import '../models/models.dart';

abstract class QuizService {
  Future<List<QuizPackInfo>> getPacks();
  Future<List<QuizQuestion>> getQuestionsForPack(String packId);
  Future<List<QuizQuestion>> getQuestions();

  Future<int> submitResult({
    required int correct,
    required int total,
    required int elapsedSeconds,
  });
}
