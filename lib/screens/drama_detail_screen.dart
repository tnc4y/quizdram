import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme.dart';
import '../models/models.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/stripe_painter.dart';
import '../router.dart';
import '../services/service_locator.dart';
import 'cast_profile_screen.dart';

class DramaDetailScreen extends StatelessWidget {
  final Drama drama;
  const DramaDetailScreen({super.key, required this.drama});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: context.qp.bg,
      child: CustomScrollView(
        slivers: [
          // ── Hero ──────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            backgroundColor: context.qp.bg,
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
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(6),
                    child: Icon(Icons.favorite_border_rounded,
                        color: Colors.white, size: 20),
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.pin,
              background: _DramaHero(drama: drama),
            ),
          ),

          // ── Content ───────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Region + year + eps row
                  Row(
                    children: [
                      _RegionTag(drama.region),
                      const SizedBox(width: 8),
                      Text('${drama.year}',
                          style: QT.body(12, c: context.qp.ink2)),
                      const SizedBox(width: 8),
                      Text('·',
                          style: QT.body(12, c: context.qp.ink3)),
                      const SizedBox(width: 8),
                      if (drama.eps > 0) ...[
                        Text('${drama.eps} ${t('bölüm', 'eps', '화')}',
                            style: QT.body(12, c: context.qp.ink2)),
                        const SizedBox(width: 8),
                        Text('·', style: QT.body(12, c: context.qp.ink3)),
                        const SizedBox(width: 8),
                      ],
                      Text(drama.genre,
                          style: QT.body(12, c: context.qp.ink2)),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Title
                  Text(
                    drama.title,
                    style: QT.display(28, c: context.qp.ink,
                        w: FontWeight.w700, h: 1.1, ls: -0.6),
                  ),

                  if (drama.hangul.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(drama.hangul,
                        style: QT.hangul(14,
                            c: context.qp.ink2, w: FontWeight.w700)),
                  ],

                  if (drama.popularity != null) ...[
                    const SizedBox(height: 10),
                    Row(children: [
                      Icon(Icons.trending_up_rounded,
                          size: 14, color: context.qp.pink),
                      const SizedBox(width: 4),
                      Text(
                        t(
                          'Popülerlik: ${drama.popularity!.toStringAsFixed(1)}',
                          'Popularity: ${drama.popularity!.toStringAsFixed(1)}',
                          '인기도: ${drama.popularity!.toStringAsFixed(1)}',
                        ),
                        style: QT.body(11, c: context.qp.ink2),
                      ),
                    ]),
                  ],

                  const SizedBox(height: 16),
                  Divider(color: context.qp.line, height: 1),
                  const SizedBox(height: 16),

                  // Play quiz CTA
                  GestureDetector(
                    onTap: () => AppRouter.toQuizPlay(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 14, horizontal: 16),
                      decoration: BoxDecoration(
                        color: context.qp.featured,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.play_arrow_rounded,
                              color: context.qp.gold, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            t('${drama.title} Quizini Oyna',
                                'Play ${drama.title} Quiz',
                                '${drama.hangul.isNotEmpty ? drama.hangul : drama.title} 퀴즈 플레이'),
                            style: QT.display(13,
                                c: Colors.white, w: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Synopsis
                  if (drama.synopsis != null &&
                      drama.synopsis!.trim().isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text(t('Özet', 'Synopsis', '줄거리'),
                        style: QT.display(16, c: context.qp.ink,
                            w: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(drama.synopsis!,
                        style: QT.body(14, c: context.qp.ink2, h: 1.65)),
                  ],

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),

          // ── Cast section ──────────────────────────────────────
          SliverToBoxAdapter(
            child: _CastSection(drama: drama),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 100, top: 16),
              child: Center(
                child: Text(
                  drama.hangul.isNotEmpty ? drama.hangul : '드라마',
                  style: QT.hangul(48,
                      c: context.qp.pink.withValues(alpha: 0.1),
                      w: FontWeight.w900),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Hero image ────────────────────────────────────────────────────
class _DramaHero extends StatelessWidget {
  final Drama drama;
  const _DramaHero({required this.drama});

  @override
  Widget build(BuildContext context) {
    final hasImage = drama.posterUrl != null && drama.posterUrl!.isNotEmpty;
    return Stack(
      fit: StackFit.expand,
      children: [
        if (hasImage)
          CachedNetworkImage(
            imageUrl: drama.posterUrl!,
            fit: BoxFit.cover,
            placeholder: (_, _) => _GradientBg(drama: drama),
            errorWidget: (_, _, _) => _GradientBg(drama: drama),
          )
        else
          _GradientBg(drama: drama),

        // Bottom gradient scrim
        Positioned(
          left: 0, right: 0, bottom: 0,
          height: 160,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withValues(alpha: hasImage ? 0.7 : 0.5),
                ],
              ),
            ),
          ),
        ),

        if (!hasImage)
          Positioned(
            top: -10, right: -8,
            child: IgnorePointer(
              child: Text(
                drama.hangul.isNotEmpty ? drama.hangul : '드라마',
                style: QT.hangul(130,
                    c: Colors.white.withValues(alpha: 0.15),
                    w: FontWeight.w900),
              ),
            ),
          ),

        // Title overlay at bottom
        Positioned(
          left: 20, bottom: 20, right: 80,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(drama.title,
                  style: QT.display(22,
                      c: Colors.white, w: FontWeight.w700, h: 1.1),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
              if (drama.hangul.isNotEmpty)
                Text(drama.hangul,
                    style: QT.hangul(12,
                        c: Colors.white.withValues(alpha: 0.75),
                        w: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }
}

class _GradientBg extends StatelessWidget {
  final Drama drama;
  const _GradientBg({required this.drama});

  @override
  Widget build(BuildContext context) {
    final dark = Color.lerp(drama.hue, Colors.black, 0.45)!;
    return Stack(
      fit: StackFit.expand,
      children: [
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [drama.hue, dark],
            ),
          ),
        ),
        CustomPaint(
          painter: StripePainter(
            color: Colors.white,
            opacity: 0.06,
            stripeWidth: 14,
            totalStep: 28,
          ),
        ),
      ],
    );
  }
}

// ── Region tag ────────────────────────────────────────────────────
class _RegionTag extends StatelessWidget {
  final String region;
  const _RegionTag(this.region);

  static const _map = {
    'kr': ('🇰🇷 KR', Color(0xFFFF5470)),
    'cn': ('🇨🇳 CN', Color(0xFFE94560)),
    'jp': ('🇯🇵 JP', Color(0xFF7C5ED3)),
    'th': ('🇹🇭 TH', Color(0xFFFFC857)),
  };

  @override
  Widget build(BuildContext context) {
    final (code, color) = _map[region] ?? ('??', context.qp.ink2);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Text(code,
          style: QT.body(9, c: color, w: FontWeight.w700, ls: 0.5)),
    );
  }
}

// ── Cast section ──────────────────────────────────────────────────
class _CastSection extends StatefulWidget {
  final Drama drama;
  const _CastSection({required this.drama});

  @override
  State<_CastSection> createState() => _CastSectionState();
}

class _CastSectionState extends State<_CastSection> {
  late Future<List<CastMember>> _future;

  @override
  void initState() {
    super.initState();
    _future = sl.cast.getCastForDrama(widget.drama.id);
  }

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return FutureBuilder<List<CastMember>>(
      future: _future,
      builder: (context, snap) {
        final members = snap.data ?? [];
        if (snap.connectionState == ConnectionState.waiting) {
          return _CastShimmer();
        }
        if (members.isEmpty) return const SizedBox.shrink();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(t('Oyuncular', 'Cast', '출연진'),
                  style: QT.display(16, c: p.ink, w: FontWeight.w700)),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 150,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: members.length,
                separatorBuilder: (_, _) => const SizedBox(width: 10),
                itemBuilder: (_, i) {
                  final m = members[i];
                  final label = m.hangul.isNotEmpty
                      ? m.hangul[0]
                      : m.name[0];
                  return GestureDetector(
                    onTap: () => Navigator.push(context,
                        MaterialPageRoute(
                            builder: (_) => CastProfileScreen(member: m))),
                    child: SizedBox(
                      width: 78,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          QzPhoto(
                            hue: m.hue,
                            label: label,
                            photoUrl: m.photoUrl,
                            width: 78,
                            height: 100,
                            borderRadius: 12,
                          ),
                          const SizedBox(height: 5),
                          Text(m.name,
                              style: QT.display(11, c: p.ink,
                                  w: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                          Text(m.role,
                              style: QT.body(9, c: p.ink2),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _CastShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(width: 80, height: 16, color: p.card),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 150,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: 5,
            separatorBuilder: (_, _) => const SizedBox(width: 10),
            itemBuilder: (_, _) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 78, height: 100,
                  decoration: BoxDecoration(
                    color: p.card,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(height: 5),
                Container(width: 60, height: 11, color: p.card),
                const SizedBox(height: 3),
                Container(width: 40, height: 9, color: p.card),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
