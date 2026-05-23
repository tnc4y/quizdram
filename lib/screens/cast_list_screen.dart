import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/models.dart';
import '../lang.dart';
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

  late Future<List<CastMember>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<CastMember>> _load() {
    final region = _regions[_regionIdx] == 'all' ? null : _regions[_regionIdx];
    return sl.cast.getCast(region: region, limit: 30);
  }

  void _selectRegion(int i) {
    setState(() {
      _regionIdx = i;
      _future = _load();
    });
  }

  List<String> get _chips => [S.all, '🇰🇷 K-Drama', '🇨🇳 C-Drama', '🇯🇵 J-Drama', '🇹🇭 Thai'];

  @override
  Widget build(BuildContext context) {
    return Material(
      color: context.qp.bg,
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: Text(S.tabCast,
                  style: QT.display(26, c: context.qp.ink, w: FontWeight.w700)),
            ),
            const SizedBox(height: 14),
            SizedBox(
              height: 36,
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
            Expanded(
              child: FutureBuilder<List<CastMember>>(
                future: _future,
                builder: (context, snap) {
                  if (snap.connectionState == ConnectionState.waiting) {
                    return _CastShimmer();
                  }
                  final members = snap.data ?? [];
                  if (members.isEmpty) {
                    return Center(
                      child: Text(S.comingSoon,
                          style: QT.body(14, c: context.qp.ink3)),
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
                    itemBuilder: (_, i) => _CastCard(
                      member: members[i],
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => CastProfileScreen(member: members[i]),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
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
