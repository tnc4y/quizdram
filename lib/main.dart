import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_options.dart';
import 'theme.dart';
import 'lang.dart';
import 'screens/onboarding_screen.dart';
import 'screens/shell_screen.dart';
import 'screens/username_screen.dart';
import 'services/service_locator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await initPrefs();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  Widget home;
  final user = FirebaseAuth.instance.currentUser;
  if (user != null) {
    await ServiceLocator.instance.init();
    final hasName = await ServiceLocator.instance.user.hasUsername();
    home = hasName ? const ShellScreen() : const UsernameScreen();
  } else {
    home = const OnboardingScreen();
  }

  runApp(QuizDramApp(home: home));
}

class QuizDramApp extends StatelessWidget {
  final Widget home;
  const QuizDramApp({super.key, required this.home});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: appPalette,
      builder: (context, value, _) => MaterialApp(
        title: 'Quizdram',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(currentPalette),
        home: home,
      ),
    );
  }
}
