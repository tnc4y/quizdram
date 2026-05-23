import { adminDb } from '@/lib/firebase-admin'
import type { CastMember } from '@/lib/types'
import { CastTable } from './cast-table'
import { FixNameKoBtn } from './fix-nameko-btn'
import { MigrateIdsBtn } from './migrate-ids-btn'

async function getCast(): Promise<CastMember[]> {
  const snap = await adminDb.collection('cast').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as CastMember)
}

export default async function CastPage() {
  const cast = await getCast()
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Cast</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{cast.length} oyuncu</p>
        </div>
        <div className="flex items-center gap-2">
          <MigrateIdsBtn />
          <FixNameKoBtn />
        </div>
      </div>
      <CastTable cast={cast} />
    </div>
  )
}
