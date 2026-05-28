import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme.dart';
import '../models/models.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_chip.dart';
import '../widgets/stripe_painter.dart';
import '../services/service_locator.dart';
import 'news_detail_screen.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  int _chip = 0;
  late Future<List<NewsItem>> _newsFuture;

  static const _categories = [null, 'trend', 'new_show', 'gossip', 'interview'];

  List<String> get _chips => [
    S.all, S.chipTrend, S.chipNewShow, S.chipGossip, S.chipInterview,
  ];

  @override
  void initState() {
    super.initState();
    _newsFuture = _load();
  }

  Future<List<NewsItem>> _load() =>
      sl.news.getNews(category: _categories[_chip]);

  void _selectChip(int i) {
    setState(() {
      _chip = i;
      _newsFuture = _load();
    });
  }

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
              // Header
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(S.newsItalic, style: QT.serif(18, c: context.qp.pink)),
                      Text(S.magazine, style: QT.display(28, c: context.qp.ink)),
                    ],
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: context.qp.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: context.qp.line),
                    ),
                    child: Icon(Icons.search_rounded,
                        color: context.qp.ink, size: 18),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              // Category chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Builder(builder: (context) {
                  final chips = _chips;
                  return Row(
                    children: List.generate(chips.length, (i) => Padding(
                      padding:
                          EdgeInsets.only(right: i < chips.length - 1 ? 8 : 0),
                      child: GestureDetector(
                        onTap: () => _selectChip(i),
                        child: QzChip(chips[i], active: i == _chip),
                      ),
                    )),
                  );
                }),
              ),
              const SizedBox(height: 16),
              FutureBuilder<List<NewsItem>>(
                future: _newsFuture,
                builder: (context, snap) {
                  if (snap.connectionState == ConnectionState.waiting) {
                    return const _NewsLoadingShimmer();
                  }
                  if (snap.hasError) {
                    return _EmptyNews();
                  }
                  final items = snap.data ?? [];
                  if (items.isEmpty) {
                    return _EmptyNews();
                  }
                  return Column(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(
                          builder: (_) => NewsDetailScreen(news: items[0]),
                        )),
                        child: _FeaturedCard(news: items[0]),
                      ),
                      const SizedBox(height: 18),
                      ...items.skip(1).map((n) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: GestureDetector(
                          onTap: () => Navigator.push(context, MaterialPageRoute(
                            builder: (_) => NewsDetailScreen(news: n),
                          )),
                          child: _NewsRow(news: n),
                        ),
                      )),
                      const SizedBox(height: 100),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NewsLoadingShimmer extends StatelessWidget {
  const _NewsLoadingShimmer();

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Column(
      children: [
        Container(
          height: 220,
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(20),
          ),
        ),
        const SizedBox(height: 18),
        ...List.generate(3, (_) => Padding(
          padding: const EdgeInsets.only(bottom: 14),
          child: Row(
            children: [
              Container(
                width: 88,
                height: 100,
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(height: 12, width: 60, color: p.card),
                    const SizedBox(height: 8),
                    Container(height: 14, color: p.card),
                    const SizedBox(height: 4),
                    Container(height: 14, width: double.infinity, color: p.card),
                  ],
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }
}

class _EmptyNews extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 200,
      child: Center(
        child: Text(
          'Henüz haber yok',
          style: QT.body(14, c: context.qp.ink2),
        ),
      ),
    );
  }
}

// ── Featured card ───────────────────────────────────────────────
class _FeaturedCard extends StatelessWidget {
  final NewsItem news;
  const _FeaturedCard({required this.news});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    final hasImage = news.imageUrl != null && news.imageUrl!.isNotEmpty;
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: SizedBox(
        height: 220,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background: real image or gradient
            if (hasImage)
              CachedNetworkImage(
                imageUrl: news.imageUrl!,
                fit: BoxFit.cover,
                placeholder: (_, _) => _FeaturedGradient(news: news),
                errorWidget: (_, _, _) => _FeaturedGradient(news: news),
              )
            else
              _FeaturedGradient(news: news),

            // Scrim for readability
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: hasImage ? 0.25 : 0.0),
                    Colors.black.withValues(alpha: hasImage ? 0.65 : 0.45),
                  ],
                ),
              ),
            ),

            // Hangul decoration (only without image)
            if (!hasImage)
              Positioned(
                top: -10,
                right: -8,
                child: IgnorePointer(
                  child: Text(news.hangul,
                      style: QT.hangul(110, c: p.featured.withValues(alpha: 0.18), w: FontWeight.w900)),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: news.tagBg, borderRadius: BorderRadius.circular(999)),
                        child: Text(news.tag, style: QT.body(9, w: FontWeight.w700, c: news.tagFg, ls: 1)),
                      ),
                      const SizedBox(width: 8),
                      if (news.time.isNotEmpty)
                        Text(news.time, style: QT.body(11, c: Colors.white.withValues(alpha: 0.75))),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(news.headline,
                          style: QT.display(20, c: Colors.white, w: FontWeight.w700, h: 1.15, ls: -20 * 0.02)),
                      const SizedBox(height: 8),
                      Text(news.source,
                          style: QT.body(11, c: Colors.white.withValues(alpha: 0.75), w: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeaturedGradient extends StatelessWidget {
  final NewsItem news;
  const _FeaturedGradient({required this.news});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Stack(
      fit: StackFit.expand,
      children: [
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [p.pink, const Color(0xFFFF8AA3), p.gold],
              stops: const [0.0, 0.6, 1.0],
            ),
          ),
        ),
        CustomPaint(
          painter: StripePainter(color: p.featured, opacity: 0.08, stripeWidth: 12, totalStep: 24),
        ),
      ],
    );
  }
}

// ── News list row ───────────────────────────────────────────────
class _NewsRow extends StatelessWidget {
  final NewsItem news;
  const _NewsRow({required this.news});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        QzPhoto(
          hue: news.hue,
          label: news.imageUrl != null ? '' : news.hangul,
          photoUrl: news.imageUrl,
          width: 88,
          height: 100,
          borderRadius: 14,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Tag
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: news.tagBg,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  news.tag,
                  style: QT.body(
                    9,
                    w: FontWeight.w700,
                    c: news.tagFg,
                    ls: 1,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                news.headline,
                style: QT.display(
                  13.5,
                  w: FontWeight.w600,
                  h: 1.25,
                  ls: -13.5 * 0.01,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              Text(
                '${news.source} · ${news.time}',
                style: QT.body(10.5, c: context.qp.ink2),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
