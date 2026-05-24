'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronRight, Volume2 } from 'lucide-react'
import { StatusToggle } from './status-toggle'
import type { QuizPackRow, QuestionPreview } from './page'

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' }

const QUIZ_TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  trivia: { label: 'Bilgi',     cls: 'bg-blue-50 text-blue-600' },
  photo:  { label: 'Fotoğraf', cls: 'bg-purple-50 text-purple-600' },
  audio:  { label: 'Ses',      cls: 'bg-amber-50 text-amber-600' },
  mixed:  { label: 'Karma',    cls: 'bg-zinc-100 text-zinc-600' },
}

const Q_TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  template:       { label: 'Şablon', cls: 'bg-blue-50 text-blue-700' },
  group_template: { label: 'Grup',   cls: 'bg-purple-50 text-purple-700' },
  custom:         { label: 'Özel',   cls: 'bg-zinc-100 text-zinc-600' },
  audio:          { label: 'Ses',    cls: 'bg-amber-50 text-amber-700' },
}

function questionSummary(q: QuestionPreview): string {
  if (q.text) return q.text
  if (q.templateKey) return q.templateKey.replace(/_/g, ' ')
  if (q.hasAudio) return 'Ses sorusu'
  return '—'
}

export function QuizTable({ packs }: { packs: QuizPackRow[] }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const filtered = query.trim()
    ? packs.filter((p) => {
        const q = query.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          p.dramaTitle.toLowerCase().includes(q) ||
          DIFFICULTY_LABEL[p.difficulty]?.toLowerCase().includes(q)
        )
      })
    : packs

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (packs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2">
        <p className="text-sm text-zinc-400">Henüz quiz paketi yok.</p>
        <p className="text-xs text-zinc-300">Yeni paket oluşturarak başlayın.</p>
      </div>
    )
  }

  return (
    <>
      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 mb-3 bg-white">
        <Search size={15} className="text-zinc-400 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paket adı veya drama ile ara..."
          className="flex-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 bg-transparent"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-zinc-300 hover:text-zinc-600 text-xs">✕</button>
        )}
        <span className="text-xs text-zinc-400 flex-shrink-0">{filtered.length} / {packs.length}</span>
      </div>

      <div className="rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="text-left px-4 py-3 font-medium">Başlık</th>
              <th className="text-left px-4 py-3 font-medium">Drama</th>
              <th className="text-left px-4 py-3 font-medium">Soru</th>
              <th className="text-left px-4 py-3 font-medium">Tür</th>
              <th className="text-left px-4 py-3 font-medium">Zorluk</th>
              <th className="text-left px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-400">
                  &ldquo;{query}&rdquo; için sonuç bulunamadı
                </td>
              </tr>
            )}
            {filtered.map((pack) => {
              const isExpanded = expanded.has(pack.id)
              const qtBadge = QUIZ_TYPE_BADGE[pack.quizType ?? ''] ?? QUIZ_TYPE_BADGE.mixed
              return (
                <Fragment key={pack.id}>
                  <tr
                    className={`hover:bg-zinc-50 transition-colors cursor-pointer select-none ${isExpanded ? 'bg-zinc-50/60' : ''}`}
                    onClick={() => toggleExpand(pack.id)}
                  >
                    <td className="px-4 py-3 text-zinc-400">
                      {isExpanded
                        ? <ChevronDown size={14} />
                        : <ChevronRight size={14} />}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900 truncate max-w-[220px]">{pack.title}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 truncate max-w-[160px]">{pack.dramaTitle}</td>
                    <td className="px-4 py-3 text-zinc-600">{pack.questionCount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${qtBadge.cls}`}>
                        {qtBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{DIFFICULTY_LABEL[pack.difficulty] ?? pack.difficulty}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusToggle id={pack.id} currentStatus={pack.status as 'draft' | 'review' | 'published'} />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/quiz/${pack.id}`}
                        className="px-3 py-1 text-xs font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-400 transition-colors"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>

                  {/* Expandable question list */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="p-0 bg-zinc-50/40">
                        <div className="border-t border-zinc-100">
                          {pack.questions.length === 0 ? (
                            <p className="px-14 py-4 text-sm text-zinc-400 italic">Bu pakette henüz soru yok.</p>
                          ) : (
                            <table className="w-full text-sm">
                              <tbody>
                                {pack.questions.map((q, i) => {
                                  const qBadge = Q_TYPE_BADGE[q.type] ?? Q_TYPE_BADGE.custom
                                  return (
                                    <tr key={q.id} className="border-t border-zinc-100/80 first:border-t-0">
                                      <td className="pl-14 pr-4 py-2.5 text-zinc-400 text-xs w-16">{i + 1}</td>
                                      <td className="px-4 py-2.5 w-28">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${qBadge.cls}`}>
                                          {qBadge.label}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-3">
                                          {q.imageUrl && (
                                            <img
                                              src={q.imageUrl}
                                              alt=""
                                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-zinc-200"
                                            />
                                          )}
                                          <div>
                                            <p className="text-zinc-700 text-sm truncate max-w-xs">{questionSummary(q)}</p>
                                            {q.hasAudio && (
                                              <div className="flex items-center gap-1 text-amber-600 text-xs mt-0.5">
                                                <Volume2 size={11} />
                                                <span>Ses sorusu</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2.5 text-zinc-400 text-xs">
                                        {q.difficulty ? (DIFFICULTY_LABEL[q.difficulty] ?? q.difficulty) : '—'}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
