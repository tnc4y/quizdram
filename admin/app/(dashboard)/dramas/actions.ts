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
    const dramaRef = drama.tmdbId
      ? adminDb.collection('dramas').doc(String(drama.tmdbId))
      : adminDb.collection('dramas').doc()
    const dramaId = dramaRef.id

    if ((await dramaRef.get()).exists) {
      return { error: `Bu dizi zaten mevcut (TMDB ID: ${drama.tmdbId}).` }
    }

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
      const castRef = member.tmdbPersonId
        ? adminDb.collection('cast').doc(String(member.tmdbPersonId))
        : adminDb.collection('cast').doc()
      const castId = castRef.id

      let photoUrl = member.photoUrl
      if (photoUrl?.startsWith('https://image.tmdb.org')) {
        photoUrl = await copyImage(photoUrl, `cast/${castId}/photo.jpg`)
      }

      const existing = await castRef.get()
      if (existing.exists) {
        await castRef.update({
          dramaIds: FieldValue.arrayUnion(dramaId),
          updatedAt: FieldValue.serverTimestamp(),
        })
        return
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

export async function getCastByDrama(dramaId: string): Promise<CastMember[]> {
  const snap = await adminDb
    .collection('cast')
    .where('dramaIds', 'array-contains', dramaId)
    .get()
  return snap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as CastMember)
}

export async function migrateDramaDocIds(): Promise<{
  migrated: number
  skipped: number
  total: number
  error?: string
}> {
  const snap = await adminDb.collection('dramas').get()

  const toMigrate = snap.docs.filter((doc) => {
    const d = doc.data()
    const tid = d.tmdbId
    return tid && doc.id !== String(tid)
  })

  if (toMigrate.length === 0) {
    return { migrated: 0, skipped: 0, total: snap.docs.length }
  }

  let migrated = 0
  let skipped = 0

  const BATCH_SIZE = 10
  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    const chunk = toMigrate.slice(i, i + BATCH_SIZE)

    await Promise.all(
      chunk.map(async (doc) => {
        const d = doc.data()
        const newId = String(d.tmdbId)
        const newRef = adminDb.collection('dramas').doc(newId)

        try {
          const existingSnap = await newRef.get()
          if (existingSnap.exists) {
            // Hedef ID zaten var — duplicate, eskiyi sil
            await doc.ref.delete()
            skipped++
          } else {
            const batch = adminDb.batch()
            batch.set(newRef, { ...d, id: newId })
            batch.delete(doc.ref)
            await batch.commit()
            migrated++
          }
        } catch {
          skipped++
        }
      })
    )

    if (i + BATCH_SIZE < toMigrate.length) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  revalidatePath('/dramas')
  return { migrated, skipped, total: snap.docs.length }
}

export async function checkExistingTmdbIds(tmdbIds: number[]): Promise<number[]> {
  if (tmdbIds.length === 0) return []
  const chunks: number[][] = []
  for (let i = 0; i < tmdbIds.length; i += 30) chunks.push(tmdbIds.slice(i, i + 30))
  const results = await Promise.all(
    chunks.map((chunk) =>
      adminDb.collection('dramas').where('tmdbId', 'in', chunk).get()
    )
  )
  return results.flatMap((snap) => snap.docs.map((d) => d.data().tmdbId as number))
}
