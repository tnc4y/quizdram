import { notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import type { Drama, NewsItem } from '@/lib/types'
import { NewsEditor } from '../../news-editor'

async function getData(id: string) {
  const [newsDoc, dramasSnap] = await Promise.all([
    adminDb.collection('news').doc(id).get(),
    adminDb
      .collection('dramas')
      .where('status', '==', 'published')
      .orderBy('title')
      .get(),
  ])

  if (!newsDoc.exists) return null

  return {
    news: JSON.parse(JSON.stringify(newsDoc.data())) as NewsItem,
    dramas: dramasSnap.docs.map((d) => d.data() as Drama),
  }
}

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getData(id)
  if (!data) notFound()

  return <NewsEditor dramas={data.dramas} initial={data.news} />
}
