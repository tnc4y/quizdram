import { adminDb } from '@/lib/firebase-admin'
import type { Drama } from '@/lib/types'
import { TmdbImportModal } from './tmdb-import-modal'

async function getDramas(): Promise<Drama[]> {
  const snap = await adminDb.collection('dramas').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => d.data() as Drama)
}

const REGION_LABEL: Record<string, string> = {
  kr: '🇰🇷 Kore',
  cn: '🇨🇳 Çin',
  jp: '🇯🇵 Japonya',
  th: '🇹🇭 Tayland',
}

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-500',
  review: 'bg-amber-50 text-amber-700',
  published: 'bg-green-50 text-green-700',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Taslak',
  review: 'İnceleme',
  published: 'Yayında',
}

export default async function DramasPage() {
  const dramas = await getDramas()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Dramalar</h1>
        <TmdbImportModal />
      </div>

      {dramas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-400">Henüz drama yok.</p>
          <p className="text-xs text-zinc-300">TMDB&apos;den içe aktararak başlayın.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Poster</th>
                <th className="text-left px-4 py-3 font-medium">Başlık</th>
                <th className="text-left px-4 py-3 font-medium">Bölge</th>
                <th className="text-left px-4 py-3 font-medium">Yıl</th>
                <th className="text-left px-4 py-3 font-medium">Bölüm</th>
                <th className="text-left px-4 py-3 font-medium">Tür</th>
                <th className="text-left px-4 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {dramas.map((drama) => (
                <tr key={drama.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    {drama.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={drama.posterUrl}
                        alt={drama.title}
                        className="w-8 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-12 bg-zinc-100 rounded" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 truncate max-w-[200px]">{drama.title}</p>
                    {drama.titleEn && (
                      <p className="text-xs text-zinc-400 truncate max-w-[200px]">{drama.titleEn}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {REGION_LABEL[drama.region] ?? drama.region}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{drama.year || '—'}</td>
                  <td className="px-4 py-3 text-zinc-600">{drama.episodes || '—'}</td>
                  <td className="px-4 py-3 text-zinc-600 truncate max-w-[120px]">
                    {drama.genre || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[drama.status] ?? ''}`}
                    >
                      {STATUS_LABEL[drama.status] ?? drama.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
