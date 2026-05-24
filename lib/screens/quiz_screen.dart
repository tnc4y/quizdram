import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme.dart';
import '../lang.dart';
import '../models/models.dart';
import '../router.dart';
import '../services/service_locator.dart';

const _regionFlag = {
  'kr': '🇰🇷',
  'cn': '🇨🇳',
  'jp': '🇯🇵',
  'th': '🇹🇭',
};

const _diffLabel = {
  'easy':   'Kolay',
  'medium': 'Orta',
  'hard':   'Zor',
};

const _diffColor = {
  'easy':   Color(0xFF2A9D5C),
  'medium': Color(0xFFFFC857),
  'hard':   Color(0xFFFF5470),
};

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  late Future<List<QuizPackInfo>> _future;

  @override
  void initState() {
    super.initState();
    _future = sl.quiz.getPacks();
  }

  void _refresh() {
    setState(() { _future = sl.quiz.getPacks(); });
  }

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Material(
      color: p.bg,
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(S.tabQuiz,
                      style: QT.display(26, c: p.ink, w: FontWeight.w700, ls: -0.5)),
                  const SizedBox(width: 8),
                  Text('퀴즈', style: QT.hangul(20, c: p.pink.withValues(alpha: 0.35))),
                ],
              ),
            ),
            // List
            Expanded(
              child: FutureBuilder<List<QuizPackInfo>>(
                future: _future,
                builder: (context, snap) {
                  if (snap.connectionState == ConnectionState.waiting) {
                    return _Shimmer();
                  }
                  if (snap.hasError) {
                    return _ErrorState(onRetry: _refresh);
                  }
                  final packs = snap.data ?? [];
                  if (packs.isEmpty) {
                    return _EmptyState();
                  }
                  return RefreshIndicator(
                    onRefresh: () async => _refresh(),
                    color: p.pink,
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 110),
                      itemCount: packs.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 12),
                      itemBuilder: (_, i) => _PackCard(pack: packs[i]),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Pack card ─────────────────────────────────────────────────────

class _PackCard extends StatelessWidget {
  final QuizPackInfo pack;
  const _PackCard({required this.pack});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    final diffColor = _diffColor[pack.difficulty] ?? _diffColor['medium']!;
    final diffLabel = _diffLabel[pack.difficulty] ?? pack.difficulty;
    final flag = _regionFlag[pack.region] ?? '🌏';

    return GestureDetector(
      onTap: () => AppRouter.toQuizPlay(context, packId: pack.id),
      child: Container(
        decoration: BoxDecoration(
          color: p.card,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: p.line),
          boxShadow: [
            BoxShadow(
              color: p.ink.withValues(alpha: 0.04),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            // Cover image / placeholder
            ClipRRect(
              borderRadius:
                  const BorderRadius.horizontal(left: Radius.circular(20)),
              child: SizedBox(
                width: 100,
                height: 110,
                child: pack.coverUrl != null
                    ? CachedNetworkImage(
                        imageUrl: pack.coverUrl!,
                        fit: BoxFit.cover,
                        placeholder: (_, _) =>
                            ColoredBox(color: p.sand),
                        errorWidget: (_, _, _) => _CoverPlaceholder(p: p, flag: flag),
                      )
                    : _CoverPlaceholder(p: p, flag: flag),
              ),
            ),
            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      pack.title,
                      style: QT.display(15, c: p.ink, w: FontWeight.w700, h: 1.2),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (pack.dramaTitle != null) ...[
                      const SizedBox(height: 3),
                      Text(
                        pack.dramaTitle!,
                        style: QT.body(12, c: p.ink2),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 10),
                    // Badges row
                    Row(
                      children: [
                        // Difficulty
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: diffColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            diffLabel,
                            style: QT.body(10,
                                c: diffColor, w: FontWeight.w700),
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Question count
                        Text(
                          '${pack.questionCount} soru',
                          style: QT.body(11, c: p.ink3),
                        ),
                        const Spacer(),
                        // Region flag
                        Text(flag,
                            style: const TextStyle(fontSize: 16)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            // Play arrow
            Padding(
              padding: const EdgeInsets.only(right: 14),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: p.pink,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.play_arrow_rounded,
                    color: p.bg, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CoverPlaceholder extends StatelessWidget {
  final QzPalette p;
  final String flag;
  const _CoverPlaceholder({required this.p, required this.flag});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: p.sand,
      child: Center(
        child: Text(flag, style: const TextStyle(fontSize: 32)),
      ),
    );
  }
}

// ── Shimmer loading ───────────────────────────────────────────────

class _Shimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 110),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 4,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (_, _) => Container(
        height: 110,
        decoration: BoxDecoration(
          color: p.card,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: p.line),
        ),
      ),
    );
  }
}

// ── Empty state ───────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('퀴즈', style: QT.hangul(64, c: p.pink.withValues(alpha: 0.2))),
          const SizedBox(height: 12),
          Text(
            t('Henüz yayınlanmış quiz yok.', 'No quizzes published yet.',
                '아직 공개된 퀴즈가 없습니다.'),
            style: QT.body(14, c: p.ink2),
          ),
          const SizedBox(height: 4),
          Text(
            t('Yakında yeni quizler geliyor!', 'New quizzes coming soon!',
                '곧 새로운 퀴즈가 추가될 예정입니다!'),
            style: QT.body(12, c: p.ink3),
          ),
        ],
      ),
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('!', style: QT.display(48, c: p.pink.withValues(alpha: 0.4))),
          const SizedBox(height: 8),
          Text(
            t('Yüklenemedi', 'Failed to load', '불러올 수 없습니다'),
            style: QT.body(14, c: p.ink2),
          ),
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
              child: Text(
                t('Tekrar dene', 'Retry', '다시 시도'),
                style: QT.display(13, c: p.bg, w: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
