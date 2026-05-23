'use client'

import { useState, useTransition } from 'react'
import type { Drama } from '@/lib/types'
import { saveQuizPack, type QuizOptionInput } from './actions'

const OPTION_IDS = ['a', 'b', 'c', 'd']

const EMPTY_OPTIONS: QuizOptionInput[] = OPTION_IDS.map((id) => ({
  id,
  text: '',
  sub: '',
  correct: false,
}))

export function QuizCreateModal({ dramas }: { dramas: Drama[] }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dramaId, setDramaId] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [options, setOptions] = useState<QuizOptionInput[]>(EMPTY_OPTIONS)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function close() {
    setOpen(false)
    setTitle('')
    setDramaId('')
    setDifficulty('medium')
    setOptions(EMPTY_OPTIONS.map((o) => ({ ...o })))
    setError(null)
  }

  function setCorrect(id: string) {
    setOptions((prev) => prev.map((o) => ({ ...o, correct: o.id === id })))
  }

  function updateOption(id: string, field: 'text' | 'sub', value: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
  }

  function handleSave(publish: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await saveQuizPack({
        title,
        dramaId,
        region: dramas.find((d) => d.id === dramaId)?.region ?? 'kr',
        difficulty,
        options,
        status: publish ? 'published' : 'draft',
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
        + Yeni paket
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-900">Yeni Quiz Paketi</h2>
              <button onClick={close} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {/* Başlık */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Başlık (quiz sorusu)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='örn. "Lunar Tide" dizisinin başrolü kim?'
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Drama seç */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Drama</label>
                <select
                  value={dramaId}
                  onChange={(e) => setDramaId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                >
                  <option value="">— Drama seç —</option>
                  {dramas.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              {/* Zorluk */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Zorluk</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        difficulty === d
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Şıklar */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2">
                  Şıklar — doğru cevabı işaretle
                </label>
                <div className="flex flex-col gap-2">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                        opt.correct ? 'border-green-400 bg-green-50' : 'border-zinc-200'
                      }`}
                    >
                      <button
                        onClick={() => setCorrect(opt.id)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          opt.correct ? 'border-green-500 bg-green-500' : 'border-zinc-300'
                        }`}
                      >
                        {opt.correct && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <span className="text-xs font-bold text-zinc-400 w-4">{opt.id.toUpperCase()}</span>
                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(opt.id, 'text', e.target.value)}
                        placeholder="Drama / cast adı"
                        className="flex-1 text-sm outline-none bg-transparent"
                      />
                      <input
                        value={opt.sub}
                        onChange={(e) => updateOption(opt.id, 'sub', e.target.value)}
                        placeholder="한국어"
                        className="w-24 text-xs text-zinc-400 outline-none bg-transparent text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
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
