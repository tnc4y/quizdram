'use client'

import { useState, useTransition } from 'react'
import { updateCastTmdbDataBatch } from './actions'
import { RefreshCw } from 'lucide-react'

export function UpdateTmdbBtn() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ updated: number; skipped: number; total: number } | null>(null)

  function handleUpdate() {
    if (
      !confirm(
        'Tüm cast kayıtları TMDB\'den gender, doğum yeri ve diğer eksik alanlarla güncellenecek. Bu işlem birkaç dakika sürebilir. Devam et?'
      )
    )
      return

    startTransition(async () => {
      const res = await updateCastTmdbDataBatch()
      if (res.error) {
        alert(res.error)
        return
      }
      setResult({ updated: res.updated, skipped: res.skipped, total: res.total })
    })
  }

  if (result) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 font-medium">✓ {result.updated} güncellendi</span>
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
      onClick={handleUpdate}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50 transition-colors"
    >
      <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'TMDB\'den güncelleniyor…' : 'TMDB Verilerini Güncelle'}
    </button>
  )
}
