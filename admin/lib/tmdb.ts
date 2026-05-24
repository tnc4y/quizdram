import type { CastMember, TmdbCredit, Region } from './types'

export const TMDB_BASE = 'https://api.themoviedb.org/3'
export const IMG_W500 = 'https://image.tmdb.org/t/p/w500'
export const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original'

export const POPULAR_LANGS = new Set([
  'tr', 'en', 'ko', 'ja', 'zh', 'fr', 'de', 'es', 'pt',
  'ar', 'ru', 'it', 'hi', 'id', 'vi', 'th', 'pl', 'nl',
])

export interface TmdbTranslation {
  iso_639_1: string
  data: { name?: string; overview?: string; biography?: string }
}

export interface TmdbImage {
  file_path: string
  vote_average: number
}

// Aggregate credits cast member (has `roles` array instead of single `character`)
export interface AggregateCredit {
  id: number
  name: string
  original_name: string
  profile_path: string | null
  gender: number
  popularity: number
  known_for_department: string
  roles: Array<{ credit_id: string; character: string; episode_count: number }>
  total_episode_count: number
  order: number
}

// Regular credits cast member
export interface RawCredit {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export function toRegion(countries: string[]): Region {
  if (countries.includes('KR')) return 'kr'
  if (countries.includes('CN') || countries.includes('TW') || countries.includes('HK')) return 'cn'
  if (countries.includes('JP')) return 'jp'
  if (countries.includes('TH')) return 'th'
  return 'kr'
}

// Extract native name (Hangul for KR, Kana/Kanji for JP, CJK for CN, Thai for TH)
export function extractNativeName(
  alsoKnownAs: string[],
  region: Region,
  fallback: string
): string {
  const testers: Record<Region, (s: string) => boolean> = {
    kr: (s) => /[가-힣]/.test(s),
    jp: (s) => /[぀-ヿ一-鿿]/.test(s),
    cn: (s) => /[一-鿿㐀-䶿]/.test(s),
    th: (s) => /[฀-๿]/.test(s),
  }
  const test = testers[region] ?? testers.kr
  return alsoKnownAs.find(test) ?? fallback
}

export async function fetchPersonData(
  personId: number,
  headers: HeadersInit,
  dramaRegion: Region
): Promise<Omit<CastMember, 'id' | 'role' | 'createdAt' | 'updatedAt'>> {
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

  const englishName: string = person?.name ?? ''
  const alsoKnownAs: string[] = person?.also_known_as ?? []
  const nativeName = extractNativeName(alsoKnownAs, dramaRegion, englishName)

  const mainProfilePath: string = person?.profile_path ?? ''
  const extraProfiles: string[] = ((personImagesData.profiles ?? []) as TmdbImage[])
    .filter((img) => img.file_path !== mainProfilePath)
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 3)
    .map((img) => `${IMG_W500}${img.file_path}`)

  return {
    name: englishName,
    nameKo: nativeName,
    region: dramaRegion,
    age,
    hue: '#000000',
    gender: person?.gender ?? undefined,
    placeOfBirth: person?.place_of_birth ?? undefined,
    knownForDepartment: person?.known_for_department ?? undefined,
    imdbId: person?.imdb_id ?? undefined,
    popularity: person?.popularity ?? undefined,
    photoUrl: person?.profile_path ? `${IMG_W500}${person.profile_path}` : undefined,
    profileImages: extraProfiles.length > 0 ? extraProfiles : undefined,
    birthDate,
    bio: person?.biography || undefined,
    bioTranslations: Object.keys(bioTranslations).length > 0 ? bioTranslations : undefined,
    tmdbCredits: tmdbCredits.length > 0 ? tmdbCredits : undefined,
    tmdbPersonId: personId,
    status: 'draft' as const,
  }
}
