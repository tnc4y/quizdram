'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Drama } from '@/lib/types'
import { createQuizPack } from './actions'

export function QuizCreateModal({ dramas }: { dramas: Drama[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dramaId, setDramaId] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function close() {
    setOpen(false); setTitle(''); setDramaId(''); setDifficulty('medium'); setError(null)
  }

  function handleCreate() {
    if (!title.trim() || !dramaId) { setError('Başlık ve drama zorunludur.'); return }
    setError(null)
    startTransition(async () => {
      const region = dramas.find((d) => d.id === dramaId)?.region ?? 'kr'
      const result = await createQuizPack({ title, dramaId, region, difficulty })
      if (result.error) { setError(result.error); return }
      close()
      router.push(`/quiz/${result.packId}`)
    })
  }

  const inputCls = 'w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 bg-white placeholder:text-zinc-400'
  const labelCls = 'block text-xs font-medium text-zinc-500 mb-1'

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors">
        + Yeni paket
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-900">Yeni Quiz Paketi</h2>
              <button onClick={close} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className={labelCls}>Paket Başlığı</label>
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder='örn. "Goblin — Karışık Sorular"' />
              </div>
              <div>
                <label className={labelCls}>Drama</label>
                <select className={inputCls} value={dramaId} onChange={(e) => setDramaId(e.target.value)}>
                  <option value="">— Drama seç —</option>
                  {dramas.map((d) => (
                    <option key={d.id} value={d.id}>{d.titleEn || d.titleKo || d.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Zorluk</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${difficulty === d ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}>
                      {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                    </button>
                  ))}
                </div>
              </div>
              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100">
              <button onClick={close} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">İptal</button>
              <button onClick={handleCreate} disabled={isPending} className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                {isPending ? 'Oluşturuluyor…' : 'Oluştur ve Düzenle →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
