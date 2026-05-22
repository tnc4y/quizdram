export default function QuizPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Quiz Paketleri</h1>
        <button className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors">
          + Yeni paket
        </button>
      </div>
      <p className="text-sm text-zinc-400">Yakında — quiz paketi editörü burada.</p>
    </div>
  )
}
