import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme.dart';
import '../services/service_locator.dart';
import 'shell_screen.dart';

class UsernameScreen extends StatefulWidget {
  const UsernameScreen({super.key});

  @override
  State<UsernameScreen> createState() => _UsernameScreenState();
}

class _UsernameScreenState extends State<UsernameScreen> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Google kullanıcısı için Google adını ön-doldur
    final googleName = FirebaseAuth.instance.currentUser?.displayName ?? '';
    if (googleName.isNotEmpty) _controller.text = googleName;
    WidgetsBinding.instance.addPostFrameCallback((_) => _focusNode.requestFocus());
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  String? _validate(String value) {
    final v = value.trim();
    if (v.isEmpty) return 'Kullanıcı adı boş olamaz';
    if (v.length < 3) return 'En az 3 karakter olmalı';
    if (v.length > 20) return 'En fazla 20 karakter olabilir';
    if (!RegExp(r'^[a-zA-Z0-9_.]+$').hasMatch(v)) {
      return 'Sadece harf, rakam, _ ve . kullanabilirsin';
    }
    return null;
  }

  Future<void> _save() async {
    final err = _validate(_controller.text);
    if (err != null) {
      setState(() => _error = err);
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await sl.user.saveUsername(_controller.text);
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const ShellScreen()),
        );
      }
    } catch (_) {
      setState(() { _loading = false; _error = 'Kaydedilemedi. Tekrar dene.'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Scaffold(
      backgroundColor: p.bg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(22, 0, 22, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 60),
              // Dekoratif hangul
              Text('닉네임', style: QT.hangul(72, c: p.pink.withValues(alpha: 0.15))),
              const SizedBox(height: 8),
              Text('Kullanıcı adını seç', style: QT.display(26, c: p.ink, w: FontWeight.w700)),
              const SizedBox(height: 6),
              Text(
                'Bu ad liderboard ve profilinde görünecek.\n3–20 karakter, harf · rakam · _ · .',
                style: QT.body(13, c: p.ink2, h: 1.5),
              ),
              const SizedBox(height: 36),
              // Input
              Container(
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _error != null ? p.pink : p.line,
                    width: _error != null ? 1.5 : 1,
                  ),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Text('@', style: QT.display(18, c: p.ink2)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        focusNode: _focusNode,
                        style: QT.display(16, c: p.ink),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: 'kullanici_adi',
                          hintStyle: QT.display(16, c: p.ink3),
                          contentPadding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        textInputAction: TextInputAction.done,
                        onChanged: (_) { if (_error != null) setState(() => _error = null); },
                        onSubmitted: (_) => _save(),
                      ),
                    ),
                  ],
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: QT.body(12, c: p.pink)),
              ],
              const Spacer(),
              // Devam butonu
              if (_loading)
                const Center(child: CircularProgressIndicator())
              else
                GestureDetector(
                  onTap: _save,
                  child: Container(
                    width: double.infinity,
                    height: 56,
                    decoration: BoxDecoration(
                      color: p.ink,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Devam Et',
                            style: QT.display(15, c: p.bg, w: FontWeight.w600)),
                        const SizedBox(width: 10),
                        Icon(Icons.arrow_forward_rounded, color: C.gold, size: 18),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
