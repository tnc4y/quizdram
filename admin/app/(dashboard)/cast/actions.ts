'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { CastMember, Region } from '@/lib/types'

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
