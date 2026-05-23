import { adminDb } from '@/lib/firebase-admin'
import type { Drama } from '@/lib/types'
import { DramaTable } from './drama-table'
import { TmdbImportModal } from './tmdb-import-modal'

async function getDramas(): Promise<Drama[]> {
  const snap = await adminDb.collection('dramas').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as Drama)
}

export default async function DramasPage() {
  const dramas = await getDramas()
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Dramalar</h1>
        <TmdbImportModal />
      </div>
      <DramaTable dramas={dramas} />
    </div>
  )
}
