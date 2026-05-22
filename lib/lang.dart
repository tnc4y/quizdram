import 'package:flutter/foundation.dart';
import 'theme.dart';

/// Selected app language — set once during onboarding, read everywhere.
final appLang = ValueNotifier<String>('tr');

/// Active color palette — 'cream' | 'midnight'
final appPalette = ValueNotifier<String>('cream');

QzPalette get currentPalette =>
    appPalette.value == 'midnight' ? QzPalette.midnight : QzPalette.cream;

/// Returns the correct string for the current language.
String t(String tr, String en, String ko) {
  switch (appLang.value) {
    case 'en':
      return en;
    case 'ko':
      return ko;
    default:
      return tr;
  }
}

/// Pre-defined translated string constants.
abstract class S {
  // Onboarding
  static String get start          => t('Başla', 'Start', '시작');
  static String get taglineItalic  => t('Doğunun en heyecanlı', 'The most exciting from the East', '동양에서 가장 흥미로운');
  static String get taglineBold    => t('cast quiz\nkulübü.', 'cast quiz\nclub.', '캐스트 퀴즈\n클럽.');
  static String get haveAccount    => t('Hesabın var mı? ', 'Have an account? ', '계정이 있으신가요? ');
  static String get signIn         => t('Giriş yap', 'Sign in', '로그인');

  // Language screen
  static String get langItalic     => t('step one', 'step one', '첫 번째 단계');
  static String get langTitle      => t('Dilini\nseç.', 'Choose your\nlanguage.', '언어를\n선택하세요.');
  static String get langSubtitle   => t(
    'Quizleri ve magazin haberlerini hangi dilde okumak istersin?',
    'In which language would you like to read quizzes and magazine news?',
    '퀴즈와 매거진을 어떤 언어로 읽겠습니까?',
  );
  static String get continueBtn    => t('Devam et →', 'Continue →', '계속 →');
  static String get stepLabel      => t('2 / 4', '2 / 4', '2 / 4');

  // Tab bar
  static String get tabHome        => t('Anasayfa', 'Home',        '홈');
  static String get tabQuiz        => t('Quiz',     'Quiz',        '퀴즈');
  static String get tabNews        => t('Magazin',  'Magazine',    '매거진');
  static String get tabRank        => t('Liderlik', 'Leaderboard', '순위');
  static String get tabMe          => t('Profil',   'Profile',     '프로필');

  // Home
  static String get greeting       => t('Merhaba,', 'Hello,', '안녕하세요,');
  static String get todayQuiz      => t("BUGÜNÜN QUIZ'İ", "TODAY'S QUIZ", '오늘의 퀴즈');
  static String get guessTitle     => t('kadrosunu tahmin et', 'guess the cast', '캐스트를 맞춰봐');
  static String get quizMeta       => t('5 soru · 90 sn · +250 XP', '5 questions · 90 s · +250 XP', '5문제 · 90초 · +250 XP');
  static String get quizTypes      => t('Quiz türleri', 'Quiz types', '퀴즈 유형');
  static String get trending       => t('Bu hafta trend', 'Trending this week', '이번 주 트렌드');
  static String get all            => t('Tümü', 'All', '전체');
  static String get seeAll         => t('Gör', 'See all', '전체보기');

  // Home - region chips
  static String get chipKDrama     => t('🇰🇷 K-Drama', '🇰🇷 K-Drama', '🇰🇷 K-Drama');
  static String get chipCDrama     => t('🇨🇳 C-Drama', '🇨🇳 C-Drama', '🇨🇳 C-Drama');
  static String get chipJDrama     => t('🇯🇵 J-Drama', '🇯🇵 J-Drama', '🇯🇵 J-Drama');
  static String get chipThai       => t('🇹🇭 Thai', '🇹🇭 Thai', '🇹🇭 Thai BL');

  // Home - quiz type categories
  static String get catCastDrama   => t('Cast → Dizi', 'Cast → Drama', '캐스트 → 드라마');
  static String get catGuessLine   => t('Replikten Tahmin', 'Guess from Line', '대사로 맞추기');
  static String get catGuessPhoto  => t('Görselden Oyuncu', 'Guess from Photo', '사진으로 맞추기');
  static String get catOneVsOne    => t('1v1 Düello', '1v1 Duel', '1v1 대결');
  static String get catLive        => t('Canlı', 'Live', '라이브');
  static String get playing        => t('oynayan', 'playing', '명 참여');

  // News chips
  static String get chipTrend      => t('Trend', 'Trending', '트렌드');
  static String get chipNewShow    => t('Yeni dizi', 'New show', '신규 방영');
  static String get chipGossip     => t('Dedikodu', 'Gossip', '가십');
  static String get chipInterview  => t('Röportaj', 'Interview', '인터뷰');

  // Quiz play
  static String get hint           => t('İpucu kullan', 'Use hint', '힌트 사용');
  static String get hintCost       => t('−50 XP', '−50 XP', '−50 XP');
  static String get castLabel      => t('CAST → DİZİ', 'CAST → DRAMA', '캐스트 → 드라마');
  static String get questionLabel  => t('SORU', 'QUESTION', '문제');
  static String get quizQuestion   => t('Bu cast hangi\ndizide birlikte oynadı?', 'Which drama did\nthis cast star in together?', '이 캐스트가 함께 출연한\n드라마는?');

  // Quiz result
  static String get perfect        => t('MÜKEMMEL!', 'PERFECT!', '완벽해요!');
  static String get allCorrect     => t('tüm soruları bildin', 'you got them all right', '모든 문제 정답!');
  static String get xpLabel        => t('XP', 'XP', 'XP');
  static String get timeLabel      => t('Süre', 'Time', '시간');
  static String get comboLabel     => t('Combo', 'Combo', '콤보');
  static String get streakBadge    => t('22 günlük seri 🔥', '22-day streak 🔥', '22일 연속 🔥');
  static String get streakSub      => t("Yarın da gel, kaybetme", "Come back tomorrow!", '내일도 와, 잃지마');
  static String get nextQuiz       => t('Sıradaki quiz', 'Next quiz', '다음 퀴즈');
  static String get shareResult    => t('Sonucu paylaş', 'Share result', '결과 공유');
  static String get backToHome     => t('Ana ekrana dön', 'Back to home', '홈으로 돌아가기');

  // Cast profile
  static String get filmography    => t('Filmografi', 'Filmography', '필모그래피');
  static String get quizzes        => t('Quizler', 'Quizzes', '퀴즈');
  static String get newsTab        => t('Haberler', 'News', '뉴스');
  static String get dramas         => t('Dizi', 'Dramas', '드라마');
  static String get rating         => t('Reyting', 'Rating', '평점');
  static String get fans           => t('Hayran', 'Fans', '팬');
  static String get rank           => t('Sıra', 'Rank', '순위');
  static String get playBtn        => t('OYNA', 'PLAY', '플레이');
  static String get playQuiz16     => t('Quiz oyna · 16 soru', 'Play quiz · 16 questions', '퀴즈 플레이 · 16문제');
  static String get quiz16Stats    => t('16 soru · ortalama 4/5 doğru', '16 questions · avg 4/5 correct', '16문제 · 평균 4/5 정답');
  static String get comingSoon     => t('Yakında…', 'Coming soon…', '곧 출시…');

  // News
  static String get newsItalic     => t('weekly', 'weekly', '주간');
  static String get magazine       => t('Magazin', 'Magazine', '매거진');

  // Leaderboard
  static String get leaderboard    => t('Liderlik', 'Leaderboard', '순위');
  static String get thisWeek       => t('Bu hafta', 'This week', '이번 주');
  static String get allTime        => t('Tüm zamanlar', 'All time', '전체 기간');
  static String get friends        => t('Arkadaşlar', 'Friends', '친구');
  static String get weeklyLabel    => t('WEEKLY · 22 MAYIS', 'WEEKLY · 22 MAY', 'WEEKLY · 5월 22일');
  static String get you            => t('SEN', 'YOU', '나');

  // Profile
  static String get profile        => t('Profil', 'Profile', '프로필');
  static String get badges         => t('Rozetler', 'Badges', '배지');
  static String get quizStat       => t('Quiz', 'Quiz', '퀴즈');
  static String get accuracy       => t('Doğru', 'Accuracy', '정확도');
  static String get streakLabel    => t('Streak', 'Streak', '연속');
}
