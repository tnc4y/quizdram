export default function DramasPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Dramalar</h1>
        <button className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors">
          + TMDB'den içe aktar
        </button>
      </div>
      <p className="text-sm text-zinc-400">Yakında — TMDB import ve drama listesi burada.</p>
    </div>
  )
}
