import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme.dart';
import '../lang.dart';
import '../models/models.dart';
import '../widgets/stripe_painter.dart';

class NewsDetailScreen extends StatelessWidget {
  final NewsItem news;
  const NewsDetailScreen({super.key, required this.news});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Scaffold(
      backgroundColor: p.bg,
      body: CustomScrollView(
        slivers: [
          // ── Hero ──────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: p.bg,
            leading: Padding(
              padding: const EdgeInsets.all(8),
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.arrow_back_rounded,
                      color: Colors.white, size: 20),
                ),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.pin,
              background: _HeroImage(news: news),
            ),
          ),

          // ── Content ───────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tag + time row
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: news.tagBg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(news.tag,
                            style: QT.body(9,
                                w: FontWeight.w700, c: news.tagFg, ls: 1.2)),
                      ),
                      const SizedBox(width: 10),
                      if (news.time.isNotEmpty)
                        Text(news.time, style: QT.body(12, c: p.ink3)),
                      const Spacer(),
                      GestureDetector(
                        onTap: () {
                          Clipboard.setData(
                              ClipboardData(text: news.headline));
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                t('Başlık kopyalandı',
                                    'Headline copied', '제목 복사됨'),
                                style: QT.body(12, c: Colors.white),
                              ),
                              backgroundColor: p.featured,
                              behavior: SnackBarBehavior.floating,
                              duration: const Duration(seconds: 2),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          );
                        },
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: p.card,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: p.line),
                          ),
                          child: Icon(Icons.share_outlined,
                              color: p.ink2, size: 15),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Headline
                  Text(
                    news.headline,
                    style: QT.display(24,
                        c: p.ink, w: FontWeight.w700, h: 1.12, ls: -0.6),
                  ),

                  const SizedBox(height: 8),

                  // Source
                  Text(
                    news.source,
                    style: QT.body(12, c: p.ink3, w: FontWeight.w600),
                  ),

                  const SizedBox(height: 20),
                  Divider(color: p.line, height: 1),
                  const SizedBox(height: 20),

                  // Body
                  if (news.body != null && news.body!.trim().isNotEmpty) ...[
                    Text(
                      news.body!,
                      style: QT.body(15, c: p.ink, h: 1.7),
                    ),
                    const SizedBox(height: 32),
                  ] else ...[
                    _NoBodyPlaceholder(news: news),
                    const SizedBox(height: 32),
                  ],

                  // Source link
                  if (news.sourceUrl != null &&
                      news.sourceUrl!.isNotEmpty) ...[
                    _SourceButton(news: news),
                    const SizedBox(height: 20),
                  ],

                  // Bottom tag decoration
                  Center(
                    child: Text(
                      news.hangul.isNotEmpty ? news.hangul : '드라마',
                      style: QT.hangul(48,
                          c: p.pink.withValues(alpha: 0.1),
                          w: FontWeight.w900),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Hero image / gradient ─────────────────────────────────────────
class _HeroImage extends StatelessWidget {
  final NewsItem news;
  const _HeroImage({required this.news});

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Background: real image or gradient
        if (news.imageUrl != null && news.imageUrl!.isNotEmpty)
          CachedNetworkImage(
            imageUrl: news.imageUrl!,
            fit: BoxFit.cover,
            placeholder: (_, _) => _GradientBg(news: news),
            errorWidget: (_, _, _) => _GradientBg(news: news),
          )
        else
          _GradientBg(news: news),

        // Bottom gradient scrim for readability
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 160,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withValues(alpha: 0.65),
                ],
              ),
            ),
          ),
        ),

        // Hangul decoration (only when no image)
        if (news.imageUrl == null || news.imageUrl!.isEmpty)
          Positioned(
            top: -10,
            right: -8,
            child: IgnorePointer(
              child: Text(
                news.hangul.isNotEmpty ? news.hangul : '드라마',
                style: QT.hangul(130,
                    c: Colors.white.withValues(alpha: 0.15),
                    w: FontWeight.w900),
              ),
            ),
          ),

        // Source label at bottom-left
        Positioned(
          left: 20,
          bottom: 20,
          right: 60,
          child: Text(
            news.source,
            style: QT.body(12,
                c: Colors.white.withValues(alpha: 0.8),
                w: FontWeight.w600),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _GradientBg extends StatelessWidget {
  final NewsItem news;
  const _GradientBg({required this.news});

  @override
  Widget build(BuildContext context) {
    final dark = Color.lerp(news.hue, Colors.black, 0.5)!;
    return Stack(
      fit: StackFit.expand,
      children: [
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [news.hue, dark],
            ),
          ),
        ),
        CustomPaint(
          painter: StripePainter(
            color: Colors.white,
            opacity: 0.07,
            stripeWidth: 14,
            totalStep: 28,
          ),
        ),
      ],
    );
  }
}

// ── No body placeholder ───────────────────────────────────────────
class _NoBodyPlaceholder extends StatelessWidget {
  final NewsItem news;
  const _NoBodyPlaceholder({required this.news});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: p.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('📰', style: const TextStyle(fontSize: 28)),
          const SizedBox(height: 10),
          Text(
            t(
              'Bu haberin detayları şu an mevcut değil. Kaynağa giderek devam edebilirsin.',
              'Full article details are not available right now. Visit the source to read more.',
              '기사 전문을 현재 이용할 수 없습니다. 출처를 방문하여 더 읽어보세요.',
            ),
            style: QT.body(14, c: p.ink2, h: 1.6),
          ),
        ],
      ),
    );
  }
}

// ── Source button ─────────────────────────────────────────────────
class _SourceButton extends StatelessWidget {
  final NewsItem news;
  const _SourceButton({required this.news});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return GestureDetector(
      onTap: () {
        Clipboard.setData(ClipboardData(text: news.sourceUrl!));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              t('Bağlantı kopyalandı', 'Link copied', '링크 복사됨'),
              style: QT.body(12, c: Colors.white),
            ),
            backgroundColor: p.featured,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 2),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        decoration: BoxDecoration(
          color: p.featured,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.open_in_new_rounded, color: p.gold, size: 16),
            const SizedBox(width: 8),
            Text(
              t('Kaynağı Ziyaret Et', 'Visit Source', '출처 방문'),
              style: QT.display(13, c: Colors.white, w: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
