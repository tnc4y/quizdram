'use client'

import { useTransition } from 'react'
import { updateNewsStatus } from './actions'

export function NewsStatusToggle({
  id,
  currentStatus,
}: {
  id: string
  currentStatus: 'draft' | 'published'
}) {
  const [isPending, startTransition] = useTransition()

  const next = currentStatus === 'published' ? 'draft' : 'published'
  const label = currentStatus === 'published' ? 'Taslağa al' : 'Yayınla'

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await updateNewsStatus(id, next)
        })
      }
      className="text-xs font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50 transition-colors"
    >
      {isPending ? '…' : label}
    </button>
  )
}
