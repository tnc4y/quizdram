// Quizdram Firestore tip tanımları — DATABASE.md ile senkronize
// Flutter'da karşılığı olan alanlar yorum satırında belirtilmiştir.

export type Status = 'draft' | 'review' | 'published'
export type Region = 'kr' | 'cn' | 'jp' | 'th'

// dramas/{dramaId} — Flutter: Drama
export interface Drama {
  id: string
  title: string           // Drama.title
  titleKo: string         // Drama.hangul
  titleEn?: string
  titleTr?: string
  region: Region          // Drama.region
  year: number            // Drama.year
  episodes: number        // Drama.eps
  genre: string           // Drama.genre
  genres?: string[]
  hue: string             // Drama.hue (hex)
  posterUrl?: string
  backdropUrl?: string
  synopsis?: string
  synopsisEn?: string
  synopsisKo?: string
  streamingPlatforms?: string[]
  tmdbId?: number
  kmdbId?: string
  status: Status
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
}

// cast/{castId} — Flutter: CastMember
export interface CastMember {
  id: string
  name: string            // CastMember.name
  nameKo: string          // CastMember.hangul
  nameEn?: string
  region: Region          // CastMember.region
  role: string            // CastMember.role — 'Lead' | 'Supporting' | 'Guest'
  age: number             // CastMember.age
  hue: string             // CastMember.hue (hex)
  photoUrl?: string
  birthDate?: string      // 'YYYY-MM-DD'
  nationality?: string    // ISO 3166-1 alpha-2
  bio?: string
  bioEn?: string
  bioKo?: string
  dramaIds?: string[]
  instagram?: string
  tmdbPersonId?: number
  status: Status
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
}

// quizPacks/{packId} — Flutter: QuizOpt (kısmi)
export interface QuizOption {
  id: string
  text: string            // QuizOpt.text
  sub: string             // QuizOpt.sub
}

export interface QuizQuestion {
  id: string
  text: string
  textEn?: string
  textKo?: string
  options: QuizOption[]
  correctId: string       // QuizOpt.correct → doğru şıkkın id'si
  difficulty?: 'easy' | 'medium' | 'hard'
  hint?: string
  order: number
}

export interface QuizPack {
  id: string
  title: string
  titleKo?: string
  dramaId: string
  region: Region
  difficulty: 'easy' | 'medium' | 'hard'
  coverUrl?: string
  questions: QuizQuestion[]
  playCount: number
  publishedAt?: FirebaseFirestore.Timestamp
  scheduledAt?: FirebaseFirestore.Timestamp
  createdBy: string
  status: Status
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
}

// news/{newsId} — Flutter: NewsItem
export interface NewsItem {
  id: string
  tag: string             // NewsItem.tag
  tagBg: string           // NewsItem.tagBg (hex)
  tagFg: string           // NewsItem.tagFg (hex)
  headline: string        // NewsItem.headline
  headlineEn?: string
  headlineKo?: string
  source: string          // NewsItem.source
  sourceUrl?: string
  publishedAt?: FirebaseFirestore.Timestamp  // NewsItem.time buradan hesaplanır
  hue: string             // NewsItem.hue (hex)
  hangul: string          // NewsItem.hangul
  category?: 'trend' | 'new_show' | 'gossip' | 'interview'
  imageUrl?: string
  body?: string
  bodyEn?: string
  bodyKo?: string
  dramaId?: string
  status: Status
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
}

// users/{uid} — Flutter: LeaderEntry + QzBadge (kısmi)
export interface User {
  uid: string
  displayName: string     // LeaderEntry.name
  email?: string
  avatarUrl?: string
  lang?: string
  country?: string        // LeaderEntry.country (bayrak emoji kaynağı)
  role: 'user' | 'editor' | 'admin'
  xp: number
  level: number
  streak: number          // LeaderEntry.streak
  lastPlayedAt?: FirebaseFirestore.Timestamp
  badges: string[]        // kazanılan rozet ID'leri — QzBadge.name (earned)
  bannedAt?: FirebaseFirestore.Timestamp
  bannedReason?: string
  createdAt?: FirebaseFirestore.Timestamp
}

// leaderboard/weekly, leaderboard/allTime
export interface LeaderEntry {
  rank: number            // LeaderEntry.rank
  userId: string
  displayName: string     // LeaderEntry.name
  country: string         // LeaderEntry.country
  score: string           // LeaderEntry.score (formatlanmış, örn. "24.8k")
  xp: number
  streak: number          // LeaderEntry.streak
  updatedAt?: FirebaseFirestore.Timestamp
}
