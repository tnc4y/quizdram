import 'package:flutter/material.dart';
import 'models/models.dart';
import 'screens/shell_screen.dart';
import 'screens/quiz_play_screen.dart';
import 'screens/quiz_result_screen.dart';
import 'screens/cast_profile_screen.dart';
import 'screens/language_screen.dart';

/// Central navigation hub — all Navigator calls go through here.
/// Replace MaterialPageRoute with go_router or AutoRoute in Phase 1.
class AppRouter {
  AppRouter._();

  /// Onboarding → Language picker
  static void toLanguage(BuildContext context) => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LanguageScreen()),
      );

  /// Language picker → Shell (clears back-stack)
  static void toShell(BuildContext context) =>
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const ShellScreen()),
        (_) => false,
      );

  /// Shell / Cast tab → Quiz play
  static void toQuizPlay(BuildContext context) => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const QuizPlayScreen()),
      );

  /// Quiz play → Quiz result (replaces play screen)
  static void toQuizResult(
    BuildContext context, {
    required int correct,
    required int total,
    required int elapsedSeconds,
  }) =>
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => QuizResultScreen(
            correct: correct,
            total: total,
            elapsedSeconds: elapsedSeconds,
          ),
        ),
      );

  /// Quiz result → next quiz (replaces result screen)
  static void toNextQuiz(BuildContext context) => Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const QuizPlayScreen()),
      );

  /// Any screen → Cast profile detail
  static void toCastProfile(BuildContext context, CastMember member) =>
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => CastProfileScreen(member: member)),
      );
}
