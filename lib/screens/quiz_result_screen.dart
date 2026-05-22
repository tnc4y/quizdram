import 'package:flutter/material.dart';
import '../theme.dart';
import '../lang.dart';
import '../widgets/qz_bar.dart';
import '../router.dart';

class QuizResultScreen extends StatelessWidget {
  final int correct;
  final int total;
  const QuizResultScreen({super.key, required this.correct, required this.total});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.bg,
      body: Stack(
        children: [
          // Background gradient wash
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [C.bg, C.sand],
              ),
            ),
          ),
          // Decorative hangul
          Positioned(
            top: 60,
            right: -20,
            child: IgnorePointer(
              child: Text('완벽',
                  style: QT.hangul(180, c: C.pink.withValues(alpha: 0.1))),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 12, 22, 0),
              child: Column(
                children: [
                  // Close / home button row
                  Align(
                    alignment: Alignment.centerLeft,
                    child: GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: C.card,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: C.line),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.home_rounded,
                                color: C.ink2, size: 16),
                            const SizedBox(width: 6),
                            Text(S.backToHome,
                                style: QT.body(12, c: C.ink2,
                                    w: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Perfect badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: C.gold,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.bolt_rounded, color: C.plum, size: 14),
                        const SizedBox(width: 4),
                        Text(S.perfect,
                            style: QT.display(
                              11,
                              c: C.plum,
                              w: FontWeight.w700,
                              ls: 1.2,
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 22),
                  // Score
                  Text(
                    '$correct/$total',
                    style: QT.display(
                      96,
                      c: C.pink,
                      w: FontWeight.w800,
                      h: 0.9,
                      ls: -96 * 0.05,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(S.allCorrect, style: QT.serif(20)),
                  const SizedBox(height: 28),
                  // Stats card
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    decoration: BoxDecoration(
                      color: C.card,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: C.line),
                    ),
                    child: Row(
                      children: [
                        _Stat('+250', S.xpLabel, C.pink),
                        _Stat('1:30', S.timeLabel, C.plum),
                        _Stat('×3', S.comboLabel, C.gold),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Streak badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: C.ink,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: C.pink,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.local_fire_department_rounded,
                              color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(S.streakBadge,
                                  style: QT.display(
                                    15,
                                    c: C.bg,
                                    w: FontWeight.w600,
                                  )),
                              const SizedBox(height: 2),
                              Text(S.streakSub,
                                  style: QT.body(12,
                                      c: C.bg.withValues(alpha: 0.7))),
                            ],
                          ),
                        ),
                        Icon(Icons.arrow_forward_rounded,
                            color: C.gold, size: 18),
                      ],
                    ),
                  ),
                  // XP progress bar
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: C.card,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: C.line),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('LV 14',
                                style: QT.body(12, c: C.ink2, w: FontWeight.w600)),
                            Text('21,455 / 25,000 XP',
                                style: QT.body(12, c: C.ink2)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        QzBar(
                          value: 86,
                          max: 100,
                          color: C.gold,
                          track: C.plum.withValues(alpha: 0.08),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  // CTAs
                  GestureDetector(
                    onTap: () => AppRouter.toNextQuiz(context),
                    child: Container(
                      width: double.infinity,
                      height: 54,
                      decoration: BoxDecoration(
                        color: C.pink,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      alignment: Alignment.center,
                      child: Text(S.nextQuiz,
                          style: QT.display(
                            15,
                            c: Colors.white,
                            w: FontWeight.w600,
                          )),
                    ),
                  ),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      width: double.infinity,
                      height: 48,
                      decoration: BoxDecoration(
                        border: Border.all(color: C.line),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      alignment: Alignment.center,
                      child: Text(S.shareResult,
                          style: QT.display(
                            14,
                            c: C.ink,
                            w: FontWeight.w600,
                          )),
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String value, label;
  final Color color;
  const _Stat(this.value, this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Stack(
        alignment: Alignment.center,
        children: [
          Column(
            children: [
              Text(value,
                  style: QT.display(22, c: color, w: FontWeight.w700,
                      ls: -22 * 0.02)),
              const SizedBox(height: 2),
              Text(label, style: QT.body(11, c: C.ink2)),
            ],
          ),
        ],
      ),
    );
  }
}
