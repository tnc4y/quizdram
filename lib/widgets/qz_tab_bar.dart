import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme.dart';
import '../lang.dart';

/// Floating glassmorphic bottom tab bar.
class QzTabBar extends StatelessWidget {
  final int activeIndex;
  final void Function(int) onTap;

  const QzTabBar({super.key, required this.activeIndex, required this.onTap});

  static const _icons = [
    Icons.home_outlined,
    Icons.play_circle_outline_rounded,
    Icons.article_outlined,
    Icons.emoji_events_outlined,
    Icons.person_outline_rounded,
  ];

  static const _iconsActive = [
    Icons.home_rounded,
    Icons.play_circle_rounded,
    Icons.article_rounded,
    Icons.emoji_events_rounded,
    Icons.person_rounded,
  ];

  @override
  Widget build(BuildContext context) {
    final labels = [
      S.tabHome,
      S.tabQuiz,
      S.tabNews,
      S.tabRank,
      S.tabMe,
    ];

    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          padding: const EdgeInsets.fromLTRB(8, 10, 8, 14),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.88),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: C.line),
            boxShadow: [
              BoxShadow(
                color: C.plum.withValues(alpha: 0.08),
                blurRadius: 22,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(5, (i) {
              final isActive = i == activeIndex;
              final color = isActive ? C.pink : C.plum.withValues(alpha: 0.5);
              return GestureDetector(
                onTap: () => onTap(i),
                behavior: HitTestBehavior.opaque,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Stack(
                      alignment: Alignment.bottomCenter,
                      clipBehavior: Clip.none,
                      children: [
                        Icon(
                          isActive ? _iconsActive[i] : _icons[i],
                          color: color,
                          size: 22,
                        ),
                        if (isActive)
                          Positioned(
                            bottom: -5,
                            child: Container(
                              width: 5,
                              height: 5,
                              decoration: BoxDecoration(
                                color: C.pink,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      labels[i],
                      style: QT.body(
                        9.5,
                        w: FontWeight.w600,
                        c: color,
                        ls: 0.1,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
