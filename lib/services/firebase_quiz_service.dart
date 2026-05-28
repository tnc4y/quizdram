import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/models.dart';
import '../lang.dart';
import 'quiz_service.dart';

// ── Internal data holders ─────────────────────────────────────

class _Drama {
  final String id, title, titleEn, titleKo, region, genre;
  final int year, episodes;
  _Drama({
    required this.id,
    required this.title,
    required this.titleEn,
    required this.titleKo,
    required this.region,
    required this.genre,
    required this.year,
    required this.episodes,
  });
  String get displayTitle {
    if (appLang.value == 'ko') return titleKo.isNotEmpty ? titleKo : title;
    return titleEn.isNotEmpty ? titleEn : title;
  }
}

class _Cast {
  final String id, name, nameKo;
  final String? photoUrl;
  final List<String> dramaIds;
  _Cast({
    required this.id,
    required this.name,
    required this.nameKo,
    this.photoUrl,
    required this.dramaIds,
  });
  String get displayName => appLang.value == 'ko' && nameKo.isNotEmpty ? nameKo : name;
}

const _letters = ['a', 'b', 'c', 'd'];

// ── Service ───────────────────────────────────────────────────

class FirebaseQuizService implements QuizService {
  final _db = FirebaseFirestore.instance;

  // ── Pack list ─────────────────────────────────────────────────

  @override
  Future<List<QuizPackInfo>> getPacks() async {
    // orderBy kaldırıldı — composite index gerektirmesin; client-side sort
    final results = await Future.wait<QuerySnapshot<Map<String, dynamic>>>([
      _db
          .collection('quizPacks')
          .where('status', isEqualTo: 'published')
          .get(),
      _db.collection('dramas').get(),
    ]);
    final packsSnap = results[0];
    final dramasSnap = results[1];

    final dramaMap = Map.fromEntries(
      dramasSnap.docs.map((d) {
        final data = d.data();
        final title = (data['titleEn'] as String?)?.isNotEmpty == true
            ? data['titleEn']!
            : (data['titleKo'] as String? ?? data['title'] as String? ?? '');
        return MapEntry(d.id, title);
      }),
    );

    // En yeni paketler önce — client-side sort
    final sortedDocs = packsSnap.docs.toList()
      ..sort((a, b) {
        final aTs = a.data()['createdAt'] as Timestamp?;
        final bTs = b.data()['createdAt'] as Timestamp?;
        if (aTs == null && bTs == null) return 0;
        if (aTs == null) return 1;
        if (bTs == null) return -1;
        return bTs.compareTo(aTs);
      });

    return sortedDocs.map((d) {
      final data = d.data();
      final questions = data['questions'] as List? ?? [];
      return QuizPackInfo(
        id: d.id,
        title: data['title'] as String? ?? '',
        difficulty: data['difficulty'] as String? ?? 'medium',
        region: data['region'] as String? ?? 'kr',
        questionCount: questions.length,
        playCount: data['playCount'] as int? ?? 0,
        coverUrl: data['coverUrl'] as String?,
        dramaTitle: dramaMap[data['dramaId'] as String? ?? ''],
        quizType: data['quizType'] as String?,
      );
    }).toList();
  }

  // ── Questions for a specific pack ────────────────────────────

  @override
  Future<List<QuizQuestion>> getQuestionsForPack(String packId) async {
    final doc = await _db.collection('quizPacks').doc(packId).get();
    if (!doc.exists) return [];
    return _resolvePackData(doc.data()!);
  }

  // ── Most-recent published pack (home hero) ────────────────────

  @override
  Future<List<QuizQuestion>> getQuestions() async {
    // orderBy kaldırıldı; en yeni paketi client-side seçiyoruz
    final packSnap = await _db
        .collection('quizPacks')
        .where('status', isEqualTo: 'published')
        .limit(10)
        .get();

    if (packSnap.docs.isEmpty) return [];

    final newest = packSnap.docs.reduce((a, b) {
      final aTs = a.data()['createdAt'] as Timestamp?;
      final bTs = b.data()['createdAt'] as Timestamp?;
      if (aTs == null) return b;
      if (bTs == null) return a;
      return aTs.compareTo(bTs) >= 0 ? a : b;
    });

    return _resolvePackData(newest.data());
  }

  // ── Shared resolver ───────────────────────────────────────────

  Future<List<QuizQuestion>> _resolvePackData(
      Map<String, dynamic> packData) async {
    final rawList = (packData['questions'] as List<dynamic>? ?? [])
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList()
      ..sort((a, b) =>
          (a['order'] as int? ?? 0).compareTo(b['order'] as int? ?? 0));

    if (rawList.isEmpty) return [];

    final results = await Future.wait([
      _db
          .collection('dramas')
          .where('status', isEqualTo: 'published')
          .limit(30)
          .get(),
      _db.collection('cast').limit(30).get(),
    ]);

    final dramaPool = results[0].docs.map(_dramaFromQueryDoc).toList();
    final castPool = results[1].docs.map(_castFromQueryDoc).toList();

    final resolved = await Future.wait(
      rawList.map((r) => _resolve(r, dramaPool, castPool)),
    );

    return resolved.whereType<QuizQuestion>().toList();
  }

  Future<QuizQuestion?> _resolve(
    Map<String, dynamic> raw,
    List<_Drama> dramaPool,
    List<_Cast> castPool,
  ) async {
    try {
      switch (raw['type'] as String? ?? 'custom') {
        case 'custom':
          return _resolveCustom(raw);
        case 'audio':
          return _resolveAudio(raw);
        case 'template':
          return _resolveTemplate(raw, dramaPool, castPool);
        case 'group_template':
          return _resolveGroupTemplate(raw, dramaPool, castPool);
        default:
          return null;
      }
    } catch (_) {
      return null;
    }
  }

  // ── Custom ────────────────────────────────────────────────────

  QuizQuestion? _resolveCustom(Map<String, dynamic> raw) {
    final text = _localText(raw);
    if (text.isEmpty) return null;

    final rawOpts = _rawOpts(raw);
    final correctId = raw['correctId'] as String?;

    final opts = rawOpts.map((o) {
      final id = o['id'] as String? ?? '';
      final optText = _localOptText(o);
      final optSub = _localOptSub(o);
      final isCorrect = correctId != null ? id == correctId : o['correct'] as bool? ?? false;
      return QuizOpt(id, optText, optSub, isCorrect, imageUrl: o['imageUrl'] as String?);
    }).toList();

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: text,
      imageUrl: raw['imageUrl'] as String?,
      options: opts,
      optionStyle: _parseStyle(raw['optionStyle'] as String?),
      hint: raw['hint'] as String?,
    );
  }

  // ── Audio ─────────────────────────────────────────────────────

  QuizQuestion? _resolveAudio(Map<String, dynamic> raw) {
    final audioUrl = raw['audioUrl'] as String?;
    if (audioUrl == null || audioUrl.isEmpty) return null;

    final text = _localText(raw).isNotEmpty
        ? _localText(raw)
        : t('Bu sesi dinle ve yanıtla:', 'Listen and answer:', '들어보고 답하세요:');

    final rawOpts = _rawOpts(raw);
    final correctId = raw['correctId'] as String?;

    final opts = rawOpts.map((o) {
      final id = o['id'] as String? ?? '';
      final isCorrect = correctId != null ? id == correctId : o['correct'] as bool? ?? false;
      return QuizOpt(id, _localOptText(o), _localOptSub(o), isCorrect,
          imageUrl: o['imageUrl'] as String?);
    }).toList();

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: text,
      audioUrl: audioUrl,
      options: opts,
      optionStyle: _parseStyle(raw['optionStyle'] as String?),
      hint: raw['hint'] as String?,
    );
  }

  // ── Template ──────────────────────────────────────────────────

  Future<QuizQuestion?> _resolveTemplate(
    Map<String, dynamic> raw,
    List<_Drama> dramaPool,
    List<_Cast> castPool,
  ) async {
    final key = raw['templateKey'] as String? ?? '';
    final params = Map<String, dynamic>.from(raw['params'] as Map? ?? {});

    switch (key) {
      case 'cast_photo_who_is_this':
        return _tmplCastPhoto(raw, params, castPool);
      case 'which_drama_for_character':
        return _tmplWhichDramaForCast(raw, params, dramaPool, castPool);
      case 'which_character_in_drama':
        return _tmplWhichCastInDrama(raw, params, castPool);
      case 'drama_release_year':
        return _tmplDramaYear(raw, params, dramaPool);
      case 'which_region_is_drama':
        return _tmplDramaRegion(raw, params, dramaPool);
      case 'how_many_episodes':
        return _tmplHowManyEps(raw, params, dramaPool);
      case 'drama_genre':
        return _tmplDramaGenre(raw, params, dramaPool);
      default:
        return null;
    }
  }

  // ── Group template ────────────────────────────────────────────

  Future<QuizQuestion?> _resolveGroupTemplate(
    Map<String, dynamic> raw,
    List<_Drama> dramaPool,
    List<_Cast> castPool,
  ) async {
    final params = Map<String, dynamic>.from(raw['params'] as Map? ?? {});
    final groupId = params['groupId'] as String?;
    if (groupId == null) return null;

    final groupDoc = await _db.collection('quizGroups').doc(groupId).get();
    if (!groupDoc.exists) return null;

    final groupData = groupDoc.data()!;
    final itemIds = List<String>.from(groupData['itemIds'] as List? ?? []);
    if (itemIds.isEmpty) return null;

    itemIds.shuffle();
    final pickedId = itemIds.first;
    final groupType = groupData['type'] as String? ?? 'drama';

    final resolvedParams =
        groupType == 'cast' ? {'castId': pickedId} : {'dramaId': pickedId};

    final syntheticRaw = Map<String, dynamic>.from(raw)
      ..['params'] = resolvedParams;

    return _resolveTemplate(syntheticRaw, dramaPool, castPool);
  }

  // ── Template implementations ──────────────────────────────────

  Future<QuizQuestion?> _tmplCastPhoto(
    Map<String, dynamic> raw,
    Map<String, dynamic> params,
    List<_Cast> castPool,
  ) async {
    final castId = params['castId'] as String?;
    if (castId == null) return null;

    final doc = await _db.collection('cast').doc(castId).get();
    if (!doc.exists || doc.data() == null) return null;
    final cast = _parseCast(doc.id, doc.data()!);
    if (cast.photoUrl == null) return null;

    final wrong = castPool
        .where((c) => c.id != castId)
        .take(3)
        .map((c) => c.displayName)
        .toList();
    if (wrong.length < 3) return null;

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: t('Bu oyuncu kim?', 'Who is this actor?', '이 배우는 누구인가요?'),
      imageUrl: cast.photoUrl,
      options: _buildOpts(cast.displayName, '', wrong),
      hint: raw['hint'] as String?,
    );
  }

  Future<QuizQuestion?> _tmplWhichDramaForCast(
    Map<String, dynamic> raw,
    Map<String, dynamic> params,
    List<_Drama> dramaPool,
    List<_Cast> castPool,
  ) async {
    final castId = params['castId'] as String?;
    if (castId == null) return null;

    final castDoc = await _db.collection('cast').doc(castId).get();
    if (!castDoc.exists || castDoc.data() == null) return null;
    final cast = _parseCast(castDoc.id, castDoc.data()!);
    if (cast.dramaIds.isEmpty) return null;

    final dramaDoc =
        await _db.collection('dramas').doc(cast.dramaIds.first).get();
    if (!dramaDoc.exists || dramaDoc.data() == null) return null;
    final drama = _parseDrama(dramaDoc.id, dramaDoc.data()!);

    final wrong = dramaPool
        .where((d) => !cast.dramaIds.contains(d.id))
        .take(3)
        .map((d) => d.displayTitle)
        .toList();
    if (wrong.length < 3) return null;

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: t(
        '${cast.displayName} hangi dizide oynadı?',
        'Which drama did ${cast.displayName} star in?',
        '${cast.displayName}이(가) 출연한 드라마는?',
      ),
      imageUrl: cast.photoUrl,
      options: _buildOpts(drama.displayTitle, '', wrong),
      hint: raw['hint'] as String?,
    );
  }

  Future<QuizQuestion?> _tmplWhichCastInDrama(
    Map<String, dynamic> raw,
    Map<String, dynamic> params,
    List<_Cast> castPool,
  ) async {
    final dramaId = params['dramaId'] as String?;
    if (dramaId == null) return null;

    final dramaDoc = await _db.collection('dramas').doc(dramaId).get();
    if (!dramaDoc.exists || dramaDoc.data() == null) return null;
    final drama = _parseDrama(dramaDoc.id, dramaDoc.data()!);

    final castSnap = await _db
        .collection('cast')
        .where('dramaIds', arrayContains: dramaId)
        .limit(1)
        .get();
    if (castSnap.docs.isEmpty) return null;
    final correctCast = _castFromQueryDoc(castSnap.docs.first);

    final wrong = castPool
        .where((c) => c.id != correctCast.id)
        .take(3)
        .map((c) => c.displayName)
        .toList();
    if (wrong.length < 3) return null;

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: t(
        '"${drama.displayTitle}" dizisinde kim oynuyor?',
        'Who stars in "${drama.displayTitle}"?',
        '"${drama.displayTitle}"에 누가 출연하나요?',
      ),
      options: _buildOpts(correctCast.displayName, '', wrong),
      hint: raw['hint'] as String?,
    );
  }

  Future<QuizQuestion?> _tmplDramaYear(
    Map<String, dynamic> raw,
    Map<String, dynamic> params,
    List<_Drama> dramaPool,
  ) async {
    final dramaId = params['dramaId'] as String?;
    if (dramaId == null) return null;

    final doc = await _db.collection('dramas').doc(dramaId).get();
    if (!doc.exists || doc.data() == null) return null;
    final drama = _parseDrama(doc.id, doc.data()!);

    final wrongYears = dramaPool
        .map((d) => d.year)
        .where((y) => y > 0 && y != drama.year)
        .toSet()
        .take(3)
        .map((y) => y.toString())
        .toList();
    if (wrongYears.length < 3) return null;

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: t(
        '"${drama.displayTitle}" ne zaman yayınlandı?',
        'When did "${drama.displayTitle}" premiere?',
        '"${drama.displayTitle}"은(는) 언제 방영되었나요?',
      ),
      options: _buildOpts(drama.year.toString(), '', wrongYears),
      hint: raw['hint'] as String?,
    );
  }

  Future<QuizQuestion?> _tmplDramaRegion(
    Map<String, dynamic> raw,
    Map<String, dynamic> params,
    List<_Drama> dramaPool,
  ) async {
    final dramaId = params['dramaId'] as String?;
    if (dramaId == null) return null;

    final doc = await _db.collection('dramas').doc(dramaId).get();
    if (!doc.exists || doc.data() == null) return null;
    final drama = _parseDrama(doc.id, doc.data()!);

    const regions = {
      'kr': '🇰🇷 Korea',
      'cn': '🇨🇳 China',
      'jp': '🇯🇵 Japan',
      'th': '🇹🇭 Thailand',
    };
    final correctLabel = regions[drama.region] ?? drama.region;
    final wrong = regions.entries
        .where((e) => e.key != drama.region)
        .map((e) => e.value)
        .take(3)
        .toList();
    if (wrong.length < 3) return null;

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: t(
        '"${drama.displayTitle}" hangi ülkeden?',
        'Where is "${drama.displayTitle}" from?',
        '"${drama.displayTitle}"은(는) 어느 나라 드라마인가요?',
      ),
      options: _buildOpts(correctLabel, '', wrong),
      hint: raw['hint'] as String?,
    );
  }

  Future<QuizQuestion?> _tmplHowManyEps(
    Map<String, dynamic> raw,
    Map<String, dynamic> params,
    List<_Drama> dramaPool,
  ) async {
    final dramaId = params['dramaId'] as String?;
    if (dramaId == null) return null;

    final doc = await _db.collection('dramas').doc(dramaId).get();
    if (!doc.exists || doc.data() == null) return null;
    final drama = _parseDrama(doc.id, doc.data()!);

    final wrong = dramaPool
        .map((d) => d.episodes)
        .where((e) => e > 0 && e != drama.episodes)
        .toSet()
        .take(3)
        .map((e) => e.toString())
        .toList();
    if (wrong.length < 3) return null;

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: t(
        '"${drama.displayTitle}" kaç bölüm?',
        'How many episodes does "${drama.displayTitle}" have?',
        '"${drama.displayTitle}" 몇 부작인가요?',
      ),
      options: _buildOpts(drama.episodes.toString(), '', wrong),
      hint: raw['hint'] as String?,
    );
  }

  Future<QuizQuestion?> _tmplDramaGenre(
    Map<String, dynamic> raw,
    Map<String, dynamic> params,
    List<_Drama> dramaPool,
  ) async {
    final dramaId = params['dramaId'] as String?;
    if (dramaId == null) return null;

    final doc = await _db.collection('dramas').doc(dramaId).get();
    if (!doc.exists || doc.data() == null) return null;
    final drama = _parseDrama(doc.id, doc.data()!);
    if (drama.genre.isEmpty) return null;

    final wrong = dramaPool
        .map((d) => d.genre)
        .where((g) => g.isNotEmpty && g != drama.genre)
        .toSet()
        .take(3)
        .toList();
    if (wrong.length < 3) return null;

    return QuizQuestion(
      id: raw['id'] as String? ?? '',
      text: t(
        '"${drama.displayTitle}" hangi türde?',
        'What genre is "${drama.displayTitle}"?',
        '"${drama.displayTitle}"의 장르는 무엇인가요?',
      ),
      options: _buildOpts(drama.genre, '', wrong),
      hint: raw['hint'] as String?,
    );
  }

  // ── Option builder ────────────────────────────────────────────

  List<QuizOpt> _buildOpts(
    String correctText,
    String correctSub,
    List<String> wrongTexts,
  ) {
    final all = <Map<String, dynamic>>[
      {'text': correctText, 'sub': correctSub, 'correct': true},
      ...wrongTexts.map((w) => {'text': w, 'sub': '', 'correct': false}),
    ]..shuffle();

    return all.asMap().entries.map((e) {
      return QuizOpt(
        _letters[e.key % _letters.length],
        e.value['text'] as String,
        e.value['sub'] as String,
        e.value['correct'] as bool,
      );
    }).toList();
  }

  // ── Parsers ───────────────────────────────────────────────────

  _Drama _dramaFromQueryDoc(QueryDocumentSnapshot<Map<String, dynamic>> doc) =>
      _parseDrama(doc.id, doc.data());

  _Cast _castFromQueryDoc(QueryDocumentSnapshot<Map<String, dynamic>> doc) =>
      _parseCast(doc.id, doc.data());

  _Drama _parseDrama(String id, Map<String, dynamic> d) {
    final genres = d['genres'] as List?;
    return _Drama(
      id: id,
      title: d['title'] as String? ?? '',
      titleEn: d['titleEn'] as String? ?? '',
      titleKo: d['titleKo'] as String? ?? '',
      region: d['region'] as String? ?? 'kr',
      genre: (genres?.isNotEmpty == true ? genres!.first : d['genre'])
              as String? ??
          '',
      year: d['year'] as int? ?? 0,
      episodes: d['episodes'] as int? ?? 0,
    );
  }

  _Cast _parseCast(String id, Map<String, dynamic> d) {
    return _Cast(
      id: id,
      name: d['name'] as String? ?? '',
      nameKo: d['nameKo'] as String? ?? '',
      photoUrl: d['photoUrl'] as String?,
      dramaIds: List<String>.from(d['dramaIds'] as List? ?? []),
    );
  }

  // ── Lang helpers ──────────────────────────────────────────────

  String _localText(Map<String, dynamic> raw) {
    final tr = raw['translations'] as Map<String, dynamic>? ?? {};
    final lang = tr[appLang.value] as Map<String, dynamic>?
        ?? tr['en'] as Map<String, dynamic>?
        ?? tr['tr'] as Map<String, dynamic>?;
    return lang?['text'] as String? ?? raw['text'] as String? ?? '';
  }

  String _localOptText(Map<String, dynamic> o) {
    final tr = o['translations'] as Map<String, dynamic>?;
    final lang = tr?[appLang.value] as Map<String, dynamic>?
        ?? tr?['en'] as Map<String, dynamic>?;
    return lang?['text'] as String? ?? o['text'] as String? ?? '';
  }

  String _localOptSub(Map<String, dynamic> o) {
    final tr = o['translations'] as Map<String, dynamic>?;
    final lang = tr?[appLang.value] as Map<String, dynamic>?
        ?? tr?['en'] as Map<String, dynamic>?;
    return lang?['sub'] as String? ?? o['sub'] as String? ?? '';
  }

  List<Map<String, dynamic>> _rawOpts(Map<String, dynamic> raw) =>
      (raw['options'] as List<dynamic>? ?? [])
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();

  OptionStyle _parseStyle(String? s) {
    switch (s) {
      case 'poster':
        return OptionStyle.poster;
      case 'text+image':
        return OptionStyle.textImage;
      default:
        return OptionStyle.text;
    }
  }

  // ── Submit ────────────────────────────────────────────────────

  @override
  Future<int> submitResult({
    required int correct,
    required int total,
    required int elapsedSeconds,
  }) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    final xp = _calcXp(correct, total, elapsedSeconds);

    final batch = _db.batch();
    batch.set(_db.collection('results').doc(), {
      'uid': uid,
      'correct': correct,
      'total': total,
      'elapsedSeconds': elapsedSeconds,
      'xp': xp,
      'createdAt': FieldValue.serverTimestamp(),
    });

    if (uid != null) {
      final userRef = _db.collection('users').doc(uid);
      final userSnap = await userRef.get();
      final d = userSnap.data() ?? {};

      final currentXp = (d['xp'] as num?)?.toInt() ?? 0;
      final newTotalXp = currentXp + xp;
      final newLevel = _levelFromXp(newTotalXp);

      // Accuracy: rolling weighted average (quizzesPlayed * accuracy + correct%) / (quizzesPlayed+1)
      final played = (d['quizzesPlayed'] as num?)?.toInt() ?? 0;
      final oldAcc = (d['accuracy'] as num?)?.toInt() ?? 0;
      final newAcc = total > 0
          ? ((oldAcc * played + (correct * 100 ~/ total)) ~/ (played + 1))
          : oldAcc;

      // Streak calculation
      final lastPlayed = d['lastPlayedAt'] as Timestamp?;
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      int newStreak = (d['streak'] as num?)?.toInt() ?? 0;
      if (lastPlayed != null) {
        final lastDate = lastPlayed.toDate();
        final lastDay = DateTime(lastDate.year, lastDate.month, lastDate.day);
        final diff = today.difference(lastDay).inDays;
        if (diff == 0) {
          // Already played today — streak unchanged
        } else if (diff == 1) {
          newStreak++; // Consecutive day
        } else {
          newStreak = 1; // Streak broken
        }
      } else {
        newStreak = 1; // First play
      }

      batch.set(
        userRef,
        {
          'xp': newTotalXp,
          'level': newLevel,
          'quizzesPlayed': played + 1,
          'accuracy': newAcc,
          'streak': newStreak,
          'lastPlayedAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    }

    await batch.commit();
    return xp;
  }

  static int _xpForLevel(int level) {
    if (level <= 1) return 0;
    final n = level - 1;
    return 1000 * n * (n + 1) ~/ 2;
  }

  static int _levelFromXp(int xp) {
    int level = 1;
    while (_xpForLevel(level + 1) <= xp) {
      level++;
    }
    return level;
  }

  int _calcXp(int correct, int total, int elapsed) {
    if (correct == 0) return 0;
    final base = correct * 250;
    final speedBonus = elapsed < 30 ? 500 : elapsed < 60 ? 250 : 0;
    return base + speedBonus;
  }
}
