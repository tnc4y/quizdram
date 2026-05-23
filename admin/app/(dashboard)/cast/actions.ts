'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { CastMember, Region } from '@/lib/types'

const TMDB_BASE = 'https://api.themoviedb.org/3'

function containsHangul(s: string): boolean {
  return /[가-힣ᄀ-ᇿ]/.test(s)
}

function extractHangulFromAka(alsoKnownAs: string[]): string | undefined {
  return alsoKnownAs.find((n) => containsHangul(n))
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

export async function fixNameKoBatch(): Promise<{ updated: number; skipped: number; error?: string }> {
  const key = process.env.TMDB_API_KEY
  if (!key) return { updated: 0, skipped: 0, error: 'TMDB_API_KEY tanımlı değil' }

  const headers = { Authorization: `Bearer ${key}` }

  // Hangul olmayan nameKo'ya sahip cast üyelerini bul
  const snap = await adminDb.collection('cast').get()
  const toFix = snap.docs.filter((doc) => {
    const d = doc.data()
    const tmdbId: number | undefined = d.tmdbPersonId ?? d.tmdbId
    return tmdbId && !containsHangul(d.nameKo ?? '')
  })

  if (toFix.length === 0) return { updated: 0, skipped: snap.docs.length }

  let updated = 0
  let skipped = 0

  // 10'arlı batch — TMDB rate limit aşmamak için
  const BATCH_SIZE = 10
  for (let i = 0; i < toFix.length; i += BATCH_SIZE) {
    const chunk = toFix.slice(i, i + BATCH_SIZE)
    await Promise.all(
      chunk.map(async (doc) => {
        const d = doc.data()
        const tmdbPersonId: number = d.tmdbPersonId ?? d.tmdbId
        try {
          const res = await fetch(
            `${TMDB_BASE}/person/${tmdbPersonId}?language=ko-KR`,
            { headers }
          )
          if (!res.ok) { skipped++; return }
          const person = await res.json()
          const aka: string[] = person.also_known_as ?? []
          const hangul = extractHangulFromAka(aka)
          if (!hangul) { skipped++; return }

          await doc.ref.update({
            nameKo: hangul,
            updatedAt: FieldValue.serverTimestamp(),
          })
          updated++
        } catch {
          skipped++
        }
      })
    )
    // Batch'ler arası kısa bekleme
    if (i + BATCH_SIZE < toFix.length) {
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  revalidatePath('/cast')
  return { updated, skipped }
}
