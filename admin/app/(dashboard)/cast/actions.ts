'use server'

import { revalidatePath } from 'next/cache'
import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { CastMember, Region } from '@/lib/types'

const TMDB_BASE = 'https://api.themoviedb.org/3'

// TMDB gender → insan okunabilir string (opsiyonel kontrol için)
// 0=belirtilmemiş, 1=kadın, 2=erkek, 3=non-binary

function containsHangul(s: string): boolean {
  return /[가-힣ᄀ-ᇿ]/.test(s)
}

function isRomaji(s: string): boolean {
  return s.length > 0 && !containsHangul(s) && !/[一-鿿぀-ヿ]/.test(s)
}

type UpdatePayload = {
  name: string
  nameKo: string
  nameEn: string
  region: Region
  role: string
  birthDate: string
  hue: string
  bio: string
  bioEn: string
  bioKo: string
  status: string
  photoUrl?: string
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')
  ) as T
}

export async function updateCast(
  id: string,
  payload: UpdatePayload
): Promise<{ error?: string }> {
  try {
    const age = payload.birthDate
      ? new Date().getFullYear() - parseInt(payload.birthDate.split('-')[0])
      : undefined

    await adminDb
      .collection('cast')
      .doc(id)
      .update(
        stripUndefined({
          name: payload.name,
          nameKo: payload.nameKo,
          nameEn: payload.nameEn || undefined,
          region: payload.region,
          role: payload.role,
          birthDate: payload.birthDate || undefined,
          age: age ?? FieldValue.delete(),
          hue: payload.hue,
          bio: payload.bio || undefined,
          bioEn: payload.bioEn || undefined,
          bioKo: payload.bioKo || undefined,
          status: payload.status,
          photoUrl: payload.photoUrl,
          updatedAt: FieldValue.serverTimestamp(),
        })
      )

    revalidatePath('/cast')
    return {}
  } catch (err) {
    console.error('updateCast hatası:', err)
    return { error: 'Güncelleme başarısız.' }
  }
}

export async function deleteCast(id: string): Promise<{ error?: string }> {
  try {
    await adminDb.collection('cast').doc(id).delete()
    revalidatePath('/cast')
    return {}
  } catch (err) {
    console.error('deleteCast hatası:', err)
    return { error: 'Silme başarısız.' }
  }
}

export async function getCastList(): Promise<CastMember[]> {
  const snap = await adminDb.collection('cast').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => d.data() as CastMember)
}

// Tek kaydın tamamını getirir — tablo sadece hafif alanları yükler, edit için bunu kullan
export async function getCastById(id: string): Promise<CastMember | null> {
  const doc = await adminDb.collection('cast').doc(id).get()
  if (!doc.exists) return null
  return JSON.parse(JSON.stringify(doc.data())) as CastMember
}

// name alanı Hangul olan (romaji eksik) kayıtları TMDB'den en-US ile patch'le
export async function fixRomajiBatch(): Promise<{ updated: number; skipped: number; total: number; error?: string }> {
  const key = process.env.TMDB_API_KEY
  if (!key) return { updated: 0, skipped: 0, total: 0, error: 'TMDB_API_KEY tanımlı değil' }

  const headers = { Authorization: `Bearer ${key}` }

  const snap = await adminDb.collection('cast').get()

  // name'i Hangul olan veya nameKo ile aynı olan kayıtlar = romaji eksik
  const toFix = snap.docs.filter((doc) => {
    const d = doc.data()
    const tmdbPersonId: number | undefined = d.tmdbPersonId ?? d.tmdbId
    const name: string = d.name ?? ''
    const nameKo: string = d.nameKo ?? ''
    return tmdbPersonId && (containsHangul(name) || name === nameKo)
  })

  if (toFix.length === 0) return { updated: 0, skipped: 0, total: snap.docs.length }

  let updated = 0
  let skipped = 0

  const BATCH_SIZE = 10
  for (let i = 0; i < toFix.length; i += BATCH_SIZE) {
    const chunk = toFix.slice(i, i + BATCH_SIZE)
    await Promise.all(
      chunk.map(async (doc) => {
        const d = doc.data()
        const tmdbPersonId: number = d.tmdbPersonId ?? d.tmdbId
        try {
          const res = await fetch(
            `${TMDB_BASE}/person/${tmdbPersonId}?language=en-US`,
            { headers }
          )
          if (!res.ok) { skipped++; return }

          const person = await res.json()
          const romajiName: string = person.name ?? ''

          // TMDB'den gelen isim de Hangul ise atla
          if (!romajiName || !isRomaji(romajiName)) { skipped++; return }

          const update: Record<string, unknown> = {
            name: romajiName,
            updatedAt: FieldValue.serverTimestamp(),
          }

          // nameKo'da Hangul yoksa onu da doldur
          if (!containsHangul(d.nameKo ?? '')) {
            const aka: string[] = person.also_known_as ?? []
            const hangul = aka.find((n: string) => containsHangul(n))
            if (hangul) update.nameKo = hangul
          }

          await doc.ref.update(update)
          updated++
        } catch {
          skipped++
        }
      })
    )
    if (i + BATCH_SIZE < toFix.length) {
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  revalidatePath('/cast')
  return { updated, skipped, total: snap.docs.length }
}

// Tüm cast doc ID'lerini tmdbPersonId ile eşleştir (duplicate'i kökten önler)
export async function migrateCastDocIds(): Promise<{
  migrated: number
  merged: number
  skipped: number
  total: number
  error?: string
}> {
  const snap = await adminDb.collection('cast').get()

  const toMigrate = snap.docs.filter((doc) => {
    const d = doc.data()
    const pid = d.tmdbPersonId
    return pid && doc.id !== String(pid)
  })

  if (toMigrate.length === 0) {
    return { migrated: 0, merged: 0, skipped: 0, total: snap.docs.length }
  }

  let migrated = 0
  let merged = 0
  let skipped = 0

  const BATCH_SIZE = 10
  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    const chunk = toMigrate.slice(i, i + BATCH_SIZE)

    await Promise.all(
      chunk.map(async (doc) => {
        const d = doc.data()
        const newId = String(d.tmdbPersonId)
        const newRef = adminDb.collection('cast').doc(newId)

        try {
          const existingSnap = await newRef.get()

          if (existingSnap.exists) {
            // Zaten doğru ID'li bir doc var — sadece dramaIds'i birleştir, eskiyi sil
            const existingData = existingSnap.data()!
            const mergedDramaIds = Array.from(
              new Set([
                ...(existingData.dramaIds ?? []),
                ...(d.dramaIds ?? []),
              ])
            )
            await newRef.update({
              dramaIds: mergedDramaIds,
              updatedAt: FieldValue.serverTimestamp(),
            })
            await doc.ref.delete()
            merged++
          } else {
            // Yeni doc oluştur, eskiyi sil
            const writeBatch = adminDb.batch()
            writeBatch.set(newRef, { ...d, id: newId })
            writeBatch.delete(doc.ref)
            await writeBatch.commit()
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

  revalidatePath('/cast')
  return { migrated, merged, skipped, total: snap.docs.length }
}

// Mevcut 700+ cast kaydını TMDB'den gender + ek alanlarla güncelle
export async function updateCastTmdbDataBatch(): Promise<{
  updated: number
  skipped: number
  total: number
  error?: string
}> {
  const key = process.env.TMDB_API_KEY
  if (!key) return { updated: 0, skipped: 0, total: 0, error: 'TMDB_API_KEY tanımlı değil' }

  const headers = { Authorization: `Bearer ${key}` }

  const snap = await adminDb.collection('cast').get()

  // Sadece tmdbPersonId'si olan ve eksik alanı bulunan kayıtları işle
  const toUpdate = snap.docs.filter((doc) => {
    const d = doc.data()
    const pid: number | undefined = d.tmdbPersonId ?? d.tmdbId
    if (!pid) return false
    // gender, placeOfBirth, knownForDepartment veya imdbId eksikse güncelle
    return (
      d.gender === undefined ||
      d.gender === null ||
      d.placeOfBirth === undefined ||
      d.knownForDepartment === undefined ||
      d.imdbId === undefined
    )
  })

  if (toUpdate.length === 0) return { updated: 0, skipped: 0, total: snap.docs.length }

  let updated = 0
  let skipped = 0

  const BATCH_SIZE = 8
  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const chunk = toUpdate.slice(i, i + BATCH_SIZE)

    await Promise.all(
      chunk.map(async (doc) => {
        const d = doc.data()
        const tmdbPersonId: number = d.tmdbPersonId ?? d.tmdbId
        try {
          const res = await fetch(
            `${TMDB_BASE}/person/${tmdbPersonId}?language=en-US`,
            { headers }
          )
          if (!res.ok) { skipped++; return }

          const person = await res.json()

          const update: Record<string, unknown> = {
            updatedAt: FieldValue.serverTimestamp(),
          }

          // gender — her zaman yaz (0 geçerli bir değer)
          if (person.gender !== undefined && person.gender !== null) {
            update.gender = person.gender
          }

          if (person.place_of_birth && d.placeOfBirth === undefined) {
            update.placeOfBirth = person.place_of_birth
          }

          if (person.known_for_department && d.knownForDepartment === undefined) {
            update.knownForDepartment = person.known_for_department
          }

          if (person.imdb_id && d.imdbId === undefined) {
            update.imdbId = person.imdb_id
          }

          if (person.popularity !== undefined && d.popularity === undefined) {
            update.popularity = person.popularity
          }

          // Doğum tarihi eksikse ekle
          if (person.birthday && !d.birthDate) {
            update.birthDate = person.birthday
            const yr = parseInt(person.birthday.split('-')[0])
            if (yr > 1900) update.age = new Date().getFullYear() - yr
          }

          // nameKo eksik ya da romaji ise Hangul bulmayı dene
          if (!containsHangul(d.nameKo ?? '')) {
            const aka: string[] = person.also_known_as ?? []
            const hangul = aka.find((n: string) => containsHangul(n))
            if (hangul) update.nameKo = hangul
          }

          // bio eksikse doldur
          if (person.biography && !d.bio) {
            update.bio = person.biography
            update.bioEn = person.biography
          }

          await doc.ref.update(update)
          updated++
        } catch {
          skipped++
        }
      })
    )

    // TMDB rate limit için bekleme
    if (i + BATCH_SIZE < toUpdate.length) {
      await new Promise((r) => setTimeout(r, 350))
    }
  }

  revalidatePath('/cast')
  return { updated, skipped, total: snap.docs.length }
}

// Eski random klasör adlı Storage dosyalarını cast/{tmdbPersonId}/photo.jpg'ye taşı
export async function migrateCastStoragePaths(): Promise<{
  moved: number
  skipped: number
  total: number
  error?: string
}> {
  const bucket = adminStorage.bucket()
  const bucketName = bucket.name
  const urlPrefix = `https://storage.googleapis.com/${bucketName}/`

  const snap = await adminDb.collection('cast').get()

  const toMigrate = snap.docs.filter((doc) => {
    const d = doc.data()
    const pid: number | undefined = d.tmdbPersonId ?? d.tmdbId
    const photoUrl: string = d.photoUrl ?? ''
    if (!pid || !photoUrl.startsWith(urlPrefix)) return false
    const currentPath = photoUrl.slice(urlPrefix.length)
    const expectedPath = `cast/${pid}/photo.jpg`
    return currentPath !== expectedPath
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
        const pid: number = d.tmdbPersonId ?? d.tmdbId
        const oldPath = (d.photoUrl as string).slice(urlPrefix.length)
        const newPath = `cast/${pid}/photo.jpg`

        try {
          const sourceFile = bucket.file(oldPath)
          const [sourceExists] = await sourceFile.exists()
          if (!sourceExists) { skipped++; return }

          const destFile = bucket.file(newPath)
          const [destExists] = await destFile.exists()

          if (!destExists) {
            await sourceFile.copy(destFile)
            await destFile.makePublic()
          }
          // Kaynak kopyalandıktan (veya hedef zaten varsa) sonra sil
          await sourceFile.delete()

          const newUrl = `${urlPrefix}${newPath}`
          await doc.ref.update({ photoUrl: newUrl, updatedAt: FieldValue.serverTimestamp() })
          moved++
        } catch {
          skipped++
        }
      })
    )

    if (i + BATCH_SIZE < toMigrate.length) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  revalidatePath('/cast')
  return { moved, skipped, total: snap.docs.length }
}
