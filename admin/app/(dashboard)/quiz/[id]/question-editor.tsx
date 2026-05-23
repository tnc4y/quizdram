'use client'

import { useState, useRef, useTransition } from 'react'
import type { QuizQuestion, QuizOption, QuizTemplateKey, OptionStyle, QuizGroup } from '@/lib/types'
import { saveQuestion } from '../actions'
import { Plus, Trash2, Volume2 } from 'lucide-react'
import { SearchableSelect } from './searchable-select'
import { ImagePicker, type ImageSource } from './image-picker'

interface DramaItem { id: string; title: string; titleKo: string; region: string; posterUrl: string; backdropUrl: string }
interface CastItem { id: string; name: string; nameKo: string; photoUrl: string }

interface Props {
  packId: string
  question: QuizQuestion | null
  questionCount: number
  dramas: DramaItem[]
  castList: CastItem[]
  groups: QuizGroup[]
  onSaved: (q: QuizQuestion) => void
  onClose: () => void
}

type QType = 'template' | 'group_template' | 'custom' | 'audio'

const TEMPLATE_KEYS: { key: QuizTemplateKey; label: string; param: 'drama' | 'cast' }[] = [
  { key: 'which_drama_for_character',  label: 'Karakter hangi dizide?',      param: 'cast' },
  { key: 'which_character_in_drama',   label: 'Dizinin başrolü kim?',         param: 'drama' },
  { key: 'drama_release_year',         label: 'Dizi kaç yılında yayınlandı?', param: 'drama' },
  { key: 'cast_photo_who_is_this',     label: 'Bu kişi kim? (fotoğraf)',      param: 'cast' },
  { key: 'which_region_is_drama',      label: 'Dizi hangi ülke yapımı?',      param: 'drama' },
  { key: 'how_many_episodes',          label: 'Dizi kaç bölüm?',              param: 'drama' },
  { key: 'drama_genre',                label: 'Dizinin türü nedir?',           param: 'drama' },
]

const REGION_FLAG: Record<string, string> = { kr: '🇰🇷', cn: '🇨🇳', jp: '🇯🇵', th: '🇹🇭', us: '🇺🇸' }

interface OptionState {
  id: string
  text: string
  sub: string
  imageUrl: string
  imageFile: File | null
  imagePreview: string | null
  correct: boolean
}

function defaultOptions(): OptionState[] {
  return ['a', 'b', 'c', 'd'].map((id, i) => ({
    id, text: '', sub: '', imageUrl: '', imageFile: null, imagePreview: null, correct: i === 0,
  }))
}

async function uploadFile(file: File, path: string): Promise<string | undefined> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', path)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  if (!res.ok) return undefined
  return (await res.json()).url as string
}

export function QuestionEditor({
  packId, question, questionCount, dramas, castList, groups, onSaved, onClose,
}: Props) {
  const [qtype, setQtype] = useState<QType>(question?.type ?? 'custom')
  const [templateKey, setTemplateKey] = useState<QuizTemplateKey | ''>(question?.templateKey ?? '')
  const [paramDramaId, setParamDramaId] = useState(question?.params?.dramaId ?? '')
  const [paramCastId, setParamCastId] = useState(question?.params?.castId ?? '')
  const [paramGroupId, setParamGroupId] = useState(question?.params?.groupId ?? '')
  const [textEn, setTextEn] = useState(question?.text ?? '')
  const [textTr, setTextTr] = useState(question?.translations?.tr?.text ?? '')
  const [textKo, setTextKo] = useState(question?.translations?.ko?.text ?? '')
  const [langTab, setLangTab] = useState<'en' | 'tr' | 'ko'>('en')
  const [optionStyle, setOptionStyle] = useState<OptionStyle>(question?.optionStyle ?? 'text')
  const [options, setOptions] = useState<OptionState[]>(
    question?.options?.map((o) => ({
      id: o.id,
      text: o.text ?? '',
      sub: o.sub ?? '',
      imageUrl: o.imageUrl ?? '',
      imageFile: null,
      imagePreview: o.imageUrl ?? null,
      correct: o.id === question.correctId,
    })) ?? defaultOptions()
  )
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(question?.difficulty ?? 'medium')
  const [hint, setHint] = useState(question?.hint ?? '')

  // Question image
  const [qImageUrl, setQImageUrl] = useState(question?.imageUrl ?? '')
  const [qImageFile, setQImageFile] = useState<File | null>(null)
  const [qImagePreview, setQImagePreview] = useState<string | null>(question?.imageUrl ?? null)

  // Audio
  const [audioUrl, setAudioUrl] = useState(question?.audioUrl ?? '')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioName, setAudioName] = useState<string | null>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const questionId = question?.id ?? crypto.randomUUID()

  const selectedTemplateKey = TEMPLATE_KEYS.find((k) => k.key === templateKey)
  const needsDrama = selectedTemplateKey?.param === 'drama'
  const needsCast = selectedTemplateKey?.param === 'cast'

  // ── Derived image sources for pickers ─────────────────────────

  const castImageSources: ImageSource[] = castList
    .filter((c) => c.photoUrl)
    .map((c) => ({ id: c.id, label: c.name, sub: c.nameKo, imageUrl: c.photoUrl }))

  const dramaImageSources: ImageSource[] = dramas
    .flatMap((d) => {
      const items: ImageSource[] = []
      if (d.posterUrl) items.push({ id: `${d.id}_poster`, label: d.title, sub: d.region, imageUrl: d.posterUrl })
      if (d.backdropUrl) items.push({ id: `${d.id}_backdrop`, label: `${d.title} (sahne)`, sub: d.region, imageUrl: d.backdropUrl })
      return items
    })

  // ── SearchableSelect items ─────────────────────────────────────

  const dramaSelectItems = dramas.map((d) => ({
    id: d.id,
    label: d.title,
    sub: d.titleKo || undefined,
    badge: REGION_FLAG[d.region],
    imageUrl: d.posterUrl || undefined,
  }))

  const castSelectItems = castList.map((c) => ({
    id: c.id,
    label: c.name,
    sub: c.nameKo || undefined,
    imageUrl: c.photoUrl || undefined,
  }))

  const groupSelectItems = groups.map((g) => ({
    id: g.id,
    label: g.name,
    sub: g.description,
    badge: `${g.itemIds.length} öğe`,
  }))

  // ── Handlers ──────────────────────────────────────────────────

  function updateOption(id: string, field: keyof OptionState, value: string | boolean | File | null) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
  }

  function setCorrect(id: string) {
    setOptions((prev) => prev.map((o) => ({ ...o, correct: o.id === id })))
  }

  function addOption() {
    if (options.length >= 6) return
    const id = crypto.randomUUID().slice(0, 4)
    setOptions((prev) => [...prev, { id, text: '', sub: '', imageUrl: '', imageFile: null, imagePreview: null, correct: false }])
  }

  function removeOption(id: string) {
    if (options.length <= 2) return
    setOptions((prev) => {
      const next = prev.filter((o) => o.id !== id)
      if (!next.some((o) => o.correct)) next[0].correct = true
      return next
    })
  }

  function handleOptionImage(optId: string, url: string, file?: File) {
    setOptions((prev) => prev.map((o) =>
      o.id === optId
        ? { ...o, imageUrl: file ? '' : url, imageFile: file ?? null, imagePreview: url || null }
        : o
    ))
  }

  function handleQImage(url: string, file?: File) {
    setQImageUrl(file ? '' : url)
    setQImageFile(file ?? null)
    setQImagePreview(url || null)
  }

  function handleAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioFile(file)
    setAudioName(file.name)
  }

  // ── Validation ────────────────────────────────────────────────

  function validate(): string | null {
    if (qtype === 'template') {
      if (!templateKey) return 'Şablon anahtarı seçin.'
      if (needsDrama && !paramDramaId) return 'Drama seçin.'
      if (needsCast && !paramCastId) return 'Oyuncu seçin.'
    }
    if (qtype === 'group_template') {
      if (!templateKey) return 'Şablon anahtarı seçin.'
      if (!paramGroupId) return 'Grup seçin.'
    }
    if (qtype === 'custom' || qtype === 'audio') {
      if (qtype === 'audio' && !audioFile && !audioUrl) return 'Ses dosyası yükleyin.'
      if (options.filter((o) => optionStyle === 'text' ? o.text.trim() : true).length < 2) return 'En az 2 şık gerekli.'
      if (!options.some((o) => o.correct)) return 'Doğru şıkkı işaretleyin.'
    }
    return null
  }

  // ── Save ──────────────────────────────────────────────────────

  function handleSave() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)

    startTransition(async () => {
      let finalQImageUrl = qImageUrl
      let finalAudioUrl = audioUrl

      if (qImageFile) {
        const url = await uploadFile(qImageFile, `quizPacks/${packId}/q_${questionId}_img.jpg`)
        if (url) finalQImageUrl = url
      }
      if (audioFile) {
        const ext = audioFile.name.split('.').pop() ?? 'mp3'
        const url = await uploadFile(audioFile, `quizPacks/${packId}/q_${questionId}_audio.${ext}`)
        if (url) finalAudioUrl = url
      }

      const finalOptions: QuizOption[] = await Promise.all(
        options.map(async (o) => {
          let imgUrl = o.imageUrl
          if (o.imageFile) {
            const url = await uploadFile(o.imageFile, `quizPacks/${packId}/q_${questionId}_opt_${o.id}.jpg`)
            if (url) imgUrl = url
          }
          return {
            id: o.id,
            ...(o.text ? { text: o.text } : {}),
            ...(o.sub ? { sub: o.sub } : {}),
            ...(imgUrl ? { imageUrl: imgUrl } : {}),
          }
        })
      )

      const builtQuestion: QuizQuestion = {
        id: questionId,
        type: qtype,
        order: question?.order ?? questionCount,
        difficulty,
        ...(hint ? { hint } : {}),
        ...(finalQImageUrl ? { imageUrl: finalQImageUrl } : {}),

        ...(qtype === 'template' && {
          templateKey: templateKey as QuizTemplateKey,
          params: {
            ...(paramDramaId ? { dramaId: paramDramaId } : {}),
            ...(paramCastId ? { castId: paramCastId } : {}),
          },
        }),

        ...(qtype === 'group_template' && {
          templateKey: templateKey as QuizTemplateKey,
          params: { groupId: paramGroupId },
        }),

        ...((qtype === 'custom' || qtype === 'audio') && {
          ...(textEn ? { text: textEn } : {}),
          ...((textTr || textKo) && {
            translations: {
              ...(textTr ? { tr: { text: textTr } } : {}),
              ...(textKo ? { ko: { text: textKo } } : {}),
            },
          }),
          optionStyle,
          options: finalOptions,
          correctId: options.find((o) => o.correct)?.id ?? '',
        }),

        ...(qtype === 'audio' && finalAudioUrl ? { audioUrl: finalAudioUrl } : {}),
      }

      const result = await saveQuestion(packId, builtQuestion)
      if (result.error) { setError(result.error); return }
      onSaved(builtQuestion)
    })
  }

  const inputCls = 'w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 bg-white placeholder:text-zinc-400'
  const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5'
  const showOptions = qtype === 'custom' || qtype === 'audio'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[94vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-zinc-900">{question ? 'Soru Düzenle' : 'Soru Ekle'}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Type selector */}
          <div>
            <label className={labelCls}>Soru Tipi</label>
            <div className="flex gap-2">
              {([
                ['template', 'Şablon'],
                ['group_template', 'Grup Şablon'],
                ['custom', 'Özel'],
                ['audio', 'Ses'],
              ] as [QType, string][]).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setQtype(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${qtype === t ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Template fields */}
          {(qtype === 'template' || qtype === 'group_template') && (
            <>
              <div>
                <label className={labelCls}>Şablon Anahtarı</label>
                <select className={inputCls} value={templateKey} onChange={(e) => setTemplateKey(e.target.value as QuizTemplateKey)}>
                  <option value="">— Seçin —</option>
                  {TEMPLATE_KEYS.map((k) => (
                    <option key={k.key} value={k.key}>{k.label}</option>
                  ))}
                </select>
              </div>

              {qtype === 'template' && needsDrama && (
                <div>
                  <label className={labelCls}>Drama</label>
                  <SearchableSelect
                    items={dramaSelectItems}
                    value={paramDramaId}
                    onChange={setParamDramaId}
                    placeholder="— Drama seç —"
                    emptyLabel="— Drama seç —"
                    searchPlaceholder="Drama ara... (Türkçe veya Korece)"
                  />
                </div>
              )}

              {qtype === 'template' && needsCast && (
                <div>
                  <label className={labelCls}>Oyuncu</label>
                  <SearchableSelect
                    items={castSelectItems}
                    value={paramCastId}
                    onChange={setParamCastId}
                    placeholder="— Oyuncu seç —"
                    emptyLabel="— Oyuncu seç —"
                    searchPlaceholder="Oyuncu ara... (İngilizce veya Korece)"
                  />
                </div>
              )}

              {qtype === 'group_template' && (
                <div>
                  <label className={labelCls}>Grup</label>
                  <SearchableSelect
                    items={groupSelectItems}
                    value={paramGroupId}
                    onChange={setParamGroupId}
                    placeholder="— Grup seç —"
                    emptyLabel="— Grup seç —"
                    searchPlaceholder="Grup ara..."
                  />
                  {groups.length === 0 && (
                    <p className="text-xs text-zinc-400 mt-1">Henüz grup yok. Önce Gruplar sayfasından bir grup oluşturun.</p>
                  )}
                </div>
              )}

              <p className="text-xs text-zinc-400 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2">
                ℹ️ Şablon sorularda seçenekler Flutter uygulaması tarafından otomatik üretilir.
              </p>
            </>
          )}

          {/* Custom / Audio fields */}
          {showOptions && (
            <>
              {/* Audio upload */}
              {qtype === 'audio' && (
                <div>
                  <label className={labelCls}>Ses Dosyası (mp3, max 5MB)</label>
                  <div
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
                    onClick={() => audioRef.current?.click()}
                  >
                    <Volume2 size={16} className="text-zinc-400 flex-shrink-0" />
                    <span className="text-sm text-zinc-500 truncate">
                      {audioName || (audioUrl ? 'Mevcut ses dosyası' : 'Ses dosyası seç...')}
                    </span>
                  </div>
                  <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={handleAudio} />
                </div>
              )}

              {/* Question text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-500">Soru Metni</label>
                  <div className="flex gap-1">
                    {(['en', 'tr', 'ko'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLangTab(l)}
                        className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${langTab === l ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {langTab === 'en' && <input className={inputCls} value={textEn} onChange={(e) => setTextEn(e.target.value)} placeholder="Question text (English)" />}
                {langTab === 'tr' && <input className={inputCls} value={textTr} onChange={(e) => setTextTr(e.target.value)} placeholder="Soru metni (Türkçe)" />}
                {langTab === 'ko' && <input className={inputCls} value={textKo} onChange={(e) => setTextKo(e.target.value)} placeholder="질문 텍스트 (한국어)" />}
              </div>

              {/* Question image */}
              <div>
                <label className={labelCls}>Soru Görseli (isteğe bağlı)</label>
                <ImagePicker
                  preview={qImagePreview}
                  castSources={castImageSources}
                  dramaSources={dramaImageSources}
                  onChange={handleQImage}
                />
              </div>

              {/* Option style */}
              <div>
                <label className={labelCls}>Seçenek Görünümü</label>
                <div className="flex gap-2">
                  {([
                    ['text', 'Metin'],
                    ['poster', 'Poster/Fotoğraf'],
                    ['text+image', 'Metin + Görsel'],
                  ] as [OptionStyle, string][]).map(([s, label]) => (
                    <button
                      key={s}
                      onClick={() => setOptionStyle(s)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${optionStyle === s ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className={labelCls}>Şıklar — doğru cevabı işaretle</label>
                <div className="flex flex-col gap-2">
                  {options.map((opt, i) => (
                    <div
                      key={opt.id}
                      className={`rounded-lg border transition-colors ${opt.correct ? 'border-green-400 bg-green-50' : 'border-zinc-200'}`}
                    >
                      <div className="flex items-center gap-3 px-3 py-2">
                        <button
                          onClick={() => setCorrect(opt.id)}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${opt.correct ? 'border-green-500 bg-green-500' : 'border-zinc-300 hover:border-zinc-500'}`}
                        >
                          {opt.correct && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <span className="text-xs font-bold text-zinc-400 w-4">{String.fromCharCode(65 + i)}</span>
                        {(optionStyle === 'text' || optionStyle === 'text+image') && (
                          <>
                            <input
                              value={opt.text}
                              onChange={(e) => updateOption(opt.id, 'text', e.target.value)}
                              placeholder="Seçenek metni"
                              className="flex-1 text-sm text-zinc-900 outline-none bg-transparent placeholder:text-zinc-300"
                            />
                            <input
                              value={opt.sub}
                              onChange={(e) => updateOption(opt.id, 'sub', e.target.value)}
                              placeholder="한국어"
                              className="w-20 text-xs text-zinc-400 outline-none bg-transparent text-right placeholder:text-zinc-200"
                            />
                          </>
                        )}
                        {options.length > 2 && (
                          <button onClick={() => removeOption(opt.id)} className="p-1 text-zinc-300 hover:text-red-500 transition-colors flex-shrink-0">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      {/* Option image (poster or text+image) */}
                      {(optionStyle === 'poster' || optionStyle === 'text+image') && (
                        <div className="px-3 pb-3 border-t border-zinc-100 pt-2">
                          <ImagePicker
                            preview={opt.imagePreview}
                            castSources={castImageSources}
                            dramaSources={dramaImageSources}
                            aspectRatio={optionStyle === 'poster' ? 'portrait' : 'square'}
                            onChange={(url, file) => handleOptionImage(opt.id, url, file)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {options.length < 6 && (
                  <button onClick={addOption} className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
                    <Plus size={12} />
                    Şık ekle
                  </button>
                )}
              </div>
            </>
          )}

          {/* Difficulty + hint */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Zorluk</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${difficulty === d ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
                  >
                    {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>İpucu (isteğe bağlı)</label>
              <input className={inputCls} value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Küçük ipucu..." />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">İptal</button>
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
  )
}
