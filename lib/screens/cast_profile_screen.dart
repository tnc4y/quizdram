import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/models.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/stripe_painter.dart';
import '../router.dart';
import '../services/service_locator.dart';

class CastProfileScreen extends StatefulWidget {
  final CastMember member;
  const CastProfileScreen({super.key, required this.member});

  @override
  State<CastProfileScreen> createState() => _CastProfileScreenState();
}

class _CastProfileScreenState extends State<CastProfileScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final cast = widget.member;

    return Material(
      color: context.qp.bg,
      child: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero section
                _Hero(cast: cast),
                // Content below hero
                Padding(
                  padding: const EdgeInsets.fromLTRB(22, 0, 22, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 12),
                      // Region + age + role chips
                      Row(
                        children: [
                          _RegionTag(cast.region),
                          const SizedBox(width: 6),
                          Text('· ${cast.age}',
                              style: QT.body(12, c: context.qp.ink2)),
                          const SizedBox(width: 6),
                          Text('· ${cast.role}',
                              style: QT.body(12, c: context.qp.ink2)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(cast.name,
                          style: QT.display(30, c: context.qp.ink, w: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(cast.hangul,
                          style: QT.hangul(14, c: context.qp.ink2, w: FontWeight.w700)),
                      const SizedBox(height: 14),
                      Divider(color: context.qp.line, height: 1),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _StatCell('12', S.dramas),
                            _StatCell('4.8', S.rating),
                            _StatCell('2.1M', S.fans),
                            _StatCell('#3', S.rank),
                          ],
                        ),
                      ),
                      Divider(color: context.qp.line, height: 1),
                      const SizedBox(height: 16),
                      // Tabs
                      Row(
                        children: [
                          _Tab(S.filmography, active: _tab == 0,
                              onTap: () => setState(() => _tab = 0)),
                          const SizedBox(width: 18),
                          _Tab(S.quizzes, active: _tab == 1,
                              onTap: () => setState(() => _tab = 1)),
                          const SizedBox(width: 18),
                          _Tab(S.newsTab, active: _tab == 2,
                              onTap: () => setState(() => _tab = 2)),
                        ],
                      ),
                      const SizedBox(height: 14),
                      // Tab content
                      if (_tab == 0) _Filmography(cast: cast),
                      if (_tab == 1) _QuizCTA(cast: cast),
                      if (_tab == 2) _CastNews(),
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Back button (only when pushed as a route)
          if (Navigator.of(context).canPop())
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.arrow_back_rounded,
                        color: context.qp.ink, size: 18),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Hero with striped gradient ──────────────────────────────────
class _Hero extends StatelessWidget {
  final CastMember cast;
  const _Hero({required this.cast});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 280,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Gradient bg
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [cast.hue, context.qp.featured],
                stops: const [0.0, 0.85],
              ),
            ),
          ),
          // Diagonal stripes
          CustomPaint(
            painter: StripePainter(
              color: Colors.white,
              opacity: 0.04,
              stripeWidth: 18,
              totalStep: 36,
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Builder(builder: (ctx) => Container(
              height: 120,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, ctx.qp.bg],
                ),
              ),
            )),
          ),
          // Hangul accent
          Positioned(
            top: 20,
            right: 16,
            child: IgnorePointer(
              child: Text(
                cast.hangul,
                style: QT.hangul(
                  120,
                  c: Colors.white.withValues(alpha: 0.4),
                  w: FontWeight.w900,
                  ls: -4,
                ),
              ),
            ),
          ),
          // Bookmark + heart buttons
          SafeArea(
            child: Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _HeroBtn(Icons.bookmark_outline_rounded),
                    const SizedBox(width: 8),
                    _HeroBtn(Icons.favorite_border_rounded, fill: context.qp.pink),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroBtn extends StatelessWidget {
  final IconData icon;
  final Color? fill;
  const _HeroBtn(this.icon, {this.fill});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, color: fill ?? context.qp.ink, size: 18),
    );
  }
}

class _RegionTag extends StatelessWidget {
  final String region;
  const _RegionTag(this.region);

  static const _map = {
    'kr': ('KR', Color(0xFFFF5470)),
    'cn': ('CN', Color(0xFFE94560)),
    'jp': ('JP', Color(0xFF7C5ED3)),
    'th': ('TH', Color(0xFFFFC857)),
  };

  @override
  Widget build(BuildContext context) {
    final (code, color) = _map[region] ?? ('??', context.qp.ink2);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(code,
          style: QT.body(9, c: color, w: FontWeight.w700, ls: 1)),
    );
  }
}

class _StatCell extends StatelessWidget {
  final String value, label;
  const _StatCell(this.value, this.label);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: QT.display(17, c: context.qp.ink, w: FontWeight.w700)),
        const SizedBox(height: 2),
        Text(label, style: QT.body(10, c: context.qp.ink2)),
      ],
    );
  }
}

class _Tab extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _Tab(this.label, {required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Text(label,
              style: QT.display(
                13,
                c: active ? context.qp.ink : context.qp.ink2,
                w: active ? FontWeight.w700 : FontWeight.w500,
              )),
          const SizedBox(height: 6),
          if (active)
            Container(
              height: 2,
              width: 24,
              decoration: BoxDecoration(
                color: context.qp.pink,
                borderRadius: BorderRadius.circular(1),
              ),
            )
          else
            const SizedBox(height: 2),
        ],
      ),
    );
  }
}

// ── Filmography list ─────────────────────────────────────────────
class _Filmography extends StatefulWidget {
  final CastMember cast;
  const _Filmography({required this.cast});

  @override
  State<_Filmography> createState() => _FilmographyState();
}

class _FilmographyState extends State<_Filmography> {
  late Future<List<Drama>> _future;

  @override
  void initState() {
    super.initState();
    _future = sl.cast.getDramasForCast(widget.cast.dramaIds);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Drama>>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return Column(
            children: List.generate(2, (_) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                height: 98,
                decoration: BoxDecoration(
                  color: context.qp.card,
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            )),
          );
        }
        final dramas = snap.data ?? [];
        if (dramas.isEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: Text(S.comingSoon, style: QT.body(13, c: context.qp.ink3)),
            ),
          );
        }
        return Column(
          children: dramas.map((d) {
            final label = d.hangul.isNotEmpty ? d.hangul[0] : d.title[0];
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: context.qp.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: context.qp.line),
                ),
                child: Row(
                  children: [
                    QzPhoto(hue: d.hue, label: label, width: 62, height: 78, borderRadius: 10),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(d.title,
                              style: QT.display(14, c: context.qp.ink, w: FontWeight.w600)),
                          const SizedBox(height: 2),
                          Text('${d.year} · ${d.genre}',
                              style: QT.body(11, c: context.qp.ink2)),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  color: context.qp.sand,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Icon(Icons.play_arrow_rounded,
                                    color: context.qp.pink, size: 14),
                              ),
                              const SizedBox(width: 6),
                              Text(S.playQuiz16, style: QT.body(11, c: context.qp.ink2)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }
}

// ── Quiz CTA tab ─────────────────────────────────────────────────
class _QuizCTA extends StatelessWidget {
  final CastMember cast;
  const _QuizCTA({required this.cast});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.qp.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.qp.line),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: context.qp.pink, borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${cast.name.split(' ').first} quizi',
                    style: QT.display(14, c: context.qp.ink, w: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(S.quiz16Stats, style: QT.body(11, c: context.qp.ink2)),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => AppRouter.toQuizPlay(context),
            child: Text(S.playBtn, style: QT.display(12, c: context.qp.ink, w: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

// ── News tab placeholder ─────────────────────────────────────────
class _CastNews extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 32),
        child: Text(S.comingSoon, style: QT.body(14, c: context.qp.ink3)),
      ),
    );
  }
}
