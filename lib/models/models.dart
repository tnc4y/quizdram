import 'package:flutter/material.dart';

// ── Language ───────────────────────────────────────────────────
class QzLang {
  final String code, label, native, glyph;
  const QzLang(this.code, this.label, this.native, this.glyph);
}

// ── Drama ──────────────────────────────────────────────────────
class Drama {
  final String id, title, hangul, region, genre;
  final int year, eps;
  final Color hue;
  const Drama(this.id, this.title, this.hangul, this.region,
      this.year, this.eps, this.genre, this.hue);
}

// ── Cast ───────────────────────────────────────────────────────
class CastMember {
  final String id, name, hangul, region, role;
  final int age;
  final Color hue;
  const CastMember(this.id, this.name, this.hangul, this.region,
      this.role, this.age, this.hue);
}

// ── Quiz ───────────────────────────────────────────────────────
class QuizOpt {
  final String id, text, sub;
  final bool correct;
  const QuizOpt(this.id, this.text, this.sub, this.correct);
}

// ── News ───────────────────────────────────────────────────────
class NewsItem {
  final String id, tag, headline, source, time, hangul;
  final Color hue, tagBg, tagFg;
  const NewsItem(this.id, this.tag, this.headline, this.source, this.time,
      this.hue, this.hangul, this.tagBg,
      {this.tagFg = const Color(0xFF2D1B4E)});
}

// ── Leaderboard ────────────────────────────────────────────────
class LeaderEntry {
  final int rank, streak;
  final String name, country, score;
  final bool isYou;
  const LeaderEntry(this.rank, this.name, this.country, this.score, this.streak,
      {this.isYou = false});
}

// ── Badge ──────────────────────────────────────────────────────
class QzBadge {
  final String name, hangul;
  final Color color;
  final bool earned;
  const QzBadge(this.name, this.hangul, this.color, this.earned);
}
