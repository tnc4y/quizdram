'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

export interface QuizOptionInput {
  id: string
  text: string
  sub: string
  correct: boolean
}

export interface QuizPackInput {
  title: string
  dramaId: string
  region: string
  difficulty: 'easy' | 'medium' | 'hard'
  options: QuizOptionInput[]
  status: 'draft' | 'published'
}

export async function saveQuizPack(input: QuizPackInput): Promise<{ error?: string }> {
  try {
    const correctCount = input.options.filter((o) => o.correct).length
    if (correctCount !== 1) {
      return { error: 'Tam olarak 1 doğru şık işaretlenmeli.' }
    }
    if (input.options.length < 2) {
      return { error: 'En az 2 şık gerekli.' }
    }

    const ref = adminDb.collection('quizPacks').doc()
    await ref.set({
      id: ref.id,
      title: input.title,
      dramaId: input.dramaId,
      region: input.region,
      difficulty: input.difficulty,
      options: input.options,
      playCount: 0,
      status: input.status,
      publishedAt: input.status === 'published' ? Timestamp.now() : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    revalidatePath('/quiz')
    return {}
  } catch (err) {
    console.error('saveQuizPack hatası:', err)
    return { error: 'Kayıt başarısız.' }
  }
}

export async function updateQuizPackStatus(
  id: string,
  status: 'draft' | 'review' | 'published'
): Promise<{ error?: string }> {
  try {
    await adminDb.collection('quizPacks').doc(id).update({
      status,
      publishedAt: status === 'published' ? Timestamp.now() : null,
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/quiz')
    return {}
  } catch (err) {
    console.error('updateQuizPackStatus hatası:', err)
    return { error: 'Güncelleme başarısız.' }
  }
}
