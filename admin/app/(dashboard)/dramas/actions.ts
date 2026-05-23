'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import type { Drama, CastMember } from '@/lib/types'
import { FieldValue } from 'firebase-admin/firestore'

type DramaInput = Omit<Drama, 'id' | 'createdAt' | 'updatedAt'>
type CastInput = Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>

async function copyImage(tmdbUrl: string, storagePath: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/tmdb/copy-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbUrl, storagePath }),
    })
    if (!res.ok) return undefined
    const data = await res.json()
    return data.url as string
  } catch {
    return undefined
  }
}

export async function saveDrama(
  drama: DramaInput,
  cast: CastInput[]
): Promise<{ error?: string }> {
  try {
    const dramaRef = adminDb.collection('dramas').doc()
    const dramaId = dramaRef.id

    let posterUrl = drama.posterUrl
    let backdropUrl = drama.backdropUrl

    if (posterUrl?.startsWith('https://image.tmdb.org')) {
      posterUrl = await copyImage(posterUrl, `dramas/${dramaId}/poster.jpg`)
    }
    if (backdropUrl?.startsWith('https://image.tmdb.org')) {
      backdropUrl = await copyImage(backdropUrl, `dramas/${dramaId}/backdrop.jpg`)
    }

    await dramaRef.set({
      ...drama,
      id: dramaId,
      posterUrl,
      backdropUrl,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    const castSaves = cast.map(async (member) => {
      const castRef = adminDb.collection('cast').doc()
      const castId = castRef.id

      let photoUrl = member.photoUrl
      if (photoUrl?.startsWith('https://image.tmdb.org')) {
        photoUrl = await copyImage(photoUrl, `cast/${castId}/photo.jpg`)
      }

      await castRef.set({
        ...member,
        id: castId,
        photoUrl,
        dramaIds: [dramaId],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    await Promise.all(castSaves)

    revalidatePath('/dramas')
    return {}
  } catch (err) {
    console.error('saveDrama hatası:', err)
    return { error: 'Kayıt başarısız. Konsolu kontrol edin.' }
  }
}
