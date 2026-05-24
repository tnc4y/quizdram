'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface DoneState {
  updated: number
  skipped: number
  total: number
}

export function UpdateTmdbBtn() {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [done, setDone] = useState<DoneState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  async function fetchCount() {
    try {
      const res = await fetch('/api/cast/refresh')
      const data = await res.json()
      setCount(data.count ?? null)
    } catch { /* ignore */ }
  }

  function handleOpen() {
    setOpen(true)
    setLogs([])
    setDone(null)
    setError(null)
    fetchCount()
  }

  function handleClose() {
    if (running) return
    setOpen(false)
  }

  async function handleStart() {
    setRunning(true)
    setLogs([])
    setDone(null)
    setError(null)

    try {
      const res = await fetch('/api/cast/refresh', { method: 'POST' })
      if (!res.body) throw new Error('Sunucu akışı desteklemiyor')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const msg = JSON.parse(line.slice(6))
            if (msg.type === 'log')   setLogs((prev) => [...prev, msg.text])
            else if (msg.type === 'done')  setDone({ updated: msg.updated, skipped: msg.skipped, total: msg.total })
            else if (msg.type === 'error') setError(msg.text)
          } catch { /* skip */ }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Güncelleme başarısız')
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title="Tüm cast üyelerini TMDB'den güncelle (ad, fotoğraf, biyografi, native name)"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
      >
        <RefreshCw size={14} />
        TMDB Verilerini Güncelle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">TMDB&apos;den Cast Güncelle</h2>
                {count !== null && !running && !done && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {count} oyuncu — ad, fotoğraf, native name, biyografi, kredi güncellenir
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                disabled={running}
                className="text-zinc-400 hover:text-zinc-700 text-xl leading-none disabled:opacity-30"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {!running && !done && !error && logs.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Ad, fotoğraf, native name (Korece/Japonca/Çince), biyografi ve TV kredi
                  listeleri TMDB&apos;den taze veriyle güncellenir.
                  {count !== null && (
                    <> <strong>{count} oyuncu</strong> işlenecek.</>
                  )}
                </p>
              )}

              {(running || logs.length > 0) && (
                <div className="rounded-xl bg-zinc-950 px-4 py-3 font-mono text-xs text-zinc-300 max-h-80 overflow-y-auto flex flex-col gap-0.5">
                  {logs.map((line, i) => (
                    <span key={i} className="whitespace-pre-wrap leading-relaxed">{line}</span>
                  ))}
                  {running && (
                    <span className="flex items-center gap-2 text-zinc-500 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                      Güncelleniyor…
                    </span>
                  )}
                  <div ref={logEndRef} />
                </div>
              )}

              {done && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex gap-4">
                  <span>✅ Tamamlandı</span>
                  <span>{done.updated} güncellendi</span>
                  <span>{done.skipped} atlandı</span>
                  <span>/{done.total} toplam</span>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100 flex-shrink-0">
              <button
                onClick={handleClose}
                disabled={running}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-40 transition-colors"
              >
                {done ? 'Kapat' : 'İptal'}
              </button>
              {!done && (
                <button
                  onClick={handleStart}
                  disabled={running}
                  className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {running && (
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  {running ? 'Güncelleniyor…' : 'Güncellemeyi Başlat'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
