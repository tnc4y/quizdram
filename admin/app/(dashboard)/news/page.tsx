import Link from 'next/link'
import { adminDb } from '@/lib/firebase-admin'
import { NewsStatusToggle } from './news-status-toggle'
import { Pencil } from 'lucide-react'

interface NewsRow {
  id: string
  tag: string
  tagBg: string
  tagFg: string
  headline: string
  headlineEn: string
  headlineKo: string
  source: string
  category: string
  status: string
  hasBody: boolean
}

async function getNews(): Promise<NewsRow[]> {
  const snap = await (adminDb.collection('news') as any)
    .orderBy('createdAt', 'desc')
    .select('id', 'tag', 'tagBg', 'tagFg', 'headline', 'headlineEn', 'headlineKo', 'source', 'category', 'status', 'body')
    .get()
  return snap.docs.map((d: any) => {
    const data = d.data()
    return {
      id: d.id,
      tag: data.tag ?? '—',
      tagBg: data.tagBg ?? '#F4F4F5',
      tagFg: data.tagFg ?? '#71717A',
      headline: data.headline ?? '—',
      headlineEn: data.headlineEn ?? '',
      headlineKo: data.headlineKo ?? '',
      source: data.source ?? '—',
      category: data.category ?? '—',
      status: data.status ?? 'draft',
      hasBody: !!data.body,
    }
  })
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
  const news = await getNews()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Haberler</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{news.length} haber</p>
        </div>
        <Link
          href="/news/new"
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
        >
          + Yeni Haber
        </Link>
      </div>

      {news.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-400">Henüz haber yok.</p>
          <Link href="/news/new" className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-2">
            İlk haberi oluştur →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Etiket</th>
                <th className="text-left px-4 py-3 font-medium">Başlık</th>
                <th className="text-left px-4 py-3 font-medium">Diller</th>
                <th className="text-left px-4 py-3 font-medium">Kategori</th>
                <th className="text-left px-4 py-3 font-medium">Kaynak</th>
                <th className="text-left px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3" />
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
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="font-medium text-zinc-900 truncate">{item.headline}</p>
                    {item.hasBody && (
                      <span className="text-xs text-zinc-400">gövde var</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <span className={`text-xs px-1 rounded ${item.headline ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>TR</span>
                      <span className={`text-xs px-1 rounded ${item.headlineEn ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>EN</span>
                      <span className={`text-xs px-1 rounded ${item.headlineKo ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>KO</span>
                    </div>
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
                    <div className="flex items-center gap-1">
                      <NewsStatusToggle id={item.id} currentStatus={item.status as 'draft' | 'published'} />
                      <Link
                        href={`/news/${item.id}/edit`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                    </div>
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
