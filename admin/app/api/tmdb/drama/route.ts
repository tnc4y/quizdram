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

interface TmdbImage {
  file_path: string
  vote_average: number
  width: number
  height: number
}

// Hangul Unicode range check
function containsHangul(s: string): boolean {
  return /[가-힣ᄀ-ᇿ㄰-㆏]/.test(s)
}

// Extract Korean name: prefer translations endpoint, fall back to also_known_as Hangul
function extractKoreanName(
  translations: TmdbTranslation[],
  alsoKnownAs: string[],
  fallback: string
): string {
  const fromTranslation = translations
    .find((t) => t.iso_639_1 === 'ko')
    ?.data.name?.trim()
  if (fromTranslation && containsHangul(fromTranslation)) return fromTranslation

  const fromAka = alsoKnownAs.find((n) => containsHangul(n))
  if (fromAka) return fromAka

  return fallback
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
  const [personRes, tvCreditsRes, personImagesRes] = await Promise.all([
    fetch(`${TMDB_BASE}/person/${personId}?language=en-US`, { headers }),
    fetch(`${TMDB_BASE}/person/${personId}/tv_credits?language=ko-KR`, { headers }),
    fetch(`${TMDB_BASE}/person/${personId}/images`, { headers }),
  ])

  const person = personRes.ok ? await personRes.json() : null
  const tvCreditsData = tvCreditsRes.ok ? await tvCreditsRes.json() : { cast: [] }
  const personImagesData = personImagesRes.ok ? await personImagesRes.json() : { profiles: [] }

  const bioTranslations: Record<string, string> = {}
  if (person?.biography) bioTranslations['en'] = person.biography

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
    .filter((c) => !!c.first_air_date)
    .map((c) => ({
      tmdbId: c.id,
      title: c.name ?? c.original_name,
      titleOriginal: c.original_name !== c.name ? c.original_name : undefined,
      year: c.first_air_date ? parseInt(c.first_air_date.split('-')[0]) : undefined,
      character: c.character || undefined,
      posterPath: c.poster_path ?? undefined,
    }))

  const birthDate: string | undefined = person?.birthday ?? undefined
  const age = birthDate
    ? new Date().getFullYear() - parseInt(birthDate.split('-')[0])
    : 0

  const englishName = person?.name ?? ''
  const alsoKnownAs: string[] = person?.also_known_as ?? []
  const koreanName = extractKoreanName([], alsoKnownAs, englishName)

  // Profil fotoğrafları: ana profil_path hariç, oy ortalamasına göre sıralı ilk 3
  const mainProfilePath: string = person?.profile_path ?? ''
  const extraProfiles: string[] = ((personImagesData.profiles ?? []) as TmdbImage[])
    .filter((img) => img.file_path !== mainProfilePath)
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 3)
    .map((img) => `${IMG_BASE}${img.file_path}`)

  return {
    name: englishName,
    nameKo: koreanName,
    region: dramaRegion,
    age,
    hue: '#000000',
    gender: person?.gender ?? undefined,
    placeOfBirth: person?.place_of_birth ?? undefined,
    knownForDepartment: person?.known_for_department ?? undefined,
    imdbId: person?.imdb_id ?? undefined,
    popularity: person?.popularity ?? undefined,
    photoUrl: person?.profile_path
      ? `${IMG_BASE}${person.profile_path}`
      : undefined,
    profileImages: extraProfiles.length > 0 ? extraProfiles : undefined,
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

  // Drama için paralel istekler — images endpoint'i ek görseller için
  const [tvRes, creditsRes, translationsRes, imagesRes] = await Promise.all([
    fetch(`${TMDB_BASE}/tv/${tmdbId}?language=ko-KR`, { headers }),
    fetch(`${TMDB_BASE}/tv/${tmdbId}/credits?language=ko-KR`, { headers }),
    fetch(`${TMDB_BASE}/tv/${tmdbId}/translations`, { headers }),
    fetch(`${TMDB_BASE}/tv/${tmdbId}/images?include_image_language=null`, { headers }),
  ])

  if (!tvRes.ok) {
    return Response.json({ error: 'TMDB drama bulunamadı' }, { status: 404 })
  }

  const tv = await tvRes.json()
  const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] }
  const translationsData = translationsRes.ok
    ? await translationsRes.json()
    : { translations: [] }
  const imagesData = imagesRes.ok ? await imagesRes.json() : { backdrops: [], posters: [] }

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

  // Ana poster/backdrop dışındaki ek görseller (en iyi 5 backdrop, 3 poster)
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
    .map((img) => `${IMG_BASE}${img.file_path}`)

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
    images: (extraBackdrops.length > 0 || extraPosters.length > 0)
      ? {
          backdrops: extraBackdrops.length > 0 ? extraBackdrops : undefined,
          posters: extraPosters.length > 0 ? extraPosters : undefined,
        }
      : undefined,
    tmdbId: tv.id,
    status: 'draft',
  }

  const rawCast = (credits.cast as RawCastMember[]).slice(0, 10)

  const cast = await Promise.all(
    rawCast.map(async (member, index) => {
      const personData = await fetchPersonData(member.id, headers, region)
      return {
        ...personData,
        name: personData.name || member.name,
        nameKo: personData.nameKo || member.name,
        photoUrl:
          personData.photoUrl ??
          (member.profile_path ? `${IMG_BASE}${member.profile_path}` : undefined),
        role: index < 3 ? 'Lead' : 'Supporting',
      } satisfies Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>
    })
  )

  return Response.json({ drama, cast })
}
