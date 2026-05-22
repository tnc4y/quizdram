import 'package:flutter/material.dart';
import '../theme.dart';
import '../lang.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_chip.dart';
import '../router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

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
              _Header(),
              const SizedBox(height: 16),
              _HeroQuizCard(),
              const SizedBox(height: 18),
              _RegionChips(),
              const SizedBox(height: 22),
              _SectionTitle(S.quizTypes, trailing: ''),
              const SizedBox(height: 12),
              _QuizTypeGrid(),
              const SizedBox(height: 22),
              _SectionTitle(S.trending, trailing: S.seeAll),
              const SizedBox(height: 12),
              _TrendingStrip(),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Header ──────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(S.greeting, style: QT.body(12, c: C.ink3)),
            Text('Sen 👋',
                style: QT.display(22, w: FontWeight.w700, ls: -22 * 0.02)),
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
                    decoration: const BoxDecoration(
                      color: C.pink,
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
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: C.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: C.line),
      ),
      child: Icon(icon, color: C.ink, size: 18),
    );
  }
}

// ── Today's quiz hero card ──────────────────────────────────────
class _HeroQuizCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => AppRouter.toQuizPlay(context),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Container(
          height: 200,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [C.plum, Color(0xFF5B3A8E)],
            ),
          ),
          padding: const EdgeInsets.all(18),
          child: Stack(
            children: [
              // Decorative hangul
              Positioned(
                top: -16,
                right: -10,
                child: Text(
                  '오늘',
                  style: QT.hangul(
                    120,
                    c: C.pink.withValues(alpha: 0.25),
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: C.gold,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      S.todayQuiz,
                      style: QT.body(
                        9,
                        w: FontWeight.w700,
                        c: C.plum,
                        ls: 0.6,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Lunar Tide\n',
                    style: QT.display(
                      26,
                      c: const Color(0xFFFFF5F0),
                      w: FontWeight.w700,
                      h: 1.05,
                    ),
                  ),
                  Text(
                    S.guessTitle,
                    style: QT.display(
                      18,
                      c: C.gold,
                      w: FontWeight.w700,
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      // Avatar overlap
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
                                    color: [
                                      C.pink,
                                      C.gold,
                                      C.purple
                                    ][i],
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: C.plum, width: 2),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        S.quizMeta,
                        style: QT.body(12, c: const Color(0xCCFFF5F0)),
                      ),
                      const Spacer(),
                      Icon(Icons.arrow_forward_rounded,
                          color: C.gold, size: 18),
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

// ── Region filter chips ─────────────────────────────────────────
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
        children: List.generate(chips.length, (i) => Padding(
          padding: EdgeInsets.only(right: i < chips.length - 1 ? 8 : 0),
          child: GestureDetector(
            onTap: () => setState(() => _active = i),
            child: QzChip(chips[i], active: i == _active),
          ),
        )),
      ),
    );
  }
}

// ── Section title row ───────────────────────────────────────────
class _SectionTitle extends StatelessWidget {
  final String title, trailing;
  const _SectionTitle(this.title, {required this.trailing});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(title, style: QT.display(18)),
        if (trailing.isNotEmpty)
          Text(trailing, style: QT.body(12, c: C.ink2)),
      ],
    );
  }
}

// ── Quiz type 2×2 grid ──────────────────────────────────────────
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
    return Container(
      decoration: BoxDecoration(
        color: C.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: C.line),
      ),
      padding: const EdgeInsets.all(14),
      child: Stack(
        children: [
          Positioned(
            top: -8,
            right: -6,
            child: Text(
              cat.hangul,
              style: QT.hangul(48, c: cat.color.withValues(alpha: 0.18)),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: cat.color,
                  borderRadius: BorderRadius.circular(9),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(cat.title,
                      style: QT.display(13, w: FontWeight.w600, h: 1.15)),
                  const SizedBox(height: 2),
                  Text(cat.sub, style: QT.body(11, c: C.ink2)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Trending dramas horizontal strip ───────────────────────────
class _TrendingStrip extends StatelessWidget {
  static const _items = [
    _Trend('Neon Seoul',     '네온', Color(0xFFFF5470)),
    _Trend('Phoenix Court',  '凤凰', Color(0xFFFFC857)),
    _Trend('Tokyo 5AM',      '東京', Color(0xFF7C5ED3)),
  ];

  static const _counts = ['12k', '8.4k', '5.2k'];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(_items.length, (i) {
          final d = _items[i];
          return Padding(
            padding:
                EdgeInsets.only(right: i < _items.length - 1 ? 10 : 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                QzPhoto(
                  hue: d.color,
                  label: d.hangul,
                  width: 116,
                  height: 150,
                  borderRadius: 14,
                ),
                const SizedBox(height: 8),
                Text(d.title,
                    style: QT.display(13, w: FontWeight.w600)),
                const SizedBox(height: 2),
                Text('${_counts[i]} ${S.playing}', style: QT.body(11, c: C.ink2)),
              ],
            ),
          );
        }),
      ),
    );
  }
}

class _Trend {
  final String title, hangul;
  final Color color;
  const _Trend(this.title, this.hangul, this.color);
}
