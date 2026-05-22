import 'package:flutter/material.dart';
import '../theme.dart';
import '../data.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_chip.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: context.qp.bg,
      child: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 6, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(S.weeklyLabel,
                  style: QT.body(10, c: context.qp.pink, w: FontWeight.w600, ls: 2)),
              const SizedBox(height: 2),
              Text(S.leaderboard, style: QT.display(28, c: context.qp.ink)),
              const SizedBox(height: 14),
              // Filter chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: [
                  GestureDetector(
                      onTap: () => setState(() => _tab = 0),
                      child: QzChip(S.thisWeek, active: _tab == 0)),
                  const SizedBox(width: 8),
                  GestureDetector(
                      onTap: () => setState(() => _tab = 1),
                      child: QzChip(S.allTime, active: _tab == 1)),
                  const SizedBox(width: 8),
                  GestureDetector(
                      onTap: () => setState(() => _tab = 2),
                      child: QzChip(S.friends, active: _tab == 2)),
                ]),
              ),
              const SizedBox(height: 18),
              // Podium
              _Podium(),
              const SizedBox(height: 14),
              // Ranked list (4+)
              ...kLeaders.skip(3).map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: _LeaderRow(entry: e),
              )),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Top 3 podium ────────────────────────────────────────────────
class _Podium extends StatelessWidget {
  static const _order = [1, 0, 2]; // #2, #1, #3 positions
  static const _sizes = [56.0, 72.0, 56.0];
  static const _hues = [Color(0xFF7C5ED3), Color(0xFFFF5470), Color(0xFFFFC857)];
  static const _hanguls = ['葵', '민지', '魏'];

  @override
  Widget build(BuildContext context) {
    final top3 = kLeaders.take(3).toList();
    return ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 18, 12, 14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [context.qp.featured, const Color(0xFF4A2D7C)],
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              top: -12,
              right: -10,
              child: IgnorePointer(
                child: Text('1위',
                    style: QT.hangul(100, c: context.qp.pink.withValues(alpha: 0.25))),
              ),
            ),
            Column(
              children: [
                const SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: List.generate(3, (i) {
                    final entry = top3[_order[i]];
                    final size = _sizes[i];
                    final hue = _hues[i];
                    final h = _hanguls[_order[i]];
                    final isFirst = _order[i] == 0;
                    return Expanded(
                      child: Column(
                        children: [
                          Stack(
                            clipBehavior: Clip.none,
                            alignment: Alignment.center,
                            children: [
                              QzPhoto(
                                hue: hue,
                                label: h,
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                              ),
                              Positioned(
                                bottom: -8,
                                child: Builder(builder: (ctx) => Container(
                                  width: 22,
                                  height: 22,
                                  decoration: BoxDecoration(
                                    color: isFirst ? ctx.qp.gold : ctx.qp.bg,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: ctx.qp.featured, width: 2),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    '${entry.rank}',
                                    style: QT.display(11, c: ctx.qp.featured, w: FontWeight.w700, ls: 0),
                                  ),
                                )),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Builder(builder: (ctx) => Column(children: [
                            Text(
                              '${entry.country} ${entry.name}',
                              style: QT.display(11, c: ctx.qp.bg, w: FontWeight.w600),
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text('${entry.score} XP', style: QT.body(10, c: ctx.qp.bg.withValues(alpha: 0.7))),
                          ])),
                        ],
                      ),
                    );
                  }),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Ranked list row ──────────────────────────────────────────────
class _LeaderRow extends StatelessWidget {
  final LeaderEntry entry;
  const _LeaderRow({required this.entry});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: entry.isYou ? p.featured : p.card,
        borderRadius: BorderRadius.circular(14),
        border: entry.isYou ? null : Border.all(color: p.line),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 28,
            child: Text('#${entry.rank}',
                style: QT.display(14, c: entry.isYou ? p.gold : p.ink2, w: FontWeight.w700, ls: 0)),
          ),
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: entry.isYou ? p.pink : p.sand,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('${entry.country} ${entry.name}',
                        style: QT.display(13, c: entry.isYou ? p.bg : p.ink, w: FontWeight.w600)),
                    if (entry.isYou) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(color: p.gold, borderRadius: BorderRadius.circular(4)),
                        child: Text(S.you, style: QT.body(9, c: p.featured, w: FontWeight.w700)),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(Icons.local_fire_department_rounded,
                        size: 11, color: entry.isYou ? p.gold : p.pink),
                    const SizedBox(width: 3),
                    Text('${entry.streak}g · ${entry.score}',
                        style: QT.body(10, c: entry.isYou ? p.bg.withValues(alpha: 0.7) : p.ink2)),
                  ],
                ),
              ],
            ),
          ),
          if (!entry.isYou)
            Icon(Icons.trending_up_rounded, color: p.ink2, size: 16),
        ],
      ),
    );
  }
}
