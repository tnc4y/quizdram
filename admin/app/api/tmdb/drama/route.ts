import type { Drama, CastMember, TmdbCredit, Region } from '@/lib/types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original'

const POPULAR_LANGS = new Set([
  'tr', 'en', 'ko', 'ja', 'zh', 'fr', 'de', 'es', 'pt',
  'ar', 'ru', 'it', 'hi', 'id', 'vi', 'th', 'pl', 'nl',
])

interface TmdbTranslation {
  iso_639_1: string
  data: { name?: string; overview?: string; biography?: string }
}

interface RawCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

function toRegion(countries: string[]): Region {
  if (countries.includes('KR')) return 'kr'
  if (countries.includes('CN') || countries.includes('TW') || countries.includes('HK')) return 'cn'
  if (countries.includes('JP')) return 'jp'
  if (countries.includes('TH')) return 'th'
  return 'kr'
}

async function fetchPersonData(
  personId: number,
  headers: HeadersInit,
  dramaRegion: Region
): Promise<Omit<CastMember, 'id' | 'role' | 'order' | 'createdAt' | 'updatedAt'>> {
  // Kişi için 3 isteği paralel at
  const [personRes, translationsRes, tvCreditsRes] = await Promise.all([
    fetch(`${TMDB_BASE}/person/${personId}?language=ko-KR`, { headers }),
    fetch(`${TMDB_BASE}/person/${personId}/translations`, { headers }),
    fetch(`${TMDB_BASE}/person/${personId}/tv_credits?language=ko-KR`, { headers }),
  ])

  const person = personRes.ok ? await personRes.json() : null
  const translationsData = translationsRes.ok
    ? await translationsRes.json()
    : { translations: [] }
  const tvCreditsData = tvCreditsRes.ok ? await tvCreditsRes.json() : { cast: [] }

  // Biyografi çevirileri — içi dolu diller
  const bioTranslations: Record<string, string> = {}
  for (const t of translationsData.translations as TmdbTranslation[]) {
    const lang = t.iso_639_1
    const bio = t.data.biography?.trim()
    if (POPULAR_LANGS.has(lang) && bio) {
      bioTranslations[lang] = bio
    }
  }

  // TV kredileri — tüm TMDB dizi görünümleri (film hariç)
  const tmdbCredits: TmdbCredit[] = (
    tvCreditsData.cast as Array<{
      id: number
      name: string
      original_name: string
      first_air_date?: string
      character: string
      poster_path: string | null
    }>
  )
    .filter((c) => !!c.first_air_date) // sadece TV dizileri
    .map((c) => ({
      tmdbId: c.id,
      title: c.name ?? c.original_name,
      titleOriginal: c.original_name !== c.name ? c.original_name : undefined,
      year: c.first_air_date ? parseInt(c.first_air_date.split('-')[0]) : undefined,
      character: c.character || undefined,
      posterPath: c.poster_path ?? undefined,
    }))

  // Doğum yılından yaklaşık yaş
  const birthDate: string | undefined = person?.birthday ?? undefined
  const age = birthDate
    ? new Date().getFullYear() - parseInt(birthDate.split('-')[0])
    : 0

  return {
    name: person?.name ?? '',
    nameKo: person?.name ?? '',
    region: dramaRegion,
    age,
    hue: '#000000',
    photoUrl: person?.profile_path
      ? `${IMG_BASE}${person.profile_path}`
      : undefined,
    birthDate,
    bio: person?.biography || undefined,
    bioTranslations: Object.keys(bioTranslations).length > 0 ? bioTranslations : undefined,
    tmdbCredits: tmdbCredits.length > 0 ? tmdbCredits : undefined,
    tmdbPersonId: personId,
    status: 'draft' as const,
  }
}

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

  // Drama için 3 paralel istek
  const [tvRes, creditsRes, translationsRes] = await Promise.all([
    fetch(`${TMDB_BASE}/tv/${tmdbId}?language=ko-KR`, { headers }),
    fetch(`${TMDB_BASE}/tv/${tmdbId}/credits?language=ko-KR`, { headers }),
    fetch(`${TMDB_BASE}/tv/${tmdbId}/translations`, { headers }),
  ])

  if (!tvRes.ok) {
    return Response.json({ error: 'TMDB drama bulunamadı' }, { status: 404 })
  }

  const tv = await tvRes.json()
  const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] }
  const translationsData = translationsRes.ok
    ? await translationsRes.json()
    : { translations: [] }

  // Drama çevirileri
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

  const drama: Omit<Drama, 'id' | 'createdAt' | 'updatedAt'> = {
    title: tv.name ?? '',
    titleKo: tv.name ?? '',
    titleEn: translations['en']?.title ?? (tv.original_name !== tv.name ? tv.original_name : undefined),
    titleTr: translations['tr']?.title,
    region,
    year,
    episodes: tv.number_of_episodes ?? 0,
    genre: tv.genres?.[0]?.name ?? '',
    genres: tv.genres?.map((g: { name: string }) => g.name) ?? [],
    hue: '#000000',
    posterUrl: tv.poster_path ? `${IMG_BASE}${tv.poster_path}` : undefined,
    backdropUrl: tv.backdrop_path ? `${IMG_ORIGINAL}${tv.backdrop_path}` : undefined,
    synopsis: tv.overview ?? '',
    synopsisKo: tv.overview || undefined,
    synopsisEn: translations['en']?.synopsis,
    synopsisTr: translations['tr']?.synopsis,
    translations: Object.keys(translations).length > 0 ? translations : undefined,
    tmdbId: tv.id,
    status: 'draft',
  }

  // Her cast üyesi için kişi detayı + çeviriler + TV kredileri paralel çek
  const rawCast = (credits.cast as RawCastMember[]).slice(0, 10)

  const cast = await Promise.all(
    rawCast.map(async (member, index) => {
      const personData = await fetchPersonData(member.id, headers, region)
      return {
        ...personData,
        // Kişi adı Korece API'den geldiyse koru, yoksa raw cast'teki adı kullan
        name: personData.name || member.name,
        nameKo: personData.name || member.name,
        // Dizideki fotoğraf yoksa cast listesindeki profile_path'i kullan
        photoUrl:
          personData.photoUrl ??
          (member.profile_path ? `${IMG_BASE}${member.profile_path}` : undefined),
        role: index < 3 ? 'Lead' : 'Supporting',
      } satisfies Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>
    })
  )

  return Response.json({ drama, cast })
}
