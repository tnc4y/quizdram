'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { QuizQuestion, QuizGroup } from '@/lib/types'
import { deleteQuestion, reorderQuestions, updateQuizPack } from '../actions'
import { QuestionEditor } from './question-editor'
import {
  ChevronLeft, Pencil, Trash2, ChevronUp, ChevronDown, Plus,
  Volume2, Image as ImageIcon, LayoutList, FileText,
} from 'lucide-react'

interface DramaItem { id: string; title: string; titleKo: string; region: string; posterUrl: string; backdropUrl: string }
interface CastItem { id: string; name: string; nameKo: string; photoUrl: string }

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
const DIFFICULTY_CLS: Record<string, string> = {
  easy:   'bg-green-50 text-green-700',
  medium: 'bg-yellow-50 text-yellow-700',
  hard:   'bg-red-50 text-red-700',
}
const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Taslak' },
  { value: 'review',   label: 'İnceleme' },
  { value: 'published', label: 'Yayında' },
]

const TEMPLATE_LABELS: Record<string, string> = {
  which_drama_for_character: 'Karakter hangi dizide?',
  which_character_in_drama:  'Dizinin başrolü kim?',
  drama_release_year:        'Dizi kaç yılında yayınlandı?',
  cast_photo_who_is_this:    'Bu kişi kim?',
  which_region_is_drama:     'Dizi hangi ülke yapımı?',
  how_many_episodes:         'Dizi kaç bölüm?',
  drama_genre:               'Dizinin türü nedir?',
}

function templateDesc(q: QuizQuestion, dramas: DramaItem[], castList: CastItem[], groups: QuizGroup[]): string {
  const keyLabel = q.templateKey ? (TEMPLATE_LABELS[q.templateKey] ?? q.templateKey.replace(/_/g, ' ')) : ''
  const drama = q.params?.dramaId ? dramas.find((d) => d.id === q.params?.dramaId) : null
  const cast  = q.params?.castId  ? castList.find((c) => c.id === q.params?.castId)  : null
  const group = q.params?.groupId ? groups.find((g) => g.id === q.params?.groupId)   : null
  const target = drama?.title ?? cast?.name ?? group?.name ?? ''
  return target ? `${keyLabel} — ${target}` : keyLabel
}

// ── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({
  q, index, total, dramas, castList, groups, isPending,
  onEdit, onDelete, onMove,
}: {
  q: QuizQuestion
  index: number
  total: number
  dramas: DramaItem[]
  castList: CastItem[]
  groups: QuizGroup[]
  isPending: boolean
  onEdit: () => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const badge = TYPE_BADGE[q.type] ?? TYPE_BADGE.custom
  const diffCls = DIFFICULTY_CLS[q.difficulty ?? ''] ?? 'bg-zinc-100 text-zinc-500'

  const isTemplate = q.type === 'template' || q.type === 'group_template'
  const isAudio    = q.type === 'audio'
  const hasImage   = !!q.imageUrl

  const hasOptionImages = q.options?.some((o) => !!o.imageUrl)
  const textOptions     = q.options?.filter((o) => !!o.text) ?? []

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden hover:border-zinc-300 transition-colors">
      {/* Top row: order + badges + actions */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
        <span className="text-xs font-bold text-zinc-400 w-5 flex-shrink-0">{index + 1}</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.cls}`}>
          {badge.label}
        </span>
        {q.difficulty && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${diffCls}`}>
            {DIFFICULTY_LABEL[q.difficulty] ?? q.difficulty}
          </span>
        )}
        {isAudio && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
            <Volume2 size={11} />
            Ses
          </span>
        )}
        {hasImage && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700">
            <ImageIcon size={11} />
            Görsel
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0 || isPending}
            className="p-1 rounded text-zinc-300 hover:text-zinc-700 disabled:opacity-30 transition-colors"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1 || isPending}
            className="p-1 rounded text-zinc-300 hover:text-zinc-700 disabled:opacity-30 transition-colors"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 flex gap-4">
        {/* Question image thumbnail */}
        {hasImage && (
          <img
            src={q.imageUrl!}
            alt=""
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-zinc-200"
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Question text / template description */}
          {isTemplate ? (
            <div className="flex items-start gap-2">
              <LayoutList size={14} className="text-zinc-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-zinc-700">{templateDesc(q, dramas, castList, groups)}</p>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              {isAudio
                ? <Volume2 size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                : <FileText size={14} className="text-zinc-400 mt-0.5 flex-shrink-0" />
              }
              <p className="text-sm text-zinc-700 line-clamp-2">
                {q.text || (isAudio ? 'Ses sorusu' : '—')}
              </p>
            </div>
          )}

          {/* Template: auto-generated note */}
          {isTemplate && (
            <p className="text-xs text-zinc-400 italic">Seçenekler uygulama tarafından otomatik üretilir.</p>
          )}

          {/* Options preview */}
          {!isTemplate && q.options && q.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {hasOptionImages
                ? q.options.map((o) => (
                    <div
                      key={o.id}
                      className={`relative rounded-lg overflow-hidden border-2 flex-shrink-0 ${o.id === q.correctId ? 'border-green-400' : 'border-zinc-200'}`}
                    >
                      {o.imageUrl
                        ? <img src={o.imageUrl} alt="" className="w-12 h-12 object-cover" />
                        : <div className="w-12 h-12 bg-zinc-100 flex items-center justify-center text-zinc-400 text-[10px]">—</div>
                      }
                      {o.id === q.correctId && (
                        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))
                : textOptions.map((o) => (
                    <span
                      key={o.id}
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${o.id === q.correctId ? 'bg-green-50 border-green-300 text-green-700' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}
                    >
                      {o.id === q.correctId && (
                        <svg className="w-3 h-3 mr-1 text-green-500" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {o.text?.slice(0, 24)}{(o.text?.length ?? 0) > 24 ? '…' : ''}
                    </span>
                  ))
              }
            </div>
          )}

          {/* Translations indicator */}
          {q.translations && Object.keys(q.translations).length > 0 && (
            <div className="flex gap-1">
              {Object.keys(q.translations).map((lang) => (
                <span key={lang} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500 uppercase">
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pack Editor ───────────────────────────────────────────────────────────────

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

  // Type breakdown summary
  const typeCounts = questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.type] = (acc[q.type] ?? 0) + 1
    return acc
  }, {})

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
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-zinc-400">
              {DIFFICULTY_LABEL[pack.difficulty] ?? pack.difficulty} · {questions.length} soru
            </p>
            {Object.entries(typeCounts).map(([type, count]) => {
              const b = TYPE_BADGE[type] ?? TYPE_BADGE.custom
              return (
                <span key={type} className={`inline-flex items-center px-1.5 py-0 rounded text-[10px] font-medium ${b.cls}`}>
                  {count} {b.label}
                </span>
              )
            })}
          </div>
        </div>
        <select
          defaultValue={pack.status}
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
        <div className="flex flex-col gap-3 mb-4">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={i}
              total={questions.length}
              dramas={dramas}
              castList={castList}
              groups={groups}
              isPending={isPending}
              onEdit={() => setEditingQuestion(q)}
              onDelete={() => handleDeleteQuestion(q.id)}
              onMove={(dir) => handleMove(i, dir)}
            />
          ))}
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
