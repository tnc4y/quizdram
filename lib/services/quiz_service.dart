import '../models/models.dart';

/// Abstract contract for quiz data.
/// Swap the mock implementation for a real backend without touching screens.
abstract class QuizService {
  /// Today's featured quiz options.
  Future<List<QuizOpt>> getTodayOptions();

  /// Submit a completed quiz session and receive XP earned.
  Future<int> submitResult({
    required int correct,
    required int total,
    required int elapsedSeconds,
  });
}
