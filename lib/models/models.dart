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
  final String? photoUrl;
  final double? popularity;
  final List<String> dramaIds;
  const CastMember(this.id, this.name, this.hangul, this.region,
      this.role, this.age, this.hue,
      {this.photoUrl, this.popularity, this.dramaIds = const []});
}

// ── Quiz ───────────────────────────────────────────────────────
enum OptionStyle { text, poster, textImage }

class QuizOpt {
  final String id, text, sub;
  final bool correct;
  final String? imageUrl;
  const QuizOpt(this.id, this.text, this.sub, this.correct, {this.imageUrl});
}

class QuizQuestion {
  final String id;
  final String text;
  final String? imageUrl;
  final String? audioUrl;
  final OptionStyle optionStyle;
  final List<QuizOpt> options;
  final String? hint;
  const QuizQuestion({
    required this.id,
    required this.text,
    required this.options,
    this.imageUrl,
    this.audioUrl,
    this.optionStyle = OptionStyle.text,
    this.hint,
  });
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
