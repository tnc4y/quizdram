'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CastMember, Region } from '@/lib/types'
import { updateCast, deleteCast } from './actions'

interface Props {
  cast: CastMember
  onClose: () => void
}

type Tab = 'general' | 'bio' | 'credits'

const REGIONS: { value: Region; label: string }[] = [
  { value: 'kr', label: '🇰🇷 Kore' },
  { value: 'cn', label: '🇨🇳 Çin' },
  { value: 'jp', label: '🇯🇵 Japonya' },
  { value: 'th', label: '🇹🇭 Tayland' },
]

const ROLES = ['Lead', 'Supporting', 'Guest']
const STATUSES = [
  { value: 'draft', label: 'Taslak' },
  { value: 'review', label: 'İncelemede' },
  { value: 'published', label: 'Yayında' },
]

async function uploadPhoto(file: File, castId: string): Promise<string | undefined> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', `cast/${castId}/photo.jpg`)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  if (!res.ok) return undefined
  const data = await res.json()
  return data.url as string
}

export function CastEditModal({ cast, onClose }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('general')
  const [form, setForm] = useState({
    name: cast.name ?? '',
    nameKo: cast.nameKo ?? '',
    nameEn: cast.nameEn ?? '',
    region: cast.region,
    role: cast.role ?? 'Lead',
    birthDate: cast.birthDate ?? '',
    hue: cast.hue ?? '#000000',
    bio: cast.bio ?? '',
    bioEn: cast.bioEn ?? '',
    bioKo: cast.bioKo ?? '',
    status: cast.status,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(cast.photoUrl ?? null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      let photoUrl = cast.photoUrl
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile, cast.id)
      }
      const result = await updateCast(cast.id, { ...form, photoUrl })
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      onClose()
    })
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const result = await deleteCast(cast.id)
      if (result.error) { setError(result.error); return }
      router.refresh()
      onClose()
    })
  }

  const inputCls = 'w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 bg-white'
  const labelCls = 'block text-xs font-medium text-zinc-500 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Cast Düzenle</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{cast.nameKo}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 px-6 flex-shrink-0">
          {([['general', 'Genel'], ['bio', 'Biyografi'], ['credits', 'Krediler']] as [Tab, string][]).map(([key, label]) => (
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
              {/* Photo */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div
                  className="w-24 h-36 rounded-xl overflow-hidden bg-zinc-100 cursor-pointer relative group"
                  onClick={() => fileRef.current?.click()}
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-3xl">👤</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Değiştir</span>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline"
                >
                  Fotoğraf yükle
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>İsim (Asıl dil)</label>
                    <input className={inputCls} value={form.nameKo} onChange={e => set('nameKo', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>İsim (Romanize)</label>
                    <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>İsim (İngilizce)</label>
                    <input className={inputCls} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Doğum Tarihi</label>
                    <input type="date" className={inputCls} value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Bölge</label>
                    <select className={inputCls} value={form.region} onChange={e => set('region', e.target.value)}>
                      {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Rol</label>
                    <select className={inputCls} value={form.role} onChange={e => set('role', e.target.value)}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
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
                    <input className={`${inputCls} flex-1`} value={form.hue} onChange={e => set('hue', e.target.value)} placeholder="#000000" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'bio' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Biyografi — İngilizce</label>
                <textarea rows={5} className={inputCls} value={form.bioEn} onChange={e => set('bioEn', e.target.value)} placeholder="English biography..." />
              </div>
              <div>
                <label className={labelCls}>Biyografi — Korece</label>
                <textarea rows={5} className={inputCls} value={form.bioKo} onChange={e => set('bioKo', e.target.value)} placeholder="한국어 소개..." />
              </div>
              <div>
                <label className={labelCls}>Biyografi — Türkçe</label>
                <textarea rows={5} className={inputCls} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Türkçe biyografi..." />
              </div>
              {cast.bioTranslations && Object.keys(cast.bioTranslations).filter(l => !['en','ko','tr'].includes(l)).length > 0 && (
                <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3">
                  <p className="text-xs font-medium text-zinc-500 mb-2">TMDB'den gelen diğer diller (salt okunur)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(cast.bioTranslations)
                      .filter(l => !['en','ko','tr'].includes(l))
                      .map(lang => (
                        <span key={lang} className="text-xs bg-zinc-200 text-zinc-600 rounded px-2 py-0.5 uppercase">{lang}</span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'credits' && (
            <div className="flex flex-col gap-2">
              {!cast.tmdbCredits || cast.tmdbCredits.length === 0 ? (
                <p className="text-sm text-zinc-400 py-8 text-center">TMDB kredisi yok.</p>
              ) : (
                cast.tmdbCredits.map((credit) => (
                  <div key={credit.tmdbId} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50">
                    {credit.posterPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://image.tmdb.org/t/p/w92${credit.posterPath}`}
                        alt={credit.title}
                        className="w-8 h-12 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-12 bg-zinc-100 rounded flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{credit.title}</p>
                      <p className="text-xs text-zinc-400">
                        {credit.year && <span>{credit.year}</span>}
                        {credit.character && <span> · {credit.character}</span>}
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-zinc-300 flex-shrink-0">#{credit.tmdbId}</span>
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
              confirmDelete
                ? 'text-red-600 hover:text-red-800'
                : 'text-zinc-400 hover:text-red-600'
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
