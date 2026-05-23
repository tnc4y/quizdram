'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { QuizQuestion, QuizGroup } from '@/lib/types'
import { deleteQuestion, reorderQuestions, updateQuizPack } from '../actions'
import { QuestionEditor } from './question-editor'
import { ChevronLeft, Pencil, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'

interface DramaItem { id: string; title: string; region: string }
interface CastItem { id: string; name: string; photoUrl?: string }

interface Pack {
  id: string
  title: string
  dramaId: string
  difficulty: string
  status: string
  questions: QuizQuestion[]
}

interface Props {
  pack: Pack
  dramas: DramaItem[]
  castList: CastItem[]
  groups: QuizGroup[]
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  template:       { label: 'Şablon',     cls: 'bg-blue-50 text-blue-700' },
  group_template: { label: 'Grup',       cls: 'bg-purple-50 text-purple-700' },
  custom:         { label: 'Özel',       cls: 'bg-zinc-100 text-zinc-600' },
  audio:          { label: 'Ses',        cls: 'bg-amber-50 text-amber-700' },
}
const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' }
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Taslak' },
  { value: 'review', label: 'İnceleme' },
  { value: 'published', label: 'Yayında' },
]

function questionSummary(q: QuizQuestion): string {
  if (q.text) return q.text
  if (q.templateKey) return q.templateKey.replace(/_/g, ' ')
  if (q.audioUrl) return '🔊 Ses sorusu'
  return '—'
}

export function PackEditor({ pack, dramas, castList, groups }: Props) {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    [...(pack.questions ?? [])].sort((a, b) => a.order - b.order)
  )
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null | 'new'>(null)
  const [isPending, startTransition] = useTransition()

  function handleDeleteQuestion(id: string) {
    startTransition(async () => {
      await deleteQuestion(pack.id, id)
      setQuestions((prev) => prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, order: i })))
    })
  }

  function handleMove(index: number, dir: -1 | 1) {
    const newQ = [...questions]
    const target = index + dir
    if (target < 0 || target >= newQ.length) return
    ;[newQ[index], newQ[target]] = [newQ[target], newQ[index]]
    const reordered = newQ.map((q, i) => ({ ...q, order: i }))
    setQuestions(reordered)
    startTransition(async () => {
      await reorderQuestions(pack.id, reordered.map((q) => q.id))
    })
  }

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateQuizPack(pack.id, { status })
      router.refresh()
    })
  }

  function handleQuestionSaved(q: QuizQuestion) {
    setQuestions((prev) => {
      const idx = prev.findIndex((x) => x.id === q.id)
      if (idx >= 0) {
        const next = [...prev]; next[idx] = q; return next
      }
      return [...prev, q]
    })
    setEditingQuestion(null)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/quiz" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ChevronLeft size={16} />
          Paketler
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-zinc-900 truncate">{pack.title}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {DIFFICULTY_LABEL[pack.difficulty] ?? pack.difficulty} · {questions.length} soru
          </p>
        </div>
        <select
          value={pack.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2 mb-4">
          <p className="text-sm text-zinc-400">Henüz soru yok.</p>
          <p className="text-xs text-zinc-300">Aşağıdan soru ekleyin.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-8">#</th>
                <th className="text-left px-4 py-3 font-medium">Tip</th>
                <th className="text-left px-4 py-3 font-medium">Soru</th>
                <th className="text-left px-4 py-3 font-medium">Zorluk</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {questions.map((q, i) => {
                const badge = TYPE_BADGE[q.type] ?? TYPE_BADGE.custom
                return (
                  <tr key={q.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-zinc-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 truncate max-w-[280px]">{questionSummary(q)}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{DIFFICULTY_LABEL[q.difficulty ?? ''] ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleMove(i, -1)} disabled={i === 0 || isPending} className="p-1 rounded text-zinc-300 hover:text-zinc-700 disabled:opacity-30">
                          <ChevronUp size={14} />
                        </button>
                        <button onClick={() => handleMove(i, 1)} disabled={i === questions.length - 1 || isPending} className="p-1 rounded text-zinc-300 hover:text-zinc-700 disabled:opacity-30">
                          <ChevronDown size={14} />
                        </button>
                        <button onClick={() => setEditingQuestion(q)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.id)} disabled={isPending} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => setEditingQuestion('new')}
        className="flex items-center gap-2 px-4 py-2 border border-zinc-300 text-sm font-medium text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
      >
        <Plus size={14} />
        Soru Ekle
      </button>

      {editingQuestion !== null && (
        <QuestionEditor
          packId={pack.id}
          question={editingQuestion === 'new' ? null : editingQuestion}
          questionCount={questions.length}
          dramas={dramas}
          castList={castList}
          groups={groups}
          onSaved={handleQuestionSaved}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </>
  )
}
