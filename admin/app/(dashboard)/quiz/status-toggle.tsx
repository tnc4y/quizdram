'use client'

import { useTransition } from 'react'
import { updateQuizPackStatus } from './actions'

const NEXT_STATUS: Record<string, { label: string; next: 'draft' | 'review' | 'published' }> = {
  draft: { label: 'Yayınla', next: 'published' },
  review: { label: 'Yayınla', next: 'published' },
  published: { label: 'Taslağa al', next: 'draft' },
}

export function StatusToggle({
  id,
  currentStatus,
}: {
  id: string
  currentStatus: 'draft' | 'review' | 'published'
}) {
  const [isPending, startTransition] = useTransition()
  const action = NEXT_STATUS[currentStatus]

  if (!action) return null

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await updateQuizPackStatus(id, action.next)
        })
      }
      className="text-xs font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50 transition-colors"
    >
      {isPending ? '…' : action.label}
    </button>
  )
}
