import { adminDb } from '@/lib/firebase-admin'
import type { Drama } from '@/lib/types'
import { DramaTable } from './drama-table'
import { TmdbImportModal } from './tmdb-import-modal'
import { MigrateDramaIdsBtn } from './migrate-ids-btn'
import { MigrateDramaStorageBtn } from './migrate-storage-btn'

// Tablo için gereken minimum alanlar — translations/synopsis*/images gibi büyük
// alanları hariç tutar. Edit tıklandığında getDramaById() ile tam kayıt lazy fetch edilir.
const TABLE_FIELDS = [
  'id', 'title', 'titleEn', 'titleKo', 'region',
  'year', 'episodes', 'genre', 'posterUrl', 'status', 'tmdbId',
] as const

export type DramaListItem = Pick<Drama,
  'id' | 'title' | 'titleEn' | 'titleKo' | 'region' |
  'year' | 'episodes' | 'genre' | 'posterUrl' | 'status' | 'tmdbId'
>

async function getDramaListItems(): Promise<DramaListItem[]> {
  const snap = await (adminDb.collection('dramas') as any)
    .orderBy('createdAt', 'desc')
    .select(...TABLE_FIELDS)
    .get()
  return snap.docs.map((d: any) => JSON.parse(JSON.stringify(d.data())) as DramaListItem)
}

export default async function DramasPage() {
  const dramas = await getDramaListItems()
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Dramalar</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{dramas.length} drama</p>
        </div>
        <div className="flex items-center gap-2">
          <MigrateDramaIdsBtn />
          <MigrateDramaStorageBtn />
          <TmdbImportModal />
        </div>
      </div>
      <DramaTable dramas={dramas} />
    </div>
  )
}
