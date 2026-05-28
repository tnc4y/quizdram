import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/models.dart';
import '../lang.dart';
import '../utils/korean_romanizer.dart';
import '../widgets/qz_photo.dart';
import '../services/service_locator.dart';
import 'cast_profile_screen.dart';
import 'drama_detail_screen.dart';
import 'news_detail_screen.dart';

enum _Tab { cast, drama, news }

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  _Tab _tab = _Tab.drama;
  String _query = '';
  final _ctrl = TextEditingController();

  // data caches
  late Future<List<CastMember>> _castFuture;
  late Future<List<Drama>> _dramaFuture;
  late Future<List<NewsItem>> _newsFuture;

  @override
  void initState() {
    super.initState();
    _castFuture = sl.cast.getCast(limit: 500);
    _dramaFuture = sl.drama.getAll(limit: 60);
    _newsFuture = sl.news.getNews();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  List<CastMember> _filterCast(List<CastMember> all) {
    if (_query.isEmpty) {
      return [...all]..sort((a, b) =>
          (b.popularity ?? -1).compareTo(a.popularity ?? -1));
    }
    final q = _query.toLowerCase();
    return all.where((m) {
      if (m.name.toLowerCase().contains(q)) return true;
      if (m.hangul.toLowerCase().contains(q)) return true;
      if (KoreanRomanizer.hasHangul(m.hangul) &&
          KoreanRomanizer.romanize(m.hangul).toLowerCase().contains(q)) {
        return true;
      }
      return false;
    }).toList()
      ..sort((a, b) => (b.popularity ?? -1).compareTo(a.popularity ?? -1));
  }

  List<Drama> _filterDramas(List<Drama> all) {
    if (_query.isEmpty) return all;
    final q = _query.toLowerCase();
    return all.where((d) {
      if (d.title.toLowerCase().contains(q)) return true;
      if (d.hangul.toLowerCase().contains(q)) return true;
      if (d.genre.toLowerCase().contains(q)) return true;
      return false;
    }).toList();
  }

  List<NewsItem> _filterNews(List<NewsItem> all) {
    if (_query.isEmpty) return all;
    final q = _query.toLowerCase();
    return all.where((n) {
      if (n.headline.toLowerCase().contains(q)) return true;
      if (n.tag.toLowerCase().contains(q)) return true;
      if (n.source.toLowerCase().contains(q)) return true;
      return false;
    }).toList();
  }

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
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Padding(
                      padding: const EdgeInsets.only(right: 10),
                      child: Icon(Icons.arrow_back_rounded,
                          color: p.ink, size: 22),
                    ),
                  ),
                  Text(t('Arama', 'Search', '검색'),
                      style: QT.display(26, c: p.ink, w: FontWeight.w700)),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // ── Search bar ───────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                height: 42,
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: p.line),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 10),
                    Icon(Icons.search_rounded, color: p.ink2, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _ctrl,
                        autofocus: false,
                        onChanged: (v) => setState(() => _query = v.trim()),
                        style: QT.body(13, c: p.ink),
                        decoration: InputDecoration(
                          hintText: t(
                            'Dizi, oyuncu, haber ara…',
                            'Search drama, actor, news…',
                            '드라마, 배우, 뉴스 검색…',
                          ),
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
                          _ctrl.clear();
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
            const SizedBox(height: 14),

            // ── Tab row ──────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  _TabChip(
                    label: t('Dramalar', 'Dramas', '드라마'),
                    active: _tab == _Tab.drama,
                    onTap: () => setState(() => _tab = _Tab.drama),
                  ),
                  const SizedBox(width: 8),
                  _TabChip(
                    label: t('Oyuncular', 'Actors', '배우'),
                    active: _tab == _Tab.cast,
                    onTap: () => setState(() => _tab = _Tab.cast),
                  ),
                  const SizedBox(width: 8),
                  _TabChip(
                    label: t('Haberler', 'News', '뉴스'),
                    active: _tab == _Tab.news,
                    onTap: () => setState(() => _tab = _Tab.news),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // ── Content ──────────────────────────────────────────
            Expanded(child: _buildContent(p)),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(QzPalette p) {
    switch (_tab) {
      case _Tab.drama:
        return FutureBuilder<List<Drama>>(
          future: _dramaFuture,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return _DramaShimmer();
            }
            if (snap.hasError) {
              return _ErrorState(
                message: snap.error.toString(),
                onRetry: () => setState(() {
                  _dramaFuture = sl.drama.getAll(limit: 60);
                }),
              );
            }
            final dramas = _filterDramas(snap.data ?? []);
            if (dramas.isEmpty) {
              return _EmptyState(
                  label: t('Drama bulunamadı', 'No dramas found', '드라마 없음'));
            }
            return GridView.builder(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 14,
                crossAxisSpacing: 10,
                childAspectRatio: 0.58,
              ),
              itemCount: dramas.length,
              itemBuilder: (ctx, i) {
                final d = dramas[i];
                return GestureDetector(
                  onTap: () => Navigator.push(ctx,
                      MaterialPageRoute(
                          builder: (_) => DramaDetailScreen(drama: d))),
                  child: _DramaCard(drama: d),
                );
              },
            );
          },
        );

      case _Tab.cast:
        return FutureBuilder<List<CastMember>>(
          future: _castFuture,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return _CastShimmer();
            }
            if (snap.hasError) {
              return _ErrorState(
                message: snap.error.toString(),
                onRetry: () => setState(() {
                  _castFuture = sl.cast.getCast(limit: 500);
                }),
              );
            }
            final members = _filterCast(snap.data ?? []);
            if (members.isEmpty) {
              return _EmptyState(
                  label: t('Oyuncu bulunamadı', 'No actors found', '배우 없음'));
            }
            return GridView.builder(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 14,
                crossAxisSpacing: 10,
                childAspectRatio: 0.62,
              ),
              itemCount: members.length,
              itemBuilder: (ctx, i) {
                final m = members[i];
                final label = m.hangul.isNotEmpty
                    ? m.hangul[0]
                    : m.name[0];
                return GestureDetector(
                  onTap: () => Navigator.push(ctx,
                      MaterialPageRoute(
                          builder: (_) => CastProfileScreen(member: m))),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      QzPhoto(
                        hue: m.hue,
                        label: label,
                        photoUrl: m.photoUrl,
                        width: double.infinity,
                        height: 120,
                        borderRadius: 14,
                      ),
                      const SizedBox(height: 6),
                      Text(m.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: QT.display(12, c: context.qp.ink,
                              w: FontWeight.w600)),
                      const SizedBox(height: 1),
                      Text(m.role,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: QT.body(10, c: context.qp.ink2)),
                    ],
                  ),
                );
              },
            );
          },
        );

      case _Tab.news:
        return FutureBuilder<List<NewsItem>>(
          future: _newsFuture,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return _NewsShimmer();
            }
            if (snap.hasError) {
              return _ErrorState(
                message: snap.error.toString(),
                onRetry: () => setState(() {
                  _newsFuture = sl.news.getNews();
                }),
              );
            }
            final items = _filterNews(snap.data ?? []);
            if (items.isEmpty) {
              return _EmptyState(
                  label: t('Haber bulunamadı', 'No news found', '뉴스 없음'));
            }
            return ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final n = items[i];
                return GestureDetector(
                  onTap: () => Navigator.push(ctx,
                      MaterialPageRoute(
                          builder: (_) => NewsDetailScreen(news: n))),
                  child: _NewsRow(news: n),
                );
              },
            );
          },
        );
    }
  }
}

// ── Chips ─────────────────────────────────────────────────────────
class _TabChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _TabChip(
      {required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: active ? p.featured : p.card,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: active ? p.featured : p.line),
        ),
        child: Text(
          label,
          style: QT.body(12,
              c: active ? p.bg : p.ink2, w: FontWeight.w600),
        ),
      ),
    );
  }
}

// ── Drama card ────────────────────────────────────────────────────
class _DramaCard extends StatelessWidget {
  final Drama drama;
  const _DramaCard({required this.drama});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    final label = drama.hangul.isNotEmpty ? drama.hangul[0] : drama.title[0];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        QzPhoto(
          hue: drama.hue,
          label: drama.posterUrl != null ? '' : label,
          photoUrl: drama.posterUrl,
          width: double.infinity,
          height: 120,
          borderRadius: 14,
        ),
        const SizedBox(height: 6),
        Text(drama.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: QT.display(12, c: p.ink, w: FontWeight.w600)),
        const SizedBox(height: 1),
        Text('${drama.year} · ${drama.genre}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: QT.body(10, c: p.ink2)),
      ],
    );
  }
}

// ── News row ──────────────────────────────────────────────────────
class _NewsRow extends StatelessWidget {
  final NewsItem news;
  const _NewsRow({required this.news});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        QzPhoto(
          hue: news.hue,
          label: news.imageUrl != null ? '' : news.hangul,
          photoUrl: news.imageUrl,
          width: 88,
          height: 100,
          borderRadius: 14,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: news.tagBg,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(news.tag,
                    style:
                        QT.body(9, w: FontWeight.w700, c: news.tagFg, ls: 1)),
              ),
              const SizedBox(height: 6),
              Text(news.headline,
                  style: QT.display(13.5,
                      w: FontWeight.w600, h: 1.25, ls: -0.14),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis),
              const SizedBox(height: 6),
              Text('${news.source} · ${news.time}',
                  style: QT.body(10.5, c: p.ink2)),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Empty state ───────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  final String label;
  const _EmptyState({required this.label});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 200,
      child: Center(
        child: Text(label, style: QT.body(14, c: context.qp.ink3)),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return SizedBox(
      height: 260,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.wifi_off_rounded, color: p.ink3, size: 32),
              const SizedBox(height: 12),
              Text(
                t('Bağlantı hatası', 'Connection error', '연결 오류'),
                style: QT.display(14, c: p.ink, w: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Text(
                message,
                style: QT.body(11, c: p.ink3),
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: onRetry,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: p.featured,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    t('Tekrar dene', 'Retry', '다시 시도'),
                    style: QT.body(13, c: Colors.white, w: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Shimmer placeholders ──────────────────────────────────────────
class _DramaShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 14,
        crossAxisSpacing: 10,
        childAspectRatio: 0.58,
      ),
      itemCount: 9,
      itemBuilder: (_, _) => Column(
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

class _CastShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 14,
        crossAxisSpacing: 10,
        childAspectRatio: 0.62,
      ),
      itemCount: 9,
      itemBuilder: (_, _) => Column(
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

class _NewsShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = context.qp;
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
      itemCount: 5,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (_, _) => Row(
        children: [
          Container(
            width: 88, height: 100,
            decoration: BoxDecoration(
              color: p.card,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(width: 50, height: 16, color: p.card),
                const SizedBox(height: 8),
                Container(height: 14, color: p.card),
                const SizedBox(height: 4),
                Container(height: 14, color: p.card),
                const SizedBox(height: 6),
                Container(width: 80, height: 10, color: p.card),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
