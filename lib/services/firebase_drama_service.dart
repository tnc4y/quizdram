import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../models/models.dart';
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

  Drama _fromDoc(QueryDocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data();
    final genres = d['genres'] as List?;
    final genre = (genres?.isNotEmpty == true ? genres!.first : d['genre']) as String? ?? '';
    return Drama(
      doc.id,
      d['title'] as String? ?? '',
      d['titleKo'] as String? ?? '',
      d['region'] as String? ?? 'kr',
      d['year'] as int? ?? 2024,
      d['episodes'] as int? ?? 0,
      genre,
      _hex(d['hue'] as String? ?? '#FF5470'),
    );
  }

  Color _hex(String hex) {
    final h = hex.replaceFirst('#', '');
    return Color(int.parse('FF$h', radix: 16));
  }
}
