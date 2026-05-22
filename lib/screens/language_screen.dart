import 'package:flutter/material.dart';
import '../theme.dart';
import '../data.dart';
import '../lang.dart';
import 'shell_screen.dart';

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  String _selected = 'tr';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              // Header row: back + step
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Text('←',
                        style: QT.display(24, c: C.ink)),
                  ),
                  Text(S.stepLabel,
                      style: QT.body(12, c: C.ink2, w: FontWeight.w600, ls: 1)),
                ],
              ),
              const SizedBox(height: 18),
              // Step label + title
              Text(S.langItalic, style: QT.serif(18, c: C.pink)),
              const SizedBox(height: 6),
              Text(S.langTitle, style: QT.display(32)),
              const SizedBox(height: 10),
              Text(
                S.langSubtitle,
                style: QT.body(14, c: C.ink2, h: 1.5),
              ),
              const SizedBox(height: 22),
              // Language list
              Expanded(
                child: ListView.separated(
                  itemCount: kLangs.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    final lang = kLangs[i];
                    final sel = lang.code == _selected;
                    return GestureDetector(
                      onTap: () => setState(() => _selected = lang.code),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: sel ? C.ink : C.card,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: sel ? Colors.transparent : C.line,
                          ),
                        ),
                        child: Row(
                          children: [
                            // Glyph box
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: sel
                                    ? C.pink
                                    : C.pink.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                lang.glyph,
                                style: QT.hangul(
                                  18,
                                  c: sel ? C.bg : C.pink,
                                  w: FontWeight.w800,
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            // Labels
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(lang.label,
                                      style: QT.display(
                                        15,
                                        c: sel ? C.bg : C.ink,
                                        w: FontWeight.w600,
                                      )),
                                  const SizedBox(height: 2),
                                  Text(lang.native,
                                      style: QT.body(
                                        12,
                                        c: sel
                                            ? C.bg.withValues(alpha: 0.6)
                                            : C.ink2,
                                      )),
                                ],
                              ),
                            ),
                            // Checkmark or empty circle
                            sel
                                ? Icon(Icons.check_rounded,
                                    color: C.gold, size: 22)
                                : Container(
                                    width: 22,
                                    height: 22,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border:
                                          Border.all(color: C.line, width: 1.5),
                                    ),
                                  ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              // Continue button
              GestureDetector(
                onTap: () {
                  appLang.value = _selected;
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const ShellScreen()),
                    (_) => false,
                  );
                },
                child: Container(
                  height: 54,
                  decoration: BoxDecoration(
                    color: C.pink,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    S.continueBtn,
                    style: QT.display(15, c: Colors.white, w: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 28),
            ],
          ),
        ),
      ),
    );
  }
}
