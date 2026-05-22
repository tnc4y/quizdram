import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'stripe_painter.dart';

/// Gradient placeholder image with a Hangul/Hanzi character overlay.
/// Matches the design's QzPhoto / DPhoto components.
class QzPhoto extends StatelessWidget {
  final Color hue;
  final String label;
  final double width;
  final double height;
  final double borderRadius;

  const QzPhoto({
    super.key,
    required this.hue,
    this.label = '',
    required this.width,
    required this.height,
    this.borderRadius = 18,
  });

  @override
  Widget build(BuildContext context) {
    final dark = Color.lerp(hue, Colors.black, 0.5)!;
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: SizedBox(
        width: width,
        height: height,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Base gradient
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [hue, dark],
                ),
              ),
            ),
            // Diagonal stripe overlay
            CustomPaint(
              painter: StripePainter(
                color: Colors.white,
                opacity: 0.12,
                stripeWidth: 12,
                totalStep: 24,
              ),
            ),
            // Vignette from bottom
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.28),
                  ],
                  stops: const [0.3, 1.0],
                ),
              ),
            ),
            // Hangul / Hanzi label
            if (label.isNotEmpty)
              Positioned(
                left: 8,
                bottom: 6,
                child: Text(
                  label,
                  style: GoogleFonts.notoSansKr(
                    fontSize: height * 0.32,
                    fontWeight: FontWeight.w900,
                    color: Colors.white.withValues(alpha: 0.92),
                    letterSpacing: -height * 0.32 * 0.04,
                    shadows: [
                      Shadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 2,
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
