import 'package:flutter/material.dart';

/// Thin horizontal progress / XP bar.
class QzBar extends StatelessWidget {
  final double value;
  final double max;
  final Color color;
  final Color track;
  final double height;

  const QzBar({
    super.key,
    required this.value,
    this.max = 100,
    required this.color,
    required this.track,
    this.height = 6,
  });

  @override
  Widget build(BuildContext context) {
    final pct = (value / max).clamp(0.0, 1.0);
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: track,
        borderRadius: BorderRadius.circular(999),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: pct,
        child: Container(
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(999),
          ),
        ),
      ),
    );
  }
}
