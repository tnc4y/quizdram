import '../models/models.dart';

/// Abstract contract for magazine / news content.
abstract class NewsService {
  /// Latest stories, optionally filtered by [category].
  Future<List<NewsItem>> getNews({String? category});
}
