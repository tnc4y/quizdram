import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/models.dart';
import 'leaderboard_service.dart';

class FirebaseLeaderboardService implements LeaderboardService {
  final _db = FirebaseFirestore.instance;

  @override
  Future<List<LeaderEntry>> getWeekly() => _fetchUsers('weeklyXp', fallback: 'xp');

  @override
  Future<List<LeaderEntry>> getAllTime() => _fetchUsers('xp');

  @override
  Future<List<LeaderEntry>> getFriends() => _fetchUsers('xp');

  static String _fmtXp(int xp) {
    final s = xp.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write('.');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  Future<List<LeaderEntry>> _fetchUsers(String orderField, {String? fallback}) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;

    QuerySnapshot<Map<String, dynamic>> snap;
    try {
      snap = await _db
          .collection('users')
          .orderBy(orderField, descending: true)
          .limit(50)
          .get();
    } catch (_) {
      // Field doesn't exist on any doc — fall back to xp
      if (fallback != null && fallback != orderField) {
        snap = await _db
            .collection('users')
            .orderBy(fallback, descending: true)
            .limit(50)
            .get();
      } else {
        rethrow;
      }
    }

    // Filter out users with no display name (anonymous / incomplete profiles)
    final docs = snap.docs
        .where((d) => (d.data()['displayName'] as String? ?? '').trim().isNotEmpty)
        .toList();

    return docs.asMap().entries.map((e) {
      final rank = e.key + 1;
      final d = e.value.data();
      final xp = (d[orderField] as num? ?? d['xp'] as num? ?? 0).toInt();
      return LeaderEntry(
        rank,
        d['displayName'] as String? ?? '',
        d['country'] as String? ?? '',
        _fmtXp(xp),
        (d['streak'] as num?)?.toInt() ?? 0,
        isYou: e.value.id == uid,
      );
    }).toList();
  }
}
