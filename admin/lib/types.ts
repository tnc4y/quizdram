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
  synopsisTr?: string
  // { 'tr': { title: '...', synopsis: '...' }, 'en': { ... }, 'ja': { ... }, ... }
  translations?: Record<string, { title?: string; synopsis?: string }>
  popularity?: number
  voteAverage?: number
  voteCount?: number
  streamingPlatforms?: string[]
  tmdbId?: number
  kmdbId?: string
  // TMDB'den gelen ek görseller (Firebase Storage URL'leri)
  images?: {
    backdrops?: string[]
    posters?: string[]
  }
  status: Status
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
}

// TMDB'den gelen TV kredisi (henüz import edilmemiş diziler dahil)
export interface TmdbCredit {
  tmdbId: number
  title: string           // Gösterim başlığı (asıl dil)
  titleOriginal?: string  // Orijinal başlık (farklıysa)
  year?: number           // İlk yayın yılı
  character?: string      // Oynadığı karakter adı
  posterPath?: string     // '/abc.jpg' — önizleme için TMDB raw path
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
  profileImages?: string[] // ek profil fotoğrafları (Firebase Storage URL'leri)
  birthDate?: string      // 'YYYY-MM-DD'
  gender?: number         // TMDB: 0=belirtilmemiş, 1=kadın, 2=erkek, 3=non-binary
  nationality?: string    // ISO 3166-1 alpha-2
  placeOfBirth?: string
  knownForDepartment?: string // 'Acting', 'Directing', vb.
  imdbId?: string
  popularity?: number
  bio?: string            // Biyografi (İngilizce / TMDB varsayılan)
  bioEn?: string
  bioKo?: string
  // { 'tr': 'Türkçe bio...', 'ja': '日本語bio...', ... }
  bioTranslations?: Record<string, string>
  dramaIds?: string[]     // Firestore'a import edilmiş drama ID'leri
  // TMDB'deki tüm TV kredileri — henüz import edilmemiş diziler dahil
  tmdbCredits?: TmdbCredit[]
  instagram?: string
  tmdbPersonId?: number
  status: Status
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
}

// quizPacks/{packId}

// Şablon soru tipleri — Flutter uygulamasında metni çevrilir, parametreler DB'den gelir
export type QuizTemplateKey =
  | 'which_drama_for_character'   // "{character} hangi dizide oynuyor?"
  | 'which_character_in_drama'    // "{drama} dizisinin başrolü kim?"
  | 'drama_release_year'          // "{drama} kaç yılında yayınlandı?"
  | 'cast_photo_who_is_this'      // "Bu kişi kim?"
  | 'which_region_is_drama'       // "{drama} hangi ülke yapımı?"
  | 'how_many_episodes'           // "{drama} kaç bölümdür?"
  | 'drama_genre'                 // "{drama} hangi türde?"

// Şablon soru parametreleri — key'e göre hangi params alanlarının dolu olacağı
export interface QuizTemplateParams {
  dramaId?: string
  castId?: string
  groupId?: string  // group_template sorularda quizGroups/{id}
  [key: string]: string | undefined
}

// Seçenek çevirisi — custom sorularda her dil için ayrı option metni
export interface QuizOptionTranslation {
  text?: string
  sub?: string
}

export type OptionStyle = 'text' | 'poster' | 'text+image'

// Flutter: QuizOpt
export interface QuizOption {
  id: string
  text?: string                   // poster-only seçeneklerde boş olabilir
  sub?: string
  imageUrl?: string               // poster / fotoğraf stili seçenekler için
  translations?: Record<string, QuizOptionTranslation>
}

export interface QuizQuestion {
  id: string
  // template: Flutter metni üretir; group_template: gruptan rastgele seçer
  // custom: admin metin girer; audio: ses dosyası sorusu
  type: 'template' | 'group_template' | 'custom' | 'audio'

  // --- Template / Group Template ---
  templateKey?: QuizTemplateKey
  params?: QuizTemplateParams

  // --- Custom / Audio ---
  text?: string                   // fallback metin (EN) — template için boş
  translations?: Record<string, {
    text: string
    hint?: string
  }>

  // --- Medya ---
  imageUrl?: string
  audioUrl?: string               // ses soruları için Firebase Storage URL
  optionStyle?: OptionStyle       // seçeneklerin görünüm stili

  // template/group_template için options ve correctId olmayabilir
  options?: QuizOption[]
  correctId?: string

  difficulty?: 'easy' | 'medium' | 'hard'
  hint?: string
  order: number
}

// quizGroups/{groupId} — önceden gruplandırılmış dizi/oyuncu havuzu
export interface QuizGroup {
  id: string
  name: string
  description?: string
  type: 'drama' | 'cast'
  itemIds: string[]               // dramaIds veya castIds
  region?: Region
  status: Status
  createdAt?: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
}

export type QuizType = 'trivia' | 'photo' | 'audio' | 'mixed'

export interface QuizPack {
  id: string
  title: string
  titleKo?: string
  // { 'tr': 'Türkçe başlık', 'en': 'English title', ... }
  titleTranslations?: Record<string, string>
  dramaId: string
  region: Region
  difficulty: 'easy' | 'medium' | 'hard'
  quizType?: QuizType
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
