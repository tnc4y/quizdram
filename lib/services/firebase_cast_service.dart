import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../lang.dart';
import '../utils/korean_romanizer.dart';
import 'cast_service.dart';

class FirebaseCastService implements CastService {
  final _db = FirebaseFirestore.instance;

  @override
  Future<List<CastMember>> getCast({String? region, int limit = 30}) async {
    Query<Map<String, dynamic>> q = _db.collection('cast');
    if (region != null) {
      q = q.where('region', isEqualTo: region);
    }
    final snap = await q.limit(limit).get();
    return snap.docs.map(_castFromDoc).toList();
  }

  @override
  Future<List<Drama>> getDramasForCast(List<String> dramaIds) async {
    if (dramaIds.isEmpty) return [];
    final snap = await _db
        .collection('dramas')
        .where(FieldPath.documentId, whereIn: dramaIds.take(10).toList())
        .get();
    return snap.docs.map(_dramaFromDoc).toList();
  }

  CastMember _castFromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    final lang = appLang.value;
    String name;
    if (lang == 'ko') {
      name = (d['nameKo'] ?? d['nameEn'] ?? d['name'] ?? '') as String;
    } else {
      final raw = (d['nameEn'] ?? d['name'] ?? '') as String;
      name = (raw.isNotEmpty && KoreanRomanizer.hasHangul(raw))
          ? KoreanRomanizer.romanize(raw)
          : raw;
    }
    final hangul = d['nameKo'] as String? ?? d['hangul'] as String? ?? '';
    final dramaIds = (d['dramaIds'] as List?)?.cast<String>() ?? [];
    return CastMember(
      doc.id,
      name,
      hangul,
      d['region'] as String? ?? 'kr',
      d['role'] as String? ?? '',
      (d['age'] as num?)?.toInt() ?? 0,
      _hexColor(d['hue'] as String?),
      photoUrl: d['photoUrl'] as String?,
      dramaIds: dramaIds,
    );
  }

  Drama _dramaFromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    final lang = appLang.value;
    final title = (lang == 'ko'
        ? (d['titleKo'] ?? d['titleEn'] ?? d['title'])
        : (d['titleEn'] ?? d['title'])) as String? ?? '';
    final hangul = d['titleKo'] as String? ?? d['hangul'] as String? ?? '';
    final genres = d['genres'] as List?;
    final genre = (genres?.isNotEmpty == true ? genres!.first : d['genre']) as String? ?? '';
    return Drama(
      doc.id,
      title,
      hangul,
      d['region'] as String? ?? 'kr',
      (d['year'] as num?)?.toInt() ?? 0,
      (d['episodes'] as num?)?.toInt() ?? 0,
      genre,
      _hexColor(d['hue'] as String?),
    );
  }

  Color _hexColor(String? hex) {
    if (hex == null || hex.isEmpty) return const Color(0xFFFF5470);
    final h = hex.replaceFirst('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }
}
