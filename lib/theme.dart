import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Cream K-pop light palette — Direction A
class C {
  static const bg     = Color(0xFFFFF5F0);
  static const ink    = Color(0xFF2D1B4E);
  static const ink2   = Color(0x9E2D1B4E); // 62 %
  static const ink3   = Color(0x612D1B4E); // 38 %
  static const line   = Color(0x0F2D1B4E); // 8 %
  static const pink   = Color(0xFFFF5470);
  static const plum   = Color(0xFF2D1B4E);
  static const gold   = Color(0xFFFFC857);
  static const sand   = Color(0xFFFAEADD);
  static const card   = Color(0xFFFFFFFF);
  static const purple = Color(0xFF7C5ED3);
}

/// Text style helpers
class QT {
  static TextStyle display(
    double s, {
    FontWeight w = FontWeight.w700,
    Color c = C.ink,
    double? ls,
    double h = 1.0,
  }) =>
      GoogleFonts.unbounded(
        fontSize: s,
        fontWeight: w,
        color: c,
        letterSpacing: ls ?? -s * 0.03,
        height: h,
      );

  static TextStyle serif(double s, {Color c = C.ink2}) =>
      GoogleFonts.playfairDisplay(
        fontSize: s,
        fontStyle: FontStyle.italic,
        color: c,
      );

  static TextStyle hangul(
    double s, {
    FontWeight w = FontWeight.w900,
    Color? c,
    double ls = 0,
  }) =>
      GoogleFonts.notoSansKr(
        fontSize: s,
        fontWeight: w,
        color: c ?? C.ink,
        letterSpacing: ls,
      );

  static TextStyle body(
    double s, {
    FontWeight w = FontWeight.w400,
    Color? c,
    double? ls,
    double? h,
  }) =>
      GoogleFonts.inter(
        fontSize: s,
        fontWeight: w,
        color: c ?? C.ink,
        letterSpacing: ls,
        height: h,
      );
}

ThemeData buildAppTheme() => ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: C.bg,
      colorScheme: const ColorScheme.light(
        surface: C.bg,
        primary: C.pink,
        secondary: C.gold,
        onSurface: C.ink,
      ),
    );
