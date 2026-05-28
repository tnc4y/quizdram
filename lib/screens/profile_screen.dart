import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme.dart';
import '../data.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_bar.dart';
import '../services/service_locator.dart';
import 'settings_screen.dart';

// ── Data holder ──────────────────────────────────────────────────
class _ProfileData {
  final String name;
  final int xp, xpMax, level;
  final List<QzBadge> badges;
  final int quizzes, accuracy, streak;
  final DateTime? lastPlayedAt;

  const _ProfileData({
    required this.name,
    required this.xp,
    required this.xpMax,
    required this.level,
    required this.badges,
    required this.quizzes,
    required this.accuracy,
    required this.streak,
    this.lastPlayedAt,
  });

  int get earnedCount => badges.where((b) => b.earned).length;

  bool get playedToday {
    if (lastPlayedAt == null) return false;
    final now = DateTime.now();
    final d = lastPlayedAt!;
    return d.year == now.year && d.month == now.month && d.day == now.day;
  }
}

Future<_ProfileData> _loadProfile() async {
  final u = sl.user;
  final results = await Future.wait([
    u.getDisplayName(),
    u.getXpProgress(),
    u.getBadges(),
    u.getStats(),
    _fetchLastPlayedAt(),
  ]);
  final name     = results[0] as String;
  final xpData   = results[1] as ({int xp, int xpMax, int level});
  final badges   = results[2] as List<QzBadge>;
  final stats    = results[3] as ({int quizzes, int accuracy, int streak});
  final lastAt   = results[4] as DateTime?;

  return _ProfileData(
    name: name,
    xp: xpData.xp, xpMax: xpData.xpMax, level: xpData.level,
    badges: badges,
    quizzes: stats.quizzes, accuracy: stats.accuracy, streak: stats.streak,
    lastPlayedAt: lastAt,
  );
}

Future<DateTime?> _fetchLastPlayedAt() async {
  final uid = FirebaseAuth.instance.currentUser?.uid;
  if (uid == null) return null;
  final snap = await FirebaseFirestore.instance.collection('users').doc(uid).get();
  final ts = snap.data()?['lastPlayedAt'] as Timestamp?;
  return ts?.toDate();
}

// ── Screen ───────────────────────────────────────────────────────
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<_ProfileData> _future;

  @override
  void initState() {
    super.initState();
    _future = _loadProfile();
  }

  void _refresh() => setState(() => _future = _loadProfile());

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Material(
      color: p.bg,
      child: SafeArea(
        bottom: false,
        child: FutureBuilder<_ProfileData>(
          future: _future,
          builder: (context, snap) {
            final data = snap.data;
            final loading = snap.connectionState == ConnectionState.waiting;

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 6, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Header ──────────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(S.profile, style: QT.display(22, c: p.ink)),
                      GestureDetector(
                        onTap: () => Navigator.push(context,
                            MaterialPageRoute(
                                builder: (_) => const SettingsScreen())),
                        child: _IconBtn(Icons.settings_outlined),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  if (loading) ...[
                    _ProfileShimmer(),
                  ] else if (data == null) ...[
                    _ErrorState(onRetry: _refresh),
                  ] else ...[
                    // ── Identity card ────────────────────────────
                    _IdentityCard(data: data),
                    const SizedBox(height: 12),

                    // ── Stats row ────────────────────────────────
                    _StatsRow(data: data),
                    const SizedBox(height: 12),

                    // ── Streak card ──────────────────────────────
                    if (data.streak > 0) ...[
                      _StreakCard(data: data),
                      const SizedBox(height: 12),
                    ],

                    // ── Next level card ──────────────────────────
                    _NextLevelCard(data: data),
                    const SizedBox(height: 20),

                    // ── Badges ───────────────────────────────────
                    _BadgesSection(data: data),
                  ],
                  const SizedBox(height: 100),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

// ── Icon button ──────────────────────────────────────────────────
class _IconBtn extends StatelessWidget {
  final IconData icon;
  const _IconBtn(this.icon);

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(11),
        border: Border.all(color: p.line),
      ),
      child: Icon(icon, color: p.ink2, size: 17),
    );
  }
}

// ── Identity card ────────────────────────────────────────────────
class _IdentityCard extends StatelessWidget {
  final _ProfileData data;
  const _IdentityCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    // Sabit beyaz/açık renkler: featured her zaman koyu bg
    const textMain  = Colors.white;
    final textSub   = Colors.white.withValues(alpha: 0.65);
    final textFaint = Colors.white.withValues(alpha: 0.45);

    final initial = data.name.isNotEmpty ? data.name[0].toUpperCase() : '?';
    final xpPct   = data.xpMax > 0 ? data.xp / data.xpMax : 0.0;

    return ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: Container(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [p.featured, Color.lerp(p.featured, p.purple, 0.35)!],
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              top: -20,
              right: -12,
              child: IgnorePointer(
                child: Text('팬', style: QT.hangul(120, c: p.pink.withValues(alpha: 0.22))),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    QzPhoto(
                      hue: p.pink,
                      label: initial,
                      width: 72,
                      height: 72,
                      borderRadius: 18,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            data.name.isEmpty ? '—' : data.name,
                            style: QT.display(19, c: textMain, w: FontWeight.w700, ls: -0.4),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            _levelTitle(data.level),
                            style: QT.body(12, c: textSub),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: p.pink,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              'LV ${data.level}',
                              style: QT.body(10, c: textMain, w: FontWeight.w700, ls: 0.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${_fmt(data.xp)} / ${_fmt(data.xpMax)} XP',
                      style: QT.body(11, c: textSub),
                    ),
                    Text(
                      '${(xpPct * 100).toInt()}%',
                      style: QT.body(11, c: textFaint),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                QzBar(
                  value: xpPct * 100,
                  max: 100,
                  color: p.gold,
                  track: Colors.white.withValues(alpha: 0.12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _levelTitle(int level) {
    if (level < 3)  return t('Yeni Hayran',      'New Fan',         '신규 팬');
    if (level < 6)  return t('Drama İzleyicisi', 'Drama Watcher',   '드라마 시청자');
    if (level < 10) return t('Dizi Bağımlısı',   'Series Addict',   '시리즈 중독자');
    if (level < 15) return t('K-Drama Uzmanı',   'K-Drama Expert',  'K-드라마 전문가');
    if (level < 20) return t('Asya Sineması Pro', 'Asian Cinema Pro', '아시아 영화 프로');
    return t('Efsanevi İzleyici', 'Legendary Viewer', '전설적인 시청자');
  }

  String _fmt(int n) {
    if (n >= 1000) {
      final k = n ~/ 1000;
      final r = (n % 1000) ~/ 100;
      return r > 0 ? '$k.${r}k' : '${k}k';
    }
    return '$n';
  }
}

// ── Stats row ────────────────────────────────────────────────────
class _StatsRow extends StatelessWidget {
  final _ProfileData data;
  const _StatsRow({required this.data});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    final items = [
      _SI(data.quizzes.toString(), S.quizStat,  p.pink,   '퀴즈'),
      _SI('${data.accuracy}%',     S.accuracy, p.gold,   '정답'),
      _SI('${data.streak}',        'Seri',    p.purple, '연속'),
    ];
    return Row(
      children: List.generate(items.length, (i) => Expanded(
        child: Padding(
          padding: EdgeInsets.only(left: i > 0 ? 8 : 0),
          child: _StatCell(items[i]),
        ),
      )),
    );
  }
}

class _SI {
  final String value, label, hangul;
  final Color color;
  const _SI(this.value, this.label, this.color, this.hangul);
}

class _StatCell extends StatelessWidget {
  final _SI s;
  const _StatCell(this.s);

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: p.line),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -4,
            right: -2,
            child: Text(s.hangul,
                style: QT.hangul(34, c: s.color.withValues(alpha: 0.12))),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(s.value,
                  style: QT.display(20, c: s.color, w: FontWeight.w800, ls: -0.4)),
              const SizedBox(height: 1),
              Text(s.label, style: QT.body(10, c: p.ink3, w: FontWeight.w500)),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Streak card ──────────────────────────────────────────────────
class _StreakCard extends StatelessWidget {
  final _ProfileData data;
  const _StreakCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    final days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    final today = DateTime.now().weekday - 1; // 0=Mon … 6=Sun
    final streak = data.streak.clamp(0, 7);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: p.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('🔥', style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${data.streak} ${t("Günlük Seri", "Day Streak", "일 연속")}',
                      style: QT.display(14, c: p.pink, w: FontWeight.w700),
                    ),
                    Text(
                      data.playedToday
                          ? t('Bugün oynadın — harika!', 'You played today — great!', '오늘 플레이했어요!')
                          : t('Bugün oyna, seriyi koru!', 'Play today, keep the streak!', '오늘 플레이하세요!'),
                      style: QT.body(11, c: p.ink2),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: data.playedToday
                      ? p.pink.withValues(alpha: 0.12)
                      : p.sand,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  data.playedToday
                      ? t('✓ Bugün', '✓ Today', '✓ 오늘')
                      : t('Oyna!', 'Play!', '플레이!'),
                  style: QT.body(10,
                      c: data.playedToday ? p.pink : p.ink2,
                      w: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(7, (i) {
              // son `streak` güne kadar olan günler dolu
              final filled = (today - i).abs() < streak &&
                  (i <= today || streak > today + 1);
              final isToday = i == today;
              return _DayDot(
                label: days[i],
                filled: filled || (isToday && data.playedToday),
                isToday: isToday,
                color: p.pink,
                bg: p.sand,
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _DayDot extends StatelessWidget {
  final String label;
  final bool filled, isToday;
  final Color color, bg;
  const _DayDot({
    required this.label,
    required this.filled,
    required this.isToday,
    required this.color,
    required this.bg,
  });

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Column(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: filled ? color : bg,
            shape: BoxShape.circle,
            border: isToday && !filled
                ? Border.all(color: color.withValues(alpha: 0.4), width: 1.5)
                : null,
          ),
          child: Center(
            child: filled
                ? Text('🔥', style: const TextStyle(fontSize: 14))
                : Text(
                    label[0],
                    style: QT.body(10,
                        c: isToday ? color : p.ink3,
                        w: isToday ? FontWeight.w700 : FontWeight.w400),
                  ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: QT.body(9, c: filled ? color : p.ink3,
              w: filled ? FontWeight.w600 : FontWeight.w400),
        ),
      ],
    );
  }
}

// ── Next level card ───────────────────────────────────────────────
class _NextLevelCard extends StatelessWidget {
  final _ProfileData data;
  const _NextLevelCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    final pct = data.xpMax > 0 ? data.xp / data.xpMax : 0.0;
    final remaining = data.xpMax - data.xp;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: p.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                t('Sonraki Seviye', 'Next Level', '다음 레벨'),
                style: QT.display(13, c: p.ink, w: FontWeight.w700),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: p.sand,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'LV ${data.level}',
                      style: QT.body(10, c: p.ink2, w: FontWeight.w700),
                    ),
                  ),
                  Text(' → ', style: QT.body(10, c: p.ink3)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: p.gold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'LV ${data.level + 1}',
                      style: QT.body(10, c: p.gold, w: FontWeight.w700),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          QzBar(
            value: pct * 100,
            max: 100,
            color: p.gold,
            track: p.sand,
          ),
          const SizedBox(height: 6),
          Text(
            remaining > 0
                ? t('$remaining XP daha kazan → LV ${data.level + 1}',
                    'Earn $remaining more XP → LV ${data.level + 1}',
                    '$remaining XP 더 획득 → LV ${data.level + 1}')
                : t('Seviye atladın!', 'Level up!', '레벨업!'),
            style: QT.body(11, c: p.ink2),
          ),
        ],
      ),
    );
  }
}

// ── Badges section ────────────────────────────────────────────────
class _BadgesSection extends StatelessWidget {
  final _ProfileData data;
  const _BadgesSection({required this.data});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    // Kazanılanlar önde
    final sorted = [
      ...data.badges.where((b) => b.earned),
      ...data.badges.where((b) => !b.earned),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(S.badges, style: QT.display(15, c: p.ink)),
            Text(
              '${data.earnedCount} / ${data.badges.length}',
              style: QT.body(11, c: p.ink3),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 86,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: sorted.length,
            separatorBuilder: (_, _) => const SizedBox(width: 10),
            itemBuilder: (_, i) => _BadgeChip(sorted[i]),
          ),
        ),
      ],
    );
  }
}

class _BadgeChip extends StatelessWidget {
  final QzBadge badge;
  const _BadgeChip(this.badge);

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Opacity(
      opacity: badge.earned ? 1.0 : 0.35,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: badge.earned ? badge.color : p.sand,
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Text(
                  badge.hangul,
                  style: QT.hangul(22, c: badge.earned ? Colors.white : p.ink3),
                ),
              ),
              if (badge.earned)
                Positioned(
                  right: -4,
                  bottom: -4,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: p.gold,
                      shape: BoxShape.circle,
                      border: Border.all(color: p.bg, width: 1.5),
                    ),
                    child: Icon(Icons.check_rounded, color: p.featured, size: 9),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 5),
          SizedBox(
            width: 52,
            child: Text(
              badge.name,
              style: QT.body(9, c: p.ink2, w: FontWeight.w600),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Shimmer ───────────────────────────────────────────────────────
class _ProfileShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Column(
      children: [
        Container(
          height: 148,
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(22),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: List.generate(3, (i) => Expanded(
            child: Padding(
              padding: EdgeInsets.only(left: i > 0 ? 8 : 0),
              child: Container(
                height: 68,
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          )),
        ),
        const SizedBox(height: 12),
        Container(
          height: 110,
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ],
    );
  }
}

// ── Error state ───────────────────────────────────────────────────
class _ErrorState extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorState({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 60),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('!', style: QT.display(48, c: p.pink.withValues(alpha: 0.4))),
            const SizedBox(height: 8),
            Text(t('Yüklenemedi', 'Failed to load', '불러올 수 없습니다'),
                style: QT.body(13, c: p.ink2)),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: onRetry,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: p.ink,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(t('Tekrar dene', 'Retry', '다시 시도'),
                    style: QT.display(12, c: p.bg, w: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
