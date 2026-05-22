// data.jsx — Fictional content for Quizdram screens
// Using original drama/cast names to avoid IP issues but evoke the genre.

const QZ_LANGS = [
  { code: 'tr', label: 'Türkçe',  native: 'Türkçe' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ko', label: 'Korece',  native: '한국어' },
  { code: 'ja', label: 'Japonca', native: '日本語' },
  { code: 'zh', label: 'Çince',   native: '中文' },
];

// Regional accent chips
const QZ_REGIONS = [
  { id: 'kr', label: 'K-Drama',  flag: '🇰🇷', hue: 'pink' },
  { id: 'cn', label: 'C-Drama',  flag: '🇨🇳', hue: 'plum' },
  { id: 'jp', label: 'J-Drama',  flag: '🇯🇵', hue: 'gold' },
  { id: 'th', label: 'Thai',     flag: '🇹🇭', hue: 'pink' },
];

// Fictional dramas (original titles to avoid trademark issues)
const QZ_DRAMAS = [
  { id: 'd1', title: 'Lunar Tide',         hangul: '달의 조류',   region: 'kr', year: 2024, eps: 16, genre: 'Romance · Fantasy' },
  { id: 'd2', title: 'Crimson Letter',     hangul: '진홍의 편지', region: 'kr', year: 2023, eps: 20, genre: 'Historical' },
  { id: 'd3', title: 'Neon Seoul',         hangul: '네온 서울',   region: 'kr', year: 2025, eps: 12, genre: 'Thriller' },
  { id: 'd4', title: 'Phoenix Court',      hanzi:  '凤凰宫廷',    region: 'cn', year: 2024, eps: 40, genre: 'Wuxia' },
  { id: 'd5', title: 'Tokyo at 5AM',       kanji:  '東京の朝五時', region: 'jp', year: 2025, eps: 10, genre: 'Slice of Life' },
  { id: 'd6', title: 'Midnight Promise',   thai:   'สัญญาเที่ยงคืน', region: 'th', year: 2024, eps: 8,  genre: 'BL Romance' },
];

// Fictional cast (no real names)
const QZ_CAST = [
  { id: 'c1', name: 'Han Soo-jin',  hangul: '한수진', region: 'kr', role: 'Lead', age: 28, hue: '#ff5470' },
  { id: 'c2', name: 'Lee Tae-min',  hangul: '이태민', region: 'kr', role: 'Lead', age: 30, hue: '#2d1b4e' },
  { id: 'c3', name: 'Park Yeon-woo',hangul: '박연우', region: 'kr', role: 'Supporting', age: 26, hue: '#ffc857' },
  { id: 'c4', name: 'Wei Lan',      hanzi:  '魏蓝',  region: 'cn', role: 'Lead', age: 27, hue: '#ff8aa3' },
  { id: 'c5', name: 'Aoi Hayashi',  kanji:  '林葵',  region: 'jp', role: 'Lead', age: 25, hue: '#7c5ed3' },
  { id: 'c6', name: 'Tawan P.',     thai:   'ตะวัน', region: 'th', role: 'Lead', age: 24, hue: '#ff5470' },
];

// Today's quiz question — used in onboarding-to-quiz flow
const QZ_TODAY = {
  id: 'today',
  type: 'cast-to-drama',
  prompt: 'Bu cast hangi dizide birlikte oynadı?',
  promptEn: 'Which drama featured this cast together?',
  cast: ['c1', 'c2', 'c3'],
  options: [
    { id: 'd1', text: 'Lunar Tide',       correct: true },
    { id: 'd2', text: 'Crimson Letter',   correct: false },
    { id: 'd3', text: 'Neon Seoul',       correct: false },
    { id: 'd7', text: 'Glass Mountain',   correct: false },
  ],
};

// Magazine / gossip feed cards
const QZ_NEWS = [
  { id: 'n1', tag: 'TRENDING', region: 'kr', headline: 'Lunar Tide 2. sezon onaylandı — çekimler Jeju\'da başlıyor', time: '2s', reactions: 14823, img: '#ff5470' },
  { id: 'n2', tag: 'YENİ',     region: 'cn', headline: 'Phoenix Court kadrosu Cannes\'ta podyumda', time: '6s', reactions: 8421, img: '#ffc857' },
  { id: 'n3', tag: 'EXKLÜZİF', region: 'jp', headline: '"Tokyo at 5AM" finalinde sürpriz cameo', time: '11s', reactions: 5210, img: '#7c5ed3' },
  { id: 'n4', tag: 'DEDIKODU', region: 'kr', headline: 'Bir K-pop idolü "Neon Seoul"un üçüncü sezonunda mı?', time: '1g', reactions: 22041, img: '#2d1b4e' },
];

// Leaderboard
const QZ_LEADERS = [
  { rank: 1, name: 'minji_92',      country: '🇰🇷', score: 24820, streak: 41 },
  { rank: 2, name: 'aoi.dorama',    country: '🇯🇵', score: 23150, streak: 38 },
  { rank: 3, name: 'wei.shu',       country: '🇨🇳', score: 22980, streak: 22 },
  { rank: 4, name: 'sen',           country: '🇹🇷', score: 21455, streak: 19, you: true },
  { rank: 5, name: 'phim.thai',     country: '🇹🇭', score: 19021, streak: 15 },
  { rank: 6, name: 'dramaqueen',    country: '🇺🇸', score: 18004, streak: 12 },
];

// Achievement badges
const QZ_BADGES = [
  { id: 'b1', name: '21 Günlük Seri',  icon: 'flame', earned: true },
  { id: 'b2', name: 'K-Drama Uzmanı',  icon: 'crown', earned: true },
  { id: 'b3', name: 'İlk Sezon',       icon: 'leaf',  earned: true },
  { id: 'b4', name: 'C-Drama Avcısı',  icon: 'sword', earned: false },
  { id: 'b5', name: 'Anime Asistanı',  icon: 'star',  earned: false },
  { id: 'b6', name: '1v1 Şampiyonu',   icon: 'cup',   earned: false },
];

Object.assign(window, { QZ_LANGS, QZ_REGIONS, QZ_DRAMAS, QZ_CAST, QZ_TODAY, QZ_NEWS, QZ_LEADERS, QZ_BADGES });
