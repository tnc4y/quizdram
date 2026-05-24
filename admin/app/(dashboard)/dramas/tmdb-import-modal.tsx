'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import type { Drama, CastMember } from '@/lib/types'
import { saveDrama, checkExistingTmdbIds } from './actions'

interface Preview {
  drama: Omit<Drama, 'id' | 'createdAt' | 'updatedAt'>
  cast: Array<Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>>
}

interface RelatedDrama {
  tmdbId: number
  title: string
  year?: number
  posterPath?: string
  actors: string[]
  inDb: boolean
}

type Step = 'input' | 'cascade-select' | 'cascade-import'

// SSE akışını okuyup log ve result döndürür
async function readDramaStream(
  tmdbId: number,
  onLog: (text: string) => void,
): Promise<Preview | null> {
  const res = await fetch('/api/tmdb/drama/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tmdbId }),
  })
  if (!res.body) return null

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result: Preview | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''
    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data: ')) continue
      try {
        const msg = JSON.parse(line.slice(6))
        if (msg.type === 'log') onLog(msg.text)
        else if (msg.type === 'result') result = { drama: msg.drama, cast: msg.cast }
        else if (msg.type === 'error') onLog(`⚠ ${msg.text}`)
      } catch { /* skip */ }
    }
  }
  return result
}

export function TmdbImportModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [tmdbId, setTmdbId] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchLogs, setFetchLogs] = useState<string[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [relatedDramas, setRelatedDramas] = useState<RelatedDrama[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // cascade-import step
  const [cascadeLogs, setCascadeLogs] = useState<string[]>([])
  const [cascadeProgress, setCascadeProgress] = useState<{ current: number; total: number; label: string } | null>(null)
  const [cascadeDone, setCascadeDone] = useState(false)

  const fetchLogEndRef = useRef<HTMLDivElement>(null)
  const cascadeLogEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchLogEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [fetchLogs])
  useEffect(() => { cascadeLogEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [cascadeLogs])

  function close() {
    setOpen(false)
    setStep('input')
    setTmdbId('')
    setPreview(null)
    setFetchError(null)
    setSaveError(null)
    setFetchLogs([])
    setRelatedDramas([])
    setSelectedIds(new Set())
    setCascadeLogs([])
    setCascadeProgress(null)
    setCascadeDone(false)
  }

  async function handleFetch() {
    setFetchError(null)
    setPreview(null)
    setFetchLogs([])
    setFetching(true)
    try {
      const result = await readDramaStream(Number(tmdbId), (text) =>
        setFetchLogs((prev) => [...prev, text])
      )
      if (result) setPreview(result)
      else setFetchError('Sonuç alınamadı')
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Getirme başarısız')
    } finally {
      setFetching(false)
    }
  }

  function handleSave() {
    if (!preview) return
    setSaveError(null)
    startTransition(async () => {
      const result = await saveDrama(preview.drama, preview.cast)
      if (result.error) { setSaveError(result.error); return }

      // Tüm cast'in tmdbCredits'inden bağlı dizileri topla
      const relatedMap = new Map<number, RelatedDrama>()
      for (const member of preview.cast) {
        for (const credit of member.tmdbCredits ?? []) {
          if (credit.tmdbId === preview.drama.tmdbId) continue
          if (!relatedMap.has(credit.tmdbId)) {
            relatedMap.set(credit.tmdbId, {
              tmdbId: credit.tmdbId,
              title: credit.title,
              year: credit.year,
              posterPath: credit.posterPath,
              actors: [],
              inDb: false,
            })
          }
          const name = member.nameEn ?? member.name ?? member.nameKo
          if (name && !relatedMap.get(credit.tmdbId)!.actors.includes(name)) {
            relatedMap.get(credit.tmdbId)!.actors.push(name)
          }
        }
      }

      if (relatedMap.size === 0) { close(); return }

      const allIds = [...relatedMap.keys()]
      const existingIds = await checkExistingTmdbIds(allIds)
      const existingSet = new Set(existingIds)

      const related = [...relatedMap.values()]
        .map((d) => ({ ...d, inDb: existingSet.has(d.tmdbId) }))
        .sort((a, b) => b.actors.length - a.actors.length || (b.year ?? 0) - (a.year ?? 0))

      setRelatedDramas(related)
      setSelectedIds(new Set(related.filter((d) => !d.inDb).map((d) => d.tmdbId)))
      setStep('cascade-select')
    })
  }

  async function handleCascadeImport() {
    const toImport = relatedDramas.filter((d) => !d.inDb && selectedIds.has(d.tmdbId))
    if (toImport.length === 0) { close(); return }

    setCascadeLogs([])
    setCascadeDone(false)
    setCascadeProgress({ current: 0, total: toImport.length, label: '' })
    setStep('cascade-import')

    for (let i = 0; i < toImport.length; i++) {
      const drama = toImport[i]
      setCascadeProgress({ current: i + 1, total: toImport.length, label: drama.title })
      setCascadeLogs((prev) => [
        ...prev,
        ...(i > 0 ? [''] : []),
        `━━━ [${i + 1}/${toImport.length}] ${drama.title} (TMDB: ${drama.tmdbId}) ━━━`,
      ])

      try {
        const result = await readDramaStream(drama.tmdbId, (text) =>
          setCascadeLogs((prev) => [...prev, text])
        )

        if (result) {
          const saveResult = await saveDrama(result.drama, result.cast)
          if (saveResult.error) {
            setCascadeLogs((prev) => [...prev, `   ↳ ⚠ Kaydedilemedi: ${saveResult.error}`])
          } else {
            setCascadeLogs((prev) => [...prev, `   ↳ ✅ Firestore'a kaydedildi`])
          }
        }
      } catch (err) {
        setCascadeLogs((prev) => [...prev, `   ↳ ⚠ ${String(err).slice(0, 80)}`])
      }
    }

    setCascadeProgress(null)
    setCascadeDone(true)
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const newCount = relatedDramas.filter((d) => !d.inDb).length
  const selectedCount = relatedDramas.filter((d) => !d.inDb && selectedIds.has(d.tmdbId)).length

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
      >
        + TMDB&apos;den içe aktar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">
                  {step === 'input' && 'TMDB\'den Drama İçe Aktar'}
                  {step === 'cascade-select' && 'Bağlı Diziler'}
                  {step === 'cascade-import' && 'İçe Aktarılıyor…'}
                </h2>
                {step === 'cascade-select' && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {newCount} yeni · {relatedDramas.length - newCount} DB&apos;de mevcut
                  </p>
                )}
                {step === 'cascade-import' && cascadeProgress && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {cascadeProgress.current}/{cascadeProgress.total} — &quot;{cascadeProgress.label}&quot;
                  </p>
                )}
                {step === 'cascade-import' && cascadeDone && (
                  <p className="text-xs text-green-600 mt-0.5">✅ Tamamlandı</p>
                )}
              </div>
              <button onClick={close} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

              {/* ── step: input ── */}
              {step === 'input' && (
                <>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="TMDB ID (örn: 93779)"
                      value={tmdbId}
                      onChange={(e) => setTmdbId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !fetching && tmdbId && handleFetch()}
                      className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400"
                    />
                    <button
                      onClick={handleFetch}
                      disabled={!tmdbId || fetching}
                      className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {fetching ? 'Alınıyor…' : 'Getir'}
                    </button>
                  </div>

                  {fetchError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{fetchError}</div>
                  )}

                  {/* Canlı log terminali */}
                  {(fetching || fetchLogs.length > 0) && (
                    <div className="rounded-xl bg-zinc-950 px-4 py-3 font-mono text-xs text-zinc-300 max-h-52 overflow-y-auto flex flex-col gap-0.5">
                      {fetchLogs.map((line, i) => (
                        <span key={i} className="whitespace-pre-wrap leading-relaxed">{line}</span>
                      ))}
                      {fetching && (
                        <span className="flex items-center gap-2 text-zinc-500 mt-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                          Alınıyor…
                        </span>
                      )}
                      <div ref={fetchLogEndRef} />
                    </div>
                  )}

                  {/* Preview kartı */}
                  {preview && (
                    <div className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                      {preview.drama.posterUrl && (
                        <div className="flex-shrink-0">
                          <Image src={preview.drama.posterUrl} alt={preview.drama.title} width={80} height={120} className="rounded-lg object-cover" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">
                          {preview.drama.titleEn ?? preview.drama.title}
                        </p>
                        {preview.drama.titleEn && preview.drama.titleKo && (
                          <p className="text-sm text-zinc-500 truncate">{preview.drama.titleKo}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mt-1">
                          <span className="uppercase font-medium">{preview.drama.region}</span>
                          <span>{preview.drama.year}</span>
                          <span>{preview.drama.episodes} bölüm</span>
                          <span>{preview.drama.genre}</span>
                        </div>
                        {preview.cast.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-zinc-700 mb-1">
                              Cast — {preview.cast.length} oyuncu
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {preview.cast.slice(0, 8).map((c, i) => (
                                <span key={i} className={`text-xs rounded px-2 py-0.5 ${i < 3 ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                                  {c.nameEn ?? c.name}
                                </span>
                              ))}
                              {preview.cast.length > 8 && (
                                <span className="text-xs text-zinc-400">+{preview.cast.length - 8} daha</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {saveError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{saveError}</div>
                  )}
                </>
              )}

              {/* ── step: cascade-select ── */}
              {step === 'cascade-select' && (
                <div className="flex flex-col gap-2">
                  {relatedDramas.map((drama) => (
                    <label
                      key={drama.tmdbId}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        drama.inDb
                          ? 'border-zinc-100 bg-zinc-50 opacity-50 cursor-default'
                          : selectedIds.has(drama.tmdbId)
                          ? 'border-zinc-900 bg-zinc-50'
                          : 'border-zinc-100 hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={drama.inDb}
                        checked={drama.inDb || selectedIds.has(drama.tmdbId)}
                        onChange={() => !drama.inDb && toggleSelect(drama.tmdbId)}
                        className="flex-shrink-0"
                      />
                      {drama.posterPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://image.tmdb.org/t/p/w92${drama.posterPath}`} alt={drama.title} className="w-8 h-12 object-cover rounded flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-12 bg-zinc-200 rounded flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 truncate">{drama.title}</p>
                        <p className="text-xs text-zinc-400">
                          {drama.year && <span>{drama.year} · </span>}
                          {drama.actors.slice(0, 3).join(', ')}
                          {drama.actors.length > 3 && ` +${drama.actors.length - 3}`}
                        </p>
                      </div>
                      {drama.inDb ? (
                        <span className="flex-shrink-0 text-xs font-medium text-green-700 bg-green-100 rounded px-2 py-0.5">Mevcut</span>
                      ) : (
                        <span className="flex-shrink-0 text-xs text-zinc-400">{drama.tmdbId}</span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {/* ── step: cascade-import ── */}
              {step === 'cascade-import' && (
                <div className="rounded-xl bg-zinc-950 px-4 py-3 font-mono text-xs text-zinc-300 max-h-[480px] overflow-y-auto flex flex-col gap-0.5">
                  {cascadeLogs.map((line, i) => (
                    <span
                      key={i}
                      className={`whitespace-pre-wrap leading-relaxed ${
                        line.startsWith('━━━') ? 'text-zinc-400 font-semibold mt-1' : ''
                      }`}
                    >
                      {line}
                    </span>
                  ))}
                  {!cascadeDone && cascadeProgress && (
                    <span className="flex items-center gap-2 text-zinc-500 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                      Alınıyor…
                    </span>
                  )}
                  <div ref={cascadeLogEndRef} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100 flex-shrink-0">
              {step === 'input' && (
                <>
                  <button onClick={close} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">İptal</button>
                  <button
                    onClick={handleSave}
                    disabled={!preview || isPending || fetching}
                    className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? 'Kaydediliyor…' : 'Firestore\'a Kaydet'}
                  </button>
                </>
              )}

              {step === 'cascade-select' && (
                <>
                  <button onClick={close} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Atla</button>
                  <button
                    onClick={handleCascadeImport}
                    disabled={selectedCount === 0}
                    className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Seçilenleri İçe Aktar ({selectedCount})
                  </button>
                </>
              )}

              {step === 'cascade-import' && (
                <button
                  onClick={close}
                  disabled={!cascadeDone}
                  className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cascadeDone ? 'Kapat' : 'Aktarılıyor…'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
