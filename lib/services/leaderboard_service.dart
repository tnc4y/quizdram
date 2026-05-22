import '../models/models.dart';

/// Abstract contract for leaderboard data.
abstract class LeaderboardService {
  /// Weekly top players.
  Future<List<LeaderEntry>> getWeekly();

  /// All-time top players.
  Future<List<LeaderEntry>> getAllTime();

  /// Friends leaderboard for the signed-in user.
  Future<List<LeaderEntry>> getFriends();
}
