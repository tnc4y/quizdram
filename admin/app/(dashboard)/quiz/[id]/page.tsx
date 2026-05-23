import { adminDb } from '@/lib/firebase-admin'
import type { QuizGroup } from '@/lib/types'
import { notFound } from 'next/navigation'
import { PackEditor } from './pack-editor'

async function getData(id: string) {
  const [packSnap, dramasSnap, castSnap, groupsSnap] = await Promise.all([
    adminDb.collection('quizPacks').doc(id).get(),
    adminDb.collection('dramas').orderBy('title').get(),
    adminDb.collection('cast').orderBy('name').get(),
    adminDb.collection('quizGroups').orderBy('name').get(),
  ])

  if (!packSnap.exists) return null

  return {
    pack: JSON.parse(JSON.stringify(packSnap.data())),
    dramas: dramasSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        title: (data.titleEn || data.titleKo || data.title) as string,
        titleKo: (data.titleKo || '') as string,
        region: (data.region || 'kr') as string,
        posterUrl: (data.posterUrl || '') as string,
        backdropUrl: (data.backdropUrl || '') as string,
      }
    }),
    castList: castSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: (data.nameEn || data.name) as string,
        nameKo: (data.nameKo || '') as string,
        photoUrl: (data.photoUrl || '') as string,
      }
    }),
    groups: groupsSnap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as QuizGroup),
  }
}

export default async function PackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getData(id)
  if (!data) notFound()

  return (
    <div className="p-8">
      <PackEditor
        pack={data.pack}
        dramas={data.dramas}
        castList={data.castList}
        groups={data.groups}
      />
    </div>
  )
}
