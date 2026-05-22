import 'package:flutter/material.dart';
import '../theme.dart';
import '../lang.dart';
import '../widgets/stripe_painter.dart';
import 'language_screen.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.bg,
      body: Stack(
        children: [
          // Decorative hangul accent — top-right bleed
          Positioned(
            top: 28,
            right: -36,
            child: IgnorePointer(
              child: Text(
                '퀴즈',
                style: QT.hangul(
                  220,
                  c: C.pink.withValues(alpha: 0.18),
                ),
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 8, 22, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 62),
                  // Poster card
                  const _PosterCard(),
                  const SizedBox(height: 22),
                  // Tagline
                  Text(S.taglineItalic, style: QT.serif(16)),
                  const SizedBox(height: 4),
                  Text(
                    S.taglineBold,
                    style: QT.display(26, h: 1.05),
                  ),
                  const Spacer(),
                  // Start CTA
                  _StartButton(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const LanguageScreen()),
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Sign-in link
                  Center(
                    child: Text.rich(
                      TextSpan(
                        text: S.haveAccount,
                        style: QT.body(12, c: C.ink3),
                        children: [
                          TextSpan(
                            text: S.signIn,
                            style: QT.body(12, w: FontWeight.w600, c: C.ink),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Poster card ─────────────────────────────────────────────────
class _PosterCard extends StatelessWidget {
  const _PosterCard();

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: SizedBox(
        height: 340,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Gradient background
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [C.plum, C.pink],
                ),
              ),
            ),
            // Stripe overlay (gold/amber)
            CustomPaint(
              painter: const StripePainter(
                color: Color(0xFFFFC857),
                opacity: 0.18,
                stripeWidth: 14,
                totalStep: 28,
              ),
            ),
            // "드라마 · 시네마" — top left
            Positioned(
              top: 14,
              left: 14,
              child: Text(
                '드라마 · 시네마',
                style: QT.hangul(
                  14,
                  c: const Color(0xFFFFF5F0),
                  w: FontWeight.w900,
                  ls: 0.2 * 14,
                ),
              ),
            ),
            // "EST · 2025" pill — top right
            Positioned(
              top: 22,
              right: 16,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: C.gold,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'EST · 2025',
                  style: QT.display(
                    10,
                    c: C.plum,
                    w: FontWeight.w700,
                    ls: 0.6,
                  ),
                ),
              ),
            ),
            // Bottom: title + tagline
            Positioned(
              bottom: 22,
              left: 22,
              right: 22,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('vol. 02 · seoul',
                      style: QT.serif(18, c: C.gold)),
                  const SizedBox(height: 4),
                  Text(
                    'QUIZ\nDRAM',
                    style: QT.display(
                      56,
                      c: const Color(0xFFFFF5F0),
                      w: FontWeight.w800,
                      h: 0.92,
                      ls: -56 * 0.04,
                    ),
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

// ── CTA button ──────────────────────────────────────────────────
class _StartButton extends StatelessWidget {
  final VoidCallback onTap;
  const _StartButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: C.ink,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(S.start,
                style:
                    QT.display(16, c: C.bg, w: FontWeight.w600, ls: -0.01 * 16)),
            const SizedBox(width: 10),
            Icon(Icons.arrow_forward_rounded, color: C.gold, size: 18),
          ],
        ),
      ),
    );
  }
}
