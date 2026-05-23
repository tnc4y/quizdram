'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

export interface NewsInput {
  tag: string
  tagBg: string
  tagFg: string
  headline: string
  headlineEn?: string
  source: string
  sourceUrl?: string
  hue: string
  hangul: string
  category: 'trend' | 'new_show' | 'gossip' | 'interview'
  dramaId?: string
  status: 'draft' | 'published'
}

export async function saveNews(input: NewsInput): Promise<{ error?: string }> {
  try {
    const ref = adminDb.collection('news').doc()
    await ref.set({
      id: ref.id,
      tag: input.tag,
      tagBg: input.tagBg,
      tagFg: input.tagFg,
      headline: input.headline,
      headlineEn: input.headlineEn || null,
      source: input.source,
      sourceUrl: input.sourceUrl || null,
      hue: input.hue,
      hangul: input.hangul,
      category: input.category,
      dramaId: input.dramaId || null,
      status: input.status,
      publishedAt: input.status === 'published' ? Timestamp.now() : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/news')
    return {}
  } catch (err) {
    console.error('saveNews hatası:', err)
    return { error: 'Kayıt başarısız.' }
  }
}

export async function updateNewsStatus(
  id: string,
  status: 'draft' | 'published'
): Promise<{ error?: string }> {
  try {
    await adminDb.collection('news').doc(id).update({
      status,
      publishedAt: status === 'published' ? Timestamp.now() : null,
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/news')
    return {}
  } catch (err) {
    console.error('updateNewsStatus hatası:', err)
    return { error: 'Güncelleme başarısız.' }
  }
}
