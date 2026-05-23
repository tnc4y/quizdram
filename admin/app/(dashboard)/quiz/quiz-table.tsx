'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { StatusToggle } from './status-toggle'

interface QuizPackRow {
  id: string
  title: string
  dramaTitle: string
  questionCount: number
  difficulty: string
  status: string
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' }

export function QuizTable({ packs }: { packs: QuizPackRow[] }) {
  const [query, setQuery] = useState('')

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
              <th className="text-left px-4 py-3 font-medium">Başlık</th>
              <th className="text-left px-4 py-3 font-medium">Drama</th>
              <th className="text-left px-4 py-3 font-medium">Soru</th>
              <th className="text-left px-4 py-3 font-medium">Zorluk</th>
              <th className="text-left px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-400">
                  &ldquo;{query}&rdquo; için sonuç bulunamadı
                </td>
              </tr>
            )}
            {filtered.map((pack) => (
              <tr key={pack.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900 truncate max-w-[220px]">{pack.title}</p>
                </td>
                <td className="px-4 py-3 text-zinc-600 truncate max-w-[160px]">{pack.dramaTitle}</td>
                <td className="px-4 py-3 text-zinc-600">{pack.questionCount}</td>
                <td className="px-4 py-3 text-zinc-600">{DIFFICULTY_LABEL[pack.difficulty] ?? pack.difficulty}</td>
                <td className="px-4 py-3">
                  <StatusToggle id={pack.id} currentStatus={pack.status as 'draft' | 'review' | 'published'} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/quiz/${pack.id}`}
                    className="px-3 py-1 text-xs font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-400 transition-colors"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
