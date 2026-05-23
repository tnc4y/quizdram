import { adminDb } from '@/lib/firebase-admin'
import type { Drama } from '@/lib/types'
import { QuizCreateModal } from './quiz-create-modal'
import { QuizTable } from './quiz-table'

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

export default async function QuizPage() {
  const { packs, dramas } = await getData()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Quiz Paketleri</h1>
        <QuizCreateModal dramas={dramas} />
      </div>
      <QuizTable packs={packs} />
    </div>
  )
}
