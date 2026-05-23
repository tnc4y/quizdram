import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/models.dart';
import 'quiz_service.dart';

class FirebaseQuizService implements QuizService {
  final _db = FirebaseFirestore.instance;

  @override
  Future<List<QuizOpt>> getTodayOptions() async {
    final snap = await _db
        .collection('quizPacks')
        .where('status', isEqualTo: 'published')
        .orderBy('publishedAt', descending: true)
        .limit(1)
        .get();

    if (snap.docs.isEmpty) return [];

    final d = snap.docs.first.data();
    final rawOpts = d['options'] as List<dynamic>? ?? [];
    return rawOpts.map((o) {
      final opt = o as Map<String, dynamic>;
      return QuizOpt(
        opt['id'] as String? ?? '',
        opt['text'] as String? ?? '',
        opt['sub'] as String? ?? '',
        opt['correct'] as bool? ?? false,
      );
    }).toList();
  }

  @override
  Future<int> submitResult({
    required int correct,
    required int total,
    required int elapsedSeconds,
  }) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    final xp = _calcXp(correct, total, elapsedSeconds);

    final batch = _db.batch();

    batch.set(_db.collection('results').doc(), {
      'uid': uid,
      'correct': correct,
      'total': total,
      'elapsedSeconds': elapsedSeconds,
      'xp': xp,
      'createdAt': FieldValue.serverTimestamp(),
    });

    if (uid != null) {
      batch.set(
        _db.collection('users').doc(uid),
        {
          'xp': FieldValue.increment(xp),
          'quizzesPlayed': FieldValue.increment(1),
          'lastPlayedAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    }

    await batch.commit();
    return xp;
  }

  int _calcXp(int correct, int total, int elapsed) {
    if (correct == 0) return 0;
    final base = correct * 250;
    final speedBonus = elapsed < 30 ? 500 : elapsed < 60 ? 250 : 0;
    return base + speedBonus;
  }
}
