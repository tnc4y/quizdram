'use client'

import { useState, useTransition } from 'react'
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

type Step = 'input' | 'cascade'

export function TmdbImportModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [tmdbId, setTmdbId] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // cascade state
  const [relatedDramas, setRelatedDramas] = useState<RelatedDrama[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [cascadeProgress, setCascadeProgress] = useState<{ current: number; total: number } | null>(null)

  function close() {
    setOpen(false)
    setStep('input')
    setTmdbId('')
    setPreview(null)
    setFetchError(null)
    setSaveError(null)
    setRelatedDramas([])
    setSelectedIds(new Set())
    setCascadeProgress(null)
  }

  async function handleFetch() {
    setFetchError(null)
    setPreview(null)
    setFetching(true)
    try {
      const res = await fetch('/api/tmdb/drama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: Number(tmdbId) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Bilinmeyen hata')
      setPreview(data)
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

      // Tüm oyuncuların tmdbCredits'inden bağlı dizileri topla
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
          const name = member.nameEn || member.name || member.nameKo
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
      setStep('cascade')
    })
  }

  async function handleCascadeImport() {
    const toImport = relatedDramas.filter((d) => !d.inDb && selectedIds.has(d.tmdbId))
    if (toImport.length === 0) { close(); return }

    setCascadeProgress({ current: 0, total: toImport.length })
    for (let i = 0; i < toImport.length; i++) {
      setCascadeProgress({ current: i + 1, total: toImport.length })
      try {
        const res = await fetch('/api/tmdb/drama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId: toImport[i].tmdbId }),
        })
        if (!res.ok) continue
        const data = await res.json()
        await saveDrama(data.drama, data.cast)
      } catch { /* skip */ }
    }
    close()
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
                  {step === 'input' ? 'TMDB\'den Drama İçe Aktar' : 'Bağlı Diziler'}
                </h2>
                {step === 'cascade' && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {newCount} yeni · {relatedDramas.length - newCount} DB&apos;de mevcut
                  </p>
                )}
              </div>
              <button onClick={close} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

              {step === 'input' && (
                <>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="TMDB ID (örn: 93779)"
                      value={tmdbId}
                      onChange={(e) => setTmdbId(e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400"
                    />
                    <button
                      onClick={handleFetch}
                      disabled={!tmdbId || fetching}
                      className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {fetching ? 'Getiriliyor…' : 'Getir'}
                    </button>
                  </div>

                  {fetchError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{fetchError}</div>
                  )}

                  {preview && (
                    <div className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                      {preview.drama.posterUrl && (
                        <div className="flex-shrink-0">
                          <Image src={preview.drama.posterUrl} alt={preview.drama.title} width={80} height={120} className="rounded-lg object-cover" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">{preview.drama.titleEn || preview.drama.title}</p>
                        {preview.drama.titleEn && preview.drama.titleKo && (
                          <p className="text-sm text-zinc-500 truncate">{preview.drama.titleKo}</p>
                        )}
                        <div className="flex gap-3 text-xs text-zinc-500 mt-1">
                          <span className="uppercase">{preview.drama.region}</span>
                          <span>{preview.drama.year}</span>
                          <span>{preview.drama.episodes} bölüm</span>
                          <span>{preview.drama.genre}</span>
                        </div>
                        {preview.drama.synopsis && (
                          <p className="text-xs text-zinc-500 mt-2 line-clamp-3">{preview.drama.synopsis}</p>
                        )}
                        {preview.cast.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-zinc-700 mb-1">Cast ({preview.cast.length} kişi)</p>
                            <div className="flex flex-wrap gap-1">
                              {preview.cast.slice(0, 5).map((c, i) => (
                                <span key={i} className="text-xs bg-zinc-200 text-zinc-700 rounded px-2 py-0.5">{c.nameEn || c.name}</span>
                              ))}
                              {preview.cast.length > 5 && (
                                <span className="text-xs text-zinc-400">+{preview.cast.length - 5} daha</span>
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

              {step === 'cascade' && (
                <>
                  {cascadeProgress && (
                    <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-700 flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin flex-shrink-0" />
                      Aktarılıyor: {cascadeProgress.current} / {cascadeProgress.total}
                    </div>
                  )}
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
                          disabled={drama.inDb || !!cascadeProgress}
                          checked={drama.inDb || selectedIds.has(drama.tmdbId)}
                          onChange={() => !drama.inDb && toggleSelect(drama.tmdbId)}
                          className="flex-shrink-0"
                        />
                        {drama.posterPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`https://image.tmdb.org/t/p/w92${drama.posterPath}`}
                            alt={drama.title}
                            className="w-8 h-12 object-cover rounded flex-shrink-0"
                          />
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
                        {drama.inDb && (
                          <span className="flex-shrink-0 text-xs font-medium text-green-700 bg-green-100 rounded px-2 py-0.5">Mevcut</span>
                        )}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100 flex-shrink-0">
              {step === 'input' ? (
                <>
                  <button onClick={close} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">İptal</button>
                  <button
                    onClick={handleSave}
                    disabled={!preview || isPending}
                    className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? 'Kaydediliyor…' : 'Firestore\'a Kaydet'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={close}
                    disabled={!!cascadeProgress}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                  >
                    Atla
                  </button>
                  <button
                    onClick={handleCascadeImport}
                    disabled={selectedCount === 0 || !!cascadeProgress}
                    className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cascadeProgress
                      ? `${cascadeProgress.current}/${cascadeProgress.total} aktarılıyor…`
                      : `Seçilenleri İçe Aktar (${selectedCount})`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
