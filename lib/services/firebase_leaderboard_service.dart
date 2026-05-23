import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/models.dart';
import 'leaderboard_service.dart';

class FirebaseLeaderboardService implements LeaderboardService {
  final _db = FirebaseFirestore.instance;

  @override
  Future<List<LeaderEntry>> getWeekly() => _fetch('weekly');

  @override
  Future<List<LeaderEntry>> getAllTime() => _fetch('allTime');

  @override
  Future<List<LeaderEntry>> getFriends() => _fetch('weekly');

  Future<List<LeaderEntry>> _fetch(String type) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    final snap = await _db
        .collection('leaderboard')
        .doc(type)
        .collection('entries')
        .orderBy('rank')
        .limit(100)
        .get();

    return snap.docs.map((doc) {
      final d = doc.data();
      return LeaderEntry(
        d['rank'] as int? ?? 0,
        d['displayName'] as String? ?? '',
        d['country'] as String? ?? '',
        d['score'] as String? ?? '',
        d['streak'] as int? ?? 0,
        isYou: d['userId'] == uid,
      );
    }).toList();
  }
}
