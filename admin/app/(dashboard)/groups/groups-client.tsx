'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizGroup, Region, Status } from '@/lib/types'
import { createGroup, updateGroup, deleteGroup } from './group-actions'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface DramaItem { id: string; title: string; region: string }
interface CastItem { id: string; name: string; photoUrl?: string }

interface Props {
  groups: QuizGroup[]
  dramas: DramaItem[]
  castList: CastItem[]
}

const TYPE_LABEL = { drama: 'Dizi', cast: 'Oyuncu' }
const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-500',
  review: 'bg-amber-50 text-amber-700',
  published: 'bg-green-50 text-green-700',
}
const STATUS_LABEL: Record<string, string> = { draft: 'Taslak', review: 'İnceleme', published: 'Yayında' }

export function GroupsClient({ groups, dramas, castList }: Props) {
  const [editing, setEditing] = useState<QuizGroup | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Quiz Grupları</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <Plus size={14} />
          Yeni Grup
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-400">Henüz grup yok.</p>
          <p className="text-xs text-zinc-300">Gruplar, quiz sorularında rastgele seçim için kullanılır.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Grup Adı</th>
                <th className="text-left px-4 py-3 font-medium">Tip</th>
                <th className="text-left px-4 py-3 font-medium">Öğe Sayısı</th>
                <th className="text-left px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{group.name}</p>
                    {group.description && <p className="text-xs text-zinc-400 mt-0.5">{group.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{TYPE_LABEL[group.type]}</td>
                  <td className="px-4 py-3 text-zinc-600">{group.itemIds.length}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[group.status] ?? ''}`}>
                      {STATUS_LABEL[group.status] ?? group.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditing(group)}
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
      )}

      {(creating || editing) && (
        <GroupEditModal
          group={editing}
          dramas={dramas}
          castList={castList}
          onClose={() => { setEditing(null); setCreating(false) }}
        />
      )}
    </>
  )
}

// ── Group Edit Modal ────────────────────────────────────────────────────────

function GroupEditModal({
  group,
  dramas,
  castList,
  onClose,
}: {
  group: QuizGroup | null
  dramas: DramaItem[]
  castList: CastItem[]
  onClose: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState(group?.name ?? '')
  const [description, setDescription] = useState(group?.description ?? '')
  const [type, setType] = useState<'drama' | 'cast'>(group?.type ?? 'drama')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(group?.itemIds ?? []))
  const [status, setStatus] = useState<Status>(group?.status ?? 'draft')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const items = type === 'drama' ? dramas : castList
  const filtered = items.filter((item) => {
    const label = (item as CastItem).name ?? (item as DramaItem).title ?? ''
    return label.toLowerCase().includes(search.toLowerCase())
  })

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const input = { name, description: description || undefined, type, itemIds: [...selectedIds], status }
      const result = group
        ? await updateGroup(group.id, input)
        : await createGroup(input)
      if (result.error) { setError(result.error); return }
      router.refresh()
      onClose()
    })
  }

  function handleDelete() {
    if (!group) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const result = await deleteGroup(group.id)
      if (result.error) { setError(result.error); return }
      router.refresh()
      onClose()
    })
  }

  const inputCls = 'w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 bg-white placeholder:text-zinc-400'
  const labelCls = 'block text-xs font-medium text-zinc-500 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-zinc-900">{group ? 'Grup Düzenle' : 'Yeni Grup'}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Grup Adı</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="örn. 2024 Romantik Kore Dizileri" />
          </div>
          <div>
            <label className={labelCls}>Açıklama (isteğe bağlı)</label>
            <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kısa açıklama..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tip</label>
              <div className="flex gap-2">
                {(['drama', 'cast'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setSelectedIds(new Set()) }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${type === t ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
                  >
                    {t === 'drama' ? 'Dizi' : 'Oyuncu'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Durum</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option value="draft">Taslak</option>
                <option value="review">İnceleme</option>
                <option value="published">Yayında</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              {type === 'drama' ? 'Diziler' : 'Oyuncular'} — {selectedIds.size} seçildi
            </label>
            <input
              className={`${inputCls} mb-2`}
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="border border-zinc-200 rounded-lg overflow-y-auto max-h-48 divide-y divide-zinc-100">
              {filtered.map((item) => {
                const id = item.id
                const label = (item as DramaItem).title || (item as CastItem).name
                return (
                  <label key={id} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(id)}
                      onChange={() => toggleItem(id)}
                      className="flex-shrink-0"
                    />
                    <span className="text-sm text-zinc-800">{label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 flex-shrink-0">
          {group ? (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className={`text-sm font-medium transition-colors ${confirmDelete ? 'text-red-600 hover:text-red-800' : 'text-zinc-400 hover:text-red-600'}`}
            >
              {confirmDelete ? 'Emin misin? Tekrar tıkla' : 'Sil'}
            </button>
          ) : <div />}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">İptal</button>
            <button
              onClick={handleSave}
              disabled={isPending || !name.trim()}
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
