'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { QuizGroup, Region, Status } from '@/lib/types'

type GroupInput = {
  name: string
  description?: string
  type: 'drama' | 'cast'
  itemIds: string[]
  region?: Region
  status: Status
}

export async function createGroup(input: GroupInput): Promise<{ error?: string }> {
  try {
    const ref = adminDb.collection('quizGroups').doc()
    await ref.set({
      ...input,
      id: ref.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/groups')
    return {}
  } catch (err) {
    console.error('createGroup hatası:', err)
    return { error: 'Grup oluşturulamadı.' }
  }
}

export async function updateGroup(
  id: string,
  input: Partial<GroupInput>
): Promise<{ error?: string }> {
  try {
    await adminDb.collection('quizGroups').doc(id).update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/groups')
    return {}
  } catch (err) {
    console.error('updateGroup hatası:', err)
    return { error: 'Güncelleme başarısız.' }
  }
}

export async function deleteGroup(id: string): Promise<{ error?: string }> {
  try {
    await adminDb.collection('quizGroups').doc(id).delete()
    revalidatePath('/groups')
    return {}
  } catch (err) {
    console.error('deleteGroup hatası:', err)
    return { error: 'Silme başarısız.' }
  }
}

export async function getGroups(): Promise<QuizGroup[]> {
  const snap = await adminDb.collection('quizGroups').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as QuizGroup)
}
