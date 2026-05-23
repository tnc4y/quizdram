'use client'

import { useState, useTransition } from 'react'
import { migrateCastDocIds } from './actions'
import { Fingerprint } from 'lucide-react'

export function MigrateIdsBtn() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    migrated: number
    merged: number
    skipped: number
  } | null>(null)

  function handleMigrate() {
    if (
      !confirm(
        'Tüm cast doc ID\'leri TMDB person ID\'si ile değiştirilecek. Duplicate kayıtlar birleştirilecek. Devam et?'
      )
    )
      return

    startTransition(async () => {
      const res = await migrateCastDocIds()
      if (res.error) {
        alert(res.error)
        return
      }
      setResult({ migrated: res.migrated, merged: res.merged, skipped: res.skipped })
    })
  }

  if (result) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 font-medium">
          ✓ {result.migrated} taşındı
        </span>
        {result.merged > 0 && (
          <span className="text-blue-600">{result.merged} birleştirildi</span>
        )}
        {result.skipped > 0 && (
          <span className="text-zinc-400">{result.skipped} atlandı</span>
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
