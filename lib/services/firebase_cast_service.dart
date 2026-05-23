import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../lang.dart';
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
    final name = lang == 'ko'
        ? (d['nameKo'] ?? d['nameEn'] ?? d['name'] ?? '')
        : (d['nameEn'] ?? d['name'] ?? '');
    final hangul = d['nameKo'] ?? d['hangul'] ?? '';
    final hueInt = d['hue'] as int? ?? 0xFFFF5470;
    final dramaIds = (d['dramaIds'] as List?)?.cast<String>() ?? [];
    return CastMember(
      doc.id,
      name as String,
      hangul as String,
      d['region'] as String? ?? 'kr',
      d['role'] as String? ?? '',
      (d['age'] as num?)?.toInt() ?? 0,
      Color(hueInt),
      photoUrl: d['photoUrl'] as String?,
      dramaIds: dramaIds,
    );
  }

  Drama _dramaFromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    final lang = appLang.value;
    final title = lang == 'ko'
        ? (d['titleKo'] ?? d['titleEn'] ?? d['title'] ?? '')
        : (d['titleEn'] ?? d['title'] ?? '');
    final hangul = d['titleKo'] ?? d['hangul'] ?? '';
    final hueInt = d['hue'] as int? ?? 0xFF2D1B4E;
    return Drama(
      doc.id,
      title as String,
      hangul as String,
      d['region'] as String? ?? 'kr',
      (d['year'] as num?)?.toInt() ?? 0,
      (d['eps'] as num?)?.toInt() ?? 0,
      d['genre'] as String? ?? '',
      Color(hueInt),
    );
  }
}
