'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { NewsItem } from '@/lib/types'

export interface NewsInput {
  tag: string
  tagBg: string
  tagFg: string
  headline: string
  headlineEn?: string
  headlineKo?: string
  body?: string
  bodyEn?: string
  bodyKo?: string
  source: string
  sourceUrl?: string
  imageUrl?: string
  hue: string
  hangul: string
  category: 'trend' | 'new_show' | 'gossip' | 'interview'
  dramaId?: string
  status: 'draft' | 'published'
}

function strip<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as T
}

export async function saveNews(input: NewsInput): Promise<{ id?: string; error?: string }> {
  try {
    const ref = adminDb.collection('news').doc()
    await ref.set({
      ...strip({
        id: ref.id,
        tag: input.tag,
        tagBg: input.tagBg,
        tagFg: input.tagFg,
        headline: input.headline,
        headlineEn: input.headlineEn,
        headlineKo: input.headlineKo,
        body: input.body,
        bodyEn: input.bodyEn,
        bodyKo: input.bodyKo,
        source: input.source,
        sourceUrl: input.sourceUrl,
        imageUrl: input.imageUrl,
        hue: input.hue,
        hangul: input.hangul,
        category: input.category,
        dramaId: input.dramaId,
        status: input.status,
      }),
      publishedAt: input.status === 'published' ? Timestamp.now() : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/news')
    return { id: ref.id }
  } catch (err) {
    console.error('saveNews hatası:', err)
    return { error: 'Kayıt başarısız.' }
  }
}

export async function updateNews(id: string, input: NewsInput): Promise<{ error?: string }> {
  try {
    await adminDb.collection('news').doc(id).update({
      ...strip({
        tag: input.tag,
        tagBg: input.tagBg,
        tagFg: input.tagFg,
        headline: input.headline,
        headlineEn: input.headlineEn,
        headlineKo: input.headlineKo,
        body: input.body,
        bodyEn: input.bodyEn,
        bodyKo: input.bodyKo,
        source: input.source,
        sourceUrl: input.sourceUrl,
        imageUrl: input.imageUrl,
        hue: input.hue,
        hangul: input.hangul,
        category: input.category,
        dramaId: input.dramaId,
      }),
      status: input.status,
      publishedAt: input.status === 'published' ? Timestamp.now() : null,
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/news')
    return {}
  } catch (err) {
    console.error('updateNews hatası:', err)
    return { error: 'Güncelleme başarısız.' }
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

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const doc = await adminDb.collection('news').doc(id).get()
  if (!doc.exists) return null
  return JSON.parse(JSON.stringify(doc.data())) as NewsItem
}
