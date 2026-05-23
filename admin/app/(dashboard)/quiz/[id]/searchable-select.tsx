'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Check, ChevronDown } from 'lucide-react'

export interface SelectItem {
  id: string
  label: string
  sub?: string
  imageUrl?: string
  badge?: string
}

interface Props {
  items: SelectItem[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  emptyLabel?: string
  searchPlaceholder?: string
}

export function SearchableSelect({
  items,
  value,
  onChange,
  placeholder = '— Seçin —',
  emptyLabel = '— Seçin —',
  searchPlaceholder = 'Ara...',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = items.find((i) => i.id === value)
  const filtered = query
    ? items.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.sub?.toLowerCase().includes(query.toLowerCase())
      )
    : items

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  function select(id: string) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white hover:border-zinc-400 transition-colors text-left"
      >
        {selected?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.imageUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-zinc-100" />
        )}
        <span className={`flex-1 truncate ${selected ? 'text-zinc-900' : 'text-zinc-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.badge && (
          <span className="text-xs text-zinc-400 flex-shrink-0">{selected.badge}</span>
        )}
        <ChevronDown size={14} className="text-zinc-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100">
            <Search size={13} className="text-zinc-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-zinc-300 hover:text-zinc-600 text-xs leading-none"
              >
                ✕
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto">
            {/* Clear option */}
            <button
              type="button"
              onClick={() => select('')}
              className="w-full flex items-center px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-50 transition-colors"
            >
              {emptyLabel}
            </button>

            {filtered.length === 0 && query ? (
              <p className="px-3 py-5 text-xs text-center text-zinc-400">Sonuç bulunamadı</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => select(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-zinc-50 transition-colors text-left"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-zinc-100"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs text-zinc-400 flex-shrink-0 font-medium">
                      {item.label[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-900 truncate">{item.label}</div>
                    {item.sub && <div className="text-xs text-zinc-400 truncate">{item.sub}</div>}
                  </div>
                  {item.badge && (
                    <span className="text-xs text-zinc-400 flex-shrink-0">{item.badge}</span>
                  )}
                  {item.id === value && <Check size={13} className="text-green-500 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>

          {/* Count */}
          {items.length > 10 && (
            <div className="px-3 py-1.5 border-t border-zinc-100 text-xs text-zinc-400">
              {filtered.length} / {items.length} sonuç
            </div>
          )}
        </div>
      )}
    </div>
  )
}
