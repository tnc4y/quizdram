import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../models/models.dart';
import 'news_service.dart';

class FirebaseNewsService implements NewsService {
  final _db = FirebaseFirestore.instance;

  @override
  Future<List<NewsItem>> getNews({String? category}) async {
    Query<Map<String, dynamic>> q = _db
        .collection('news')
        .where('status', isEqualTo: 'published')
        .orderBy('publishedAt', descending: true)
        .limit(20);

    if (category != null) {
      q = q.where('category', isEqualTo: category);
    }

    final snap = await q.get();
    return snap.docs.map(_fromDoc).toList();
  }

  NewsItem _fromDoc(QueryDocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data();
    return NewsItem(
      doc.id,
      d['tag'] as String? ?? '',
      d['headline'] as String? ?? '',
      d['source'] as String? ?? '',
      _relativeTime(d['publishedAt'] as Timestamp?),
      _hex(d['hue'] as String? ?? '#E8D5B7'),
      d['hangul'] as String? ?? '',
      _hex(d['tagBg'] as String? ?? '#F3E5AB'),
      tagFg: _hex(d['tagFg'] as String? ?? '#2D1B4E'),
    );
  }

  String _relativeTime(Timestamp? ts) {
    if (ts == null) return '';
    final diff = DateTime.now().difference(ts.toDate());
    if (diff.inHours < 1) return '${diff.inMinutes}dk';
    if (diff.inHours < 24) return '${diff.inHours}s';
    return '${diff.inDays}g';
  }

  Color _hex(String hex) {
    final h = hex.replaceFirst('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }
}
