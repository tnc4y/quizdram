import 'package:flutter/material.dart';
import '../theme.dart';

/// Filter / category pill chip.
class QzChip extends StatelessWidget {
  final String label;
  final bool active;

  const QzChip(this.label, {super.key, this.active = false});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
      decoration: BoxDecoration(
        color: active ? p.ink : p.ink.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: QT.body(
          12,
          w: FontWeight.w600,
          c: active ? p.bg : p.ink,
          ls: 0.1,
        ),
      ),
    );
  }
}
