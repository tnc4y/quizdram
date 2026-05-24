import type { Drama, CastMember } from '@/lib/types'
import {
  TMDB_BASE,
  IMG_W500,
  IMG_ORIGINAL,
  POPULAR_LANGS,
  toRegion,
  fetchPersonData,
  type TmdbTranslation,
  type TmdbImage,
  type AggregateCredit,
} from '@/lib/tmdb'

type SseMsg =
  | { type: 'log'; text: string }
  | { type: 'result'; drama: Omit<Drama, 'id' | 'createdAt' | 'updatedAt'>; cast: Array<Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>> }
  | { type: 'error'; text: string }

// Streaming (SSE) version — used by the import modal for live progress display
export async function POST(request: Request) {
  const { tmdbId } = await request.json()

  if (!tmdbId) {
    return Response.json({ error: 'tmdbId gerekli' }, { status: 400 })
  }

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
      await send({ type: 'log', text: '🎬 Dizi bilgileri alınıyor...' })

      const [tvRes, aggCreditsRes, translationsRes, imagesRes] = await Promise.all([
        fetch(`${TMDB_BASE}/tv/${tmdbId}?language=ko-KR`, { headers }),
        fetch(`${TMDB_BASE}/tv/${tmdbId}/aggregate_credits`, { headers }),
        fetch(`${TMDB_BASE}/tv/${tmdbId}/translations`, { headers }),
        fetch(`${TMDB_BASE}/tv/${tmdbId}/images?include_image_language=null`, { headers }),
      ])

      if (!tvRes.ok) {
        await send({ type: 'error', text: 'TMDB drama bulunamadı' })
        return
      }

      const tv = await tvRes.json()
      const aggData = aggCreditsRes.ok ? await aggCreditsRes.json() : { cast: [] }
      const translationsData = translationsRes.ok
        ? await translationsRes.json()
        : { translations: [] }
      const imagesData = imagesRes.ok ? await imagesRes.json() : { backdrops: [], posters: [] }

      const translations: Record<string, { title?: string; synopsis?: string }> = {}
      for (const t of translationsData.translations as TmdbTranslation[]) {
        const lang = t.iso_639_1
        if (!POPULAR_LANGS.has(lang)) continue
        const title = t.data.name?.trim() || undefined
        const synopsis = t.data.overview?.trim() || undefined
        if (title || synopsis) translations[lang] = { title, synopsis }
      }

      const region = toRegion(tv.origin_country ?? [])
      const year = tv.first_air_date ? parseInt(tv.first_air_date.split('-')[0]) : 0

      const mainPosterPath: string = tv.poster_path ?? ''
      const mainBackdropPath: string = tv.backdrop_path ?? ''

      const extraBackdrops: string[] = ((imagesData.backdrops ?? []) as TmdbImage[])
        .filter((img) => img.file_path !== mainBackdropPath)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 5)
        .map((img) => `${IMG_ORIGINAL}${img.file_path}`)

      const extraPosters: string[] = ((imagesData.posters ?? []) as TmdbImage[])
        .filter((img) => img.file_path !== mainPosterPath)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 3)
        .map((img) => `${IMG_W500}${img.file_path}`)

      const drama: Omit<Drama, 'id' | 'createdAt' | 'updatedAt'> = {
        title: tv.name ?? '',
        titleKo: tv.name ?? '',
        titleEn:
          translations['en']?.title ??
          (tv.original_name !== tv.name ? tv.original_name : undefined),
        titleTr: translations['tr']?.title,
        region,
        year,
        episodes: tv.number_of_episodes ?? 0,
        genre: tv.genres?.[0]?.name ?? '',
        genres: tv.genres?.map((g: { name: string }) => g.name) ?? [],
        hue: '#000000',
        posterUrl: tv.poster_path ? `${IMG_W500}${tv.poster_path}` : undefined,
        backdropUrl: tv.backdrop_path ? `${IMG_ORIGINAL}${tv.backdrop_path}` : undefined,
        synopsis: tv.overview ?? '',
        synopsisKo: tv.overview || undefined,
        synopsisEn: translations['en']?.synopsis,
        synopsisTr: translations['tr']?.synopsis,
        translations: Object.keys(translations).length > 0 ? translations : undefined,
        images:
          extraBackdrops.length > 0 || extraPosters.length > 0
            ? {
                backdrops: extraBackdrops.length > 0 ? extraBackdrops : undefined,
                posters: extraPosters.length > 0 ? extraPosters : undefined,
              }
            : undefined,
        tmdbId: tv.id,
        status: 'draft',
      }

      // aggregate_credits: episode_count sırası, max 30
      const rawCast = ((aggData.cast ?? []) as AggregateCredit[])
        .sort((a, b) => b.total_episode_count - a.total_episode_count || a.order - b.order)
        .slice(0, 30)

      await send({
        type: 'log',
        text: `✅ "${drama.titleEn ?? drama.title}" — ${rawCast.length} oyuncu bulundu`,
      })

      // Cast üyelerini sırayla çek (progress göstermek için sequential)
      const cast: Array<Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>> = []

      for (let i = 0; i < rawCast.length; i++) {
        const member = rawCast[i]
        await send({
          type: 'log',
          text: `👤 [${i + 1}/${rawCast.length}] ${member.name} alınıyor...`,
        })

        try {
          const personData = await fetchPersonData(member.id, headers, region)
          cast.push({
            ...personData,
            name: personData.name || member.name,
            nameKo: personData.nameKo || member.name,
            photoUrl:
              personData.photoUrl ??
              (member.profile_path ? `${IMG_W500}${member.profile_path}` : undefined),
            role: i < 3 ? 'Lead' : i < 8 ? 'Supporting' : 'Guest',
          } satisfies Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>)

          const native = personData.nameKo !== personData.name
            ? ` (${personData.nameKo})`
            : ''
          await send({
            type: 'log',
            text: `   ↳ ${personData.name}${native} · ${personData.tmdbCredits?.length ?? 0} dizi kredisi`,
          })
        } catch {
          await send({ type: 'log', text: `   ↳ ⚠ ${member.name} alınamadı, atlandı` })
        }
      }

      await send({ type: 'log', text: `✅ Tamamlandı — ${cast.length} oyuncu hazır` })
      await send({ type: 'result', drama, cast })
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
