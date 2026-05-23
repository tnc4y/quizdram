'use client'

import { useState } from 'react'
import type { Drama } from '@/lib/types'
import { DramaEditModal } from './drama-edit-modal'
import { Pencil } from 'lucide-react'

const REGION_LABEL: Record<string, string> = {
  kr: '🇰🇷 Kore',
  cn: '🇨🇳 Çin',
  jp: '🇯🇵 Japonya',
  th: '🇹🇭 Tayland',
}

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-500',
  review: 'bg-amber-50 text-amber-700',
  published: 'bg-green-50 text-green-700',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Taslak',
  review: 'İnceleme',
  published: 'Yayında',
}

interface Props {
  dramas: Drama[]
}

export function DramaTable({ dramas }: Props) {
  const [editing, setEditing] = useState<Drama | null>(null)

  if (dramas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2">
        <p className="text-sm text-zinc-400">Henüz drama yok.</p>
        <p className="text-xs text-zinc-300">TMDB&apos;den içe aktararak başlayın.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Poster</th>
              <th className="text-left px-4 py-3 font-medium">Başlık</th>
              <th className="text-left px-4 py-3 font-medium">Bölge</th>
              <th className="text-left px-4 py-3 font-medium">Yıl</th>
              <th className="text-left px-4 py-3 font-medium">Bölüm</th>
              <th className="text-left px-4 py-3 font-medium">Tür</th>
              <th className="text-left px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {dramas.map((drama) => (
              <tr key={drama.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  {drama.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={drama.posterUrl}
                      alt={drama.title}
                      className="w-8 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-12 bg-zinc-100 rounded flex items-center justify-center text-zinc-300 text-lg">🎬</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900 truncate max-w-[200px]">{drama.titleEn || drama.titleKo || drama.title}</p>
                  {drama.titleEn && drama.titleKo && (
                    <p className="text-xs text-zinc-400 truncate max-w-[200px]">{drama.titleKo}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                  {REGION_LABEL[drama.region] ?? drama.region}
                </td>
                <td className="px-4 py-3 text-zinc-600">{drama.year || '—'}</td>
                <td className="px-4 py-3 text-zinc-600">{drama.episodes || '—'}</td>
                <td className="px-4 py-3 text-zinc-600 truncate max-w-[120px]">{drama.genre || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[drama.status] ?? ''}`}>
                    {STATUS_LABEL[drama.status] ?? drama.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditing(drama)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <DramaEditModal drama={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
