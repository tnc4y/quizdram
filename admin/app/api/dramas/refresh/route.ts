import { adminDb } from '@/lib/firebase-admin'
import {
  TMDB_BASE,
  IMG_W500,
  IMG_ORIGINAL,
  POPULAR_LANGS,
  toRegion,
  type TmdbTranslation,
  type TmdbImage,
} from '@/lib/tmdb'
import { FieldValue } from 'firebase-admin/firestore'
import type { Region } from '@/lib/types'

type SseMsg =
  | { type: 'log'; text: string }
  | { type: 'done'; updated: number; skipped: number; total: number }
  | { type: 'error'; text: string }

export async function GET() {
  const snap = await adminDb
    .collection('dramas')
    .where('tmdbId', '>=', 1)
    .get()
  return Response.json({ count: snap.size })
}

export async function POST() {
  const key = process.env.TMDB_API_KEY
  if (!key) {
    return Response.json({ error: 'TMDB_API_KEY tanımlı değil' }, { status: 500 })
  }

  const headers = { Authorization: `Bearer ${key}` }
  const encoder = new TextEncoder()
  const { readable, writable } = new TransformStream<Uint8Array>()
  const writer = writable.getWriter()

  function send(msg: SseMsg) {
    return writer.write(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`))
  }

  ;(async () => {
    try {
      await send({ type: 'log', text: '🔍 Dramalar Firestore\'dan alınıyor...' })

      const snap = await adminDb
        .collection('dramas')
        .where('tmdbId', '>=', 1)
        .get()

      const total = snap.docs.length
      await send({ type: 'log', text: `📋 ${total} drama güncelleme kuyruğuna alındı` })

      let updated = 0
      let skipped = 0

      for (let i = 0; i < snap.docs.length; i++) {
        const doc = snap.docs[i]
        const d = doc.data()
        const tmdbId: number = d.tmdbId

        await send({
          type: 'log',
          text: `🎬 [${i + 1}/${total}] "${d.title}" güncelleniyor... (TMDB: ${tmdbId})`,
        })

        try {
          const [tvRes, translationsRes] = await Promise.all([
            fetch(`${TMDB_BASE}/tv/${tmdbId}?language=ko-KR`, { headers }),
            fetch(`${TMDB_BASE}/tv/${tmdbId}/translations`, { headers }),
          ])

          if (!tvRes.ok) {
            await send({ type: 'log', text: `   ↳ ⚠ TMDB'de bulunamadı, atlandı` })
            skipped++
            continue
          }

          const tv = await tvRes.json()
          const translationsData = translationsRes.ok
            ? await translationsRes.json()
            : { translations: [] }

          const translations: Record<string, { title?: string; synopsis?: string }> = {}
          for (const t of translationsData.translations as TmdbTranslation[]) {
            const lang = t.iso_639_1
            if (!POPULAR_LANGS.has(lang)) continue
            const title = t.data.name?.trim() || undefined
            const synopsis = t.data.overview?.trim() || undefined
            if (title || synopsis) translations[lang] = { title, synopsis }
          }

          const region = toRegion(tv.origin_country ?? []) as Region
          const year = tv.first_air_date ? parseInt(tv.first_air_date.split('-')[0]) : 0

          const patch: Record<string, unknown> = {
            title: tv.name ?? d.title,
            titleKo: tv.name ?? d.titleKo,
            region,
            year: year || d.year,
            episodes: tv.number_of_episodes ?? d.episodes,
            genre: tv.genres?.[0]?.name ?? d.genre,
            genres: tv.genres?.map((g: { name: string }) => g.name) ?? d.genres,
            synopsis: tv.overview || d.synopsis,
            synopsisKo: tv.overview || d.synopsisKo,
            updatedAt: FieldValue.serverTimestamp(),
          }

          // titleEn: translations['en'] varsa veya original_name Korece değilse
          const enTitle = translations['en']?.title
          const originalName: string = tv.original_name ?? ''
          if (enTitle) {
            patch.titleEn = enTitle
          } else if (originalName && originalName !== tv.name) {
            patch.titleEn = originalName
          }

          if (translations['tr']?.title) patch.titleTr = translations['tr'].title
          if (translations['en']?.synopsis) patch.synopsisEn = translations['en'].synopsis
          if (translations['tr']?.synopsis) patch.synopsisTr = translations['tr'].synopsis
          if (Object.keys(translations).length > 0) patch.translations = translations

          // posterUrl/backdropUrl: sadece mevcut değer yoksa veya TMDB path değişmişse yaz
          if (tv.poster_path && !d.posterUrl?.includes('/dramas/')) {
            patch.posterUrl = `${IMG_W500}${tv.poster_path}`
          }
          if (tv.backdrop_path && !d.backdropUrl?.includes('/dramas/')) {
            patch.backdropUrl = `${IMG_ORIGINAL}${tv.backdrop_path}`
          }

          // FieldValue sentinellarını patch'ten ayır — JSON.stringify bunları siliyor
          const { updatedAt: updatedAtSentinel, ...plainPatch } = patch

          // JSON round-trip: nested objelerdeki undefined'ları da temizler
          // (translations.en.synopsis: undefined gibi Firestore'u patlatan değerler)
          const cleanPatch = JSON.parse(JSON.stringify(plainPatch))

          await doc.ref.update({ ...cleanPatch, updatedAt: updatedAtSentinel })
          updated++
        } catch (err) {
          await send({
            type: 'log',
            text: `   ↳ ⚠ Güncellenemedi: ${String(err).slice(0, 100)}`,
          })
          skipped++
        }
      }

      await send({ type: 'log', text: `\n✅ Tamamlandı — ${updated} güncellendi, ${skipped} atlandı` })
      await send({ type: 'done', updated, skipped, total })
    } catch (err) {
      await send({ type: 'error', text: String(err) })
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
