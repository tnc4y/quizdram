import { adminDb } from '@/lib/firebase-admin'
import type { Drama } from '@/lib/types'
import { QuizCreateModal } from './quiz-create-modal'
import { StatusToggle } from './status-toggle'

interface QuizPackRow {
  id: string
  title: string
  dramaId: string
  difficulty: string
  optionCount: number
  status: string
  publishedAt?: { _seconds: number } | null
}

async function getData() {
  const [packsSnap, dramasSnap] = await Promise.all([
    adminDb.collection('quizPacks').orderBy('createdAt', 'desc').get(),
    adminDb.collection('dramas').where('status', '==', 'published').orderBy('title').get(),
  ])

  const packs: QuizPackRow[] = packsSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      title: data.title ?? '—',
      dramaId: data.dramaId ?? '',
      difficulty: data.difficulty ?? '—',
      optionCount: (data.options ?? []).length,
      status: data.status ?? 'draft',
      publishedAt: data.publishedAt ?? null,
    }
  })

  const dramas = dramasSnap.docs.map((d) => d.data() as Drama)

  return { packs, dramas }
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
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

export default async function QuizPage() {
  const { packs, dramas } = await getData()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Quiz Paketleri</h1>
        <QuizCreateModal dramas={dramas} />
      </div>

      {packs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-400">Henüz quiz paketi yok.</p>
          <p className="text-xs text-zinc-300">Yeni paket oluşturarak başlayın.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Başlık</th>
                <th className="text-left px-4 py-3 font-medium">Zorluk</th>
                <th className="text-left px-4 py-3 font-medium">Şık</th>
                <th className="text-left px-4 py-3 font-medium">Durum</th>
                <th className="text-left px-4 py-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {packs.map((pack) => (
                <tr key={pack.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 truncate max-w-[280px]">{pack.title}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {DIFFICULTY_LABEL[pack.difficulty] ?? pack.difficulty}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{pack.optionCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[pack.status] ?? ''}`}>
                      {STATUS_LABEL[pack.status] ?? pack.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusToggle id={pack.id} currentStatus={pack.status as 'draft' | 'review' | 'published'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
