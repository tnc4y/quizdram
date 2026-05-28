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
    final stored = (snap.data()?['displayName'] as String? ?? '').trim();
    if (stored.isNotEmpty) return stored;
    return _auth.currentUser?.displayName ?? '';
  }

  @override
  Future<({int xp, int xpMax, int level})> getXpProgress() async {
    if (uid == null) return (xp: 0, xpMax: 1000, level: 1);
    final snap = await _userDoc.get();
    final totalXp = (snap.data()?['xp'] as num?)?.toInt() ?? 0;
    final level = _levelFromXp(totalXp);
    final levelStart = _xpForLevel(level);
    final levelEnd = _xpForLevel(level + 1);
    return (xp: totalXp - levelStart, xpMax: levelEnd - levelStart, level: level);
  }

  // Total XP threshold to reach a given level (L1=0, L2=1000, L3=3000, L4=6000…)
  static int _xpForLevel(int level) {
    if (level <= 1) return 0;
    // sum of 1000*(1+2+...+(level-1)) = 1000 * (level-1)*level/2
    final n = level - 1;
    return 1000 * n * (n + 1) ~/ 2;
  }

  static int _levelFromXp(int xp) {
    // Solve xp >= 500*n*(n+1) → n ≤ (sqrt(1+2*xp/500)-1)/1
    // Simple linear scan is fine; max practical XP ~ 10M → level ~140
    int level = 1;
    while (_xpForLevel(level + 1) <= xp) {
      level++;
    }
    return level;
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
