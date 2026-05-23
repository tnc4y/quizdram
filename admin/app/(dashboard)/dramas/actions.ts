'use server'

import { revalidatePath } from 'next/cache'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import type { Drama, CastMember } from '@/lib/types'
import { FieldValue } from 'firebase-admin/firestore'

type DramaInput = Omit<Drama, 'id' | 'createdAt' | 'updatedAt'>
type CastInput = Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>

async function copyImage(tmdbUrl: string, storagePath: string): Promise<string | undefined> {
  try {
    const imageRes = await fetch(tmdbUrl)
    if (!imageRes.ok) return undefined
    const buffer = Buffer.from(await imageRes.arrayBuffer())
    const contentType = imageRes.headers.get('content-type') ?? 'image/jpeg'
    const bucket = adminStorage.bucket()
    const file = bucket.file(storagePath)
    await file.save(buffer, { metadata: { contentType }, public: true })
    return `https://storage.googleapis.com/${bucket.name}/${storagePath}`
  } catch {
    return undefined
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T
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

    await dramaRef.set(stripUndefined({
      ...drama,
      id: dramaId,
      posterUrl,
      backdropUrl,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }))

    const castSaves = cast.map(async (member) => {
      const castRef = adminDb.collection('cast').doc()
      const castId = castRef.id

      let photoUrl = member.photoUrl
      if (photoUrl?.startsWith('https://image.tmdb.org')) {
        photoUrl = await copyImage(photoUrl, `cast/${castId}/photo.jpg`)
      }

      await castRef.set(stripUndefined({
        ...member,
        id: castId,
        photoUrl,
        dramaIds: [dramaId],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }))
    })

    await Promise.all(castSaves)

    revalidatePath('/dramas')
    return {}
  } catch (err) {
    console.error('saveDrama hatası:', err)
    return { error: 'Kayıt başarısız. Konsolu kontrol edin.' }
  }
}

type UpdateDramaPayload = {
  title: string
  titleKo: string
  titleEn: string
  titleTr: string
  region: string
  year: number
  episodes: number
  genre: string
  hue: string
  status: string
  synopsis: string
  synopsisEn: string
  synopsisKo: string
  synopsisTr: string
  posterUrl?: string
}

export async function updateDrama(
  id: string,
  payload: UpdateDramaPayload
): Promise<{ error?: string }> {
  try {
    await adminDb
      .collection('dramas')
      .doc(id)
      .update(
        stripUndefined({
          title: payload.title,
          titleKo: payload.titleKo,
          titleEn: payload.titleEn || undefined,
          titleTr: payload.titleTr || undefined,
          region: payload.region,
          year: payload.year,
          episodes: payload.episodes,
          genre: payload.genre,
          hue: payload.hue,
          status: payload.status,
          synopsis: payload.synopsis || undefined,
          synopsisEn: payload.synopsisEn || undefined,
          synopsisKo: payload.synopsisKo || undefined,
          synopsisTr: payload.synopsisTr || undefined,
          posterUrl: payload.posterUrl,
          updatedAt: FieldValue.serverTimestamp(),
        })
      )

    revalidatePath('/dramas')
    return {}
  } catch (err) {
    console.error('updateDrama hatası:', err)
    return { error: 'Güncelleme başarısız.' }
  }
}

export async function deleteDrama(id: string): Promise<{ error?: string }> {
  try {
    await adminDb.collection('dramas').doc(id).delete()
    revalidatePath('/dramas')
    return {}
  } catch (err) {
    console.error('deleteDrama hatası:', err)
    return { error: 'Silme başarısız.' }
  }
}
