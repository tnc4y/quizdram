'use client'

import { useState, useRef } from 'react'
import { Search, Upload } from 'lucide-react'

export interface ImageSource {
  id: string
  label: string
  imageUrl: string
  sub?: string
}

interface Props {
  preview: string | null
  castSources: ImageSource[]
  dramaSources: ImageSource[]
  aspectRatio?: 'square' | 'portrait'
  onChange: (url: string, file?: File) => void
}

type Tab = 'upload' | 'cast' | 'drama'

const REGION_FLAG: Record<string, string> = {
  kr: '🇰🇷', cn: '🇨🇳', jp: '🇯🇵', th: '🇹🇭', us: '🇺🇸',
}

export function ImagePicker({ preview, castSources, dramaSources, aspectRatio = 'square', onChange }: Props) {
  const [tab, setTab] = useState<Tab>('upload')
  const [query, setQuery] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const sources = tab === 'cast' ? castSources : dramaSources
  const filtered = query
    ? sources.filter(
        (s) =>
          s.label.toLowerCase().includes(query.toLowerCase()) ||
          s.sub?.toLowerCase().includes(query.toLowerCase())
      )
    : sources

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(URL.createObjectURL(file), file)
  }

  function selectUrl(url: string) {
    onChange(url, undefined)
  }

  return (
    <div className="space-y-2">
      {/* Tab bar */}
      <div className="flex gap-1">
        {([
          ['upload', '↑ Yükle'],
          ['cast', '👤 Oyuncu'],
          ['drama', '🎬 Drama'],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setQuery('') }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === t
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 rounded-lg border border-zinc-200 overflow-hidden cursor-pointer hover:border-zinc-400 transition-colors"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className={`object-cover flex-shrink-0 ${aspectRatio === 'portrait' ? 'w-12 h-16' : 'w-16 h-16'}`}
            />
          ) : (
            <div
              className={`bg-zinc-100 flex items-center justify-center text-zinc-300 flex-shrink-0 ${
                aspectRatio === 'portrait' ? 'w-12 h-16' : 'w-16 h-16'
              }`}
            >
              <Upload size={18} />
            </div>
          )}
          <div className="px-3">
            <p className="text-sm text-zinc-500">{preview ? 'Değiştir' : 'Görsel yükle...'}</p>
            <p className="text-xs text-zinc-300">JPG, PNG, WEBP</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}

      {/* Cast / Drama tab */}
      {(tab === 'cast' || tab === 'drama') && (
        <div>
          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 mb-2">
            <Search size={13} className="text-zinc-400 flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'cast' ? 'Oyuncu ara...' : 'Drama ara...'}
              className="flex-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-zinc-300 hover:text-zinc-600 text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-zinc-400 py-6">
              {query ? 'Sonuç bulunamadı' : tab === 'cast' ? 'Fotoğraflı oyuncu yok' : 'Poster yüklenmiş drama yok'}
            </p>
          ) : (
            <div className={`grid gap-2 max-h-52 overflow-y-auto ${tab === 'cast' ? 'grid-cols-5' : 'grid-cols-4'}`}>
              {filtered.map((item) => {
                const isSelected = preview === item.imageUrl
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectUrl(item.imageUrl)}
                    title={item.label}
                    className={`relative rounded-lg overflow-hidden transition-all ${
                      tab === 'cast' ? 'aspect-square' : 'aspect-[2/3]'
                    } ${
                      isSelected
                        ? 'ring-2 ring-zinc-900 ring-offset-1'
                        : 'hover:ring-2 hover:ring-zinc-300 hover:ring-offset-1'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 pt-4 pb-1">
                      <p className="text-white text-[9px] leading-tight truncate">{item.label}</p>
                      {item.sub && (
                        <p className="text-white/60 text-[8px] truncate">
                          {REGION_FLAG[item.sub] ?? item.sub}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-zinc-900 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-xs text-zinc-400 mt-1.5">{filtered.length} sonuç</p>
          )}
        </div>
      )}

      {/* Current selection indicator when not on upload tab */}
      {tab !== 'upload' && preview && (
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
          <p className="text-xs text-zinc-500 flex-1 truncate">Seçildi</p>
          <button
            type="button"
            onClick={() => onChange('', undefined)}
            className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
          >
            ✕ Kaldır
          </button>
        </div>
      )}
    </div>
  )
}
