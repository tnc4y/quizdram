import { adminDb } from '@/lib/firebase-admin'
import type { CastMember } from '@/lib/types'
import { CastTable } from './cast-table'

async function getCast(): Promise<CastMember[]> {
  const snap = await adminDb.collection('cast').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as CastMember)
}

export default async function CastPage() {
  const cast = await getCast()
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Cast</h1>
        <span className="text-sm text-zinc-400">{cast.length} oyuncu</span>
      </div>
      <CastTable cast={cast} />
    </div>
  )
}
