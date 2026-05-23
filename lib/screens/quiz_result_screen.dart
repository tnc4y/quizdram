import 'package:flutter/material.dart';
import '../theme.dart';
import '../lang.dart';
import '../widgets/qz_bar.dart';
import '../router.dart';
import '../services/service_locator.dart';

class QuizResultScreen extends StatefulWidget {
  final int correct;
  final int total;
  final int elapsedSeconds;

  const QuizResultScreen({
    super.key,
    required this.correct,
    required this.total,
    required this.elapsedSeconds,
  });

  @override
  State<QuizResultScreen> createState() => _QuizResultScreenState();
}

class _QuizResultScreenState extends State<QuizResultScreen> {
  late Future<({int xpEarned, int xp, int xpMax, int level})> _future;

  @override
  void initState() {
    super.initState();
    _future = _submit();
  }

  Future<({int xpEarned, int xp, int xpMax, int level})> _submit() async {
    final xpEarned = await sl.quiz.submitResult(
      correct: widget.correct,
      total: widget.total,
      elapsedSeconds: widget.elapsedSeconds,
    );
    final progress = await sl.user.getXpProgress();
    return (
      xpEarned: xpEarned,
      xp: progress.xp,
      xpMax: progress.xpMax,
      level: progress.level,
    );
  }

  String _timeStr() {
    final m = widget.elapsedSeconds ~/ 60;
    final s = widget.elapsedSeconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.bg,
      body: FutureBuilder<({int xpEarned, int xp, int xpMax, int level})>(
        future: _future,
        builder: (context, snap) {
          final xpEarned = snap.data?.xpEarned ?? 0;
          final xp = snap.data?.xp ?? 0;
          final xpMax = snap.data?.xpMax ?? 1000;
          final level = snap.data?.level ?? 1;
          final xpPct = xpMax > 0 ? xp / xpMax * 100 : 0.0;
          final isLoading = snap.connectionState == ConnectionState.waiting;

          return Stack(
            children: [
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [C.bg, C.sand],
                  ),
                ),
              ),
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
                                Icon(Icons.home_rounded, color: C.ink2, size: 16),
                                const SizedBox(width: 6),
                                Text(S.backToHome,
                                    style: QT.body(12, c: C.ink2, w: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
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
                                style: QT.display(11, c: C.plum,
                                    w: FontWeight.w700, ls: 1.2)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 22),
                      Text(
                        '${widget.correct}/${widget.total}',
                        style: QT.display(96, c: C.pink, w: FontWeight.w800,
                            h: 0.9, ls: -96 * 0.05),
                      ),
                      const SizedBox(height: 6),
                      Text(S.allCorrect, style: QT.serif(20)),
                      const SizedBox(height: 28),
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        decoration: BoxDecoration(
                          color: C.card,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: C.line),
                        ),
                        child: Row(
                          children: [
                            _Stat(isLoading ? '...' : '+$xpEarned', S.xpLabel, C.pink),
                            _Stat(_timeStr(), S.timeLabel, C.plum),
                            _Stat('${widget.correct}/${widget.total}', S.comboLabel, C.gold),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
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
                              child: const Icon(
                                  Icons.local_fire_department_rounded,
                                  color: Colors.white,
                                  size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(S.streakBadge,
                                      style: QT.display(15, c: C.bg,
                                          w: FontWeight.w600)),
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
                                Text('LV $level',
                                    style: QT.body(12, c: C.ink2,
                                        w: FontWeight.w600)),
                                Text(isLoading ? '...' : '$xp / $xpMax XP',
                                    style: QT.body(12, c: C.ink2)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            QzBar(
                              value: isLoading ? 0 : xpPct,
                              max: 100,
                              color: C.gold,
                              track: C.plum.withValues(alpha: 0.08),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
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
                              style: QT.display(15, c: Colors.white,
                                  w: FontWeight.w600)),
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
                              style: QT.display(14, c: C.ink,
                                  w: FontWeight.w600)),
                        ),
                      ),
                      const SizedBox(height: 28),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
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
      child: Column(
        children: [
          Text(value,
              style: QT.display(22, c: color, w: FontWeight.w700,
                  ls: -22 * 0.02)),
          const SizedBox(height: 2),
          Text(label, style: QT.body(11, c: C.ink2)),
        ],
      ),
    );
  }
}
