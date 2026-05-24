import { adminDb } from '@/lib/firebase-admin'
import type { CastMember } from '@/lib/types'
import { CastTable } from './cast-table'
import { FixNameKoBtn } from './fix-nameko-btn'
import { MigrateIdsBtn } from './migrate-ids-btn'
import { UpdateTmdbBtn } from './update-tmdb-btn'
import { MigrateStorageBtn } from './migrate-storage-btn'

// Tablo için gereken minimum alanlar — tmdbCredits/bioTranslations/bio gibi büyük
// alanları hariç tutar, böylece 700+ kayıt saniyeler içinde yüklenir.
// Edit tıklandığında getCastById() ile tam kayıt lazy fetch edilir.
const TABLE_FIELDS = [
  'id', 'name', 'nameKo', 'role', 'region',
  'photoUrl', 'status', 'dramaIds', 'tmdbPersonId',
] as const

export type CastListItem = Pick<CastMember,
  'id' | 'name' | 'nameKo' | 'role' | 'region' |
  'photoUrl' | 'status' | 'dramaIds' | 'tmdbPersonId'
>

async function getCastListItems(): Promise<CastListItem[]> {
  const snap = await (adminDb.collection('cast') as any)
    .orderBy('createdAt', 'desc')
    .select(...TABLE_FIELDS)
    .get()
  return snap.docs.map((d: any) => JSON.parse(JSON.stringify(d.data())) as CastListItem)
}

export default async function CastPage() {
  const cast = await getCastListItems()
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Cast</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{cast.length} oyuncu</p>
        </div>
        <div className="flex items-center gap-2">
          <MigrateIdsBtn />
          <MigrateStorageBtn />
          <FixNameKoBtn />
          <UpdateTmdbBtn />
        </div>
      </div>
      <CastTable cast={cast} />
    </div>
  )
}
