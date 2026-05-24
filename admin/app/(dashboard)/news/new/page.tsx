import { adminDb } from '@/lib/firebase-admin'
import type { Drama } from '@/lib/types'
import { NewsEditor } from '../news-editor'

async function getPublishedDramas(): Promise<Drama[]> {
  const snap = await adminDb
    .collection('dramas')
    .where('status', '==', 'published')
    .orderBy('title')
    .get()
  return snap.docs.map((d) => d.data() as Drama)
}

export default async function NewNewsPage() {
  const dramas = await getPublishedDramas()
  return <NewsEditor dramas={dramas} />
}
