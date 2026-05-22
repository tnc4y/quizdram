// screens-dark.jsx — Direction B: "Midnight Magazine" — deep plum + neon
// More editorial/cinematic feel. Same 8 screens, very different vibe.

const D = {
  bg: '#0e0a1f',
  bg2: '#181030',
  ink: '#f6f0ff',
  ink2: 'rgba(246,240,255,0.62)',
  ink3: 'rgba(246,240,255,0.32)',
  line: 'rgba(246,240,255,0.08)',
  pink: '#ff4d7e',
  gold: '#ffc857',
  cyan: '#74e6ff',
  card: '#1a1232',
};

function DScreen({ children, pad = 18, bg = D.bg }) {
  return (
    <div className="qz" style={{
      width: '100%', height: '100%', background: bg, color: D.ink,
      fontFamily: 'var(--body)', position: 'relative', overflow: 'hidden',
      padding: `4px ${pad}px 0`, boxSizing: 'border-box',
    }}>{children}</div>
  );
}

function DTitle({ children, size = 32, weight = 700, lh = 1.0, style = {} }) {
  return (
    <h1 style={{
      fontFamily: 'var(--display)', fontWeight: weight, fontSize: size, lineHeight: lh,
      letterSpacing: '-0.03em', margin: 0, color: D.ink, ...style,
    }}>{children}</h1>
  );
}

// Editorial chip — outlined
function DChip({ children, active = false, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 12px', borderRadius: 999,
      fontFamily: 'var(--body)', fontSize: 12, fontWeight: 600, letterSpacing: 0.1,
      background: active ? D.pink : 'transparent',
      color: active ? '#fff' : D.ink2,
      border: active ? 'none' : `1px solid ${D.line}`,
      whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

// Bottom tab bar — dark variant
function DTabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home',  icon: 'home',   label: 'Anasayfa' },
    { id: 'play',  icon: 'play',   label: 'Quiz' },
    { id: 'news',  icon: 'news',   label: 'Magazin' },
    { id: 'rank',  icon: 'trophy', label: 'Liderlik' },
    { id: 'me',    icon: 'user',   label: 'Profil' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 8,
      borderRadius: 28, padding: '10px 8px 14px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(20,12,42,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(246,240,255,0.06)',
      boxShadow: '0 6px 22px rgba(0,0,0,0.4)',
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        const color = isActive ? D.pink : 'rgba(246,240,255,0.45)';
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color, flex: 1 }}>
            <div style={{ color, position: 'relative' }}>
              {QzIcons[t.icon]}
              {isActive && <div style={{ position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: 5, background: D.pink, boxShadow: '0 0 10px ' + D.pink }} />}
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 600 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Photo with film-grain style — uses QzPhoto + dark overlay
function DPhoto({ hue = D.pink, label = '', size = 'md', rounded = 14, style = {} }) {
  const dim = { sm: 56, md: 84, lg: 120, xl: 160 }[size] || 84;
  return (
    <div style={{
      width: dim, height: dim, borderRadius: rounded, overflow: 'hidden',
      position: 'relative', flexShrink: 0,
      background: `linear-gradient(160deg, ${hue} 0%, #1a1232 110%)`,
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 5px)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${hue}66 0%, transparent 70%)`,
      }} />
      {label && (
        <span style={{
          position: 'absolute', left: 8, bottom: 6,
          fontFamily: 'var(--hangul)', fontWeight: 900, fontSize: dim * 0.34,
          color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.04em',
          textShadow: '0 1px 6px rgba(0,0,0,0.45)',
        }}>{label}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 01 · Onboarding — dark poster
// ─────────────────────────────────────────────────────────────
function DOnboarding() {
  return (
    <DScreen pad={0}>
      <div style={{ position: 'absolute', inset: 0, padding: '8px 22px 0' }}>
        {/* huge editorial hangul */}
        <div style={{
          position: 'absolute', top: 40, left: -28,
          fontFamily: 'var(--hangul)', fontSize: 240, fontWeight: 900,
          color: D.pink, opacity: 0.18, lineHeight: 0.85, letterSpacing: '-0.05em',
          pointerEvents: 'none',
        }}>드람</div>

        {/* poster */}
        <div style={{ marginTop: 60, position: 'relative' }}>
          <div style={{
            height: 380, borderRadius: 22, overflow: 'hidden', position: 'relative',
            background: `linear-gradient(180deg, ${D.bg2} 0%, ${D.pink} 110%)`,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(45deg, rgba(116,230,255,0.07) 0 1px, transparent 1px 4px)',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle at 30% 20%, ${D.cyan}44 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${D.gold}55 0%, transparent 55%)`,
            }} />
            <div style={{
              position: 'absolute', top: 16, left: 18,
              fontFamily: 'var(--display)', fontWeight: 700, fontSize: 10, letterSpacing: 2,
              color: D.gold,
            }}>VOL. 02 · MMXXV · MIDNIGHT EDITION</div>

            <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: 'var(--hangul)', fontWeight: 900, fontSize: 14, color: D.ink, letterSpacing: '0.2em' }}>드라마</div>

            <div style={{ position: 'absolute', bottom: 28, left: 22, right: 22 }}>
              <div style={{
                fontFamily: 'var(--display)', fontWeight: 800, fontSize: 64,
                color: D.ink, lineHeight: 0.88, letterSpacing: '-0.05em',
              }}>
                QUIZ<br/>
                <span style={{
                  background: `linear-gradient(90deg, ${D.gold}, ${D.pink})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>DRAM</span>
              </div>
              <div style={{ marginTop: 10, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: D.ink2 }}>
                — drama after dark
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button style={{
          position: 'absolute', left: 22, right: 22, bottom: 68,
          height: 58, borderRadius: 18, border: 'none',
          background: D.pink, color: '#fff',
          fontFamily: 'var(--display)', fontWeight: 600, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer', boxShadow: `0 12px 32px ${D.pink}55`,
        }}>
          Başla
          <span style={{ color: D.gold }}>{QzIcons.arrow}</span>
        </button>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 36, textAlign: 'center',
          fontSize: 12, color: D.ink3,
        }}>
          Hesabın var mı? <span style={{ color: D.ink, fontWeight: 600 }}>Giriş yap</span>
        </div>
      </div>
    </DScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 02 · Language (dark) — pill-style with native scripts giant
// ─────────────────────────────────────────────────────────────
function DLanguage() {
  const langs = [
    { code: 'tr', native: 'Türkçe',  label: 'Türkçe',  glyph: 'Tr' },
    { code: 'en', native: 'English', label: 'İngilizce', glyph: 'En' },
    { code: 'ko', native: '한국어', label: 'Korece',   glyph: '한' },
    { code: 'ja', native: '日本語', label: 'Japonca',  glyph: '日' },
    { code: 'zh', native: '中文',   label: 'Çince',    glyph: '中' },
  ];
  return (
    <DScreen pad={22}>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{ background: 'none', border: 'none', color: D.ink, fontSize: 24, padding: 0, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 10, color: D.ink3, letterSpacing: 2, fontWeight: 600 }}>STEP 02 / 04</div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: D.gold, fontSize: 18 }}>your language</div>
        <DTitle size={36}>Hangi<br/>dilde<br/><span style={{ color: D.pink }}>akarsın</span>?</DTitle>
        <div style={{ color: D.ink2, marginTop: 10, fontSize: 13, maxWidth: 260 }}>
          Quizler ve magazin haberleri için seçtiğin dil her zaman değiştirilebilir.
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gap: 8 }}>
        {langs.map((l, i) => {
          const sel = i === 2; // korece selected as default in dark direction
          return (
            <div key={l.code} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 14px', borderRadius: 14,
              background: sel ? D.pink : D.card,
              color: sel ? '#fff' : D.ink,
              border: sel ? 'none' : `1px solid ${D.line}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: sel ? 'rgba(255,255,255,0.16)' : D.bg,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--hangul)', fontWeight: 800, fontSize: 18,
                color: sel ? '#fff' : D.gold,
              }}>{l.glyph}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15 }}>{l.label}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 1 }}>{l.native}</div>
              </div>
              {sel ? <div style={{ color: D.gold }}>{QzIcons.check}</div>
                : <div style={{ width: 20, height: 20, borderRadius: 99, border: `1.5px solid ${D.line}` }} />}
            </div>
          );
        })}
      </div>

      <button style={{
        position: 'absolute', left: 22, right: 22, bottom: 48,
        height: 56, borderRadius: 16, border: 'none',
        background: D.gold, color: '#1a1232',
        fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
      }}>Devam et →</button>
    </DScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 03 · Home (dark) — editorial grid
// ─────────────────────────────────────────────────────────────
function DHome({ onStartQuiz }) {
  return (
    <DScreen pad={0}>
      <div style={{ padding: '6px 20px 0', height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div>
            <div style={{ color: D.gold, fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>SAAT 21:42</div>
            <DTitle size={26} style={{ marginTop: 2 }}>İyi <span style={{ color: D.pink }}>akşamlar</span></DTitle>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: D.card, border: `1px solid ${D.line}`, display: 'grid', placeItems: 'center', color: D.ink }}>{QzIcons.search}</div>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: D.card, border: `1px solid ${D.line}`, display: 'grid', placeItems: 'center', color: D.ink, position: 'relative' }}>
              {QzIcons.bell}
              <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 7, background: D.pink, boxShadow: '0 0 6px ' + D.pink }} />
            </div>
          </div>
        </div>

        {/* Today's hero — full-bleed magazine cover */}
        <div onClick={onStartQuiz} style={{
          marginTop: 16, borderRadius: 22, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(155deg, ${D.pink} 0%, #6a1a4e 100%)`,
          height: 260, cursor: 'pointer',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 70% 30%, ${D.gold}66 0%, transparent 55%)`,
          }} />
          <div style={{
            position: 'absolute', top: -18, right: -10,
            fontFamily: 'var(--hangul)', fontSize: 140, fontWeight: 900,
            color: 'rgba(0,0,0,0.22)', lineHeight: 0.85,
          }}>오늘</div>
          <div style={{ padding: 18, position: 'relative', color: D.ink, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{
                fontFamily: 'var(--display)', fontWeight: 700, fontSize: 9, letterSpacing: 2,
                background: D.gold, color: '#1a1232', padding: '4px 8px', borderRadius: 999,
              }}>BUGÜNÜN QUIZ'İ · #128</span>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 30, marginTop: 12, lineHeight: 0.98, letterSpacing: '-0.03em' }}>
                Lunar Tide<br/>kadrosunu<br/><span style={{ color: D.gold, fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 32 }}>tahmin et</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {['#74e6ff', '#ffc857', '#1a1232'].map((c, i) => (
                  <div key={i} style={{
                    width: 30, height: 30, borderRadius: 99, background: c,
                    border: '2px solid #ff4d7e', marginLeft: i ? -10 : 0,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>5 soru · 90 sn</div>
              <div style={{ marginLeft: 'auto', color: D.gold }}>{QzIcons.arrow}</div>
            </div>
          </div>
        </div>

        {/* region row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, overflowX: 'auto' }}>
          <DChip active>Tümü</DChip>
          <DChip>K-Drama</DChip>
          <DChip>C-Drama</DChip>
          <DChip>J-Drama</DChip>
          <DChip>Thai BL</DChip>
        </div>

        {/* category as horizontal scroll posters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22 }}>
          <DTitle size={16}>Quiz türleri <span style={{ color: D.ink3, fontWeight: 400, fontSize: 13 }}>· 04</span></DTitle>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
          {[
            { t: 'Cast → Dizi', s: '32 quiz', c: D.pink, h: '캐스트' },
            { t: 'Replikten Tahmin', s: '18 quiz', c: D.cyan, h: '대사' },
            { t: 'Görselden', s: '40 quiz', c: D.gold, h: '사진' },
            { t: '1v1 Düello', s: 'Canlı', c: '#9d7cff', h: '대결' },
          ].map((cat, i) => (
            <div key={i} style={{
              minWidth: 140, background: D.card, borderRadius: 16, padding: 14,
              border: `1px solid ${D.line}`, position: 'relative', overflow: 'hidden', height: 130,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{
                position: 'absolute', top: -10, right: -6,
                fontFamily: 'var(--hangul)', fontSize: 56, fontWeight: 900,
                color: cat.c, opacity: 0.2, lineHeight: 0.9,
              }}>{cat.h}</div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: cat.c, boxShadow: `0 0 16px ${cat.c}66` }} />
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 13.5 }}>{cat.t}</div>
                <div style={{ fontSize: 10.5, color: D.ink3, marginTop: 2 }}>{cat.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* mini stats / 1v1 banner */}
        <div style={{
          marginTop: 18, borderRadius: 18, padding: 16,
          background: D.card, border: `1px solid ${D.line}`,
          display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -10, top: -10, fontFamily: 'var(--hangul)', fontSize: 64, fontWeight: 900, color: D.cyan, opacity: 0.16, lineHeight: 0.9 }}>대결</div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${D.cyan}, ${D.pink})`, display: 'grid', placeItems: 'center', color: '#fff' }}>{QzIcons.bolt}</div>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14 }}>1v1 sırada</div>
            <div style={{ fontSize: 11, color: D.ink3, marginTop: 1 }}>3 arkadaşın çevrimiçi · şimdi mücadele et</div>
          </div>
          <div style={{ color: D.gold }}>{QzIcons.arrow}</div>
        </div>
      </div>

      <DTabBar active="home" />
    </DScreen>
  );
}

Object.assign(window, { D, DScreen, DTitle, DChip, DTabBar, DPhoto, DOnboarding, DLanguage, DHome });
