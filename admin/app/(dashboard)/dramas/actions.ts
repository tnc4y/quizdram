'use server'

import { revalidatePath } from 'next/cache'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import type { Drama, CastMember } from '@/lib/types'
import { FieldValue } from 'firebase-admin/firestore'

type DramaInput = Omit<Drama, 'id' | 'createdAt' | 'updatedAt'>
type CastInput = Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>

async function copyImage(tmdbUrl: string, storagePath: string): Promise<string | undefined> {
  try {
    const bucket = adminStorage.bucket()
    const file = bucket.file(storagePath)
    // Aynı dosya zaten varsa yeniden yükleme (TMDB ID klasörleri sayesinde idempotent)
    const [exists] = await file.exists()
    if (exists) {
      return `https://storage.googleapis.com/${bucket.name}/${storagePath}`
    }
    const imageRes = await fetch(tmdbUrl)
    if (!imageRes.ok) return undefined
    const buffer = Buffer.from(await imageRes.arrayBuffer())
    const contentType = imageRes.headers.get('content-type') ?? 'image/jpeg'
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

    // Galeri görselleri — klasör adı her zaman TMDB drama ID'si (dramaId)
    let galleryBackdrops: string[] | undefined
    let galleryPosters: string[] | undefined

    if (drama.images?.backdrops?.length) {
      const results = await Promise.all(
        drama.images.backdrops.slice(0, 5).map((url, i) =>
          url.startsWith('https://image.tmdb.org')
            ? copyImage(url, `dramas/${dramaId}/gallery/b${i}.jpg`)
            : Promise.resolve(url)
        )
      )
      const valid = results.filter(Boolean) as string[]
      if (valid.length > 0) galleryBackdrops = valid
    }

    if (drama.images?.posters?.length) {
      const results = await Promise.all(
        drama.images.posters.slice(0, 3).map((url, i) =>
          url.startsWith('https://image.tmdb.org')
            ? copyImage(url, `dramas/${dramaId}/gallery/p${i}.jpg`)
            : Promise.resolve(url)
        )
      )
      const valid = results.filter(Boolean) as string[]
      if (valid.length > 0) galleryPosters = valid
    }

    const dramaImages =
      galleryBackdrops || galleryPosters
        ? { backdrops: galleryBackdrops, posters: galleryPosters }
        : undefined

    await dramaRef.set(stripUndefined({
      ...drama,
      id: dramaId,
      posterUrl,
      backdropUrl,
      images: dramaImages,
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

      // Ek profil fotoğrafları — klasör adı her zaman TMDB person ID'si (castId)
      let profileImages: string[] | undefined
      if (member.profileImages?.length) {
        const results = await Promise.all(
          member.profileImages.slice(0, 3).map((url, i) =>
            url.startsWith('https://image.tmdb.org')
              ? copyImage(url, `cast/${castId}/gallery/p${i}.jpg`)
              : Promise.resolve(url)
          )
        )
        const valid = results.filter(Boolean) as string[]
        if (valid.length > 0) profileImages = valid
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
        profileImages,
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

// Tek kaydın tamamını getirir — tablo hafif select() kullanır, edit için bunu kullan
export async function getDramaById(id: string): Promise<Drama | null> {
  const doc = await adminDb.collection('dramas').doc(id).get()
  if (!doc.exists) return null
  return JSON.parse(JSON.stringify(doc.data())) as Drama
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

// Eski random klasör adlı poster/backdrop'ları dramas/{tmdbId}/... yoluna taşı
export async function migrateDramaStoragePaths(): Promise<{
  moved: number
  skipped: number
  total: number
  error?: string
}> {
  const bucket = adminStorage.bucket()
  const bucketName = bucket.name
  const urlPrefix = `https://storage.googleapis.com/${bucketName}/`

  const snap = await adminDb.collection('dramas').get()

  type FileSlot = { field: 'posterUrl' | 'backdropUrl'; expectedSuffix: string }
  const slots: FileSlot[] = [
    { field: 'posterUrl', expectedSuffix: 'poster.jpg' },
    { field: 'backdropUrl', expectedSuffix: 'backdrop.jpg' },
  ]

  const toMigrate = snap.docs.filter((doc) => {
    const d = doc.data()
    const tid: number | undefined = d.tmdbId
    if (!tid) return false
    return slots.some(({ field }) => {
      const url: string = d[field] ?? ''
      if (!url.startsWith(urlPrefix)) return false
      const currentPath = url.slice(urlPrefix.length)
      return currentPath !== `dramas/${tid}/${field === 'posterUrl' ? 'poster.jpg' : 'backdrop.jpg'}`
    })
  })

  if (toMigrate.length === 0) return { moved: 0, skipped: 0, total: snap.docs.length }

  let moved = 0
  let skipped = 0

  const BATCH_SIZE = 5
  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    const chunk = toMigrate.slice(i, i + BATCH_SIZE)

    await Promise.all(
      chunk.map(async (doc) => {
        const d = doc.data()
        const tid: number = d.tmdbId
        const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
        let anyMoved = false

        for (const { field, expectedSuffix } of slots) {
          const url: string = d[field] ?? ''
          if (!url.startsWith(urlPrefix)) continue
          const oldPath = url.slice(urlPrefix.length)
          const newPath = `dramas/${tid}/${expectedSuffix}`
          if (oldPath === newPath) continue

          try {
            const sourceFile = bucket.file(oldPath)
            const [sourceExists] = await sourceFile.exists()
            if (!sourceExists) { skipped++; continue }

            const destFile = bucket.file(newPath)
            const [destExists] = await destFile.exists()
            if (!destExists) {
              await sourceFile.copy(destFile)
              await destFile.makePublic()
            }
            await sourceFile.delete()

            update[field] = `${urlPrefix}${newPath}`
            anyMoved = true
          } catch {
            skipped++
          }
        }

        if (anyMoved) {
          await doc.ref.update(update)
          moved++
        }
      })
    )

    if (i + BATCH_SIZE < toMigrate.length) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  revalidatePath('/dramas')
  return { moved, skipped, total: snap.docs.length }
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
