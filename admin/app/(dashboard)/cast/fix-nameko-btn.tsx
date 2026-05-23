'use client'

import { useState, useTransition } from 'react'
import { fixRomajiBatch } from './actions'
import { Languages } from 'lucide-react'

export function FixNameKoBtn() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ updated: number; skipped: number } | null>(null)

  function handleFix() {
    startTransition(async () => {
      const res = await fixRomajiBatch()
      setResult({ updated: res.updated, skipped: res.skipped })
      if (res.error) alert(res.error)
    })
  }

  if (result) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600 font-medium">✓ {result.updated} güncellendi</span>
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
      onClick={handleFix}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50 transition-colors"
    >
      <Languages size={14} />
      {isPending ? 'Hangul düzeltiliyor…' : 'Hangul İsimleri Düzelt'}
    </button>
  )
}
