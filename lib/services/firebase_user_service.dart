import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../data.dart';
import 'user_service.dart';

class FirebaseUserService implements UserService {
  final _auth = FirebaseAuth.instance;
  final _db = FirebaseFirestore.instance;

  @override
  String? get uid => _auth.currentUser?.uid;

  DocumentReference<Map<String, dynamic>> get _userDoc =>
      _db.collection('users').doc(uid);

  @override
  Future<String> getDisplayName() async {
    if (uid == null) return '';
    final snap = await _userDoc.get();
    return snap.data()?['displayName'] as String? ?? '';
  }

  @override
  Future<({int xp, int xpMax, int level})> getXpProgress() async {
    if (uid == null) return (xp: 0, xpMax: 1000, level: 1);
    final snap = await _userDoc.get();
    final d = snap.data() ?? {};
    final xp = d['xp'] as int? ?? 0;
    final level = d['level'] as int? ?? 1;
    return (xp: xp, xpMax: level * 1000, level: level);
  }

  @override
  Future<List<QzBadge>> getBadges() async {
    if (uid == null) return kBadges.map((b) => QzBadge(b.name, b.hangul, b.color, false)).toList();
    final snap = await _userDoc.get();
    final earned = List<String>.from(snap.data()?['badges'] ?? []);
    return kBadges
        .map((b) => QzBadge(b.name, b.hangul, b.color, earned.contains(b.name)))
        .toList();
  }

  @override
  Future<({int quizzes, int accuracy, int streak})> getStats() async {
    if (uid == null) return (quizzes: 0, accuracy: 0, streak: 0);
    final snap = await _userDoc.get();
    final d = snap.data() ?? {};
    return (
      quizzes: d['quizzesPlayed'] as int? ?? 0,
      accuracy: d['accuracy'] as int? ?? 0,
      streak: d['streak'] as int? ?? 0,
    );
  }

  /// Kullanıcı Firestore'da kayıtlı ve displayName dolu mu?
  Future<bool> hasUsername() async {
    if (uid == null) return false;
    final snap = await _userDoc.get();
    final name = snap.data()?['displayName'] as String? ?? '';
    return name.trim().isNotEmpty;
  }

  /// Kullanıcı adını Firestore'a kaydet.
  Future<void> saveUsername(String name) async {
    if (uid == null) return;
    await _userDoc.set({'displayName': name.trim()}, SetOptions(merge: true));
  }

  /// Firestore dokümanı yoksa oluştur (displayName boş bırakılır — username ekranı dolduracak).
  Future<void> ensureProfile() async {
    if (uid == null) return;
    final snap = await _userDoc.get();
    if (!snap.exists) {
      await _userDoc.set({
        'uid': uid,
        'displayName': '',
        'role': 'user',
        'xp': 0,
        'level': 1,
        'streak': 0,
        'badges': <String>[],
        'createdAt': FieldValue.serverTimestamp(),
      });
    }
  }
}
