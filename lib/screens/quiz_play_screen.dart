import 'dart:async';
import 'package:flutter/material.dart';
import '../theme.dart';
import '../data.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_bar.dart';
import '../router.dart';
import '../services/service_locator.dart';

class QuizPlayScreen extends StatefulWidget {
  const QuizPlayScreen({super.key});

  @override
  State<QuizPlayScreen> createState() => _QuizPlayScreenState();
}

class _QuizPlayScreenState extends State<QuizPlayScreen> {
  int _question = 0; // 0-4
  String? _picked;
  int _seconds = 90;
  int _correct = 0;
  Timer? _timer;
  DateTime? _startTime;
  List<QuizOpt> _opts = kTodayOpts;

  @override
  void initState() {
    super.initState();
    _loadOpts();
    _startTimer();
  }

  Future<void> _loadOpts() async {
    try {
      final opts = await sl.quiz.getTodayOptions();
      if (opts.isNotEmpty && mounted) {
        setState(() => _opts = opts);
      }
    } catch (_) {
      // stay with kTodayOpts fallback
    }
  }

  void _startTimer() {
    _startTime = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        if (_seconds > 0) {
          _seconds--;
        } else {
          _nextQuestion();
        }
      });
    });
  }

  void _nextQuestion() {
    if (_question < 4) {
      setState(() {
        _question++;
        _picked = null;
        _seconds = 90;
      });
    } else {
      _timer?.cancel();
      final elapsed = _startTime != null
          ? DateTime.now().difference(_startTime!).inSeconds
          : 0;
      AppRouter.toQuizResult(
        context,
        correct: _correct,
        total: 5,
        elapsedSeconds: elapsed,
      );
    }
  }

  void _pick(String id) {
    if (_picked != null) return;
    final wasCorrect = _opts.firstWhere(
      (o) => o.id == id,
      orElse: () => QuizOpt(id, '', '', false),
    ).correct;
    setState(() {
      _picked = id;
      if (wasCorrect) _correct++;
    });
    Future.delayed(const Duration(milliseconds: 900), _nextQuestion);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mins = _seconds ~/ 60;
    final secs = _seconds % 60;
    final timeStr = '$mins:${secs.toString().padLeft(2, '0')}';

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 6, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top bar: close + progress + timer
              Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child:
                        Icon(Icons.close_rounded, color: C.ink2, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: QzBar(
                      value: (_question + 1).toDouble(),
                      max: 5,
                      color: C.pink,
                      track: C.plum.withValues(alpha: 0.08),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: C.ink,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.bolt_rounded, color: C.gold, size: 12),
                        const SizedBox(width: 3),
                        Text(timeStr,
                            style: QT.display(
                              11,
                              c: const Color(0xFFFFF5F0),
                              w: FontWeight.w700,
                              ls: 0.4,
                            )),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              // Question label
              Text(
                '${S.questionLabel} ${_question + 1} / 5 · ${S.castLabel}',
                style: QT.body(12, c: C.ink2, w: FontWeight.w600, ls: 0.6),
              ),
              const SizedBox(height: 6),
              Text(
                S.quizQuestion,
                style: QT.display(22),
              ),
              const SizedBox(height: 18),
              // Cast strip
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: C.card,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: C.line),
                ),
                child: Row(
                  children: List.generate(3, (i) {
                    final c = kCast[i];
                    return Expanded(
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                            horizontal: i == 1 ? 4 : 0),
                        child: Column(
                          children: [
                            QzPhoto(
                              hue: c.hue,
                              label: c.hangul[0],
                              width: double.infinity,
                              height: 88,
                              borderRadius: 14,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              c.name.split(' ').first,
                              style: QT.display(
                                10,
                                w: FontWeight.w600,
                                h: 1.2,
                              ),
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 16),
              // Answer options
              ..._opts.map((o) => _OptionBtn(
                    option: o,
                    picked: _picked,
                    onTap: _pick,
                  )),
              const Spacer(),
              // Hint chip
              Container(
                margin: const EdgeInsets.only(bottom: 22),
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: C.sand,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    Text('힌트',
                        style: QT.hangul(18, c: C.pink)),
                    const SizedBox(width: 10),
                    Text(S.hint, style: QT.body(12, c: C.ink2)),
                    const Spacer(),
                    Text(S.hintCost,
                        style: QT.display(13,
                            c: C.plum, w: FontWeight.w700)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Single option button ─────────────────────────────────────────
class _OptionBtn extends StatelessWidget {
  final QuizOpt option;
  final String? picked;
  final void Function(String) onTap;

  const _OptionBtn({
    required this.option,
    required this.picked,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isPicked = picked == option.id;
    final isCorrect = isPicked && option.correct;
    final isWrong = isPicked && !option.correct;

    Color bg = C.card;
    Color fg = C.ink;
    Color border = C.line;
    if (isCorrect) {
      bg = C.ink;
      fg = C.bg;
      border = Colors.transparent;
    } else if (isWrong) {
      bg = const Color(0xFFFDE4E8);
      fg = const Color(0xFFC0364A);
      border = Colors.transparent;
    }

    Color badgeBg = C.sand;
    Color badgeFg = C.ink;
    if (isCorrect) {
      badgeBg = C.gold;
      badgeFg = C.plum;
    } else if (isWrong) {
      badgeBg = const Color(0xFFFFB1BC);
      badgeFg = C.plum;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: GestureDetector(
        onTap: () => onTap(option.id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.fromLTRB(13, 13, 13, 13),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border),
          ),
          child: Row(
            children: [
              Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  color: badgeBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Text(
                  option.id.toUpperCase(),
                  style: QT.display(
                    12,
                    c: badgeFg,
                    w: FontWeight.w700,
                    ls: 0,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(option.text,
                        style: QT.display(
                          14,
                          c: fg,
                          w: FontWeight.w600,
                        )),
                    const SizedBox(height: 1),
                    Text(option.sub,
                        style: QT.hangul(
                          10,
                          c: fg.withValues(alpha: 0.7),
                          w: FontWeight.w400,
                        )),
                  ],
                ),
              ),
              if (isCorrect)
                Icon(Icons.check_rounded, color: C.gold, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}
