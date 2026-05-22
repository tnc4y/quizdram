import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme.dart';
import 'lang.dart';
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
    return ValueListenableBuilder<String>(
      valueListenable: appPalette,
      builder: (context, value, _) => MaterialApp(
        title: 'Quizdram',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(currentPalette),
        home: const OnboardingScreen(),
      ),
    );
  }
}
