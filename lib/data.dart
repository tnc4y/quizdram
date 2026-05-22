import 'package:flutter/material.dart';
import 'models/models.dart';
export 'models/models.dart';

// ── Languages ──────────────────────────────────────────────────
const kLangs = [
  QzLang('tr', 'Türkçe',  'Türkçe',  'Tr'),
  QzLang('en', 'English', 'English', 'En'),
  QzLang('ko', 'Korece',  '한국어',   '한'),
  QzLang('ja', 'Japonca', '日本語',  '日'),
  QzLang('zh', 'Çince',   '中文',    '中'),
];

// ── Dramas ─────────────────────────────────────────────────────
const kDramas = [
  Drama('d1', 'Lunar Tide',       '달의 조류',   'kr', 2024, 16, 'Romance · Fantasy', Color(0xFFFF5470)),
  Drama('d2', 'Crimson Letter',   '진홍의 편지', 'kr', 2023, 20, 'Historical',        Color(0xFF2D1B4E)),
  Drama('d3', 'Neon Seoul',       '네온 서울',   'kr', 2025, 12, 'Thriller',          Color(0xFF7C5ED3)),
  Drama('d4', 'Phoenix Court',    '凤凰宫廷',    'cn', 2024, 40, 'Wuxia',             Color(0xFFFFC857)),
  Drama('d5', 'Tokyo at 5AM',     '東京五時',    'jp', 2025, 10, 'Slice of Life',     Color(0xFF7C5ED3)),
  Drama('d6', 'Midnight Promise', 'สัญญา',      'th', 2024,  8, 'BL Romance',        Color(0xFFFF5470)),
];

// ── Cast ───────────────────────────────────────────────────────
const kCast = [
  CastMember('c1', 'Han Soo-jin',   '한수진', 'kr', 'Lead',        28, Color(0xFFFF5470)),
  CastMember('c2', 'Lee Tae-min',   '이태민', 'kr', 'Lead',        30, Color(0xFF2D1B4E)),
  CastMember('c3', 'Park Yeon-woo', '박연우', 'kr', 'Supporting',  26, Color(0xFFFFC857)),
  CastMember('c4', 'Wei Lan',       '魏蓝',  'cn', 'Lead',        27, Color(0xFFFF8AA3)),
  CastMember('c5', 'Aoi Hayashi',   '林葵',  'jp', 'Lead',        25, Color(0xFF7C5ED3)),
];

// ── Quiz ───────────────────────────────────────────────────────
const kTodayOpts = [
  QuizOpt('a', 'Lunar Tide',     '달의 조류 · 2024',   true),
  QuizOpt('b', 'Crimson Letter', '진홍의 편지 · 2023', false),
  QuizOpt('c', 'Neon Seoul',     '네온 서울 · 2025',   false),
  QuizOpt('d', 'Glass Mountain', '유리 산 · 2022',     false),
];

// ── News ───────────────────────────────────────────────────────
const kNews = [
  NewsItem('n0', 'EXKLÜZİF',
      '"Lunar Tide" 2. sezonu Jeju\'da çekiliyor — kadroda 2 yeni isim',
      'Quizdram', '2s',
      Color(0xFFFF5470), '특종', Color(0xFF2D1B4E),
      tagFg: Color(0xFFFFF5F0)),
  NewsItem('n1', 'YENİ',
      'Phoenix Court kadrosu Cannes\'ta podyumda',
      'C-Drama Today', '6s',
      Color(0xFFFFC857), '风', Color(0xFFFFC857)),
  NewsItem('n2', 'DEDIKODU',
      'Bir K-pop idolü "Neon Seoul"un 3. sezonunda mı?',
      'Seoul Beat', '1g',
      Color(0xFF2D1B4E), '소문', Color(0xFFFF5470),
      tagFg: Color(0xFF2D1B4E)),
  NewsItem('n3', 'TRENDING',
      '"Tokyo at 5AM" finalinde sürpriz cameo',
      'JP Drama Daily', '2g',
      Color(0xFF7C5ED3), '東', Color(0xFF2D1B4E),
      tagFg: Color(0xFFFFF5F0)),
];

// ── Leaderboard ────────────────────────────────────────────────
const kLeaders = [
  LeaderEntry(1, 'minji_92',   '🇰🇷', '24.8k', 41),
  LeaderEntry(2, 'aoi.dorama', '🇯🇵', '23.1k', 38),
  LeaderEntry(3, 'wei.shu',    '🇨🇳', '22.9k', 22),
  LeaderEntry(4, 'sen',        '🇹🇷', '21.4k', 19, isYou: true),
  LeaderEntry(5, 'phim.thai',  '🇹🇭', '19.0k', 15),
  LeaderEntry(6, 'dramaqueen', '🇺🇸', '18.0k', 12),
  LeaderEntry(7, 'k.fan',      '🇰🇷', '17.5k',  8),
];

// ── Badges ─────────────────────────────────────────────────────
const kBadges = [
  QzBadge('21g Seri',  '연속', Color(0xFFFF5470), true),
  QzBadge('K-Uzmanı',  'K',   Color(0xFF2D1B4E), true),
  QzBadge('İlk Sezon', '1',   Color(0xFFFFC857), true),
  QzBadge('C-Avcısı',  'C',   Color(0xFF7C5ED3), false),
  QzBadge('Anime',     'A',   Color(0xFFFF5470), false),
  QzBadge('1v1 Şamp.', '王',  Color(0xFFFFC857), false),
  QzBadge('Hızlı',     '速',  Color(0xFF2D1B4E), false),
  QzBadge('Mükemmel',  '満',  Color(0xFFFF5470), false),
];
