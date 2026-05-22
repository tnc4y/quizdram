import 'package:flutter/material.dart';
import '../theme.dart';
import '../data.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_chip.dart';
import '../widgets/stripe_painter.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  int _chip = 0;

  List<String> get _chips => [
    S.all, S.chipTrend, S.chipNewShow, S.chipGossip, S.chipInterview,
  ];

  @override
  Widget build(BuildContext context) {
    return Material(
      color: C.bg,
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
                      Text(S.newsItalic, style: QT.serif(18, c: C.pink)),
                      Text(S.magazine, style: QT.display(28)),
                    ],
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: C.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: C.line),
                    ),
                    child: const Icon(Icons.search_rounded,
                        color: C.ink, size: 18),
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
                        onTap: () => setState(() => _chip = i),
                        child: QzChip(chips[i], active: i == _chip),
                      ),
                    )),
                  );
                }),
              ),
              const SizedBox(height: 16),
              // Featured story card
              _FeaturedCard(news: kNews[0]),
              const SizedBox(height: 18),
              // News list
              ...kNews.skip(1).map((n) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: _NewsRow(news: n),
              )),
              const SizedBox(height: 100),
            ],
          ),
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
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: SizedBox(
        height: 220,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [C.pink, const Color(0xFFFF8AA3), C.gold],
                  stops: const [0.0, 0.6, 1.0],
                ),
              ),
            ),
            CustomPaint(
              painter: StripePainter(
                color: C.plum,
                opacity: 0.08,
                stripeWidth: 12,
                totalStep: 24,
              ),
            ),
            // Hangul accent
            Positioned(
              top: -10,
              right: -8,
              child: IgnorePointer(
                child: Text(
                  news.hangul,
                  style: QT.hangul(
                    110,
                    c: C.plum.withValues(alpha: 0.18),
                    w: FontWeight.w900,
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Tag
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: news.tagBg,
                          borderRadius: BorderRadius.circular(999),
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
                      const SizedBox(width: 8),
                      Text(news.time,
                          style: QT.body(
                            11,
                            c: C.plum.withValues(alpha: 0.7),
                          )),
                    ],
                  ),
                  // Headline + reactions
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        news.headline,
                        style: QT.display(
                          20,
                          c: C.plum,
                          w: FontWeight.w700,
                          h: 1.15,
                          ls: -20 * 0.02,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: C.plum,
                              shape: BoxShape.circle,
                              border: Border.all(color: C.pink, width: 2),
                            ),
                          ),
                          const SizedBox(width: -4),
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: C.purple,
                              shape: BoxShape.circle,
                              border: Border.all(color: C.pink, width: 2),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '14.8K beğeni · 2.1K yorum',
                            style: QT.body(
                              11,
                              c: C.plum.withValues(alpha: 0.8),
                            ),
                          ),
                        ],
                      ),
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
          label: news.hangul,
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
                style: QT.body(10.5, c: C.ink2),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
