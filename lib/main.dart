import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme.dart';
import 'screens/onboarding_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const QuizDramApp());
}

class QuizDramApp extends StatelessWidget {
  const QuizDramApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quizdram',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: const OnboardingScreen(),
    );
  }
}
