import '../models/models.dart';

abstract class CastService {
  Future<List<CastMember>> getCast({String? region, int limit = 30});
}
