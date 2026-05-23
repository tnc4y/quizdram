import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'theme.dart';
import 'lang.dart';
import 'screens/onboarding_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
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
