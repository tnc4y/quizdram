import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../lang.dart';
import 'drama_service.dart';

class FirebaseDramaService implements DramaService {
  final _db = FirebaseFirestore.instance;

  @override
  Future<List<Drama>> getTrending({int limit = 6}) async {
    final snap = await _db
        .collection('dramas')
        .where('status', isEqualTo: 'published')
        .orderBy('playCount', descending: true)
        .limit(limit)
        .get();
    return snap.docs.map(_fromDoc).toList();
  }

  @override
  Future<List<Drama>> getDramasByIds(List<String> ids) async {
    if (ids.isEmpty) return [];
    final snaps = await Future.wait(
      ids.take(20).map((id) => _db.collection('dramas').doc(id).get()),
    );
    return snaps.where((s) => s.exists).map(_fromDoc).toList();
  }

  @override
  Future<List<Drama>> getAll({String? region, int limit = 60}) async {
    Query<Map<String, dynamic>> q = _db
        .collection('dramas')
        .where('status', isEqualTo: 'published');
    if (region != null) q = q.where('region', isEqualTo: region);
    try {
      final snap = await q
          .orderBy('popularity', descending: true)
          .limit(limit)
          .get();
      return snap.docs.map(_fromDoc).toList();
    } catch (_) {
      // popularity index not yet created — fall back to playCount
      final snap = await q
          .orderBy('playCount', descending: true)
          .limit(limit)
          .get();
      return snap.docs.map(_fromDoc).toList();
    }
  }

  Drama _fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    final lang = appLang.value;
    final title = (lang == 'ko'
        ? (d['titleKo'] ?? d['titleEn'] ?? d['title'])
        : (d['titleEn'] ?? d['title'])) as String? ?? '';
    final hangul = d['titleKo'] as String? ?? '';
    final genres = d['genres'] as List?;
    final genre = (genres?.isNotEmpty == true ? genres!.first : d['genre']) as String? ?? '';
    final synopsis = (lang == 'ko'
        ? (d['synopsisKo'] ?? d['synopsisEn'] ?? d['synopsis'])
        : (d['synopsisEn'] ?? d['synopsis'])) as String?;
    return Drama(
      doc.id,
      title,
      hangul,
      d['region'] as String? ?? 'kr',
      (d['year'] as num?)?.toInt() ?? 2024,
      (d['episodes'] as num?)?.toInt() ?? 0,
      genre,
      _hex(d['hue'] as String? ?? '#FF5470'),
      posterUrl: d['posterUrl'] as String?,
      popularity: (d['popularity'] as num?)?.toDouble(),
      synopsis: synopsis,
    );
  }

  Color _hex(String hex) {
    final h = hex.replaceFirst('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }
}
