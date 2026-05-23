'use client'

import { useState, useTransition } from 'react'
import { migrateDramaDocIds } from './actions'
import { Fingerprint } from 'lucide-react'

export function MigrateDramaIdsBtn() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    migrated: number
    skipped: number
  } | null>(null)

  function handleMigrate() {
    if (
      !confirm(
        'Tüm drama doc ID\'leri TMDB ID\'si ile değiştirilecek. Duplicate kayıtlar silinecek. Devam et?'
      )
    )
      return

    startTransition(async () => {
      const res = await migrateDramaDocIds()
      if (res.error) {
        alert(res.error)
        return
      }
      setResult({ migrated: res.migrated, skipped: res.skipped })
    })
  }

  if (result) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 font-medium">✓ {result.migrated} taşındı</span>
        {result.skipped > 0 && (
          <span className="text-zinc-400">{result.skipped} atlandı/silindi</span>
        )}
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
      <Fingerprint size={14} />
      {isPending ? 'ID\'ler güncelleniyor…' : 'Doc ID → TMDB ID'}
    </button>
  )
}
