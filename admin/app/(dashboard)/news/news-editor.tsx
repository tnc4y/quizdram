'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Drama, NewsItem } from '@/lib/types'
import { saveNews, updateNews, type NewsInput } from './actions'
import { Globe, Loader2, ArrowLeft } from 'lucide-react'

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

interface Props {
  dramas: Drama[]
  initial?: NewsItem  // varsa edit modu
}

export function NewsEditor({ dramas, initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [translateError, setTranslateError] = useState<string | null>(null)

  // Form state
  const [tag, setTag] = useState(initial?.tag ?? 'TREND')
  const [tagBg, setTagBg] = useState(initial?.tagBg ?? '#FFE5EC')
  const [tagFg, setTagFg] = useState(initial?.tagFg ?? '#C0364A')
  const [category, setCategory] = useState<typeof CATEGORIES[number]['value']>(
    (initial?.category as typeof CATEGORIES[number]['value']) ?? 'trend'
  )
  const [source, setSource] = useState(initial?.source ?? '')
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [hue, setHue] = useState(initial?.hue ?? '#C0364A')
  const [hangul, setHangul] = useState(initial?.hangul ?? '뉴스')
  const [dramaId, setDramaId] = useState(initial?.dramaId ?? '')

  // Dil alanları
  const [headline, setHeadline] = useState(initial?.headline ?? '')
  const [headlineEn, setHeadlineEn] = useState(initial?.headlineEn ?? '')
  const [headlineKo, setHeadlineKo] = useState(initial?.headlineKo ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [bodyEn, setBodyEn] = useState(initial?.bodyEn ?? '')
  const [bodyKo, setBodyKo] = useState(initial?.bodyKo ?? '')

  function buildInput(status: 'draft' | 'published'): NewsInput {
    return {
      tag, tagBg, tagFg, headline, headlineEn, headlineKo,
      body, bodyEn, bodyKo,
      source, sourceUrl, imageUrl, hue, hangul, category,
      dramaId: dramaId || undefined,
      status,
    }
  }

  function handleSave(publish: boolean) {
    setError(null)
    startTransition(async () => {
      const result = initial
        ? await updateNews(initial.id, buildInput(publish ? 'published' : 'draft'))
        : await saveNews(buildInput(publish ? 'published' : 'draft'))

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/news')
      }
    })
  }

  async function handleTranslate(to: 'en' | 'ko') {
    setTranslateError(null)
    setIsTranslating(true)
    try {
      const texts: Record<string, string> = {}
      if (headline.trim()) texts.headline = headline
      if (body.trim()) texts.body = body

      if (Object.keys(texts).length === 0) return

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, from: 'tr', to }),
      })
      const data = await res.json()
      if (!res.ok) { setTranslateError(data.error ?? 'Çeviri başarısız'); return }

      if (to === 'en') {
        if (data.translations.headline) setHeadlineEn(data.translations.headline)
        if (data.translations.body) setBodyEn(data.translations.body)
      } else {
        if (data.translations.headline) setHeadlineKo(data.translations.headline)
        if (data.translations.body) setBodyKo(data.translations.body)
      }
    } catch {
      setTranslateError('Ağ hatası, tekrar deneyin.')
    } finally {
      setIsTranslating(false)
    }
  }

  async function handleTranslateAll() {
    setTranslateError(null)
    setIsTranslating(true)
    try {
      const texts: Record<string, string> = {}
      if (headline.trim()) texts.headline = headline
      if (body.trim()) texts.body = body
      if (Object.keys(texts).length === 0) return

      const [enRes, koRes] = await Promise.all([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, from: 'tr', to: 'en' }),
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, from: 'tr', to: 'ko' }),
        }),
      ])

      const [enData, koData] = await Promise.all([enRes.json(), koRes.json()])

      if (enRes.ok) {
        if (enData.translations.headline) setHeadlineEn(enData.translations.headline)
        if (enData.translations.body) setBodyEn(enData.translations.body)
      }
      if (koRes.ok) {
        if (koData.translations.headline) setHeadlineKo(koData.translations.headline)
        if (koData.translations.body) setBodyKo(koData.translations.body)
      }
      if (!enRes.ok || !koRes.ok) {
        setTranslateError('Bir veya daha fazla dil çevrilemedi.')
      }
    } catch {
      setTranslateError('Ağ hatası, tekrar deneyin.')
    } finally {
      setIsTranslating(false)
    }
  }

  const previewHeadline = headline || 'Başlık buraya gelecek…'
  const previewBody = body || ''

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-4 border-b border-zinc-200 bg-white">
        <button
          onClick={() => router.push('/news')}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={15} />
          Haberler
        </button>
        <h1 className="text-sm font-semibold text-zinc-900 flex-1">
          {initial ? 'Haberi Düzenle' : 'Yeni Haber'}
        </h1>
        {error && (
          <span className="text-xs text-red-600">{error}</span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={isPending || !headline.trim()}
            className="px-4 py-2 border border-zinc-300 text-sm font-medium text-zinc-700 rounded-lg hover:bg-zinc-50 disabled:opacity-40 transition-colors"
          >
            {isPending ? 'Kaydediliyor…' : 'Taslak Kaydet'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isPending || !headline.trim()}
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            {isPending ? <Loader2 size={14} className="animate-spin inline" /> : 'Yayınla'}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sol panel: form ─── */}
        <div className="w-[55%] overflow-y-auto border-r border-zinc-200 px-8 py-6 flex flex-col gap-5">

          {/* Etiket */}
          <section>
            <label className="block text-xs font-medium text-zinc-500 mb-2">Etiket</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {TAG_PRESETS.map((p) => (
                <button
                  key={p.tag}
                  onClick={() => { setTag(p.tag); setTagBg(p.tagBg); setTagFg(p.tagFg) }}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${tag === p.tag ? 'ring-2 ring-offset-1 ring-zinc-400' : 'border-zinc-200'}`}
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
          </section>

          {/* Kategori */}
          <section>
            <label className="block text-xs font-medium text-zinc-500 mb-2">Kategori</label>
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
          </section>

          {/* Kaynak */}
          <section className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Kaynak</label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Soompi, Naver…"
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
          </section>

          {/* Görsel + kart ayarları */}
          <section className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Görsel URL</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
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
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Kart rengi</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={hue}
                  onChange={(e) => setHue(e.target.value)}
                  className="w-9 h-9 rounded border border-zinc-200 cursor-pointer p-0.5"
                />
                <input
                  value={hue}
                  onChange={(e) => setHue(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Drama bağlantısı</label>
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
          </section>

          <hr className="border-zinc-100" />

          {/* ── Türkçe (master) ── */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🇹🇷</span>
              <span className="text-xs font-semibold text-zinc-700">Türkçe (kaynak metin)</span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Başlık"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Haber gövdesi (opsiyonel)"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 resize-y"
              />
            </div>
          </section>

          {/* Çeviri butonu */}
          <section>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTranslateAll}
                disabled={isTranslating || !headline.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              >
                {isTranslating
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Globe size={14} />
                }
                {isTranslating ? 'Çevriliyor…' : 'EN + KO Otomatik Çevir'}
              </button>
              <button
                onClick={() => handleTranslate('en')}
                disabled={isTranslating || !headline.trim()}
                className="px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-500 hover:border-zinc-400 disabled:opacity-40 transition-colors"
              >
                🇬🇧 Sadece EN
              </button>
              <button
                onClick={() => handleTranslate('ko')}
                disabled={isTranslating || !headline.trim()}
                className="px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-500 hover:border-zinc-400 disabled:opacity-40 transition-colors"
              >
                🇰🇷 Sadece KO
              </button>
            </div>
            {translateError && (
              <p className="mt-1 text-xs text-amber-700">{translateError}</p>
            )}
          </section>

          {/* ── İngilizce ── */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🇬🇧</span>
              <span className="text-xs font-semibold text-zinc-700">İngilizce</span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                value={headlineEn}
                onChange={(e) => setHeadlineEn(e.target.value)}
                placeholder="English headline"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <textarea
                value={bodyEn}
                onChange={(e) => setBodyEn(e.target.value)}
                rows={4}
                placeholder="English body (optional)"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 resize-y"
              />
            </div>
          </section>

          {/* ── Korece ── */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🇰🇷</span>
              <span className="text-xs font-semibold text-zinc-700">Korece</span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                value={headlineKo}
                onChange={(e) => setHeadlineKo(e.target.value)}
                placeholder="한국어 제목"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <textarea
                value={bodyKo}
                onChange={(e) => setBodyKo(e.target.value)}
                rows={4}
                placeholder="한국어 본문 (선택사항)"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 resize-y"
              />
            </div>
          </section>
        </div>

        {/* ─── Sağ panel: önizleme ─── */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 px-8 py-6">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-4">Önizleme</p>

          {/* Kart önizleme */}
          <div
            className="rounded-2xl overflow-hidden shadow-sm mb-6 max-w-sm"
            style={{ backgroundColor: hue + '22' }}
          >
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ backgroundColor: tagBg, color: tagFg }}
                >
                  {tag}
                </span>
                <span className="text-xs text-zinc-400 opacity-60 font-semibold">{hangul}</span>
              </div>
              <p className="font-semibold text-zinc-900 text-sm leading-snug">{previewHeadline}</p>
              {previewBody && (
                <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">{previewBody}</p>
              )}
              {source && (
                <p className="text-xs text-zinc-400 mt-1">— {source}</p>
              )}
            </div>
          </div>

          {/* Dil versiyonları özet */}
          <div className="flex flex-col gap-4">
            {[
              { flag: '🇹🇷', lang: 'TR', h: headline, b: body },
              { flag: '🇬🇧', lang: 'EN', h: headlineEn, b: bodyEn },
              { flag: '🇰🇷', lang: 'KO', h: headlineKo, b: bodyKo },
            ].map(({ flag, lang, h, b }) => (
              <div key={lang} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>{flag}</span>
                  <span className="text-xs font-semibold text-zinc-500">{lang}</span>
                  {h ? (
                    <span className="ml-auto text-xs text-green-600">✓</span>
                  ) : (
                    <span className="ml-auto text-xs text-zinc-300">boş</span>
                  )}
                </div>
                {h && <p className="text-sm font-medium text-zinc-800 leading-snug mb-1">{h}</p>}
                {b && <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{b}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
