'use client'

import { useState } from 'react'
import type { CastMember } from '@/lib/types'
import type { CastListItem } from './page'
import { getCastById } from './actions'
import { CastEditModal } from './cast-edit-modal'
import { Pencil, Search, Loader2 } from 'lucide-react'

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
  cast: CastListItem[]
}

export function CastTable({ cast }: Props) {
  const [editing, setEditing] = useState<CastMember | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? cast.filter((c) => {
        const q = query.toLowerCase()
        return (
          c.name?.toLowerCase().includes(q) ||
          c.nameKo?.toLowerCase().includes(q) ||
          c.role?.toLowerCase().includes(q) ||
          REGION_LABEL[c.region]?.toLowerCase().includes(q)
        )
      })
    : cast

  async function handleEdit(id: string) {
    setLoadingId(id)
    try {
      const full = await getCastById(id)
      if (full) setEditing(full)
    } finally {
      setLoadingId(null)
    }
  }

  if (cast.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2">
        <p className="text-sm text-zinc-400">Henüz cast üyesi yok.</p>
        <p className="text-xs text-zinc-300">TMDB drama import edildiğinde cast otomatik eklenir.</p>
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
          placeholder="İsim (TR veya KO), rol veya bölge ile ara..."
          className="flex-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 bg-transparent"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-zinc-300 hover:text-zinc-600 text-xs">✕</button>
        )}
        <span className="text-xs text-zinc-400 flex-shrink-0">{filtered.length} / {cast.length}</span>
      </div>

      <div className="rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Fotoğraf</th>
              <th className="text-left px-4 py-3 font-medium">İsim</th>
              <th className="text-left px-4 py-3 font-medium">Bölge</th>
              <th className="text-left px-4 py-3 font-medium">Rol</th>
              <th className="text-left px-4 py-3 font-medium">Diziler</th>
              <th className="text-left px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-400">
                  &ldquo;{query}&rdquo; için sonuç bulunamadı
                </td>
              </tr>
            )}
            {filtered.map((member) => (
              <tr key={member.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  {member.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-8 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-12 bg-zinc-100 rounded flex items-center justify-center text-zinc-300 text-lg">👤</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900 truncate max-w-[160px]">{member.nameKo}</p>
                  {member.name !== member.nameKo && (
                    <p className="text-xs text-zinc-400 truncate max-w-[160px]">{member.name}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                  {REGION_LABEL[member.region] ?? member.region}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    member.role === 'Lead'
                      ? 'bg-purple-50 text-purple-700'
                      : member.role === 'Supporting'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {member.dramaIds?.length ?? 0} import
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[member.status] ?? ''}`}>
                    {STATUS_LABEL[member.status] ?? member.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEdit(member.id)}
                    disabled={loadingId === member.id}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  >
                    {loadingId === member.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Pencil size={14} />
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CastEditModal cast={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
