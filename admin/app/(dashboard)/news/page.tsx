import { adminDb } from '@/lib/firebase-admin'
import type { Drama } from '@/lib/types'
import { NewsCreateModal } from './news-create-modal'
import { NewsStatusToggle } from './news-status-toggle'

interface NewsRow {
  id: string
  tag: string
  tagBg: string
  tagFg: string
  headline: string
  source: string
  category: string
  status: string
}

async function getData() {
  const [newsSnap, dramasSnap] = await Promise.all([
    adminDb.collection('news').orderBy('createdAt', 'desc').get(),
    adminDb.collection('dramas').where('status', '==', 'published').orderBy('title').get(),
  ])

  const news: NewsRow[] = newsSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      tag: data.tag ?? '—',
      tagBg: data.tagBg ?? '#F4F4F5',
      tagFg: data.tagFg ?? '#71717A',
      headline: data.headline ?? '—',
      source: data.source ?? '—',
      category: data.category ?? '—',
      status: data.status ?? 'draft',
    }
  })

  const dramas = dramasSnap.docs.map((d) => d.data() as Drama)

  return { news, dramas }
}

const CATEGORY_LABEL: Record<string, string> = {
  trend: 'Trend',
  new_show: 'Yeni Dizi',
  gossip: 'Dedikodu',
  interview: 'Röportaj',
}

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-500',
  published: 'bg-green-50 text-green-700',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Taslak',
  published: 'Yayında',
}

export default async function NewsPage() {
  const { news, dramas } = await getData()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Haberler</h1>
        <NewsCreateModal dramas={dramas} />
      </div>

      {news.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-400">Henüz haber yok.</p>
          <p className="text-xs text-zinc-300">Yeni haber oluşturarak başlayın.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Etiket</th>
                <th className="text-left px-4 py-3 font-medium">Başlık</th>
                <th className="text-left px-4 py-3 font-medium">Kategori</th>
                <th className="text-left px-4 py-3 font-medium">Kaynak</th>
                <th className="text-left px-4 py-3 font-medium">Durum</th>
                <th className="text-left px-4 py-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: item.tagBg, color: item.tagFg }}
                    >
                      {item.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 truncate max-w-[300px]">{item.headline}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 truncate max-w-[100px]">{item.source}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[item.status] ?? ''}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <NewsStatusToggle id={item.id} currentStatus={item.status as 'draft' | 'published'} />
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
