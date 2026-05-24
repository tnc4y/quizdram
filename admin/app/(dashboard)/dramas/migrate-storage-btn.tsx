'use client'

import { useState, useTransition } from 'react'
import { migrateDramaStoragePaths } from './actions'
import { FolderSync } from 'lucide-react'

export function MigrateDramaStorageBtn() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ moved: number; skipped: number; total: number } | null>(null)

  function handleMigrate() {
    if (
      !confirm(
        'Storage\'daki eski random klasör adları TMDB drama ID\'sine taşınacak.\n\nEski poster/backdrop dosyaları silinir, Firestore URL\'leri güncellenir. Devam et?'
      )
    )
      return

    startTransition(async () => {
      const res = await migrateDramaStoragePaths()
      if (res.error) {
        alert(res.error)
        return
      }
      setResult({ moved: res.moved, skipped: res.skipped, total: res.total })
    })
  }

  if (result) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 font-medium">✓ {result.moved} drama taşındı</span>
        {result.skipped > 0 && (
          <span className="text-zinc-400">{result.skipped} atlandı</span>
        )}
        <span className="text-zinc-300">·</span>
        <span className="text-zinc-400 text-xs">{result.total} toplam</span>
        <button
          onClick={() => setResult(null)}
          className="text-xs text-zinc-400 hover:text-zinc-700 ml-1"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleMigrate}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50 transition-colors"
    >
      <FolderSync size={14} />
      {isPending ? 'Storage taşınıyor…' : 'Storage → TMDB ID'}
    </button>
  )
}
