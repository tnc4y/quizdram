import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../theme.dart';
import '../lang.dart';
import '../widgets/stripe_painter.dart';
import '../services/service_locator.dart';
import 'language_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  bool _loading = false;
  String? _error;

  Future<void> _signInWithGoogle() async {
    setState(() { _loading = true; _error = null; });
    try {
      final googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        setState(() => _loading = false);
        return;
      }
      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      await FirebaseAuth.instance.signInWithCredential(credential);
      await ServiceLocator.instance.init();
      _goNext();
    } catch (_) {
      setState(() { _loading = false; _error = 'Google ile giriş başarısız. Tekrar dene.'; });
    }
  }

  Future<void> _signInAsGuest() async {
    setState(() { _loading = true; _error = null; });
    try {
      await FirebaseAuth.instance.signInAnonymously();
      await ServiceLocator.instance.init();
      _goNext();
    } catch (_) {
      setState(() { _loading = false; _error = 'Misafir girişi başarısız. Tekrar dene.'; });
    }
  }

  void _goNext() {
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LanguageScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.bg,
      body: Stack(
        children: [
          Positioned(
            top: 28,
            right: -36,
            child: IgnorePointer(
              child: Text('퀴즈', style: QT.hangul(220, c: C.pink.withValues(alpha: 0.18))),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 8, 22, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 62),
                  const _PosterCard(),
                  const SizedBox(height: 22),
                  Text(S.taglineItalic, style: QT.serif(16)),
                  const SizedBox(height: 4),
                  Text(S.taglineBold, style: QT.display(26, h: 1.05)),
                  const Spacer(),
                  if (_error != null) ...[
                    Center(
                      child: Text(_error!,
                          style: QT.body(12, c: const Color(0xFFC0364A)),
                          textAlign: TextAlign.center),
                    ),
                    const SizedBox(height: 10),
                  ],
                  if (_loading)
                    const Center(child: CircularProgressIndicator())
                  else ...[
                    _GoogleButton(onTap: _signInWithGoogle),
                    const SizedBox(height: 10),
                    _GuestButton(onTap: _signInAsGuest),
                  ],
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      'Devam ederek Kullanım Şartlarını kabul etmiş olursunuz.',
                      style: QT.body(11, c: C.ink3),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Google sign-in button ────────────────────────────────────────
class _GoogleButton extends StatelessWidget {
  final VoidCallback onTap;
  const _GoogleButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: C.ink,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Google "G" logosu
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
              alignment: Alignment.center,
              child: const Text(
                'G',
                style: TextStyle(
                  fontFamily: 'sans-serif',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF4285F4),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Text('Google ile giriş yap',
                style: QT.display(15, c: C.bg, w: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

// ── Guest button ─────────────────────────────────────────────────
class _GuestButton extends StatelessWidget {
  final VoidCallback onTap;
  const _GuestButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          border: Border.all(color: C.line, width: 1.5),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person_outline_rounded, color: C.ink2, size: 18),
            const SizedBox(width: 8),
            Text('Misafir olarak devam et',
                style: QT.display(15, c: C.ink2, w: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

// ── Poster card ──────────────────────────────────────────────────
class _PosterCard extends StatelessWidget {
  const _PosterCard();

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: SizedBox(
        height: 320,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [C.plum, C.pink],
                ),
              ),
            ),
            CustomPaint(
              painter: const StripePainter(
                color: Color(0xFFFFC857),
                opacity: 0.18,
                stripeWidth: 14,
                totalStep: 28,
              ),
            ),
            Positioned(
              top: 14,
              left: 14,
              child: Text('드라마 · 시네마',
                  style: QT.hangul(14, c: const Color(0xFFFFF5F0),
                      w: FontWeight.w900, ls: 0.2 * 14)),
            ),
            Positioned(
              top: 22,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: C.gold,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text('EST · 2025',
                    style: QT.display(10, c: C.plum, w: FontWeight.w700, ls: 0.6)),
              ),
            ),
            Positioned(
              bottom: 22,
              left: 22,
              right: 22,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('vol. 02 · seoul', style: QT.serif(18, c: C.gold)),
                  const SizedBox(height: 4),
                  Text('QUIZ\nDRAM',
                      style: QT.display(56, c: const Color(0xFFFFF5F0),
                          w: FontWeight.w800, h: 0.92, ls: -56 * 0.04)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
