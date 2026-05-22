import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/qz_tab_bar.dart';
import 'home_screen.dart';
import 'cast_profile_screen.dart';
import 'news_screen.dart';
import 'leaderboard_screen.dart';
import 'profile_screen.dart';

class ShellScreen extends StatefulWidget {
  const ShellScreen({super.key});

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  int _idx = 0;

  static const _screens = [
    HomeScreen(),
    CastProfileScreen(),
    NewsScreen(),
    LeaderboardScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).padding.bottom;
    return Scaffold(
      backgroundColor: C.bg,
      body: Stack(
        children: [
          IndexedStack(
            index: _idx,
            children: _screens,
          ),
          // Floating tab bar
          Positioned(
            left: 12,
            right: 12,
            bottom: bottomInset + 8,
            child: QzTabBar(
              activeIndex: _idx,
              onTap: (i) => setState(() => _idx = i),
            ),
          ),
        ],
      ),
    );
  }
}
