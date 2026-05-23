import type { Drama, CastMember, Region } from '@/lib/types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original'

function toRegion(countries: string[]): Region {
  if (countries.includes('KR')) return 'kr'
  if (countries.includes('CN') || countries.includes('TW') || countries.includes('HK')) return 'cn'
  if (countries.includes('JP')) return 'jp'
  if (countries.includes('TH')) return 'th'
  return 'kr'
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

  const [tvRes, creditsRes] = await Promise.all([
    fetch(`${TMDB_BASE}/tv/${tmdbId}?language=ko-KR`, {
      headers: { Authorization: `Bearer ${key}` },
    }),
    fetch(`${TMDB_BASE}/tv/${tmdbId}/credits?language=ko-KR`, {
      headers: { Authorization: `Bearer ${key}` },
    }),
  ])

  if (!tvRes.ok) {
    return Response.json({ error: 'TMDB drama bulunamadı' }, { status: 404 })
  }

  const tv = await tvRes.json()
  const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] }

  const region = toRegion(tv.origin_country ?? [])
  const year = tv.first_air_date ? parseInt(tv.first_air_date.split('-')[0]) : 0

  const drama: Omit<Drama, 'id' | 'createdAt' | 'updatedAt'> = {
    title: tv.name ?? '',
    titleKo: tv.name ?? '',
    titleEn: tv.original_name !== tv.name ? tv.original_name : undefined,
    region,
    year,
    episodes: tv.number_of_episodes ?? 0,
    genre: tv.genres?.[0]?.name ?? '',
    genres: tv.genres?.map((g: { name: string }) => g.name) ?? [],
    hue: '#000000',
    posterUrl: tv.poster_path ? `${IMG_BASE}${tv.poster_path}` : undefined,
    backdropUrl: tv.backdrop_path ? `${IMG_ORIGINAL}${tv.backdrop_path}` : undefined,
    synopsis: tv.overview ?? '',
    synopsisKo: tv.overview ?? '',
    tmdbId: tv.id,
    status: 'draft',
  }

  const cast: Array<Omit<CastMember, 'id' | 'createdAt' | 'updatedAt'>> = (
    credits.cast as Array<{
      name: string
      character: string
      profile_path: string | null
      id: number
    }>
  )
    .slice(0, 10)
    .map((member, index) => ({
      name: member.name,
      nameKo: member.name,
      region,
      role: index < 3 ? 'Lead' : 'Supporting',
      age: 0,
      hue: '#000000',
      photoUrl: member.profile_path ? `${IMG_BASE}${member.profile_path}` : undefined,
      tmdbPersonId: member.id,
      status: 'draft' as const,
    }))

  return Response.json({ drama, cast })
}
