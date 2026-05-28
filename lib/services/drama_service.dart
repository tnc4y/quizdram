import '../models/models.dart';

abstract class DramaService {
  Future<List<Drama>> getTrending({int limit = 6});
  Future<List<Drama>> getDramasByIds(List<String> ids);
  Future<List<Drama>> getAll({String? region, int limit = 60});
}
