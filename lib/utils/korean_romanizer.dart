/// Revised Romanization of Korean (국어의 로마자 표기법) — simplified for names.
/// Converts composed Hangul syllables (U+AC00–U+D7A3) to Latin.
/// Non-Hangul characters pass through unchanged.
abstract class KoreanRomanizer {
  // 초성 — 19 initial consonants
  static const _initials = [
    'g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp',
    's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h',
  ];

  // 중성 — 21 vowels
  static const _vowels = [
    'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o',
    'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu',
    'eu', 'ui', 'i',
  ];

  // 종성 — 28 final consonant slots (index 0 = no final)
  static const _finals = [
    '',   'k',  'k',  'k',  'n',  'n',  'n',  't',
    'l',  'k',  'm',  'l',  'l',  'l',  'p',  'l',
    'm',  'p',  'p',  't',  't',  'ng', 't',  't',
    'k',  't',  'p',  't',
  ];

  /// Returns true if [s] contains at least one composed Hangul syllable.
  static bool hasHangul(String s) =>
      s.runes.any((r) => r >= 0xAC00 && r <= 0xD7A3);

  /// Romanizes [text], capitalising the first letter of each space-separated
  /// word.  Non-Hangul characters (spaces, Latin letters, digits) pass through.
  static String romanize(String text) {
    final words = text.split(' ');
    final romanized = words.map(_romanizeWord).join(' ');
    return romanized;
  }

  static String _romanizeWord(String word) {
    final buf = StringBuffer();
    for (final rune in word.runes) {
      if (rune >= 0xAC00 && rune <= 0xD7A3) {
        final syllable = rune - 0xAC00;
        final fi = syllable % 28;
        final vi = (syllable ~/ 28) % 21;
        final ii = syllable ~/ (28 * 21);
        buf.write(_initials[ii]);
        buf.write(_vowels[vi]);
        buf.write(_finals[fi]);
      } else {
        buf.writeCharCode(rune);
      }
    }
    final s = buf.toString();
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }
}
