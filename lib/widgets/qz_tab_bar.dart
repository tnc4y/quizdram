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
    Icons.people_outline_rounded,
    Icons.article_outlined,
    Icons.emoji_events_outlined,
    Icons.person_outline_rounded,
  ];

  static const _iconsActive = [
    Icons.home_rounded,
    Icons.people_rounded,
    Icons.article_rounded,
    Icons.emoji_events_rounded,
    Icons.person_rounded,
  ];

  @override
  Widget build(BuildContext context) {
    final labels = [
      S.tabHome,
      S.tabCast,
      S.tabNews,
      S.tabRank,
      S.tabMe,
    ];

    final bottomInset = MediaQuery.of(context).padding.bottom;
    final bottomPad = bottomInset > 0 ? bottomInset : 10.0;

    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          padding: EdgeInsets.fromLTRB(8, 10, 8, bottomPad),
          decoration: BoxDecoration(
            color: context.qp.card.withValues(alpha: 0.92),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: context.qp.line),
            boxShadow: [
              BoxShadow(
                color: context.qp.ink.withValues(alpha: 0.08),
                blurRadius: 22,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(5, (i) {
              final isActive = i == activeIndex;
              final color = isActive ? context.qp.pink : context.qp.ink.withValues(alpha: 0.5);
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
                                color: context.qp.pink,
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
