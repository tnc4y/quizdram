// screens-light-3.jsx — Direction A continued: News, Rank, Profile

// ─────────────────────────────────────────────────────────────
// 07 · Magazine / News feed
// ─────────────────────────────────────────────────────────────
function LNews() {
  return (
    <LScreen pad={0}>
      <div style={{ padding: '6px 20px 0', height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: L.pink, fontSize: 18 }}>weekly</div>
            <LTitle size={28}>Magazin</LTitle>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: L.card, border: `1px solid ${L.line}`, display: 'grid', placeItems: 'center' }}>{QzIcons.search}</div>
          </div>
        </div>

        {/* category chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto' }}>
          <QzChip active>Tümü</QzChip>
          <QzChip>Trend</QzChip>
          <QzChip>Yeni dizi</QzChip>
          <QzChip>Dedikodu</QzChip>
          <QzChip>Röportaj</QzChip>
        </div>

        {/* Featured card */}
        <div style={{
          marginTop: 16, borderRadius: 20, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${L.pink} 0%, #ff8aa3 60%, ${L.gold} 100%)`,
          color: L.plum, height: 220,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(60deg, rgba(45,27,78,0.08) 0 12px, transparent 12px 24px)',
          }} />
          <div style={{
            position: 'absolute', top: -10, right: -8,
            fontFamily: 'var(--hangul)', fontSize: 110, fontWeight: 900,
            color: 'rgba(45,27,78,0.18)', lineHeight: 0.85,
          }}>특종</div>
          <div style={{ padding: 18, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 10, letterSpacing: 1, background: L.plum, color: L.bg, padding: '4px 8px', borderRadius: 999 }}>EXKLÜZİF</span>
              <span style={{ fontSize: 11, opacity: 0.7, alignSelf: 'center' }}>2 saat önce</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                "Lunar Tide" 2. sezonu Jeju'da çekiliyor — kadroda 2 yeni isim
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 11 }}>
                <div style={{ display: 'flex' }}>
                  {[L.plum, '#7c5ed3'].map((c, i) => (
                    <div key={i} style={{ width: 22, height: 22, borderRadius: 99, background: c, border: `2px solid ${L.pink}`, marginLeft: i ? -8 : 0 }} />
                  ))}
                </div>
                <span style={{ opacity: 0.8 }}>14.8K beğeni · 2.1K yorum</span>
              </div>
            </div>
          </div>
        </div>

        {/* News list */}
        <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
          {[
            { tag: 'YENİ', tagBg: L.gold, head: 'Phoenix Court kadrosu Cannes\'ta podyumda', src: 'C-Drama Today', t: '6s', c: L.gold, h: '风' },
            { tag: 'DEDIKODU', tagBg: L.pink, head: 'Bir K-pop idolü "Neon Seoul"un üçüncü sezonunda mı?', src: 'Seoul Beat', t: '1g', c: L.plum, h: '소문' },
            { tag: 'TRENDING', tagBg: L.plum, tagFg: L.bg, head: '"Tokyo at 5AM" finalinde sürpriz cameo', src: 'JP Drama Daily', t: '2g', c: '#7c5ed3', h: '東' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <QzPhoto hue={n.c} label={n.h} size="md" rounded={14} style={{ width: 88, height: 100 }} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 9, letterSpacing: 1, background: n.tagBg, color: n.tagFg || L.plum, padding: '3px 7px', borderRadius: 4 }}>{n.tag}</span>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 13.5, lineHeight: 1.25, letterSpacing: '-0.01em', marginTop: 6, textWrap: 'pretty' }}>{n.head}</div>
                </div>
                <div style={{ fontSize: 10.5, color: L.ink2, marginTop: 6 }}>{n.src} · {n.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <QzTabBar active="news" />
    </LScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 08 · Leaderboard
// ─────────────────────────────────────────────────────────────
function LRank() {
  return (
    <LScreen pad={0}>
      <div style={{ padding: '6px 20px 0', height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ marginTop: 4 }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: L.pink, fontSize: 18 }}>weekly</div>
          <LTitle size={28}>Liderlik</LTitle>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <QzChip active>Bu hafta</QzChip>
          <QzChip>Tüm zamanlar</QzChip>
          <QzChip>Arkadaşlar</QzChip>
        </div>

        {/* Podium */}
        <div style={{
          marginTop: 18, padding: '18px 12px 14px', borderRadius: 22,
          background: `linear-gradient(180deg, ${L.plum} 0%, #4a2d7c 100%)`,
          color: L.bg, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -12, right: -10,
            fontFamily: 'var(--hangul)', fontSize: 100, fontWeight: 900,
            color: L.pink, opacity: 0.25, lineHeight: 0.85,
          }}>1위</div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', position: 'relative', marginTop: 30 }}>
            {[
              { rank: 2, name: 'aoi.dorama', score: '23.1k', c: '#7c5ed3', h: '葵', country: '🇯🇵', size: 56 },
              { rank: 1, name: 'minji_92',   score: '24.8k', c: L.pink,   h: '민지', country: '🇰🇷', size: 72 },
              { rank: 3, name: 'wei.shu',    score: '22.9k', c: L.gold,   h: '魏', country: '🇨🇳', size: 56 },
            ].map((p, i) => (
              <div key={p.rank} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <QzPhoto hue={p.c} label={p.h} size="md" rounded={p.size / 2} style={{ width: p.size, height: p.size }} />
                  <div style={{
                    position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                    width: 22, height: 22, borderRadius: 99, background: p.rank === 1 ? L.gold : L.bg,
                    color: L.plum, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11,
                    display: 'grid', placeItems: 'center', border: `2px solid ${L.plum}`,
                  }}>{p.rank}</div>
                </div>
                <div style={{ marginTop: 12, fontFamily: 'var(--display)', fontWeight: 600, fontSize: 11.5 }}>{p.country} {p.name}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{p.score} XP</div>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
          {[
            { rank: 4, name: 'sen',        c: '🇹🇷', score: '21.4k', streak: 19, you: true },
            { rank: 5, name: 'phim.thai',  c: '🇹🇭', score: '19.0k', streak: 15 },
            { rank: 6, name: 'dramaqueen', c: '🇺🇸', score: '18.0k', streak: 12 },
            { rank: 7, name: 'k.fan',      c: '🇰🇷', score: '17.5k', streak: 8 },
          ].map(r => (
            <div key={r.rank} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 14,
              background: r.you ? L.ink : L.card,
              color: r.you ? L.bg : L.ink,
              border: r.you ? 'none' : `1px solid ${L.line}`,
            }}>
              <div style={{
                width: 28, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14,
                color: r.you ? L.gold : L.ink2,
              }}>#{r.rank}</div>
              <div style={{ width: 32, height: 32, borderRadius: 99, background: r.you ? L.pink : L.sand }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 13 }}>{r.c} {r.name} {r.you && <span style={{ marginLeft: 4, fontSize: 10, color: L.gold }}>SEN</span>}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: r.you ? L.gold : L.pink }}>{QzIcons.flame}</span> {r.streak}g · {r.score}
                </div>
              </div>
              {!r.you && <div style={{ fontSize: 11, color: L.ink2 }}>↗</div>}
            </div>
          ))}
        </div>
      </div>

      <QzTabBar active="rank" />
    </LScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 09 · Profile / Achievements
// ─────────────────────────────────────────────────────────────
function LProfile() {
  return (
    <LScreen pad={0}>
      <div style={{ padding: '6px 22px 0', height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
          <LTitle size={22}>Profil</LTitle>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: L.card, border: `1px solid ${L.line}`, display: 'grid', placeItems: 'center' }}>{QzIcons.globe}</div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: L.card, border: `1px solid ${L.line}`, display: 'grid', placeItems: 'center', fontSize: 18 }}>⚙</div>
          </div>
        </div>

        {/* identity card */}
        <div style={{
          marginTop: 14, borderRadius: 22, padding: 18, position: 'relative', overflow: 'hidden',
          background: L.ink, color: L.bg,
        }}>
          <div style={{
            position: 'absolute', top: -16, right: -12,
            fontFamily: 'var(--hangul)', fontSize: 110, fontWeight: 900,
            color: L.pink, opacity: 0.28, lineHeight: 0.85,
          }}>팬</div>
          <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center' }}>
            <QzPhoto hue={L.pink} label="센" size="lg" rounded={20} style={{ width: 76, height: 76 }} />
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>sen</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>K-Drama uzmanı · #4</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <span style={{ fontFamily: 'var(--display)', fontSize: 10, letterSpacing: 1, padding: '3px 7px', borderRadius: 999, background: L.pink, color: '#fff', fontWeight: 700 }}>LV 14</span>
                <span style={{ fontFamily: 'var(--display)', fontSize: 10, letterSpacing: 1, padding: '3px 7px', borderRadius: 999, background: L.gold, color: L.plum, fontWeight: 700 }}>PRO</span>
              </div>
            </div>
          </div>

          {/* xp bar */}
          <div style={{ position: 'relative', marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.75, marginBottom: 6 }}>
              <span>LV 14</span>
              <span>21,455 / 25,000 XP</span>
            </div>
            <QzBar value={86} max={100} color={L.gold} track="rgba(255,245,240,0.15)" />
          </div>
        </div>

        {/* stats grid */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { v: '184', l: 'Quiz', c: L.pink, h: '퀴즈' },
            { v: '92%', l: 'Doğru', c: L.gold, h: '정답' },
            { v: '22', l: 'Streak', c: L.plum, h: '연속' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '12px 12px', borderRadius: 14, background: L.card,
              border: `1px solid ${L.line}`, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -6, right: -4,
                fontFamily: 'var(--hangul)', fontSize: 40, fontWeight: 900,
                color: s.c, opacity: 0.15, lineHeight: 0.9,
              }}>{s.h}</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: L.ink2, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20 }}>
          <LTitle size={16}>Rozetler</LTitle>
          <span style={{ fontSize: 11, color: L.ink2 }}>3 / 12</span>
        </div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { n: '21g Seri',   c: L.pink, h: '연속', got: true },
            { n: 'K-Uzmanı',   c: L.plum, h: 'K', got: true },
            { n: 'İlk Sezon',  c: L.gold, h: '1', got: true },
            { n: 'C-Avcısı',   c: '#7c5ed3', h: 'C', got: false },
            { n: 'Anime',      c: L.pink, h: 'A', got: false },
            { n: '1v1 Şamp.',  c: L.gold, h: '王', got: false },
            { n: 'Hızlı',      c: L.plum, h: '速', got: false },
            { n: 'Mükemmel',   c: L.pink, h: '満', got: false },
          ].map((b, i) => (
            <div key={i} style={{ textAlign: 'center', opacity: b.got ? 1 : 0.35 }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 14,
                background: b.got ? b.c : L.sand,
                color: b.got ? '#fff' : L.ink3,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--hangul)', fontWeight: 900, fontSize: 18,
                position: 'relative',
              }}>
                {b.h}
                {b.got && <div style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, background: L.gold, color: L.plum, display: 'grid', placeItems: 'center' }}><span style={{ fontSize: 10 }}>✓</span></div>}
              </div>
              <div style={{ fontSize: 9, marginTop: 4, color: L.ink2, fontWeight: 600 }}>{b.n}</div>
            </div>
          ))}
        </div>
      </div>

      <QzTabBar active="me" />
    </LScreen>
  );
}

Object.assign(window, { LNews, LRank, LProfile });
