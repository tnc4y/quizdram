import 'firebase_quiz_service.dart';
import 'firebase_user_service.dart';
import 'firebase_news_service.dart';
import 'firebase_leaderboard_service.dart';
import 'firebase_drama_service.dart';
import 'firebase_cast_service.dart';
import 'quiz_service.dart';
import 'news_service.dart';
import 'leaderboard_service.dart';
import 'drama_service.dart';
import 'cast_service.dart';

class ServiceLocator {
  ServiceLocator._();
  static final ServiceLocator _instance = ServiceLocator._();
  static ServiceLocator get instance => _instance;

  late final QuizService quiz;
  late final FirebaseUserService user;
  late final NewsService news;
  late final LeaderboardService leaderboard;
  late final DramaService drama;
  late final CastService cast;

  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    quiz = FirebaseQuizService();
    user = FirebaseUserService();
    news = FirebaseNewsService();
    leaderboard = FirebaseLeaderboardService();
    drama = FirebaseDramaService();
    cast = FirebaseCastService();
    await user.ensureProfile();
    _initialized = true;
  }
}

ServiceLocator get sl => ServiceLocator.instance;
