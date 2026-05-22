import 'package:flutter/material.dart';
import '../theme.dart';
import '../data.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_bar.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: C.bg,
      child: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 6, 22, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(S.profile, style: QT.display(22)),
                  Row(
                    children: [
                      _SmallBtn(Icons.language_rounded),
                      const SizedBox(width: 6),
                      _SmallBtn(Icons.settings_outlined),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 14),
              // Identity card
              _IdentityCard(),
              const SizedBox(height: 14),
              // Stats grid
              _StatsGrid(),
              const SizedBox(height: 20),
              // QzBadges section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(S.badges, style: QT.display(16)),
                  Text('3 / 12', style: QT.body(11, c: C.ink2)),
                ],
              ),
              const SizedBox(height: 10),
              _QzBadgeGrid(),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Identity card ────────────────────────────────────────────────
class _IdentityCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: Container(
        padding: const EdgeInsets.all(18),
        color: C.ink,
        child: Stack(
          children: [
            // Decorative hangul
            Positioned(
              top: -16,
              right: -12,
              child: IgnorePointer(
                child: Text('팬',
                    style: QT.hangul(110,
                        c: C.pink.withValues(alpha: 0.28))),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    QzPhoto(
                      hue: C.pink,
                      label: '센',
                      width: 76,
                      height: 76,
                      borderRadius: 20,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('sen',
                              style: QT.display(20,
                                  c: C.bg, w: FontWeight.w700,
                                  ls: -20 * 0.02)),
                          const SizedBox(height: 2),
                          Text('K-Drama uzmanı · #4',
                              style: QT.body(12,
                                  c: C.bg.withValues(alpha: 0.75))),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              _LevelQzBadge('LV 14', C.pink, Colors.white),
                              const SizedBox(width: 6),
                              _LevelQzBadge('PRO', C.gold, C.plum),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // XP progress
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('LV 14',
                        style: QT.body(11,
                            c: C.bg.withValues(alpha: 0.75),
                            w: FontWeight.w600)),
                    Text('21,455 / 25,000 XP',
                        style: QT.body(11,
                            c: C.bg.withValues(alpha: 0.75))),
                  ],
                ),
                const SizedBox(height: 6),
                QzBar(
                  value: 86,
                  max: 100,
                  color: C.gold,
                  track: Colors.white.withValues(alpha: 0.15),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _LevelQzBadge extends StatelessWidget {
  final String label;
  final Color bg, fg;
  const _LevelQzBadge(this.label, this.bg, this.fg);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style:
            QT.body(10, w: FontWeight.w700, c: fg, ls: 1),
      ),
    );
  }
}

// ── Stats 3-column grid ──────────────────────────────────────────
class _StatsGrid extends StatelessWidget {
  static const _stats = [
    _Stat('184', 'Quiz',   C.pink,   '퀴즈'),
    _Stat('92%', 'Doğru',  C.gold,   '정답'),
    _Stat('22',  'Streak', C.plum,   '연속'),
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(_stats.length, (i) => Expanded(
        child: Padding(
          padding: EdgeInsets.only(
            left: i > 0 ? 8 : 0,
          ),
          child: _StatsCard(_stats[i]),
        ),
      )),
    );
  }
}

class _Stat {
  final String value, label, hangul;
  final Color color;
  const _Stat(this.value, this.label, this.color, this.hangul);
}

class _StatsCard extends StatelessWidget {
  final _Stat stat;
  const _StatsCard(this.stat);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: C.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: C.line),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -6,
            right: -4,
            child: Text(
              stat.hangul,
              style: QT.hangul(
                40,
                c: stat.color.withValues(alpha: 0.15),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(stat.value,
                  style: QT.display(18,
                      c: stat.color, w: FontWeight.w700,
                      ls: -18 * 0.02)),
              const SizedBox(height: 2),
              Text(stat.label, style: QT.body(10, c: C.ink2)),
            ],
          ),
        ],
      ),
    );
  }
}

// ── QzBadges 4-column grid ─────────────────────────────────────────
class _QzBadgeGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 0.8,
      ),
      itemCount: kBadges.length,
      itemBuilder: (_, i) => _QzBadgeCell(kBadges[i]),
    );
  }
}

class _QzBadgeCell extends StatelessWidget {
  final QzBadge badge;
  const _QzBadgeCell(this.badge);

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: badge.earned ? 1.0 : 0.35,
      child: Column(
        children: [
          Expanded(
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: badge.earned ? badge.color : C.sand,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    badge.hangul,
                    style: QT.hangul(
                      18,
                      c: badge.earned ? Colors.white : C.ink3,
                    ),
                  ),
                ),
                if (badge.earned)
                  Positioned(
                    right: -4,
                    bottom: -4,
                    child: Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        color: C.gold,
                        shape: BoxShape.circle,
                        border: Border.all(color: C.bg, width: 1.5),
                      ),
                      alignment: Alignment.center,
                      child: Icon(Icons.check_rounded,
                          color: C.plum, size: 10),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            badge.name,
            style: QT.body(9, c: C.ink2, w: FontWeight.w600),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _SmallBtn extends StatelessWidget {
  final IconData icon;
  const _SmallBtn(this.icon);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 34,
      height: 34,
      decoration: BoxDecoration(
        color: C.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: C.line),
      ),
      child: Icon(icon, color: C.ink2, size: 16),
    );
  }
}
