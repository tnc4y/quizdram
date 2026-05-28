import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme.dart';
import '../lang.dart';
import '../data.dart';
import '../services/service_locator.dart';
import 'onboarding_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notifications = true;
  bool _streakReminder = true;
  bool _newsletter = false;

  static const _themes = [
    _ThemeOption('cream',    'Krem',        'Açık',  QzPalette.cream),
    _ThemeOption('midnight', 'Gece Yarısı', 'Koyu',  QzPalette.midnight),
  ];

  // ── Profile edit ───────────────────────────────────────────────
  Future<void> _editProfile() async {
    final ctrl = TextEditingController();
    final currentName = await sl.user.getDisplayName();
    ctrl.text = currentName;
    if (!mounted) return;

    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: ctx.qp.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Profili Düzenle',
            style: QT.display(16, c: ctx.qp.ink)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Kullanıcı adı',
                style: QT.body(12, c: ctx.qp.ink2)),
            const SizedBox(height: 8),
            TextField(
              controller: ctrl,
              autofocus: true,
              style: QT.display(14, c: ctx.qp.ink),
              decoration: InputDecoration(
                hintText: 'kullanici_adi',
                hintStyle: QT.body(13, c: ctx.qp.ink3),
                filled: true,
                fillColor: ctx.qp.sand,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('İptal', style: QT.body(13, c: ctx.qp.ink2)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            child: Text('Kaydet',
                style: QT.body(13, c: ctx.qp.pink, w: FontWeight.w700)),
          ),
        ],
      ),
    );

    if (result != null && result.length >= 3) {
      await sl.user.saveUsername(result);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Kullanıcı adı güncellendi.',
                style: QT.body(13, c: Colors.white)),
            backgroundColor: context.qp.featured,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  // ── Privacy dialog ─────────────────────────────────────────────
  void _showPrivacy() {
    final p = context.qp;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: ctx.qp.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Gizlilik', style: QT.display(16, c: ctx.qp.ink)),
        content: Text(
          'Quizdram, kişisel verilerinizi yalnızca hizmet sağlamak amacıyla kullanır. '
          'Quiz sonuçlarınız ve profil bilgileriniz Firebase altyapısında güvenle saklanır. '
          'Üçüncü taraflarla paylaşılmaz.',
          style: QT.body(13, c: ctx.qp.ink2, h: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Tamam',
                style: QT.body(13, c: p.pink, w: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  // ── Security dialog ────────────────────────────────────────────
  void _showSecurity() {
    final user = FirebaseAuth.instance.currentUser;
    final isAnon = user?.isAnonymous ?? true;
    final isGoogle =
        user?.providerData.any((p) => p.providerId == 'google.com') ?? false;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: ctx.qp.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Şifre & Güvenlik',
            style: QT.display(16, c: ctx.qp.ink)),
        content: Text(
          isAnon
              ? 'Misafir hesabı kullanıyorsunuz. Kalıcı hesap oluşturmak için çıkıp Google ile giriş yapın.'
              : isGoogle
                  ? 'Google hesabınız ile giriş yapıyorsunuz. Şifrenizi Google hesap ayarlarından yönetebilirsiniz.'
                  : 'Hesap güvenliğiniz için güçlü bir şifre kullandığınızdan emin olun.',
          style: QT.body(13, c: ctx.qp.ink2, h: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Tamam',
                style: QT.body(13, c: context.qp.pink, w: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  // ── Rate app ───────────────────────────────────────────────────
  void _rateApp() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('App Store\'da değerlendirme yakında aktif olacak!',
            style: QT.body(13, c: Colors.white)),
        backgroundColor: context.qp.featured,
        behavior: SnackBarBehavior.floating,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  // ── Share app ──────────────────────────────────────────────────
  void _shareApp() {
    Clipboard.setData(const ClipboardData(
        text: 'Quizdram — K-Drama & Asya dizisi quiz uygulaması! '
            'iOS ve Android\'de indirin.'));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Uygulama bağlantısı panoya kopyalandı!',
            style: QT.body(13, c: Colors.white)),
        backgroundColor: context.qp.featured,
        behavior: SnackBarBehavior.floating,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  // ── About dialog ───────────────────────────────────────────────
  void _showAbout() {
    final p = context.qp;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: ctx.qp.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Text('퀴즈', style: QT.hangul(28, c: ctx.qp.pink)),
            const SizedBox(width: 10),
            Text('Quizdram', style: QT.display(16, c: ctx.qp.ink)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _AboutRow('Sürüm', 'v1.0.0 (build 1)', ctx.qp),
            const SizedBox(height: 8),
            _AboutRow('Geliştirici', 'Quizdram Team', ctx.qp),
            const SizedBox(height: 8),
            _AboutRow('Platform', 'Flutter · Firebase', ctx.qp),
            const SizedBox(height: 8),
            _AboutRow('Tasarım', 'Direction A — Cream K-pop', ctx.qp),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Kapat',
                style: QT.body(13, c: p.pink, w: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Scaffold(
      backgroundColor: p.bg,
      appBar: AppBar(
        backgroundColor: p.bg,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: p.card,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: p.line),
            ),
            child: Icon(Icons.arrow_back_rounded, color: p.ink, size: 18),
          ),
        ),
        title: Text('Ayarlar',
            style: QT.display(16, c: p.ink)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
        children: [
          // ── Tema ───────────────────────────────────────────────
          _SectionHeader('Tema', p),
          const SizedBox(height: 10),
          Row(
            children: _themes.map((t) {
              final active = appPalette.value == t.id;
              return Expanded(
                child: Padding(
                  padding: EdgeInsets.only(right: t == _themes.last ? 0 : 10),
                  child: GestureDetector(
                    onTap: () {
                      appPalette.value = t.id;
                      setState(() {});
                    },
                    child: _ThemeCard(option: t, active: active),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 28),

          // ── Dil ───────────────────────────────────────────────
          _SectionHeader('Dil', p),
          const SizedBox(height: 10),
          ValueListenableBuilder<String>(
            valueListenable: appLang,
            builder: (context, lang, _) {
              final p = context.qp;
              return Container(
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: p.line),
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: lang,
                    isExpanded: true,
                    dropdownColor: p.card,
                    icon: Icon(Icons.keyboard_arrow_down_rounded,
                        color: p.ink2, size: 20),
                    selectedItemBuilder: (_) => kLangs.map((l) {
                      return Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: p.pink,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(l.glyph,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: p.bg,
                                )),
                          ),
                          const SizedBox(width: 10),
                          Text(l.label,
                              style: QT.body(14,
                                  c: p.ink, w: FontWeight.w600)),
                          const SizedBox(width: 4),
                          Text('(${l.native})',
                              style: QT.body(12, c: p.ink2)),
                        ],
                      );
                    }).toList(),
                    items: kLangs.map((l) {
                      final isSelected = l.code == lang;
                      return DropdownMenuItem<String>(
                        value: l.code,
                        child: Row(
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: isSelected ? p.pink : p.sand,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(l.glyph,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: isSelected ? p.bg : p.ink2,
                                  )),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(l.label,
                                      style: QT.body(13,
                                          c: p.ink, w: FontWeight.w600)),
                                  Text(l.native,
                                      style: QT.body(11, c: p.ink2)),
                                ],
                              ),
                            ),
                            if (isSelected)
                              Icon(Icons.check_rounded,
                                  color: p.pink, size: 16),
                          ],
                        ),
                      );
                    }).toList(),
                    onChanged: (code) {
                      if (code != null) appLang.value = code;
                    },
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 28),

          // ── Bildirimler ────────────────────────────────────────
          _SectionHeader('Bildirimler', p),
          const SizedBox(height: 10),
          _SettingsCard(p, children: [
            _Toggle(
              p: p,
              icon: Icons.notifications_outlined,
              label: 'Push Bildirimleri',
              sub: 'Yeni quiz ve haberler',
              value: _notifications,
              onChanged: (v) => setState(() => _notifications = v),
            ),
            Divider(height: 1, color: p.line),
            _Toggle(
              p: p,
              icon: Icons.local_fire_department_outlined,
              label: 'Seri Hatırlatıcı',
              sub: 'Gün sonu seri riski uyarısı',
              value: _streakReminder,
              onChanged: (v) => setState(() => _streakReminder = v),
            ),
            Divider(height: 1, color: p.line),
            _Toggle(
              p: p,
              icon: Icons.mail_outline_rounded,
              label: 'Haftalık Bülten',
              sub: 'K-drama haberleri e-posta özeti',
              value: _newsletter,
              onChanged: (v) => setState(() => _newsletter = v),
            ),
          ]),

          const SizedBox(height: 28),

          // ── Hesap ─────────────────────────────────────────────
          _SectionHeader('Hesap', p),
          const SizedBox(height: 10),
          _SettingsCard(p, children: [
            _NavRow(
              p: p,
              icon: Icons.person_outline_rounded,
              label: 'Profili Düzenle',
              onTap: _editProfile,
            ),
            Divider(height: 1, color: p.line),
            _NavRow(
              p: p,
              icon: Icons.shield_outlined,
              label: 'Gizlilik',
              onTap: _showPrivacy,
            ),
            Divider(height: 1, color: p.line),
            _NavRow(
              p: p,
              icon: Icons.lock_outline_rounded,
              label: 'Şifre & Güvenlik',
              onTap: _showSecurity,
            ),
          ]),

          const SizedBox(height: 28),

          // ── Uygulama hakkında ──────────────────────────────────
          _SectionHeader('Uygulama', p),
          const SizedBox(height: 10),
          _SettingsCard(p, children: [
            _NavRow(
              p: p,
              icon: Icons.star_outline_rounded,
              label: 'Quizdram\'ı Değerlendir',
              onTap: _rateApp,
            ),
            Divider(height: 1, color: p.line),
            _NavRow(
              p: p,
              icon: Icons.share_outlined,
              label: 'Arkadaşına Öner',
              onTap: _shareApp,
            ),
            Divider(height: 1, color: p.line),
            _NavRow(
              p: p,
              icon: Icons.info_outline_rounded,
              label: 'Hakkında',
              onTap: _showAbout,
            ),
          ]),

          const SizedBox(height: 28),

          // Çıkış
          GestureDetector(
            onTap: () async {
              await FirebaseAuth.instance.signOut();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const OnboardingScreen()),
                  (_) => false,
                );
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: p.pink.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: p.pink.withValues(alpha: 0.2)),
              ),
              alignment: Alignment.center,
              child: Text('Çıkış Yap',
                  style: QT.display(14, c: p.pink)),
            ),
          ),

          const SizedBox(height: 16),
          Center(
            child: Text('Quizdram v1.0.0',
                style: QT.body(11, c: p.ink3)),
          ),
        ],
      ),
    );
  }
}

// ── Theme card ──────────────────────────────────────────────────────

class _ThemeCard extends StatelessWidget {
  final _ThemeOption option;
  final bool active;
  const _ThemeCard({required this.option, required this.active});

  @override
  Widget build(BuildContext context) {
    final tp = option.palette;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: tp.bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: active ? tp.pink : tp.line,
          width: active ? 2 : 1,
        ),
        boxShadow: active
            ? [BoxShadow(color: tp.pink.withValues(alpha: 0.25), blurRadius: 10, offset: const Offset(0, 3))]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Mini UI preview header
          Container(
            height: 52,
            decoration: BoxDecoration(
              color: tp.featured,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            padding: const EdgeInsets.all(10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: tp.pink,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                          height: 6,
                          decoration: BoxDecoration(
                              color: tp.bg.withValues(alpha: 0.7),
                              borderRadius: BorderRadius.circular(3))),
                      const SizedBox(height: 4),
                      Container(
                          width: 40,
                          height: 5,
                          decoration: BoxDecoration(
                              color: tp.gold.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(2))),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Card body with labels
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(option.label,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: tp.ink,
                      fontFamily: 'Unbounded',
                    )),
                const SizedBox(height: 2),
                Text(option.sublabel,
                    style: TextStyle(fontSize: 10, color: tp.ink2)),
                const SizedBox(height: 8),
                // Color swatches
                Row(
                  children: [
                    _Swatch(tp.bg, tp.line),
                    const SizedBox(width: 4),
                    _Swatch(tp.card, tp.line),
                    const SizedBox(width: 4),
                    _Swatch(tp.pink, Colors.transparent),
                    const SizedBox(width: 4),
                    _Swatch(tp.gold, Colors.transparent),
                    const Spacer(),
                    if (active)
                      Icon(Icons.check_circle_rounded,
                          size: 14, color: tp.pink),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── About row helper ────────────────────────────────────────────────

class _AboutRow extends StatelessWidget {
  final String label, value;
  final QzPalette p;
  const _AboutRow(this.label, this.value, this.p);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 90,
          child: Text(label, style: QT.body(12, c: p.ink3)),
        ),
        Expanded(child: Text(value, style: QT.body(12, c: p.ink, w: FontWeight.w600))),
      ],
    );
  }
}

// ── Shared data holders ─────────────────────────────────────────────

class _ThemeOption {
  final String id, label, sublabel;
  final QzPalette palette;
  const _ThemeOption(this.id, this.label, this.sublabel, this.palette);
}

class _Swatch extends StatelessWidget {
  final Color color, border;
  const _Swatch(this.color, this.border);
  @override
  Widget build(BuildContext context) => Container(
        width: 13,
        height: 13,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(color: border, width: 0.5),
        ),
      );
}

class _SectionHeader extends StatelessWidget {
  final String label;
  final QzPalette p;
  const _SectionHeader(this.label, this.p);
  @override
  Widget build(BuildContext context) => Text(
        label.toUpperCase(),
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: p.ink3,
          letterSpacing: 1.5,
        ),
      );
}

class _SettingsCard extends StatelessWidget {
  final QzPalette p;
  final List<Widget> children;
  const _SettingsCard(this.p, {required this.children});
  @override
  Widget build(BuildContext context) => Container(
        decoration: BoxDecoration(
          color: p.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: p.line),
        ),
        child: Column(children: children),
      );
}

class _Toggle extends StatelessWidget {
  final QzPalette p;
  final IconData icon;
  final String label, sub;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _Toggle({
    required this.p,
    required this.icon,
    required this.label,
    required this.sub,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: p.sand,
                borderRadius: BorderRadius.circular(9),
              ),
              child: Icon(icon, color: p.ink2, size: 16),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: p.ink)),
                  Text(sub, style: TextStyle(fontSize: 11, color: p.ink2)),
                ],
              ),
            ),
            Switch.adaptive(
              value: value,
              onChanged: onChanged,
              activeThumbColor: p.pink,
              activeTrackColor: p.pink.withValues(alpha: 0.35),
            ),
          ],
        ),
      );
}

class _NavRow extends StatelessWidget {
  final QzPalette p;
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  const _NavRow({
    required this.p,
    required this.icon,
    required this.label,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) => GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: p.sand,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Icon(icon, color: p.ink2, size: 16),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(label,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: p.ink)),
              ),
              Icon(Icons.chevron_right_rounded, color: p.ink3, size: 18),
            ],
          ),
        ),
      );
}
