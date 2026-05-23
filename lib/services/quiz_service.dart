import '../models/models.dart';

abstract class QuizService {
  Future<List<QuizQuestion>> getQuestions();

  Future<int> submitResult({
    required int correct,
    required int total,
    required int elapsedSeconds,
  });
}
