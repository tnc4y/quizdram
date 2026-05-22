import 'package:flutter/material.dart';
import '../theme.dart';
import '../lang.dart';

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
    _ThemeOption('cream',    'Krem',        'Direction A — Açık',  QzPalette.cream),
    _ThemeOption('midnight', 'Gece Yarısı', 'Direction B — Koyu',  QzPalette.midnight),
  ];

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
            style: TextStyle(
              fontFamily: 'Unbounded',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: p.ink,
            )),
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
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: active ? t.palette.featured : p.card,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: active ? t.palette.pink : p.line,
                          width: active ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Mini palette swatch
                          Row(
                            children: [
                              _Swatch(t.palette.bg),
                              const SizedBox(width: 4),
                              _Swatch(t.palette.card),
                              const SizedBox(width: 4),
                              _Swatch(t.palette.pink),
                              const SizedBox(width: 4),
                              _Swatch(t.palette.gold),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            t.label,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: active ? t.palette.ink : p.ink,
                              fontFamily: 'Unbounded',
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            t.sublabel,
                            style: TextStyle(
                              fontSize: 10,
                              color: active
                                  ? t.palette.ink2
                                  : p.ink2,
                            ),
                          ),
                          if (active) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.check_circle_rounded,
                                    size: 13, color: t.palette.pink),
                                const SizedBox(width: 4),
                                Text('Aktif',
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: t.palette.pink)),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
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
            _NavRow(p: p, icon: Icons.person_outline_rounded, label: 'Profili Düzenle'),
            Divider(height: 1, color: p.line),
            _NavRow(p: p, icon: Icons.shield_outlined, label: 'Gizlilik'),
            Divider(height: 1, color: p.line),
            _NavRow(p: p, icon: Icons.lock_outline_rounded, label: 'Şifre & Güvenlik'),
          ]),

          const SizedBox(height: 28),

          // ── Uygulama hakkında ──────────────────────────────────
          _SectionHeader('Uygulama', p),
          const SizedBox(height: 10),
          _SettingsCard(p, children: [
            _NavRow(p: p, icon: Icons.star_outline_rounded, label: 'Quizdram\'ı Değerlendir'),
            Divider(height: 1, color: p.line),
            _NavRow(p: p, icon: Icons.share_outlined, label: 'Arkadaşına Öner'),
            Divider(height: 1, color: p.line),
            _NavRow(p: p, icon: Icons.info_outline_rounded, label: 'Hakkında'),
          ]),

          const SizedBox(height: 28),

          // Çıkış
          GestureDetector(
            onTap: () {},
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: p.pink.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: p.pink.withValues(alpha: 0.2)),
              ),
              alignment: Alignment.center,
              child: Text('Çıkış Yap',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: p.pink,
                    fontFamily: 'Unbounded',
                  )),
            ),
          ),

          const SizedBox(height: 16),
          Center(
            child: Text('Quizdram v0.1.0',
                style: TextStyle(fontSize: 11, color: p.ink3)),
          ),
        ],
      ),
    );
  }
}

// ── Alt widget'lar ──────────────────────────────────────────────────

class _ThemeOption {
  final String id, label, sublabel;
  final QzPalette palette;
  const _ThemeOption(this.id, this.label, this.sublabel, this.palette);
}

class _Swatch extends StatelessWidget {
  final Color color;
  const _Swatch(this.color);
  @override
  Widget build(BuildContext context) => Container(
        width: 14,
        height: 14,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
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
                          fontSize: 13, fontWeight: FontWeight.w600, color: p.ink)),
                  Text(sub,
                      style: TextStyle(fontSize: 11, color: p.ink2)),
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
  const _NavRow({required this.p, required this.icon, required this.label});

  @override
  Widget build(BuildContext context) => Padding(
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
                      fontSize: 13, fontWeight: FontWeight.w600, color: p.ink)),
            ),
            Icon(Icons.chevron_right_rounded, color: p.ink3, size: 18),
          ],
        ),
      );
}
