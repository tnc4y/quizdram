import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ── Palette definition ──────────────────────────────────────────────
class QzPalette extends ThemeExtension<QzPalette> {
  final Color bg;
  final Color card;
  final Color sand;      // light secondary fill / unearned badge bg
  final Color featured;  // dark featured-card bg (identity, podium, hero)
  final Color ink;
  final Color ink2;
  final Color ink3;
  final Color line;
  final Color pink;
  final Color plum;
  final Color gold;
  final Color purple;

  const QzPalette({
    required this.bg,
    required this.card,
    required this.sand,
    required this.featured,
    required this.ink,
    required this.ink2,
    required this.ink3,
    required this.line,
    required this.pink,
    required this.plum,
    required this.gold,
    required this.purple,
  });

  // Direction A — Cream K-pop (light)
  static const cream = QzPalette(
    bg:       Color(0xFFFFF5F0),
    card:     Color(0xFFFFFFFF),
    sand:     Color(0xFFFAEADD),
    featured: Color(0xFF2D1B4E),
    ink:      Color(0xFF2D1B4E),
    ink2:     Color(0x9E2D1B4E),
    ink3:     Color(0x612D1B4E),
    line:     Color(0x0F2D1B4E),
    pink:     Color(0xFFFF5470),
    plum:     Color(0xFF2D1B4E),
    gold:     Color(0xFFFFC857),
    purple:   Color(0xFF7C5ED3),
  );

  // Direction B — Midnight Magazine (dark)
  static const midnight = QzPalette(
    bg:       Color(0xFF0E0A1F),
    card:     Color(0xFF1A1232),
    sand:     Color(0xFF181030),
    featured: Color(0xFF1A1232),
    ink:      Color(0xFFF6F0FF),
    ink2:     Color(0x9EF6F0FF),
    ink3:     Color(0x52F6F0FF),
    line:     Color(0x14F6F0FF),
    pink:     Color(0xFFFF4D7E),
    plum:     Color(0xFF2D1B4E),
    gold:     Color(0xFFFFC857),
    purple:   Color(0xFF7C5ED3),
  );

  @override
  QzPalette copyWith({
    Color? bg, Color? card, Color? sand, Color? featured,
    Color? ink, Color? ink2, Color? ink3, Color? line,
    Color? pink, Color? plum, Color? gold, Color? purple,
  }) => QzPalette(
    bg:       bg       ?? this.bg,
    card:     card     ?? this.card,
    sand:     sand     ?? this.sand,
    featured: featured ?? this.featured,
    ink:      ink      ?? this.ink,
    ink2:     ink2     ?? this.ink2,
    ink3:     ink3     ?? this.ink3,
    line:     line     ?? this.line,
    pink:     pink     ?? this.pink,
    plum:     plum     ?? this.plum,
    gold:     gold     ?? this.gold,
    purple:   purple   ?? this.purple,
  );

  @override
  QzPalette lerp(QzPalette? other, double t) {
    if (other == null) return this;
    return QzPalette(
      bg:       Color.lerp(bg,       other.bg,       t)!,
      card:     Color.lerp(card,     other.card,     t)!,
      sand:     Color.lerp(sand,     other.sand,     t)!,
      featured: Color.lerp(featured, other.featured, t)!,
      ink:      Color.lerp(ink,      other.ink,      t)!,
      ink2:     Color.lerp(ink2,     other.ink2,     t)!,
      ink3:     Color.lerp(ink3,     other.ink3,     t)!,
      line:     Color.lerp(line,     other.line,     t)!,
      pink:     Color.lerp(pink,     other.pink,     t)!,
      plum:     Color.lerp(plum,     other.plum,     t)!,
      gold:     Color.lerp(gold,     other.gold,     t)!,
      purple:   Color.lerp(purple,   other.purple,   t)!,
    );
  }
}

// Backward-compat alias — kremyı sabit tutan wrapper
// Yeni kod context.qp kullanmalı; C sadece geçiş döneminde.
class C {
  static const bg     = Color(0xFFFFF5F0);
  static const card   = Color(0xFFFFFFFF);
  static const sand   = Color(0xFFFAEADD);
  static const ink    = Color(0xFF2D1B4E);
  static const ink2   = Color(0x9E2D1B4E);
  static const ink3   = Color(0x612D1B4E);
  static const line   = Color(0x0F2D1B4E);
  static const pink   = Color(0xFFFF5470);
  static const plum   = Color(0xFF2D1B4E);
  static const gold   = Color(0xFFFFC857);
  static const purple = Color(0xFF7C5ED3);
}

// Context accessor — her widget'ta context.qp ile kullan
extension QzPaletteX on BuildContext {
  QzPalette get qp => Theme.of(this).extension<QzPalette>() ?? QzPalette.cream;
}

// ── Text style helpers ──────────────────────────────────────────────

// GoogleFonts sets its own fontFamilyFallback internally, so we append to it
// rather than overwrite — iOS won't fall back to the emoji font on its own
// when a custom fontFamily is set, unlike Android/web.
TextStyle _withEmojiFallback(TextStyle style) => style.copyWith(
      fontFamilyFallback: [
        ...?style.fontFamilyFallback,
        'Apple Color Emoji',
      ],
    );

class QT {
  static TextStyle display(
    double s, {
    FontWeight w = FontWeight.w700,
    Color c = C.ink,
    double? ls,
    double h = 1.0,
  }) =>
      _withEmojiFallback(GoogleFonts.unbounded(
        fontSize: s,
        fontWeight: w,
        color: c,
        letterSpacing: ls ?? -s * 0.03,
        height: h,
      ));

  static TextStyle serif(double s, {Color c = C.ink2}) =>
      _withEmojiFallback(GoogleFonts.playfairDisplay(
        fontSize: s,
        fontStyle: FontStyle.italic,
        color: c,
      ));

  static TextStyle hangul(
    double s, {
    FontWeight w = FontWeight.w900,
    Color? c,
    double ls = 0,
  }) =>
      _withEmojiFallback(GoogleFonts.notoSansKr(
        fontSize: s,
        fontWeight: w,
        color: c ?? C.ink,
        letterSpacing: ls,
      ));

  static TextStyle body(
    double s, {
    FontWeight w = FontWeight.w400,
    Color? c,
    double? ls,
    double? h,
  }) =>
      _withEmojiFallback(GoogleFonts.inter(
        fontSize: s,
        fontWeight: w,
        color: c ?? C.ink,
        letterSpacing: ls,
        height: h,
      ));
}

ThemeData buildAppTheme(QzPalette p) => ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: p.bg,
      colorScheme: ColorScheme(
        brightness: p == QzPalette.midnight ? Brightness.dark : Brightness.light,
        surface: p.bg,
        primary: p.pink,
        secondary: p.gold,
        onSurface: p.ink,
        onPrimary: Colors.white,
        onSecondary: p.plum,
        error: p.pink,
        onError: Colors.white,
      ),
      extensions: [p],
    );
