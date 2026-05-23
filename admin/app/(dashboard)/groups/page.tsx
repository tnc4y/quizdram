import { adminDb } from '@/lib/firebase-admin'
import type { Drama, CastMember, QuizGroup } from '@/lib/types'
import { GroupsClient } from './groups-client'

async function getData() {
  const [groupsSnap, dramasSnap, castSnap] = await Promise.all([
    adminDb.collection('quizGroups').orderBy('createdAt', 'desc').get(),
    adminDb.collection('dramas').orderBy('title').get(),
    adminDb.collection('cast').orderBy('name').get(),
  ])
  return {
    groups: groupsSnap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as QuizGroup),
    dramas: dramasSnap.docs.map((d) => {
      const data = d.data()
      return { id: d.id, title: (data.titleEn || data.titleKo || data.title) as string, region: data.region as string }
    }),
    castList: castSnap.docs.map((d) => {
      const data = d.data()
      return { id: d.id, name: (data.nameEn || data.nameKo || data.name) as string, photoUrl: data.photoUrl as string | undefined }
    }),
  }
}

export default async function GroupsPage() {
  const { groups, dramas, castList } = await getData()
  return (
    <div className="p-8">
      <GroupsClient groups={groups} dramas={dramas} castList={castList} />
    </div>
  )
}
