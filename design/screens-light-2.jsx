// screens-light-2.jsx — Direction A continued: Quiz, Result, Cast, News, Rank, Profile

// ─────────────────────────────────────────────────────────────
// 04 · Quiz play
// ─────────────────────────────────────────────────────────────
function LQuizPlay({ pickedId, onPick }) {
  const correct = 'a';
  const options = [
    { id: 'a', text: 'Lunar Tide',     sub: '달의 조류 · 2024' },
    { id: 'b', text: 'Crimson Letter', sub: '진홍의 편지 · 2023' },
    { id: 'c', text: 'Neon Seoul',     sub: '네온 서울 · 2025' },
    { id: 'd', text: 'Glass Mountain', sub: '유리 산 · 2022' },
  ];
  return (
    <LScreen pad={0}>
      <div style={{ padding: '6px 20px 0', height: '100%', position: 'relative' }}>
        {/* top bar: close + progress + timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <div style={{ color: L.ink2 }}>{QzIcons.close}</div>
          <div style={{ flex: 1 }}>
            <QzBar value={2} max={5} color={L.pink} />
          </div>
          <div style={{
            background: L.ink, color: L.bg, padding: '5px 9px', borderRadius: 999,
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: 0.4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ color: L.gold }}>{QzIcons.bolt}</span> 0:42
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: L.ink2, fontWeight: 600, letterSpacing: 0.6 }}>
          SORU 2 / 5 · CAST → DİZİ
        </div>
        <LTitle size={22} style={{ marginTop: 6 }}>Bu cast hangi<br/>dizide birlikte oynadı?</LTitle>

        {/* cast strip */}
        <div style={{
          marginTop: 18, padding: 14, borderRadius: 18,
          background: L.card, border: `1px solid ${L.line}`,
          display: 'flex', gap: 10, justifyContent: 'space-between',
        }}>
          {[
            { name: 'Han S.J.',  h: '한', c: L.pink },
            { name: 'Lee T.M.',  h: '이', c: L.plum },
            { name: 'Park Y.W.', h: '박', c: L.gold },
          ].map((c, i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <QzPhoto hue={c.c} label={c.h} size="md" rounded={16} style={{ width: '100%', height: 92 }} />
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 11, marginTop: 6 }}>{c.name}</div>
            </div>
          ))}
        </div>

        {/* options */}
        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
          {options.map((o) => {
            const picked = pickedId === o.id;
            const isCorrect = picked && o.id === correct;
            const isWrong = picked && o.id !== correct;
            const bg = isCorrect ? L.ink : isWrong ? '#fde4e8' : (picked ? L.ink : L.card);
            const fg = isCorrect ? L.bg : isWrong ? '#c0364a' : (picked ? L.bg : L.ink);
            const border = picked ? 'none' : `1px solid ${L.line}`;
            return (
              <button key={o.id} onClick={() => onPick && onPick(o.id)} style={{
                textAlign: 'left', padding: '13px 14px', borderRadius: 14,
                background: bg, color: fg, border, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: picked ? (isCorrect ? L.gold : '#ffb1bc') : L.sand,
                  color: picked ? L.plum : L.ink, fontFamily: 'var(--display)',
                  fontWeight: 700, fontSize: 12, display: 'grid', placeItems: 'center',
                }}>{o.id.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14 }}>{o.text}</div>
                  <div style={{ fontFamily: 'var(--hangul)', fontSize: 10, opacity: 0.7, marginTop: 1 }}>{o.sub}</div>
                </div>
                {isCorrect && <span>{QzIcons.check}</span>}
              </button>
            );
          })}
        </div>

        {/* hint chip */}
        <div style={{
          position: 'absolute', left: 20, right: 20, bottom: 22,
          padding: '12px 14px', borderRadius: 14,
          background: L.sand, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontFamily: 'var(--hangul)', fontWeight: 800, fontSize: 18, color: L.pink }}>힌트</span>
          <span style={{ fontSize: 12, color: L.ink2 }}>İpucu kullan</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--display)', fontWeight: 700, color: L.plum }}>−50 XP</span>
        </div>
      </div>
    </LScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 05 · Result
// ─────────────────────────────────────────────────────────────
function LResult() {
  return (
    <LScreen pad={0}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${L.bg} 0%, ${L.sand} 100%)`,
      }} />

      {/* decorative hangul */}
      <div style={{
        position: 'absolute', top: 60, right: -20,
        fontFamily: 'var(--hangul)', fontSize: 180, fontWeight: 900,
        color: L.pink, opacity: 0.1, lineHeight: 0.85,
      }}>완벽</div>

      <div style={{ position: 'relative', padding: '32px 22px 0', height: '100%' }}>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: L.gold, color: L.plum,
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: 1.2,
          }}>
            <span>{QzIcons.bolt}</span> MÜKEMMEL!
          </div>
          <div style={{
            marginTop: 22, fontFamily: 'var(--display)', fontWeight: 800, fontSize: 96,
            color: L.pink, letterSpacing: '-0.05em', lineHeight: 0.9,
          }}>5/5</div>
          <div style={{
            marginTop: 4, fontFamily: 'var(--serif)', fontStyle: 'italic',
            color: L.ink2, fontSize: 20,
          }}>tüm soruları bildin</div>
        </div>

        {/* stats card */}
        <div style={{
          marginTop: 28, background: L.card, borderRadius: 22,
          padding: '18px 18px', border: `1px solid ${L.line}`,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        }}>
          {[
            { v: '+250', l: 'XP', c: L.pink },
            { v: '0:42', l: 'Süre', c: L.plum },
            { v: '×3', l: 'Combo', c: L.gold },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
              {i > 0 && <div style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 1, background: L.line }} />}
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, color: s.c, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontSize: 11, color: L.ink2, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* streak badge */}
        <div style={{
          marginTop: 14, padding: '14px 16px', borderRadius: 18,
          background: L.ink, color: L.bg, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: L.pink,
            display: 'grid', placeItems: 'center', color: '#fff',
          }}>{QzIcons.flame}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15 }}>22 günlük seri 🔥</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Yarın da gel, kaybetme</div>
          </div>
          <div style={{ color: L.gold }}>{QzIcons.arrow}</div>
        </div>

        {/* CTAs */}
        <div style={{ position: 'absolute', left: 22, right: 22, bottom: 32 }}>
          <button style={{
            width: '100%', height: 54, borderRadius: 16, border: 'none',
            background: L.pink, color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15,
          }}>Sıradaki quiz</button>
          <button style={{
            width: '100%', height: 48, borderRadius: 16, marginTop: 8,
            background: 'transparent', color: L.ink, cursor: 'pointer',
            border: `1px solid ${L.line}`,
            fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14,
          }}>Sonucu paylaş</button>
        </div>
      </div>
    </LScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 06 · Cast profile
// ─────────────────────────────────────────────────────────────
function LCast() {
  return (
    <LScreen pad={0}>
      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        {/* hero */}
        <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `repeating-linear-gradient(135deg, ${L.pink} 0 18px, ${L.plum} 18px 36px)`,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, transparent 40%, rgba(255,245,240,1) 100%)',
          }} />
          <div style={{
            position: 'absolute', top: 20, right: 16,
            fontFamily: 'var(--hangul)', fontSize: 120, fontWeight: 900,
            color: 'rgba(255,245,240,0.4)', lineHeight: 0.85, letterSpacing: '-0.04em',
          }}>한수진</div>
          <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', color: L.ink }}>←</div>
          </div>
          <div style={{ position: 'absolute', top: 14, right: 16, display: 'flex', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.85)', display: 'grid', placeItems: 'center', color: L.ink }}>{QzIcons.bookmark}</div>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.85)', display: 'grid', placeItems: 'center', color: L.ink }}>{QzIcons.heart}</div>
          </div>
        </div>

        <div style={{ padding: '0 22px', marginTop: -32, position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 6, fontSize: 12, color: L.ink2,
          }}>
            <QzRegionDot region="kr" />
            <span>· 28</span>
            <span>· Lead</span>
          </div>
          <LTitle size={30} style={{ marginTop: 6 }}>Han Soo-jin</LTitle>
          <div style={{ fontFamily: 'var(--hangul)', color: L.ink2, fontSize: 14, marginTop: 1 }}>한수진</div>

          {/* stats */}
          <div style={{
            marginTop: 14, padding: '14px 0',
            borderTop: `1px solid ${L.line}`, borderBottom: `1px solid ${L.line}`,
            display: 'flex', justifyContent: 'space-between',
          }}>
            {[
              ['12', 'Dizi'],
              ['4.8', 'Reyting'],
              ['2.1M', 'Hayran'],
              ['#3', 'Sıra'],
            ].map(([v, l], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17 }}>{v}</div>
                <div style={{ fontSize: 10, color: L.ink2, marginTop: 1 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
            {['Filmografi', 'Quizler', 'Haberler'].map((t, i) => (
              <div key={t} style={{
                fontFamily: 'var(--display)', fontSize: 13, fontWeight: i === 0 ? 700 : 500,
                color: i === 0 ? L.ink : L.ink2,
                borderBottom: i === 0 ? `2px solid ${L.pink}` : 'none',
                paddingBottom: 6,
              }}>{t}</div>
            ))}
          </div>

          {/* filmography */}
          <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            {[
              { t: 'Lunar Tide', y: 2024, r: 'Lead', c: L.pink, h: '달' },
              { t: 'Crimson Letter', y: 2023, r: 'Lead', c: L.plum, h: '진' },
              { t: 'Glass Mountain', y: 2022, r: 'Supporting', c: L.gold, h: '유' },
            ].map((d, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: 10, borderRadius: 14,
                background: L.card, border: `1px solid ${L.line}`,
              }}>
                <QzPhoto hue={d.c} label={d.h} size="md" rounded={10} style={{ width: 62, height: 78 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14 }}>{d.t}</div>
                  <div style={{ fontSize: 11, color: L.ink2, marginTop: 1 }}>{d.y} · {d.r}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: L.sand, color: L.pink, display: 'grid', placeItems: 'center' }}>{QzIcons.play}</div>
                    <span style={{ fontSize: 11, color: L.ink2 }}>Quiz oyna · {[16,12,8][i]} soru</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QzTabBar active="play" />
    </LScreen>
  );
}

Object.assign(window, { LQuizPlay, LResult, LCast });
