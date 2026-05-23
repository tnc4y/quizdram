'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { QuizQuestion, QuizGroup } from '@/lib/types'

// ── Pack CRUD ──────────────────────────────────────────────────────────────

export async function createQuizPack(input: {
  title: string
  dramaId: string
  region: string
  difficulty: 'easy' | 'medium' | 'hard'
}): Promise<{ packId?: string; error?: string }> {
  try {
    const ref = adminDb.collection('quizPacks').doc()
    await ref.set({
      id: ref.id,
      title: input.title,
      dramaId: input.dramaId,
      region: input.region,
      difficulty: input.difficulty,
      questions: [],
      playCount: 0,
      status: 'draft',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/quiz')
    return { packId: ref.id }
  } catch (err) {
    console.error('createQuizPack hatası:', err)
    return { error: 'Paket oluşturulamadı.' }
  }
}

export async function updateQuizPack(
  id: string,
  input: { title?: string; difficulty?: string; status?: string }
): Promise<{ error?: string }> {
  try {
    await adminDb.collection('quizPacks').doc(id).update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/quiz')
    revalidatePath(`/quiz/${id}`)
    return {}
  } catch (err) {
    console.error('updateQuizPack hatası:', err)
    return { error: 'Güncelleme başarısız.' }
  }
}

export async function deleteQuizPack(id: string): Promise<{ error?: string }> {
  try {
    await adminDb.collection('quizPacks').doc(id).delete()
    revalidatePath('/quiz')
    return {}
  } catch (err) {
    console.error('deleteQuizPack hatası:', err)
    return { error: 'Silme başarısız.' }
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
    revalidatePath(`/quiz/${id}`)
    return {}
  } catch (err) {
    console.error('updateQuizPackStatus hatası:', err)
    return { error: 'Güncelleme başarısız.' }
  }
}

// ── Question CRUD ──────────────────────────────────────────────────────────

export async function saveQuestion(
  packId: string,
  question: QuizQuestion
): Promise<{ error?: string }> {
  try {
    const packRef = adminDb.collection('quizPacks').doc(packId)
    const snap = await packRef.get()
    if (!snap.exists) return { error: 'Paket bulunamadı.' }

    const questions: QuizQuestion[] = snap.data()?.questions ?? []
    const idx = questions.findIndex((q) => q.id === question.id)

    if (idx >= 0) {
      questions[idx] = question
    } else {
      question.order = questions.length
      questions.push(question)
    }

    await packRef.update({ questions, updatedAt: FieldValue.serverTimestamp() })
    revalidatePath(`/quiz/${packId}`)
    return {}
  } catch (err) {
    console.error('saveQuestion hatası:', err)
    return { error: 'Soru kaydedilemedi.' }
  }
}

export async function deleteQuestion(
  packId: string,
  questionId: string
): Promise<{ error?: string }> {
  try {
    const packRef = adminDb.collection('quizPacks').doc(packId)
    const snap = await packRef.get()
    if (!snap.exists) return { error: 'Paket bulunamadı.' }

    const questions: QuizQuestion[] = (snap.data()?.questions ?? [])
      .filter((q: QuizQuestion) => q.id !== questionId)
      .map((q: QuizQuestion, i: number) => ({ ...q, order: i }))

    await packRef.update({ questions, updatedAt: FieldValue.serverTimestamp() })
    revalidatePath(`/quiz/${packId}`)
    return {}
  } catch (err) {
    console.error('deleteQuestion hatası:', err)
    return { error: 'Soru silinemedi.' }
  }
}

export async function reorderQuestions(
  packId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  try {
    const packRef = adminDb.collection('quizPacks').doc(packId)
    const snap = await packRef.get()
    if (!snap.exists) return { error: 'Paket bulunamadı.' }

    const current: QuizQuestion[] = snap.data()?.questions ?? []
    const map = new Map(current.map((q) => [q.id, q]))
    const questions = orderedIds
      .map((id, i) => map.get(id) ? { ...map.get(id)!, order: i } : null)
      .filter(Boolean) as QuizQuestion[]

    await packRef.update({ questions, updatedAt: FieldValue.serverTimestamp() })
    revalidatePath(`/quiz/${packId}`)
    return {}
  } catch (err) {
    console.error('reorderQuestions hatası:', err)
    return { error: 'Sıralama kaydedilemedi.' }
  }
}

// ── Picker helpers (lightweight data for dropdowns) ────────────────────────

export async function getDramasForPicker() {
  const snap = await adminDb.collection('dramas').orderBy('title').get()
  return snap.docs.map((d) => {
    const data = d.data()
    return { id: d.id, title: data.titleEn || data.titleKo || data.title, region: data.region }
  })
}

export async function getCastForPicker() {
  const snap = await adminDb.collection('cast').orderBy('name').get()
  return snap.docs.map((d) => {
    const data = d.data()
    return { id: d.id, name: data.nameEn || data.nameKo || data.name, photoUrl: data.photoUrl }
  })
}

export async function getGroupsForPicker(): Promise<QuizGroup[]> {
  const snap = await adminDb.collection('quizGroups').orderBy('name').get()
  return snap.docs.map((d) => JSON.parse(JSON.stringify(d.data())) as QuizGroup)
}
