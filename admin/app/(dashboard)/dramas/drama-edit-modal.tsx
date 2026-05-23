'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Drama, Region, CastMember } from '@/lib/types'
import { updateDrama, deleteDrama, getCastByDrama } from './actions'

interface Props {
  drama: Drama
  onClose: () => void
}

type Tab = 'general' | 'titles' | 'synopsis' | 'cast'

const REGIONS: { value: Region; label: string }[] = [
  { value: 'kr', label: '🇰🇷 Kore' },
  { value: 'cn', label: '🇨🇳 Çin' },
  { value: 'jp', label: '🇯🇵 Japonya' },
  { value: 'th', label: '🇹🇭 Tayland' },
]

const STATUSES = [
  { value: 'draft', label: 'Taslak' },
  { value: 'review', label: 'İncelemede' },
  { value: 'published', label: 'Yayında' },
]

async function uploadPoster(file: File, dramaId: string, field: 'poster' | 'backdrop'): Promise<string | undefined> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', `dramas/${dramaId}/${field}.jpg`)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  if (!res.ok) return undefined
  return (await res.json()).url as string
}

export function DramaEditModal({ drama, onClose }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('general')
  const [form, setForm] = useState({
    title: drama.title ?? '',
    titleKo: drama.titleKo ?? '',
    titleEn: drama.titleEn ?? '',
    titleTr: drama.titleTr ?? '',
    region: drama.region,
    year: drama.year?.toString() ?? '',
    episodes: drama.episodes?.toString() ?? '',
    genre: drama.genre ?? '',
    hue: drama.hue ?? '#000000',
    status: drama.status,
    synopsis: drama.synopsis ?? '',
    synopsisEn: drama.synopsisEn ?? '',
    synopsisKo: drama.synopsisKo ?? '',
    synopsisTr: drama.synopsisTr ?? '',
  })
  const [castList, setCastList] = useState<CastMember[] | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(drama.posterUrl ?? null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const posterRef = useRef<HTMLInputElement>(null)

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handlePosterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      let posterUrl = drama.posterUrl
      if (posterFile) {
        posterUrl = await uploadPoster(posterFile, drama.id, 'poster')
      }
      const result = await updateDrama(drama.id, {
        ...form,
        year: parseInt(form.year) || 0,
        episodes: parseInt(form.episodes) || 0,
        posterUrl,
      })
      if (result.error) { setError(result.error); return }
      router.refresh()
      onClose()
    })
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const result = await deleteDrama(drama.id)
      if (result.error) { setError(result.error); return }
      router.refresh()
      onClose()
    })
  }

  useEffect(() => {
    if (tab === 'cast' && castList === null) {
      getCastByDrama(drama.id).then(setCastList)
    }
  }, [tab, drama.id, castList])

  const inputCls = 'w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 bg-white placeholder:text-zinc-400'
  const labelCls = 'block text-xs font-medium text-zinc-500 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Drama Düzenle</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{drama.titleKo}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 px-6 flex-shrink-0">
          {([['general', 'Genel'], ['titles', 'Başlıklar'], ['synopsis', 'Özet'], ['cast', 'Oyuncular']] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === key
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {tab === 'general' && (
            <div className="flex gap-6">
              {/* Poster */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div
                  className="w-24 h-36 rounded-xl overflow-hidden bg-zinc-100 cursor-pointer relative group"
                  onClick={() => posterRef.current?.click()}
                >
                  {posterPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={posterPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-3xl">🎬</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Değiştir</span>
                  </div>
                </div>
                <input ref={posterRef} type="file" accept="image/*" className="hidden" onChange={handlePosterChange} />
                <button onClick={() => posterRef.current?.click()} className="text-xs text-zinc-500 hover:text-zinc-900 underline">
                  Poster yükle
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Yıl</label>
                    <input type="number" className={inputCls} value={form.year} onChange={e => set('year', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Bölüm sayısı</label>
                    <input type="number" className={inputCls} value={form.episodes} onChange={e => set('episodes', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Tür</label>
                  <input className={inputCls} value={form.genre} onChange={e => set('genre', e.target.value)} placeholder="Romance · Drama" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Bölge</label>
                    <select className={inputCls} value={form.region} onChange={e => set('region', e.target.value)}>
                      {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Durum</label>
                    <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Renk (hue)</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.hue} onChange={e => set('hue', e.target.value)} className="w-10 h-9 rounded border border-zinc-200 cursor-pointer" />
                    <input className={`${inputCls} flex-1`} value={form.hue} onChange={e => set('hue', e.target.value)} placeholder="#FF5470" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'titles' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Asıl Dil Başlığı (Korece / Çince / vb.)</label>
                <input className={inputCls} value={form.titleKo} onChange={e => set('titleKo', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Romanize / Gösterim Başlığı</label>
                <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>İngilizce Başlık</label>
                <input className={inputCls} value={form.titleEn} onChange={e => set('titleEn', e.target.value)} placeholder="English title" />
              </div>
              <div>
                <label className={labelCls}>Türkçe Başlık</label>
                <input className={inputCls} value={form.titleTr} onChange={e => set('titleTr', e.target.value)} placeholder="Türkçe başlık..." />
              </div>
              {drama.translations && Object.keys(drama.translations).filter(l => !['en','tr'].includes(l)).length > 0 && (
                <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3 mt-1">
                  <p className="text-xs font-medium text-zinc-500 mb-2">TMDB'den gelen diğer dil başlıkları</p>
                  <div className="flex flex-col gap-1">
                    {Object.entries(drama.translations)
                      .filter(([l, val]) => !['en','tr'].includes(l) && !!val.title)
                      .map(([lang, val]) => (
                        <div key={lang} className="flex items-center gap-2 text-xs">
                          <span className="uppercase font-medium text-zinc-400 w-6">{lang}</span>
                          <span className="text-zinc-600">{val.title}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'synopsis' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Özet — Korece (TMDB)</label>
                <textarea rows={4} className={inputCls} value={form.synopsisKo} onChange={e => set('synopsisKo', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Özet — İngilizce</label>
                <textarea rows={4} className={inputCls} value={form.synopsisEn} onChange={e => set('synopsisEn', e.target.value)} placeholder="English synopsis..." />
              </div>
              <div>
                <label className={labelCls}>Özet — Türkçe</label>
                <textarea rows={4} className={inputCls} value={form.synopsisTr} onChange={e => set('synopsisTr', e.target.value)} placeholder="Türkçe özet..." />
              </div>
            </div>
          )}

          {tab === 'cast' && (
            <div className="flex flex-col gap-2">
              {castList === null ? (
                <p className="text-sm text-zinc-400 py-8 text-center">Yükleniyor…</p>
              ) : castList.length === 0 ? (
                <p className="text-sm text-zinc-400 py-8 text-center">Bu dizide kayıtlı oyuncu yok.</p>
              ) : (
                castList.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50">
                    {member.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photoUrl} alt={member.name} className="w-9 h-12 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-12 bg-zinc-100 rounded-lg flex-shrink-0 flex items-center justify-center text-zinc-300">👤</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{member.nameEn || member.nameKo || member.name}</p>
                      {member.nameEn && member.nameKo && (
                        <p className="text-xs text-zinc-400 truncate">{member.nameKo}</p>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-zinc-400 flex-shrink-0">{member.role}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className={`text-sm font-medium transition-colors ${
              confirmDelete ? 'text-red-600 hover:text-red-800' : 'text-zinc-400 hover:text-red-600'
            }`}
          >
            {confirmDelete ? 'Emin misin? Tekrar tıkla' : 'Sil'}
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
