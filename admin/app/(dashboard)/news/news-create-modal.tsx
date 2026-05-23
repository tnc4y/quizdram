'use client'

import { useState, useTransition } from 'react'
import type { Drama } from '@/lib/types'
import { saveNews } from './actions'

const CATEGORIES = [
  { value: 'trend', label: 'Trend' },
  { value: 'new_show', label: 'Yeni Dizi' },
  { value: 'gossip', label: 'Dedikodu' },
  { value: 'interview', label: 'Röportaj' },
] as const

const TAG_PRESETS = [
  { tag: 'TREND', tagBg: '#FFE5EC', tagFg: '#C0364A' },
  { tag: 'YENİ DİZİ', tagBg: '#E8F4FF', tagFg: '#1A6FBF' },
  { tag: 'DEDİKODU', tagBg: '#FFF3E0', tagFg: '#B85C00' },
  { tag: 'RÖPORTAJ', tagBg: '#F0F4FF', tagFg: '#3B4FA8' },
]

export function NewsCreateModal({ dramas }: { dramas: Drama[] }) {
  const [open, setOpen] = useState(false)
  const [tag, setTag] = useState('TREND')
  const [tagBg, setTagBg] = useState('#FFE5EC')
  const [tagFg, setTagFg] = useState('#C0364A')
  const [headline, setHeadline] = useState('')
  const [headlineEn, setHeadlineEn] = useState('')
  const [source, setSource] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [hue, setHue] = useState('#C0364A')
  const [hangul, setHangul] = useState('뉴스')
  const [category, setCategory] = useState<'trend' | 'new_show' | 'gossip' | 'interview'>('trend')
  const [dramaId, setDramaId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function close() {
    setOpen(false)
    setTag('TREND'); setTagBg('#FFE5EC'); setTagFg('#C0364A')
    setHeadline(''); setHeadlineEn(''); setSource(''); setSourceUrl('')
    setHue('#C0364A'); setHangul('뉴스'); setCategory('trend'); setDramaId('')
    setError(null)
  }

  function applyPreset(p: typeof TAG_PRESETS[number]) {
    setTag(p.tag); setTagBg(p.tagBg); setTagFg(p.tagFg)
  }

  function handleSave(publish: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await saveNews({
        tag, tagBg, tagFg, headline, headlineEn, source, sourceUrl, hue, hangul,
        category, dramaId, status: publish ? 'published' : 'draft',
      })
      if (result.error) {
        setError(result.error)
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
        + Yeni haber
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-900">Yeni Haber</h2>
              <button onClick={close} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {/* Tag preset seç */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2">Etiket</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {TAG_PRESETS.map((p) => (
                    <button
                      key={p.tag}
                      onClick={() => applyPreset(p)}
                      className="px-2 py-1 rounded text-xs font-medium border border-zinc-200 hover:border-zinc-400 transition-colors"
                      style={{ backgroundColor: p.tagBg, color: p.tagFg }}
                    >
                      {p.tag}
                    </button>
                  ))}
                </div>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Özel etiket"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Kategori</label>
                <div className="flex gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        category === c.value
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Başlık */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Başlık (TR)</label>
                <textarea
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  rows={2}
                  placeholder="Haber başlığı"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Başlık (EN) — opsiyonel</label>
                <textarea
                  value={headlineEn}
                  onChange={(e) => setHeadlineEn(e.target.value)}
                  rows={2}
                  placeholder="English headline"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                />
              </div>

              {/* Kaynak */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Kaynak</label>
                  <input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Soompi, Naver vb."
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Kaynak URL</label>
                  <input
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Görsel alanlar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Kart rengi (hex)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={hue}
                      onChange={(e) => setHue(e.target.value)}
                      className="w-9 h-9 rounded border border-zinc-200 cursor-pointer"
                    />
                    <input
                      value={hue}
                      onChange={(e) => setHue(e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Hangul metin</label>
                  <input
                    value={hangul}
                    onChange={(e) => setHangul(e.target.value)}
                    placeholder="뉴스"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Drama bağlantısı */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Drama bağlantısı — opsiyonel</label>
                <select
                  value={dramaId}
                  onChange={(e) => setDramaId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                >
                  <option value="">— Seç —</option>
                  {dramas.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100">
              <button onClick={close} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                İptal
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isPending}
                className="px-4 py-2 border border-zinc-300 text-sm font-medium text-zinc-700 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
              >
                Taslak kaydet
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isPending}
                className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Kaydediliyor…' : 'Yayınla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
