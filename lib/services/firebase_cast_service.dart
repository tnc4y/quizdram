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
  Future<List<CastMember>> getCastForDrama(String dramaId, {int limit = 12}) async {
    final snap = await _db
        .collection('cast')
        .where('dramaIds', arrayContains: dramaId)
        .limit(limit)
        .get();
    final results = snap.docs.map(_castFromDoc).toList()
      ..sort((a, b) => (b.popularity ?? -1).compareTo(a.popularity ?? -1));
    return results;
  }

  CastMember _castFromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    final lang = appLang.value;
    // name = romaji, nameKo = Korean
    final name = (lang == 'ko'
        ? (d['nameKo'] ?? d['name'])
        : (d['name'] ?? d['nameEn'])) as String? ?? '';
    final hangul = d['nameKo'] as String? ?? d['hangul'] as String? ?? '';

    // dramaIds may be stale after doc-ID migration; supplement with tmdbCredits.
    // Drama doc IDs = String(tmdbId), so credits give us reliable lookups.
    final dramaIds = (d['dramaIds'] as List?)
        ?.map((e) => e?.toString())
        .whereType<String>()
        .toList() ?? [];
    final tmdbCredits = (d['tmdbCredits'] as List?) ?? [];
    final creditIds = tmdbCredits
        .whereType<Map>()
        .map((c) => c['tmdbId'])
        .whereType<num>()
        .map((id) => id.toInt().toString())
        .toList();
    final allIds = {...dramaIds, ...creditIds}.toList();

    return CastMember(
      doc.id,
      name,
      hangul,
      d['region'] as String? ?? 'kr',
      d['role'] as String? ?? '',
      (d['age'] as num?)?.toInt() ?? 0,
      _hexColor(d['hue'] as String?),
      photoUrl: d['photoUrl'] as String?,
      popularity: (d['popularity'] as num?)?.toDouble(),
      dramaIds: allIds,
    );
  }

  Color _hexColor(String? hex) {
    if (hex == null || hex.isEmpty) return const Color(0xFFFF5470);
    final h = hex.replaceFirst('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }
}
