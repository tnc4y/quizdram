import 'dart:async';
import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme.dart';
import '../lang.dart';
import '../models/models.dart';
import '../widgets/qz_bar.dart';
import '../router.dart';
import '../services/service_locator.dart';

class QuizPlayScreen extends StatefulWidget {
  const QuizPlayScreen({super.key});

  @override
  State<QuizPlayScreen> createState() => _QuizPlayScreenState();
}

class _QuizPlayScreenState extends State<QuizPlayScreen> {
  int _questionIdx = 0;
  String? _picked;
  int _seconds = 90;
  int _correct = 0;
  Timer? _timer;
  DateTime? _startTime;
  bool _loading = true;
  bool _noQuestions = false;
  List<QuizQuestion> _questions = [];
  final _player = AudioPlayer();
  bool _audioPlaying = false;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
    _startTimer();
  }

  Future<void> _loadQuestions() async {
    try {
      final questions = await sl.quiz.getQuestions();
      if (!mounted) return;
      setState(() {
        _questions = questions;
        _loading = false;
        _noQuestions = questions.isEmpty;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _noQuestions = true;
      });
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
    if (_questionIdx < _questions.length - 1) {
      _stopAudio();
      setState(() {
        _questionIdx++;
        _picked = null;
        _seconds = 90;
      });
    } else {
      _finish();
    }
  }

  void _finish() {
    _timer?.cancel();
    _stopAudio();
    final elapsed = _startTime != null
        ? DateTime.now().difference(_startTime!).inSeconds
        : 0;
    AppRouter.toQuizResult(
      context,
      correct: _correct,
      total: _questions.length,
      elapsedSeconds: elapsed,
    );
  }

  void _pick(String id) {
    if (_picked != null || _questionIdx >= _questions.length) return;
    final q = _questions[_questionIdx];
    final wasCorrect = q.options
        .firstWhere((o) => o.id == id, orElse: () => QuizOpt(id, '', '', false))
        .correct;
    setState(() {
      _picked = id;
      if (wasCorrect) _correct++;
    });
    Future.delayed(const Duration(milliseconds: 900), _nextQuestion);
  }

  Future<void> _toggleAudio(String url) async {
    if (_audioPlaying) {
      await _player.pause();
      if (mounted) setState(() => _audioPlaying = false);
    } else {
      await _player.play(UrlSource(url));
      if (mounted) setState(() => _audioPlaying = true);
    }
  }

  Future<void> _stopAudio() async {
    await _player.stop();
    if (mounted) setState(() => _audioPlaying = false);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: C.bg,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_noQuestions) {
      return Scaffold(
        backgroundColor: C.bg,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('—', style: QT.display(32, c: C.ink2)),
              const SizedBox(height: 8),
              Text(
                t('Şu an aktif quiz yok.', 'No active quiz right now.', '현재 활성 퀴즈가 없습니다.'),
                style: QT.body(14, c: C.ink2),
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(
                    color: C.ink,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(S.backToHome, style: QT.display(13, c: C.bg, w: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final q = _questions[_questionIdx];
    final total = _questions.length;
    final mins = _seconds ~/ 60;
    final secs = _seconds % 60;
    final timeStr = '$mins:${secs.toString().padLeft(2, '0')}';

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: Column(
          children: [
            // Scrollable content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 6, 20, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top bar
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Icon(Icons.close_rounded, color: C.ink2, size: 18),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: QzBar(
                            value: (_questionIdx + 1).toDouble(),
                            max: total.toDouble(),
                            color: C.pink,
                            track: C.plum.withValues(alpha: 0.08),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                          decoration: BoxDecoration(
                            color: C.ink,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.bolt_rounded, color: C.gold, size: 12),
                              const SizedBox(width: 3),
                              Text(
                                timeStr,
                                style: QT.display(11,
                                    c: const Color(0xFFFFF5F0), w: FontWeight.w700, ls: 0.4),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    // Question label
                    Text(
                      '${S.questionLabel} ${_questionIdx + 1} / $total',
                      style: QT.body(12, c: C.ink2, w: FontWeight.w600, ls: 0.6),
                    ),
                    const SizedBox(height: 6),
                    // Question text
                    Text(q.text, style: QT.display(20)),
                    const SizedBox(height: 16),
                    // Question visual (image or audio)
                    if (q.imageUrl != null) _QuestionImage(url: q.imageUrl!),
                    if (q.audioUrl != null)
                      _AudioPlayer(
                        url: q.audioUrl!,
                        playing: _audioPlaying,
                        onToggle: _toggleAudio,
                      ),
                    const SizedBox(height: 4),
                    // Options
                    if (q.optionStyle == OptionStyle.poster)
                      _PosterGrid(
                        options: q.options,
                        picked: _picked,
                        onTap: _pick,
                      )
                    else
                      ...q.options.map((o) => _OptionBtn(
                            option: o,
                            picked: _picked,
                            onTap: _pick,
                            showImage: q.optionStyle == OptionStyle.textImage,
                          )),
                  ],
                ),
              ),
            ),
            // Hint — pinned at bottom
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 22),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: C.sand,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    Text('힌트', style: QT.hangul(18, c: C.pink)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        q.hint?.isNotEmpty == true ? q.hint! : S.hint,
                        style: QT.body(12, c: C.ink2),
                      ),
                    ),
                    Text(S.hintCost,
                        style: QT.display(13, c: C.plum, w: FontWeight.w700)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Question image ────────────────────────────────────────────────

class _QuestionImage extends StatelessWidget {
  final String url;
  const _QuestionImage({required this.url});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      height: 180,
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: CachedNetworkImage(
        imageUrl: url,
        fit: BoxFit.cover,
        width: double.infinity,
        placeholder: (_, _) => Container(
          color: const Color(0xFFF4F0E8),
          child: const Center(child: CircularProgressIndicator()),
        ),
        errorWidget: (_, _, _) => Container(
          color: const Color(0xFFF4F0E8),
          child: const Icon(Icons.broken_image_rounded, size: 40),
        ),
      ),
    );
  }
}

// ── Audio player ──────────────────────────────────────────────────

class _AudioPlayer extends StatelessWidget {
  final String url;
  final bool playing;
  final Future<void> Function(String) onToggle;

  const _AudioPlayer({required this.url, required this.playing, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onToggle(url),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        decoration: BoxDecoration(
          color: C.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: C.line),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(color: C.ink, shape: BoxShape.circle),
              child: Icon(
                playing ? Icons.pause_rounded : Icons.play_arrow_rounded,
                color: C.bg,
                size: 24,
              ),
            ),
            const SizedBox(width: 14),
            Text(
              playing
                  ? t('Durdur', 'Pause', '일시정지')
                  : t('Dinle', 'Play audio', '재생'),
              style: QT.display(15, w: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Poster grid ───────────────────────────────────────────────────

class _PosterGrid extends StatelessWidget {
  final List<QuizOpt> options;
  final String? picked;
  final void Function(String) onTap;

  const _PosterGrid({required this.options, required this.picked, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      childAspectRatio: 0.85,
      children: options.take(4).map((o) => _PosterBtn(
            option: o,
            picked: picked,
            onTap: onTap,
          )).toList(),
    );
  }
}

class _PosterBtn extends StatelessWidget {
  final QuizOpt option;
  final String? picked;
  final void Function(String) onTap;

  const _PosterBtn({required this.option, required this.picked, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isPicked = picked == option.id;
    final isCorrect = isPicked && option.correct;
    final isWrong = isPicked && !option.correct;

    final borderColor = isCorrect
        ? C.gold
        : isWrong
            ? const Color(0xFFC0364A)
            : C.line;
    final borderWidth = (isCorrect || isWrong) ? 3.0 : 1.0;

    return GestureDetector(
      onTap: () => onTap(option.id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor, width: borderWidth),
          color: C.card,
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (option.imageUrl != null)
              CachedNetworkImage(
                imageUrl: option.imageUrl!,
                fit: BoxFit.cover,
                placeholder: (_, _) => const ColoredBox(color: Color(0xFFF4F0E8)),
                errorWidget: (_, _, _) =>
                    const Icon(Icons.broken_image_rounded),
              )
            else
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Text(
                    option.text,
                    style: QT.display(13, w: FontWeight.w600),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            if (isCorrect)
              const ColoredBox(color: Color(0x33FFC857)),
            // Letter badge
            Positioned(
              top: 8,
              left: 8,
              child: _LetterBadge(
                letter: option.id.toUpperCase(),
                isCorrect: isCorrect,
                isWrong: isWrong,
              ),
            ),
            if (isCorrect)
              const Positioned(
                bottom: 8,
                right: 8,
                child: Icon(Icons.check_circle_rounded,
                    color: Color(0xFFFFC857), size: 22),
              ),
          ],
        ),
      ),
    );
  }
}

// ── Text option button ────────────────────────────────────────────

class _OptionBtn extends StatelessWidget {
  final QuizOpt option;
  final String? picked;
  final void Function(String) onTap;
  final bool showImage;

  const _OptionBtn({
    required this.option,
    required this.picked,
    required this.onTap,
    this.showImage = false,
  });

  @override
  Widget build(BuildContext context) {
    final isPicked = picked == option.id;
    final isCorrect = isPicked && option.correct;
    final isWrong = isPicked && !option.correct;

    Color bg = C.card, fg = C.ink, border = C.line;
    if (isCorrect) {
      bg = C.ink;
      fg = C.bg;
      border = Colors.transparent;
    } else if (isWrong) {
      bg = const Color(0xFFFDE4E8);
      fg = const Color(0xFFC0364A);
      border = Colors.transparent;
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
              _LetterBadge(
                letter: option.id.toUpperCase(),
                isCorrect: isCorrect,
                isWrong: isWrong,
                size: 26,
              ),
              const SizedBox(width: 12),
              if (showImage && option.imageUrl != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: CachedNetworkImage(
                    imageUrl: option.imageUrl!,
                    width: 44,
                    height: 44,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(option.text,
                        style: QT.display(14, c: fg, w: FontWeight.w600)),
                    if (option.sub.isNotEmpty) ...[
                      const SizedBox(height: 1),
                      Text(option.sub,
                          style: QT.hangul(10,
                              c: fg.withValues(alpha: 0.7), w: FontWeight.w400)),
                    ],
                  ],
                ),
              ),
              if (isCorrect) Icon(Icons.check_rounded, color: C.gold, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Shared letter badge ───────────────────────────────────────────

class _LetterBadge extends StatelessWidget {
  final String letter;
  final bool isCorrect, isWrong;
  final double size;

  const _LetterBadge({
    required this.letter,
    required this.isCorrect,
    required this.isWrong,
    this.size = 22,
  });

  @override
  Widget build(BuildContext context) {
    Color badgeBg = C.sand, badgeFg = C.ink;
    if (isCorrect) {
      badgeBg = C.gold;
      badgeFg = C.plum;
    } else if (isWrong) {
      badgeBg = const Color(0xFFFFB1BC);
      badgeFg = C.plum;
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: badgeBg,
        borderRadius: BorderRadius.circular(size * 0.32),
      ),
      alignment: Alignment.center,
      child: Text(
        letter,
        style: QT.display(size * 0.46, c: badgeFg, w: FontWeight.w700, ls: 0),
      ),
    );
  }
}
