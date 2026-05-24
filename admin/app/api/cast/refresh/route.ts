import { adminDb } from '@/lib/firebase-admin'
import { fetchPersonData } from '@/lib/tmdb'
import type { CastMember, Region } from '@/lib/types'
import { FieldValue } from 'firebase-admin/firestore'

type SseMsg =
  | { type: 'log'; text: string }
  | { type: 'done'; updated: number; skipped: number; total: number }
  | { type: 'error'; text: string }


export async function GET() {
  const snap = await adminDb
    .collection('cast')
    .where('tmdbPersonId', '>=', 1)
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
      await send({ type: 'log', text: '🔍 Cast üyeleri Firestore\'dan alınıyor...' })

      const snap = await adminDb
        .collection('cast')
        .where('tmdbPersonId', '>=', 1)
        .get()

      const members = snap.docs.map((d) => d.data() as CastMember)
      const total = members.length

      await send({ type: 'log', text: `📋 ${total} cast üyesi güncelleme kuyruğuna alındı` })

      let updated = 0
      let skipped = 0

      for (let i = 0; i < members.length; i++) {
        const member = members[i]
        const { tmdbPersonId, region, id } = member

        if (!tmdbPersonId) { skipped++; continue }

        await send({
          type: 'log',
          text: `👤 [${i + 1}/${total}] ${member.name} güncelleniyor... (TMDB: ${tmdbPersonId})`,
        })

        try {
          const personData = await fetchPersonData(
            tmdbPersonId,
            headers,
            (region ?? 'kr') as Region,
          )

          // tmdbCredits içindeki undefined alanlar (posterPath vs.) Firestore'u
          // bozuyor — JSON round-trip ile temizle.
          const tmdbCreditsClean = personData.tmdbCredits
            ? JSON.parse(JSON.stringify(personData.tmdbCredits))
            : undefined

          // Yeni bağlı dramalar: tmdbCredits'teki ID'leri DB'de ara.
          // Boş array Firestore 'in' filtresini patlattığından guard şart.
          const creditTmdbIds = (personData.tmdbCredits ?? [])
            .map((c) => c.tmdbId)
            .filter((id): id is number => typeof id === 'number' && id > 0)
            .slice(0, 30)

          let newDramaIds: string[] = []
          if (creditTmdbIds.length > 0) {
            const dramaSnap = await adminDb
              .collection('dramas')
              .where('tmdbId', 'in', creditTmdbIds)
              .get()
            newDramaIds = dramaSnap.docs.map((d) => d.id)
          }

          // Sadece TMDB'den gelen, kullanıcı yönetmediği alanları güncelle.
          // hue, role, status, dramaIds (merge hariç) dokunulmaz.
          const patch: Record<string, unknown> = {
            name: personData.name || member.name,
            nameKo: personData.nameKo || member.nameKo,
            age: personData.age || member.age,
            updatedAt: FieldValue.serverTimestamp(),
          }

          if (personData.gender !== undefined)          patch.gender = personData.gender
          if (personData.placeOfBirth)                  patch.placeOfBirth = personData.placeOfBirth
          if (personData.knownForDepartment)            patch.knownForDepartment = personData.knownForDepartment
          if (personData.imdbId)                        patch.imdbId = personData.imdbId
          if (personData.popularity !== undefined)      patch.popularity = personData.popularity
          if (personData.birthDate)                     patch.birthDate = personData.birthDate
          if (personData.bio)                           patch.bio = personData.bio
          if (personData.bioTranslations)               patch.bioTranslations = personData.bioTranslations
          if (personData.photoUrl)                      patch.photoUrl = personData.photoUrl
          if (personData.profileImages?.length)         patch.profileImages = personData.profileImages
          if (tmdbCreditsClean)                         patch.tmdbCredits = tmdbCreditsClean
          if (newDramaIds.length > 0)                   patch.dramaIds = FieldValue.arrayUnion(...newDramaIds)

          // FieldValue sentinellarını ayır — JSON round-trip bunları siliyor
          const { updatedAt: updatedAtSentinel, dramaIds: dramaIdsSentinel, ...plainPatch } = patch

          // JSON round-trip: nested objelerdeki (tmdbCredits, bioTranslations vb.)
          // undefined değerlerini temizler
          const cleanPatch = JSON.parse(JSON.stringify(plainPatch))

          const finalUpdate: Record<string, unknown> = {
            ...cleanPatch,
            updatedAt: updatedAtSentinel,
          }
          if (dramaIdsSentinel !== undefined) finalUpdate.dramaIds = dramaIdsSentinel

          await adminDb.collection('cast').doc(id).update(finalUpdate)

          const native =
            personData.nameKo && personData.nameKo !== personData.name
              ? ` (${personData.nameKo})`
              : ''
          await send({
            type: 'log',
            text: `   ↳ ✅ ${personData.name}${native} güncellendi`,
          })
          updated++
        } catch (err) {
          await send({
            type: 'log',
            text: `   ↳ ⚠ ${member.name} güncellenemedi: ${String(err).slice(0, 120)}`,
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
