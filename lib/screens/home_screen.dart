import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/models.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_chip.dart';
import '../router.dart';
import '../services/service_locator.dart';

// ── Screen ───────────────────────────────────────────────────────
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<({String userName, String featuredTitle, List<Drama> dramas})> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<({String userName, String featuredTitle, List<Drama> dramas})> _load() async {
    final results = await Future.wait([
      sl.user.getDisplayName(),
      sl.drama.getTrending(limit: 5),
    ]);
    final name = results[0] as String;
    final dramas = results[1] as List<Drama>;
    return (
      userName: name,
      featuredTitle: S.todayQuiz,
      dramas: dramas,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: context.qp.bg,
      child: SafeArea(
        bottom: false,
        child: FutureBuilder<({String userName, String featuredTitle, List<Drama> dramas})>(
          future: _future,
          builder: (context, snap) {
            final data = snap.data;
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 6, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Header(name: data?.userName ?? ''),
                  const SizedBox(height: 16),
                  _HeroQuizCard(title: data?.featuredTitle ?? 'Lunar Tide'),
                  const SizedBox(height: 18),
                  _RegionChips(),
                  const SizedBox(height: 22),
                  _SectionTitle(S.quizTypes, trailing: ''),
                  const SizedBox(height: 12),
                  _QuizTypeGrid(),
                  const SizedBox(height: 22),
                  _SectionTitle(S.trending, trailing: S.seeAll),
                  const SizedBox(height: 12),
                  if (data == null)
                    _TrendingShimmer()
                  else if (data.dramas.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text('Henüz drama yok',
                            style: QT.body(13, c: context.qp.ink3)),
                      ),
                    )
                  else
                    _TrendingStrip(dramas: data.dramas),
                  const SizedBox(height: 100),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

// ── Header ───────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final String name;
  const _Header({required this.name});

  @override
  Widget build(BuildContext context) {
    final displayName = name.isNotEmpty ? name : 'Sen';
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(S.greeting, style: QT.body(12, c: context.qp.ink3)),
            Text('$displayName 👋',
                style: QT.display(22, c: context.qp.ink, w: FontWeight.w700, ls: -22 * 0.02)),
          ],
        ),
        Row(
          children: [
            _IconBtn(Icons.search_rounded),
            const SizedBox(width: 8),
            Stack(
              children: [
                _IconBtn(Icons.notifications_none_rounded),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: context.qp.pink,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  const _IconBtn(this.icon);

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: p.line),
      ),
      child: Icon(icon, color: p.ink, size: 18),
    );
  }
}

// ── Today's quiz hero card ────────────────────────────────────────
class _HeroQuizCard extends StatelessWidget {
  final String title;
  const _HeroQuizCard({required this.title});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return GestureDetector(
      onTap: () => AppRouter.toQuizPlay(context),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Container(
          height: 200,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [p.featured, const Color(0xFF5B3A8E)],
            ),
          ),
          padding: const EdgeInsets.all(18),
          child: Stack(
            children: [
              Positioned(
                top: -16,
                right: -10,
                child: Text('오늘', style: QT.hangul(120, c: p.pink.withValues(alpha: 0.25))),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                        color: p.gold, borderRadius: BorderRadius.circular(999)),
                    child: Text(S.todayQuiz,
                        style: QT.body(9, w: FontWeight.w700, c: p.featured, ls: 0.6)),
                  ),
                  const SizedBox(height: 12),
                  Text(title,
                      style: QT.display(26, c: p.bg, w: FontWeight.w700, h: 1.05)),
                  const SizedBox(height: 4),
                  Text(S.guessTitle,
                      style: QT.display(18, c: p.gold, w: FontWeight.w700)),
                  const Spacer(),
                  Row(
                    children: [
                      SizedBox(
                        width: 70,
                        height: 32,
                        child: Stack(
                          children: [
                            for (int i = 0; i < 3; i++)
                              Positioned(
                                left: i * 22.0,
                                child: Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    color: [p.pink, p.gold, p.purple][i],
                                    shape: BoxShape.circle,
                                    border: Border.all(color: p.featured, width: 2),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(S.quizMeta,
                          style: QT.body(12, c: p.bg.withValues(alpha: 0.8))),
                      const Spacer(),
                      Icon(Icons.arrow_forward_rounded, color: p.gold, size: 18),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Region filter chips ───────────────────────────────────────────
class _RegionChips extends StatefulWidget {
  @override
  State<_RegionChips> createState() => _RegionChipsState();
}

class _RegionChipsState extends State<_RegionChips> {
  int _active = 0;

  List<String> get _chips => [
        S.all, S.chipKDrama, S.chipCDrama, S.chipJDrama, S.chipThai,
      ];

  @override
  Widget build(BuildContext context) {
    final chips = _chips;
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(
          chips.length,
          (i) => Padding(
            padding: EdgeInsets.only(right: i < chips.length - 1 ? 8 : 0),
            child: GestureDetector(
              onTap: () => setState(() => _active = i),
              child: QzChip(chips[i], active: i == _active),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Section title row ─────────────────────────────────────────────
class _SectionTitle extends StatelessWidget {
  final String title, trailing;
  const _SectionTitle(this.title, {required this.trailing});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(title, style: QT.display(18, c: p.ink)),
        if (trailing.isNotEmpty) Text(trailing, style: QT.body(12, c: p.ink2)),
      ],
    );
  }
}

// ── Quiz type 2×2 grid ────────────────────────────────────────────
class _QuizTypeGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final cats = [
      _Cat(S.catCastDrama,  '32 quiz', C.pink,   '캐스트'),
      _Cat(S.catGuessLine,  '18 quiz', C.plum,   '대사'),
      _Cat(S.catGuessPhoto, '40 quiz', C.gold,   '사진'),
      _Cat(S.catOneVsOne,   S.catLive, C.purple, '대결'),
    ];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.55,
      children: cats.map((c) => _QuizTypeCard(c)).toList(),
    );
  }
}

class _Cat {
  final String title, sub;
  final Color color;
  final String hangul;
  const _Cat(this.title, this.sub, this.color, this.hangul);
}

class _QuizTypeCard extends StatelessWidget {
  final _Cat cat;
  const _QuizTypeCard(this.cat);

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Container(
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: p.line),
      ),
      padding: const EdgeInsets.all(14),
      child: Stack(
        children: [
          Positioned(
            top: -8,
            right: -6,
            child: Text(cat.hangul,
                style: QT.hangul(48, c: cat.color.withValues(alpha: 0.18))),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                    color: cat.color, borderRadius: BorderRadius.circular(9)),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(cat.title,
                      style: QT.display(13, c: p.ink, w: FontWeight.w600, h: 1.15)),
                  const SizedBox(height: 2),
                  Text(cat.sub, style: QT.body(11, c: p.ink2)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Trending dramas horizontal strip ─────────────────────────────
class _TrendingStrip extends StatelessWidget {
  final List<Drama> dramas;
  const _TrendingStrip({required this.dramas});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(dramas.length, (i) {
          final d = dramas[i];
          final label = d.hangul.isNotEmpty ? d.hangul[0] : d.title[0];
          return Padding(
            padding: EdgeInsets.only(right: i < dramas.length - 1 ? 10 : 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                QzPhoto(
                  hue: d.hue,
                  label: label,
                  width: 116,
                  height: 150,
                  borderRadius: 14,
                ),
                const SizedBox(height: 8),
                Text(d.title,
                    style: QT.display(13, c: context.qp.ink, w: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(d.genre, style: QT.body(11, c: context.qp.ink2)),
              ],
            ),
          );
        }),
      ),
    );
  }
}

// ── Trending shimmer (loading state) ─────────────────────────────
class _TrendingShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(3, (i) => Padding(
          padding: EdgeInsets.only(right: i < 2 ? 10 : 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 116,
                height: 150,
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              const SizedBox(height: 8),
              Container(width: 90, height: 13, color: p.card),
              const SizedBox(height: 4),
              Container(width: 60, height: 11, color: p.card),
            ],
          ),
        )),
      ),
    );
  }
}
