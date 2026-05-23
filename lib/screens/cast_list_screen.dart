import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/models.dart';
import '../lang.dart';
import '../utils/korean_romanizer.dart';
import '../widgets/qz_photo.dart';
import '../widgets/qz_chip.dart';
import '../services/service_locator.dart';
import 'cast_profile_screen.dart';

class CastListScreen extends StatefulWidget {
  const CastListScreen({super.key});

  @override
  State<CastListScreen> createState() => _CastListScreenState();
}

class _CastListScreenState extends State<CastListScreen> {
  int _regionIdx = 0;
  final _regions = ['all', 'kr', 'cn', 'jp', 'th'];

  List<CastMember> _allMembers = [];
  bool _loading = true;
  String? _error;

  String _query = '';
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final region = _regions[_regionIdx] == 'all' ? null : _regions[_regionIdx];
      final members = await sl.cast.getCast(region: region, limit: 60);
      if (mounted) setState(() { _allMembers = members; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  void _selectRegion(int i) {
    if (_regionIdx == i) return;
    setState(() => _regionIdx = i);
    _load();
  }

  List<CastMember> get _filtered {
    if (_query.isEmpty) return _allMembers;
    final q = _query.toLowerCase();
    return _allMembers.where((m) {
      if (m.name.toLowerCase().contains(q)) return true;
      if (m.hangul.toLowerCase().contains(q)) return true;
      // search in romanized hangul so "lim" matches "임"
      if (KoreanRomanizer.hasHangul(m.hangul) &&
          KoreanRomanizer.romanize(m.hangul).toLowerCase().contains(q)) {
        return true;
      }
      return false;
    }).toList();
  }

  List<String> get _chips =>
      [S.all, '🇰🇷 K-Drama', '🇨🇳 C-Drama', '🇯🇵 J-Drama', '🇹🇭 Thai'];

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Material(
      color: p.bg,
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: Row(
                children: [
                  if (Navigator.of(context).canPop())
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Padding(
                        padding: const EdgeInsets.only(right: 10),
                        child: Icon(Icons.arrow_back_rounded,
                            color: p.ink, size: 22),
                      ),
                    ),
                  Text(S.tabCast,
                      style: QT.display(26, c: p.ink, w: FontWeight.w700)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // ── Search bar ───────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                height: 40,
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: p.line),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 10),
                    Icon(Icons.search_rounded, color: p.ink2, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _searchCtrl,
                        onChanged: (v) => setState(() => _query = v.trim()),
                        style: QT.body(13, c: p.ink),
                        decoration: InputDecoration(
                          hintText: S.searchCast,
                          hintStyle: QT.body(13, c: p.ink3),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ),
                    if (_query.isNotEmpty)
                      GestureDetector(
                        onTap: () {
                          _searchCtrl.clear();
                          setState(() => _query = '');
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          child: Icon(Icons.close_rounded,
                              color: p.ink2, size: 16),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            // ── Region chips ─────────────────────────────────────
            SizedBox(
              height: 34,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _chips.length,
                separatorBuilder: (_, i) => const SizedBox(width: 8),
                itemBuilder: (_, i) => GestureDetector(
                  onTap: () => _selectRegion(i),
                  child: QzChip(_chips[i], active: i == _regionIdx),
                ),
              ),
            ),
            const SizedBox(height: 14),
            // ── Grid ─────────────────────────────────────────────
            Expanded(
              child: _buildBody(p),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(QzPalette p) {
    if (_loading) return _CastShimmer();

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(_error!, style: QT.body(12, c: p.ink3),
              textAlign: TextAlign.center),
        ),
      );
    }

    final members = _filtered;

    if (members.isEmpty) {
      return Center(
        child: Text(
          _query.isEmpty ? S.comingSoon : S.noResults,
          style: QT.body(14, c: p.ink3),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 14,
        crossAxisSpacing: 10,
        childAspectRatio: 0.62,
      ),
      itemCount: members.length,
      itemBuilder: (ctx, i) => _CastCard(
        member: members[i],
        onTap: () => Navigator.of(ctx).push(
          MaterialPageRoute(
            builder: (_) => CastProfileScreen(member: members[i]),
          ),
        ),
      ),
    );
  }
}

class _CastCard extends StatelessWidget {
  final CastMember member;
  final VoidCallback onTap;
  const _CastCard({required this.member, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final label = member.hangul.isNotEmpty ? member.hangul[0] : member.name[0];
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          QzPhoto(
            hue: member.hue,
            label: label,
            photoUrl: member.photoUrl,
            width: double.infinity,
            height: 120,
            borderRadius: 14,
          ),
          const SizedBox(height: 6),
          Text(
            member.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: QT.display(12, c: context.qp.ink, w: FontWeight.w600),
          ),
          const SizedBox(height: 1),
          Text(
            member.role,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: QT.body(10, c: context.qp.ink2),
          ),
        ],
      ),
    );
  }
}

class _CastShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 14,
        crossAxisSpacing: 10,
        childAspectRatio: 0.62,
      ),
      itemCount: 9,
      itemBuilder: (_, i) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 120,
            decoration: BoxDecoration(
              color: p.card,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          const SizedBox(height: 6),
          Container(width: 70, height: 12, color: p.card),
          const SizedBox(height: 4),
          Container(width: 45, height: 10, color: p.card),
        ],
      ),
    );
  }
}
