import { adminDb } from '@/lib/firebase-admin'
import type { Drama } from '@/lib/types'
import Link from 'next/link'
import { QuizCreateModal } from './quiz-create-modal'
import { StatusToggle } from './status-toggle'

interface QuizPackRow {
  id: string
  title: string
  dramaTitle: string
  questionCount: number
  difficulty: string
  status: string
}

async function getData() {
  const [packsSnap, dramasSnap] = await Promise.all([
    adminDb.collection('quizPacks').orderBy('createdAt', 'desc').get(),
    adminDb.collection('dramas').get(),
  ])

  const dramaMap = new Map(
    dramasSnap.docs.map((d) => {
      const data = d.data()
      return [d.id, (data.titleEn || data.titleKo || data.title) as string]
    })
  )

  const packs: QuizPackRow[] = packsSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      title: data.title ?? '—',
      dramaTitle: dramaMap.get(data.dramaId) ?? '—',
      questionCount: (data.questions ?? []).length,
      difficulty: data.difficulty ?? '—',
      status: data.status ?? 'draft',
    }
  })

  const dramas = dramasSnap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as Drama)
  return { packs, dramas }
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' }
const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-500',
  review: 'bg-amber-50 text-amber-700',
  published: 'bg-green-50 text-green-700',
}
const STATUS_LABEL: Record<string, string> = { draft: 'Taslak', review: 'İnceleme', published: 'Yayında' }

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
                <th className="text-left px-4 py-3 font-medium">Drama</th>
                <th className="text-left px-4 py-3 font-medium">Soru</th>
                <th className="text-left px-4 py-3 font-medium">Zorluk</th>
                <th className="text-left px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {packs.map((pack) => (
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
      )}
    </div>
  )
}
