// screens-dark-2.jsx — Direction B continued: Quiz, Result, Cast, News, Rank, Profile

// ─────────────────────────────────────────────────────────────
// 04 · Quiz play (dark)
// ─────────────────────────────────────────────────────────────
function DQuizPlay({ pickedId, onPick }) {
  const correct = 'a';
  const options = [
    { id: 'a', text: 'Lunar Tide',     sub: '달의 조류 · 2024' },
    { id: 'b', text: 'Crimson Letter', sub: '진홍의 편지 · 2023' },
    { id: 'c', text: 'Neon Seoul',     sub: '네온 서울 · 2025' },
    { id: 'd', text: 'Glass Mountain', sub: '유리 산 · 2022' },
  ];
  return (
    <DScreen pad={0}>
      <div style={{ padding: '6px 20px 0', height: '100%', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <div style={{ color: D.ink2 }}>{QzIcons.close}</div>
          <div style={{ flex: 1 }}>
            <QzBar value={2} max={5} color={D.pink} track="rgba(246,240,255,0.08)" />
          </div>
          <div style={{
            background: D.gold, color: '#1a1232', padding: '5px 9px', borderRadius: 999,
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: 0.4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>{QzIcons.bolt}</span> 0:42
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: D.gold, fontWeight: 600, letterSpacing: 1.5 }}>
          SORU 02 / 05 · CAST → DİZİ
        </div>
        <DTitle size={22} style={{ marginTop: 8 }}>Bu cast hangi<br/>dizide birlikte oynadı?</DTitle>

        {/* cast strip — overlap style */}
        <div style={{ marginTop: 20, position: 'relative', height: 140 }}>
          {[
            { name: 'Han S.J.',  h: '한', c: D.pink,  x: 0  },
            { name: 'Lee T.M.',  h: '이', c: D.cyan,  x: 90 },
            { name: 'Park Y.W.', h: '박', c: D.gold,  x: 180 },
          ].map((c, i) => (
            <div key={i} style={{ position: 'absolute', left: c.x, top: 0 }}>
              <DPhoto hue={c.c} label={c.h} size="lg" rounded={14} style={{ width: 116, height: 140, border: `2px solid ${D.bg}` }} />
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 10.5, marginTop: 6, color: D.ink2 }}>{c.name}</div>
            </div>
          ))}
        </div>

        {/* options */}
        <div style={{ marginTop: 22, display: 'grid', gap: 8 }}>
          {options.map((o) => {
            const picked = pickedId === o.id;
            const isCorrect = picked && o.id === correct;
            const isWrong = picked && o.id !== correct;
            return (
              <button key={o.id} onClick={() => onPick && onPick(o.id)} style={{
                textAlign: 'left', padding: '13px 14px', borderRadius: 14,
                background: isCorrect ? D.pink : isWrong ? '#3a1a2a' : D.card,
                color: isCorrect ? '#fff' : D.ink,
                border: isCorrect ? 'none' : isWrong ? `1px solid ${D.pink}` : `1px solid ${D.line}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: isCorrect ? `0 8px 24px ${D.pink}55` : 'none',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: isCorrect ? D.gold : isWrong ? D.pink : D.bg2,
                  color: isCorrect ? '#1a1232' : isWrong ? '#fff' : D.ink2,
                  fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12,
                  display: 'grid', placeItems: 'center',
                }}>{o.id.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14 }}>{o.text}</div>
                  <div style={{ fontFamily: 'var(--hangul)', fontSize: 10, opacity: 0.65, marginTop: 1 }}>{o.sub}</div>
                </div>
                {isCorrect && <span>{QzIcons.check}</span>}
              </button>
            );
          })}
        </div>

        {/* hint pill */}
        <div style={{
          position: 'absolute', left: 20, right: 20, bottom: 22,
          padding: '12px 14px', borderRadius: 14,
          background: D.card, border: `1px solid ${D.line}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontFamily: 'var(--hangul)', fontWeight: 800, fontSize: 18, color: D.gold }}>힌트</span>
          <span style={{ fontSize: 12, color: D.ink2 }}>İpucu kullan</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--display)', fontWeight: 700, color: D.pink, fontSize: 13 }}>−50 XP</span>
        </div>
      </div>
    </DScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 05 · Result (dark)
// ─────────────────────────────────────────────────────────────
function DResult() {
  return (
    <DScreen pad={0}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${D.pink}33 0%, transparent 55%), ${D.bg}`,
      }} />
      <div style={{
        position: 'absolute', top: 80, right: -20, fontFamily: 'var(--hangul)',
        fontSize: 200, fontWeight: 900, color: D.pink, opacity: 0.12, lineHeight: 0.85,
      }}>완벽</div>

      <div style={{ position: 'relative', padding: '32px 22px 0', height: '100%' }}>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: D.gold, color: '#1a1232',
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: 1.2,
          }}>
            <span>{QzIcons.bolt}</span> MÜKEMMEL!
          </div>
          <div style={{
            marginTop: 22, fontFamily: 'var(--display)', fontWeight: 800, fontSize: 100,
            letterSpacing: '-0.05em', lineHeight: 0.88,
            background: `linear-gradient(180deg, ${D.gold}, ${D.pink})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>5/5</div>
          <div style={{
            marginTop: 4, fontFamily: 'var(--serif)', fontStyle: 'italic',
            color: D.ink2, fontSize: 20,
          }}>tüm soruları bildin</div>
        </div>

        {/* stats card */}
        <div style={{
          marginTop: 28, background: D.card, borderRadius: 22,
          padding: '18px 18px', border: `1px solid ${D.line}`,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        }}>
          {[
            { v: '+250', l: 'XP', c: D.pink },
            { v: '0:42', l: 'Süre', c: D.cyan },
            { v: '×3', l: 'Combo', c: D.gold },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
              {i > 0 && <div style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 1, background: D.line }} />}
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, color: s.c, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontSize: 11, color: D.ink3, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* streak badge */}
        <div style={{
          marginTop: 12, padding: '14px 16px', borderRadius: 18,
          background: `linear-gradient(95deg, ${D.pink}, #6a1a4e)`,
          color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'rgba(0,0,0,0.25)',
            display: 'grid', placeItems: 'center', color: D.gold,
          }}>{QzIcons.flame}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15 }}>22 günlük seri</div>
            <div style={{ fontSize: 11.5, opacity: 0.85 }}>En uzun: 41 gün</div>
          </div>
          <div>{QzIcons.arrow}</div>
        </div>

        {/* CTAs */}
        <div style={{ position: 'absolute', left: 22, right: 22, bottom: 32 }}>
          <button style={{
            width: '100%', height: 56, borderRadius: 16, border: 'none',
            background: D.gold, color: '#1a1232', cursor: 'pointer',
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15,
          }}>Sıradaki quiz →</button>
          <button style={{
            width: '100%', height: 48, borderRadius: 16, marginTop: 8,
            background: 'transparent', color: D.ink, cursor: 'pointer',
            border: `1px solid ${D.line}`,
            fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14,
          }}>Sonucu paylaş</button>
        </div>
      </div>
    </DScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 06 · Cast profile (dark)
// ─────────────────────────────────────────────────────────────
function DCast() {
  return (
    <DScreen pad={0}>
      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        {/* hero */}
        <div style={{ position: 'relative', height: 360, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(170deg, ${D.pink} 0%, #4a1a3e 70%, ${D.bg} 100%)`,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)',
          }} />
          <div style={{
            position: 'absolute', top: 32, left: 22,
            fontFamily: 'var(--hangul)', fontSize: 130, fontWeight: 900,
            color: D.gold, opacity: 0.55, lineHeight: 0.85, letterSpacing: '-0.05em',
          }}>한수진</div>

          <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', color: D.ink }}>←</div>
          </div>
          <div style={{ position: 'absolute', top: 14, right: 16, display: 'flex', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', color: D.ink }}>{QzIcons.bookmark}</div>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: D.pink, display: 'grid', placeItems: 'center', color: '#fff' }}>{QzIcons.heart}</div>
          </div>

          {/* bottom info card */}
          <div style={{
            position: 'absolute', left: 20, right: 20, bottom: 18,
          }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 9, letterSpacing: 1.5, color: D.gold }}>KR · LEAD · 28</span>
            </div>
            <DTitle size={36} style={{ marginTop: 6 }}>Han Soo-jin</DTitle>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: D.ink2, fontSize: 16, marginTop: 4 }}>
              "the queen of midnight romance"
            </div>
          </div>
        </div>

        <div style={{ padding: '0 22px', marginTop: 16 }}>
          {/* stats */}
          <div style={{
            padding: '14px 0', borderTop: `1px solid ${D.line}`, borderBottom: `1px solid ${D.line}`,
            display: 'flex', justifyContent: 'space-between',
          }}>
            {[
              ['12', 'Dizi'],
              ['4.8', 'Reyting'],
              ['2.1M', 'Hayran'],
              ['#3', 'Sıra'],
            ].map(([v, l], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, color: i === 3 ? D.pink : D.ink }}>{v}</div>
                <div style={{ fontSize: 10, color: D.ink3, marginTop: 1 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
            {['Filmografi', 'Quizler', 'Haberler'].map((t, i) => (
              <div key={t} style={{
                fontFamily: 'var(--display)', fontSize: 13, fontWeight: i === 0 ? 700 : 500,
                color: i === 0 ? D.ink : D.ink3,
                borderBottom: i === 0 ? `2px solid ${D.pink}` : 'none',
                paddingBottom: 6,
              }}>{t}</div>
            ))}
          </div>

          {/* filmography — poster strip */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, overflowX: 'auto' }}>
            {[
              { t: 'Lunar Tide', y: 2024, c: D.pink, h: '달' },
              { t: 'Crimson Letter', y: 2023, c: D.cyan, h: '진' },
              { t: 'Glass Mountain', y: 2022, c: D.gold, h: '유' },
            ].map((d, i) => (
              <div key={i} style={{ minWidth: 124 }}>
                <DPhoto hue={d.c} label={d.h} size="lg" rounded={14} style={{ width: 124, height: 160 }} />
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 13, marginTop: 8 }}>{d.t}</div>
                <div style={{ fontSize: 10, color: D.ink3, marginTop: 1 }}>{d.y} · Lead</div>
              </div>
            ))}
          </div>

          {/* quiz CTA */}
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 16,
            background: D.card, border: `1px solid ${D.line}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: D.pink, display: 'grid', placeItems: 'center', color: '#fff' }}>{QzIcons.play}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14 }}>Han Soo-jin quizi</div>
              <div style={{ fontSize: 11, color: D.ink3, marginTop: 1 }}>16 soru · ortalama 4/5 doğru</div>
            </div>
            <div style={{ color: D.gold, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12 }}>OYNA</div>
          </div>
        </div>
      </div>

      <DTabBar active="play" />
    </DScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 07 · News (dark)
// ─────────────────────────────────────────────────────────────
function DNews() {
  return (
    <DScreen pad={0}>
      <div style={{ padding: '6px 20px 0', height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ marginTop: 4 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 10, letterSpacing: 2, color: D.gold, fontWeight: 600 }}>MMXXVI · VOL 02</div>
          <DTitle size={40} style={{ marginTop: 4 }}>
            Mid<span style={{ color: D.pink }}>night</span><br/>magazine.
          </DTitle>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto' }}>
          <DChip active>Tümü</DChip>
          <DChip>Trend</DChip>
          <DChip>Yeni dizi</DChip>
          <DChip>Dedikodu</DChip>
          <DChip>Röportaj</DChip>
        </div>

        {/* cover story */}
        <div style={{
          marginTop: 16, borderRadius: 22, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(180deg, #4a1a3e 0%, ${D.pink} 100%)`,
          height: 240,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(90deg, rgba(116,230,255,0.06) 0 2px, transparent 2px 8px)',
          }} />
          <div style={{
            position: 'absolute', top: -10, right: -8, fontFamily: 'var(--hangul)',
            fontSize: 130, fontWeight: 900, color: 'rgba(0,0,0,0.25)', lineHeight: 0.85,
          }}>특종</div>
          <div style={{ padding: 18, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--display)', fontWeight: 700, fontSize: 9, letterSpacing: 2,
                background: D.gold, color: '#1a1232', padding: '4px 8px', borderRadius: 999,
              }}>EXKLÜZİF · 02:14</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff' }}>
                "Lunar Tide" 2. sezonu Jeju'da çekiliyor — kadroda 2 yeni isim
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 11, color: '#fff' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.85 }}>
                  <span style={{ color: D.gold }}>{QzIcons.heart}</span> 14.8K
                </span>
                <span style={{ opacity: 0.6 }}>·</span>
                <span style={{ opacity: 0.85 }}>2.1K yorum</span>
              </div>
            </div>
          </div>
        </div>

        {/* feed */}
        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          {[
            { tag: 'YENİ',     head: 'Phoenix Court kadrosu Cannes\'ta podyumda', src: 'C-Drama Today', t: '6s', c: D.gold, h: '风' },
            { tag: 'DEDIKODU', head: 'Bir K-pop idolü "Neon Seoul"un üçüncü sezonunda mı?', src: 'Seoul Beat', t: '1g', c: D.cyan, h: '소문' },
            { tag: 'TRENDING', head: '"Tokyo at 5AM" finalinde sürpriz cameo', src: 'JP Drama Daily', t: '2g', c: '#9d7cff', h: '東' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <DPhoto hue={n.c} label={n.h} size="md" rounded={12} style={{ width: 88, height: 100 }} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 9, letterSpacing: 1.5, color: n.c }}>{n.tag}</span>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 13.5, lineHeight: 1.25, letterSpacing: '-0.01em', marginTop: 5, textWrap: 'pretty' }}>{n.head}</div>
                </div>
                <div style={{ fontSize: 10.5, color: D.ink3, marginTop: 6 }}>{n.src} · {n.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DTabBar active="news" />
    </DScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 08 · Leaderboard (dark)
// ─────────────────────────────────────────────────────────────
function DRank() {
  return (
    <DScreen pad={0}>
      <div style={{ padding: '6px 20px 0', height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ marginTop: 4 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 10, letterSpacing: 2, color: D.gold, fontWeight: 600 }}>WEEKLY · 22 MAYIS</div>
          <DTitle size={32}>Liderlik <span style={{ color: D.pink, fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400 }}>tablosu</span></DTitle>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <DChip active>Bu hafta</DChip>
          <DChip>Tüm zamanlar</DChip>
          <DChip>Arkadaşlar</DChip>
        </div>

        {/* Podium */}
        <div style={{
          marginTop: 16, padding: '20px 8px 16px', borderRadius: 22,
          background: `linear-gradient(180deg, ${D.bg2} 0%, rgba(255,77,126,0.15) 100%)`,
          border: `1px solid ${D.line}`, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -16, right: -10, fontFamily: 'var(--hangul)',
            fontSize: 110, fontWeight: 900, color: D.gold, opacity: 0.18, lineHeight: 0.85,
          }}>1위</div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', position: 'relative', marginTop: 30 }}>
            {[
              { rank: 2, name: 'aoi.dorama', score: '23.1k', c: D.cyan,   h: '葵', country: '🇯🇵', size: 56 },
              { rank: 1, name: 'minji_92',   score: '24.8k', c: D.pink,   h: '민지', country: '🇰🇷', size: 78 },
              { rank: 3, name: 'wei.shu',    score: '22.9k', c: D.gold,   h: '魏', country: '🇨🇳', size: 56 },
            ].map((p) => (
              <div key={p.rank} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <DPhoto hue={p.c} label={p.h} size="md" rounded={p.size / 2} style={{ width: p.size, height: p.size, boxShadow: p.rank === 1 ? `0 0 24px ${p.c}88` : 'none' }} />
                  <div style={{
                    position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                    width: 22, height: 22, borderRadius: 99, background: p.rank === 1 ? D.gold : D.bg2,
                    color: p.rank === 1 ? '#1a1232' : D.ink, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11,
                    display: 'grid', placeItems: 'center', border: `2px solid ${D.bg}`,
                  }}>{p.rank}</div>
                </div>
                <div style={{ marginTop: 12, fontFamily: 'var(--display)', fontWeight: 600, fontSize: 11.5 }}>{p.country} {p.name}</div>
                <div style={{ fontSize: 10, color: D.ink3, marginTop: 1 }}>{p.score} XP</div>
              </div>
            ))}
          </div>
        </div>

        {/* list */}
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
              background: r.you ? `linear-gradient(95deg, ${D.pink}, #6a1a4e)` : D.card,
              color: r.you ? '#fff' : D.ink,
              border: r.you ? 'none' : `1px solid ${D.line}`,
            }}>
              <div style={{
                width: 28, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14,
                color: r.you ? D.gold : D.ink3,
              }}>#{r.rank}</div>
              <div style={{ width: 32, height: 32, borderRadius: 99, background: r.you ? 'rgba(0,0,0,0.3)' : D.bg2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 13 }}>{r.c} {r.name} {r.you && <span style={{ marginLeft: 4, fontSize: 10, color: D.gold }}>SEN</span>}</div>
                <div style={{ fontSize: 10, color: r.you ? 'rgba(255,255,255,0.7)' : D.ink3, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: r.you ? D.gold : D.pink }}>{QzIcons.flame}</span> {r.streak}g · {r.score}
                </div>
              </div>
              {!r.you && <div style={{ fontSize: 11, color: D.ink3 }}>↗</div>}
            </div>
          ))}
        </div>
      </div>

      <DTabBar active="rank" />
    </DScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 09 · Profile (dark)
// ─────────────────────────────────────────────────────────────
function DProfile() {
  return (
    <DScreen pad={0}>
      <div style={{ padding: '6px 22px 0', height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
          <DTitle size={22}>Profil</DTitle>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: D.card, border: `1px solid ${D.line}`, display: 'grid', placeItems: 'center', color: D.ink2 }}>{QzIcons.globe}</div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: D.card, border: `1px solid ${D.line}`, display: 'grid', placeItems: 'center', fontSize: 18, color: D.ink2 }}>⚙</div>
          </div>
        </div>

        {/* identity card */}
        <div style={{
          marginTop: 14, borderRadius: 22, padding: 18, position: 'relative', overflow: 'hidden',
          background: `linear-gradient(155deg, ${D.pink} 0%, #4a1a3e 100%)`,
          color: '#fff',
        }}>
          <div style={{
            position: 'absolute', top: -16, right: -12,
            fontFamily: 'var(--hangul)', fontSize: 120, fontWeight: 900,
            color: D.gold, opacity: 0.3, lineHeight: 0.85,
          }}>팬</div>
          <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center' }}>
            <DPhoto hue={D.gold} label="센" size="lg" rounded={20} style={{ width: 76, height: 76, border: '2px solid rgba(255,255,255,0.25)' }} />
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>sen</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>K-Drama uzmanı · #4</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <span style={{ fontFamily: 'var(--display)', fontSize: 10, letterSpacing: 1, padding: '3px 7px', borderRadius: 999, background: D.gold, color: '#1a1232', fontWeight: 700 }}>LV 14</span>
                <span style={{ fontFamily: 'var(--display)', fontSize: 10, letterSpacing: 1, padding: '3px 7px', borderRadius: 999, background: 'rgba(0,0,0,0.3)', color: '#fff', fontWeight: 700 }}>PRO</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.8, marginBottom: 6 }}>
              <span>LV 14</span>
              <span>21,455 / 25,000 XP</span>
            </div>
            <QzBar value={86} max={100} color={D.gold} track="rgba(0,0,0,0.3)" />
          </div>
        </div>

        {/* stats grid */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { v: '184', l: 'Quiz', c: D.pink, h: '퀴즈' },
            { v: '92%', l: 'Doğru', c: D.cyan, h: '정답' },
            { v: '22', l: 'Streak', c: D.gold, h: '연속' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '12px 12px', borderRadius: 14, background: D.card,
              border: `1px solid ${D.line}`, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -6, right: -4, fontFamily: 'var(--hangul)',
                fontSize: 42, fontWeight: 900, color: s.c, opacity: 0.2, lineHeight: 0.9,
              }}>{s.h}</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D.ink3, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20 }}>
          <DTitle size={16}>Rozetler</DTitle>
          <span style={{ fontSize: 11, color: D.ink3 }}>3 / 12</span>
        </div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { n: '21g Seri',   c: D.pink, h: '연속', got: true },
            { n: 'K-Uzmanı',   c: D.cyan, h: 'K', got: true },
            { n: 'İlk Sezon',  c: D.gold, h: '1', got: true },
            { n: 'C-Avcısı',   c: '#9d7cff', h: 'C', got: false },
            { n: 'Anime',      c: D.pink, h: 'A', got: false },
            { n: '1v1 Şamp.',  c: D.gold, h: '王', got: false },
            { n: 'Hızlı',      c: D.cyan, h: '速', got: false },
            { n: 'Mükemmel',   c: D.pink, h: '満', got: false },
          ].map((b, i) => (
            <div key={i} style={{ textAlign: 'center', opacity: b.got ? 1 : 0.4 }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 14,
                background: b.got ? `linear-gradient(160deg, ${b.c}, #1a1232)` : D.bg2,
                color: b.got ? '#fff' : D.ink3,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--hangul)', fontWeight: 900, fontSize: 18,
                position: 'relative',
                boxShadow: b.got ? `0 4px 16px ${b.c}33` : 'none',
              }}>
                {b.h}
                {b.got && <div style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, background: D.gold, color: '#1a1232', display: 'grid', placeItems: 'center', fontSize: 10 }}>✓</div>}
              </div>
              <div style={{ fontSize: 9, marginTop: 4, color: D.ink2, fontWeight: 600 }}>{b.n}</div>
            </div>
          ))}
        </div>
      </div>

      <DTabBar active="me" />
    </DScreen>
  );
}

Object.assign(window, { DQuizPlay, DResult, DCast, DNews, DRank, DProfile });
