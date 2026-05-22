import 'package:flutter/material.dart';

/// Diagonal repeating stripe pattern (matches design's repeating-linear-gradient).
class StripePainter extends CustomPainter {
  final Color color;
  final double opacity;
  final double stripeWidth;
  final double totalStep;

  const StripePainter({
    required this.color,
    this.opacity = 0.18,
    this.stripeWidth = 14,
    this.totalStep = 28,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withValues(alpha: opacity)
      ..style = PaintingStyle.fill;

    // shear = tan(30°) ≈ 0.577 gives ~120° CSS diagonal angle
    const shear = 0.577;
    final start = -size.height * shear;
    final end = size.width + size.height * shear;

    for (double x = start; x < end; x += totalStep) {
      final path = Path()
        ..moveTo(x, 0)
        ..lineTo(x + stripeWidth, 0)
        ..lineTo(x + stripeWidth + size.height * shear, size.height)
        ..lineTo(x + size.height * shear, size.height)
        ..close();
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(StripePainter old) =>
      color != old.color ||
      opacity != old.opacity ||
      stripeWidth != old.stripeWidth ||
      totalStep != old.totalStep;
}
