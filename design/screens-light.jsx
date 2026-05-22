// screens-light.jsx — Direction A: Cream K-pop poster (light theme)
// All 8 screens. They consume QzPhoto, QzChip, QzIcons, QzBar, QzRegionDot, QzTabBar from ui-kit.

const L = {
  bg: '#fff5f0',
  ink: '#2d1b4e',
  ink2: 'rgba(45,27,78,0.62)',
  ink3: 'rgba(45,27,78,0.38)',
  line: 'rgba(45,27,78,0.08)',
  pink: '#ff5470',
  plum: '#2d1b4e',
  gold: '#ffc857',
  sand: '#faeadd',
  card: '#ffffff',
};

function LScreen({ children, pad = 18, bg = L.bg }) {
  return (
    <div className="qz" style={{
      width: '100%', height: '100%', background: bg, color: L.ink,
      fontFamily: 'var(--body)', position: 'relative', overflow: 'hidden',
      padding: `4px ${pad}px 0`, boxSizing: 'border-box',
    }}>{children}</div>
  );
}

// Re-usable display title (Unbounded)
function LTitle({ children, size = 32, weight = 700, lh = 1.0, style = {} }) {
  return (
    <h1 style={{
      fontFamily: 'var(--display)', fontWeight: weight, fontSize: size, lineHeight: lh,
      letterSpacing: '-0.03em', margin: 0, color: L.ink, ...style,
    }}>{children}</h1>
  );
}

// ─────────────────────────────────────────────────────────────
// 01 · Onboarding
// ─────────────────────────────────────────────────────────────
function LOnboarding() {
  return (
    <LScreen pad={0} bg={L.bg}>
      {/* big poster-style hero */}
      <div style={{ position: 'absolute', inset: 0, padding: '8px 22px 0' }}>
        {/* Hangul accent — large, off-canvas slightly */}
        <div style={{
          position: 'absolute', top: 28, right: -36,
          fontFamily: 'var(--hangul)', fontSize: 220, fontWeight: 900,
          color: L.pink, opacity: 0.18, lineHeight: 0.85, letterSpacing: '-0.04em',
          pointerEvents: 'none',
        }}>퀴즈</div>

        {/* poster card — striped photo placeholder */}
        <div style={{ marginTop: 70, position: 'relative' }}>
          <div style={{
            height: 360, borderRadius: 24, overflow: 'hidden', position: 'relative',
            background: `linear-gradient(180deg, ${L.plum} 0%, ${L.pink} 100%)`,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(120deg, rgba(255,200,87,0.18) 0 14px, transparent 14px 28px)',
            }} />
            <div style={{
              position: 'absolute', top: 14, left: 14, fontFamily: 'var(--hangul)',
              color: '#fff5f0', fontWeight: 900, fontSize: 14, letterSpacing: '0.2em',
            }}>드라마 · 시네마</div>
            <div style={{
              position: 'absolute', bottom: 22, left: 22, right: 22,
            }}>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: L.gold, fontSize: 18 }}>vol. 02 · seoul</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 56, color: '#fff5f0', lineHeight: 0.92, letterSpacing: '-0.04em', marginTop: 4 }}>
                QUIZ<br/>DRAM
              </div>
            </div>
            <div style={{
              position: 'absolute', top: 22, right: 16, padding: '5px 9px',
              background: L.gold, color: L.plum, borderRadius: 999,
              fontFamily: 'var(--display)', fontWeight: 700, fontSize: 10, letterSpacing: 0.6,
            }}>EST · 2025</div>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: L.ink2, fontSize: 16 }}>Doğunun en heyecanlı</div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 2 }}>
            cast quiz<br/>kulübü.
          </div>
        </div>

        {/* CTA */}
        <button style={{
          position: 'absolute', left: 22, right: 22, bottom: 64,
          height: 56, borderRadius: 18, border: 'none',
          background: L.ink, color: L.bg,
          fontFamily: 'var(--display)', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer',
        }}>
          Başla
          <span style={{ display: 'inline-flex', color: L.gold }}>{QzIcons.arrow}</span>
        </button>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 32, textAlign: 'center',
          fontSize: 12, color: L.ink3,
        }}>
          Hesabın var mı? <span style={{ color: L.ink, fontWeight: 600 }}>Giriş yap</span>
        </div>
      </div>
    </LScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 02 · Language picker (also onboarding flow)
// ─────────────────────────────────────────────────────────────
function LLanguage() {
  const langs = [
    { code: 'tr', label: 'Türkçe',   native: 'Türkçe',  hue: L.pink },
    { code: 'en', label: 'English',  native: 'English', hue: L.plum },
    { code: 'ko', label: 'Korece',   native: '한국어',  hue: L.pink },
    { code: 'ja', label: 'Japonca',  native: '日本語',  hue: L.gold },
    { code: 'zh', label: 'Çince',    native: '中文',    hue: L.plum },
  ];
  return (
    <LScreen pad={22}>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button style={{ background: 'none', border: 'none', color: L.ink, fontSize: 24, padding: 0, cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: 12, color: L.ink2, letterSpacing: 1, fontWeight: 600 }}>2 / 4</div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: L.pink, fontSize: 18 }}>step one</div>
        <LTitle size={32}>Dilini<br/>seç.</LTitle>
        <div style={{ color: L.ink2, marginTop: 8, fontSize: 14, maxWidth: 280 }}>
          Quizleri ve magazin haberlerini hangi dilde okumak istersin?
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'grid', gap: 10 }}>
        {langs.map((l, i) => (
          <div key={l.code} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 14px', borderRadius: 16,
            background: i === 0 ? L.ink : L.card,
            color: i === 0 ? L.bg : L.ink,
            border: i === 0 ? 'none' : `1px solid ${L.line}`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: i === 0 ? L.pink : l.hue + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--hangul)', fontWeight: 800, fontSize: 18,
              color: i === 0 ? L.bg : l.hue,
            }}>{l.native.slice(0, 1)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15 }}>{l.label}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 1 }}>{l.native}</div>
            </div>
            {i === 0 ? (
              <div style={{ color: L.gold }}>{QzIcons.check}</div>
            ) : (
              <div style={{
                width: 22, height: 22, borderRadius: 99,
                border: `1.5px solid ${L.line}`,
              }} />
            )}
          </div>
        ))}
      </div>

      <button style={{
        position: 'absolute', left: 22, right: 22, bottom: 48,
        height: 54, borderRadius: 16, border: 'none',
        background: L.pink, color: '#fff',
        fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15,
        cursor: 'pointer',
      }}>Devam et →</button>
    </LScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 03 · Home / Discover
// ─────────────────────────────────────────────────────────────
function LHome({ onStartQuiz }) {
  return (
    <LScreen pad={0}>
      <div style={{ padding: '6px 20px 0', height: '100%', overflowY: 'auto', paddingBottom: 96 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div>
            <div style={{ color: L.ink3, fontSize: 12 }}>Merhaba,</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>Sen 👋</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: L.card, border: `1px solid ${L.line}`, display: 'grid', placeItems: 'center', color: L.ink }}>{QzIcons.search}</div>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: L.card, border: `1px solid ${L.line}`, display: 'grid', placeItems: 'center', color: L.ink, position: 'relative' }}>
              {QzIcons.bell}
              <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 7, background: L.pink }} />
            </div>
          </div>
        </div>

        {/* Today's quiz hero */}
        <div onClick={onStartQuiz} style={{
          marginTop: 16, borderRadius: 22, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${L.plum} 0%, #5b3a8e 100%)`,
          color: L.bg, padding: '18px 18px 20px',
          cursor: 'pointer',
        }}>
          <div style={{
            position: 'absolute', top: -16, right: -10,
            fontFamily: 'var(--hangul)', fontSize: 120, fontWeight: 900,
            color: L.pink, opacity: 0.25, lineHeight: 0.85,
          }}>오늘</div>
          <QzChip dark style={{ background: L.gold, color: L.plum }}>BUGÜNÜN QUIZ'İ</QzChip>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 26, marginTop: 12, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Lunar Tide<br/>
            <span style={{ color: L.gold }}>kadrosunu</span> tahmin et
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
            <div style={{ display: 'flex' }}>
              {[L.pink, L.gold, '#7c5ed3'].map((h, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: 99, background: h,
                  border: `2px solid ${L.plum}`, marginLeft: i ? -10 : 0,
                }} />
              ))}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>5 soru · 90 sn · +250 XP</div>
            <div style={{ marginLeft: 'auto', color: L.gold }}>{QzIcons.arrow}</div>
          </div>
        </div>

        {/* region chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, overflowX: 'auto' }}>
          <QzChip active>Tümü</QzChip>
          <QzChip>🇰🇷 K-Drama</QzChip>
          <QzChip>🇨🇳 C-Drama</QzChip>
          <QzChip>🇯🇵 J-Drama</QzChip>
          <QzChip>🇹🇭 Thai</QzChip>
        </div>

        {/* Category section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22 }}>
          <LTitle size={18}>Quiz türleri</LTitle>
          <span style={{ fontSize: 12, color: L.ink2 }}>Tümü</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          {[
            { t: 'Cast → Dizi', s: '32 quiz', c: L.pink,  hangul: '캐스트' },
            { t: 'Replikten Tahmin', s: '18 quiz', c: L.plum, hangul: '대사' },
            { t: 'Görselden Oyuncu', s: '40 quiz', c: L.gold, hangul: '사진' },
            { t: '1v1 Düello', s: 'Canlı', c: '#7c5ed3', hangul: '대결' },
          ].map((cat, i) => (
            <div key={i} style={{
              background: L.card, borderRadius: 16, padding: 14, border: `1px solid ${L.line}`,
              position: 'relative', overflow: 'hidden', minHeight: 96,
            }}>
              <div style={{
                position: 'absolute', top: -8, right: -6,
                fontFamily: 'var(--hangul)', fontSize: 48, fontWeight: 900,
                color: cat.c, opacity: 0.18, lineHeight: 0.9,
              }}>{cat.hangul}</div>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: cat.c, marginBottom: 18 }} />
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14, lineHeight: 1.15 }}>{cat.t}</div>
              <div style={{ fontSize: 11, color: L.ink2, marginTop: 2 }}>{cat.s}</div>
            </div>
          ))}
        </div>

        {/* trending dramas strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22 }}>
          <LTitle size={18}>Bu hafta trend</LTitle>
          <span style={{ fontSize: 12, color: L.ink2 }}>Gör</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
          {[
            { t: 'Neon Seoul', h: '네온', c: L.pink },
            { t: 'Phoenix Court', h: '凤凰', c: L.gold },
            { t: 'Tokyo 5AM', h: '東京', c: '#7c5ed3' },
          ].map((d, i) => (
            <div key={i} style={{ minWidth: 116 }}>
              <QzPhoto hue={d.c} label={d.h} size="lg" rounded={14} style={{ width: 116, height: 150 }} />
              <div style={{ marginTop: 8, fontFamily: 'var(--display)', fontWeight: 600, fontSize: 13 }}>{d.t}</div>
              <div style={{ fontSize: 11, color: L.ink2 }}>{i === 0 ? '12k oynayan' : i === 1 ? '8.4k' : '5.2k'}</div>
            </div>
          ))}
        </div>
      </div>

      <QzTabBar active="home" />
    </LScreen>
  );
}

Object.assign(window, { L, LScreen, LTitle, LOnboarding, LLanguage, LHome });
