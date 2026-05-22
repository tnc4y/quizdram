import '../models/models.dart';

/// Abstract contract for user profile and progress.
abstract class UserService {
  /// Signed-in user id, or null if anonymous.
  String? get uid;

  /// Display name used in the UI.
  Future<String> getDisplayName();

  /// Current XP and level data: [current, max, level].
  Future<({int xp, int xpMax, int level})> getXpProgress();

  /// Earned and locked badges.
  Future<List<QzBadge>> getBadges();

  /// Overall stats: quizzes played, accuracy %, streak days.
  Future<({int quizzes, int accuracy, int streak})> getStats();
}
