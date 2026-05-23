'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import type { Drama, CastMember } from '@/lib/types'
import { saveDrama } from './actions'

interface Preview {
  drama: Omit<Drama, 'id' | 'createdAt' | 'updatedAt'>
  cast: Array<Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>>
}

export function TmdbImportModal() {
  const [open, setOpen] = useState(false)
  const [tmdbId, setTmdbId] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function close() {
    setOpen(false)
    setTmdbId('')
    setPreview(null)
    setFetchError(null)
    setSaveError(null)
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
      if (result.error) {
        setSaveError(result.error)
      } else {
        close()
      }
    })
  }

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
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-900">TMDB&apos;den Drama İçe Aktar</h2>
              <button
                onClick={close}
                className="text-zinc-400 hover:text-zinc-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="TMDB ID (örn: 93779)"
                  value={tmdbId}
                  onChange={(e) => setTmdbId(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
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
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {fetchError}
                </div>
              )}

              {preview && (
                <div className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  {preview.drama.posterUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={preview.drama.posterUrl}
                        alt={preview.drama.title}
                        width={80}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{preview.drama.title}</p>
                    {preview.drama.titleEn && (
                      <p className="text-sm text-zinc-500 truncate">{preview.drama.titleEn}</p>
                    )}
                    <div className="flex gap-3 text-xs text-zinc-500 mt-1">
                      <span className="uppercase">{preview.drama.region}</span>
                      <span>{preview.drama.year}</span>
                      <span>{preview.drama.episodes} bölüm</span>
                      <span>{preview.drama.genre}</span>
                    </div>
                    {preview.drama.synopsis && (
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-3">
                        {preview.drama.synopsis}
                      </p>
                    )}
                    {preview.cast.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-zinc-700 mb-1">
                          Cast ({preview.cast.length} kişi)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {preview.cast.slice(0, 5).map((c, i) => (
                            <span
                              key={i}
                              className="text-xs bg-zinc-200 text-zinc-700 rounded px-2 py-0.5"
                            >
                              {c.name}
                            </span>
                          ))}
                          {preview.cast.length > 5 && (
                            <span className="text-xs text-zinc-400">
                              +{preview.cast.length - 5} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {saveError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100">
              <button
                onClick={close}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={!preview || isPending}
                className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Kaydediliyor…' : 'Firestore\'a Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
