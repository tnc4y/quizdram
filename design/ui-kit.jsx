// ui-kit.jsx — Shared visual primitives for Quizdram screens
// Includes: QzPhoto (striped placeholder for cast photos), QzChip, QzBar, QzIcon (tiny SVG icons).
// Light + dark variants both consume these so they read consistently across directions.

// Striped placeholder with a hangul/hanzi character overlaid as decorative type
function QzPhoto({ hue = '#ff5470', label = '', script = 'ko', size = 'md', rounded = 18, style = {} }) {
  const dim = { sm: 56, md: 84, lg: 120, xl: 160 }[size] || 84;
  const stripes = `repeating-linear-gradient(135deg, ${hue} 0 12px, ${shade(hue, -0.08)} 12px 24px)`;
  return (
    <div style={{
      width: dim, height: dim, borderRadius: rounded, overflow: 'hidden',
      position: 'relative', flexShrink: 0,
      background: stripes,
      ...style,
    }}>
      {/* subtle vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, transparent 30%, ${shade(hue, -0.25)} 130%)`,
      }} />
      {label && (
        <span style={{
          position: 'absolute', left: 8, bottom: 6,
          fontFamily: 'var(--hangul)', fontWeight: 900, fontSize: dim * 0.32,
          color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.04em',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}>{label}</span>
      )}
    </div>
  );
}

// hex shade — clamp around the hue
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + (amt > 0 ? (255 - v) : v) * amt)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

function QzChip({ children, active = false, dark = false, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 11px', borderRadius: 999,
      fontFamily: 'var(--body)', fontSize: 12, fontWeight: 600, letterSpacing: 0.1,
      background: active
        ? (dark ? '#fff5f0' : '#2d1b4e')
        : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(45,27,78,0.06)'),
      color: active
        ? (dark ? '#2d1b4e' : '#fff5f0')
        : (dark ? '#fff5f0' : '#2d1b4e'),
      border: dark && !active ? '1px solid rgba(255,255,255,0.08)' : 'none',
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

// thin tick icons (no emoji)
const QzIcons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5L12 4l9 7.5"/><path d="M5 10.5V20h14V10.5"/>
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor"/>
    </svg>
  ),
  news: (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h7M7 12h10M7 15h6"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M5 6h3M16 6h3M9 16h6M12 13v3M9 20h6"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/>
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M12 2s4 3.5 4 8c0 2-1 3-1 3s.5-2-1-3.5C12.5 8 11 9 11 11c0 1.5 1 2 1 3.5 0 1.5-1 2.5-2 2.5-1.5 0-3-1.5-3-4 0-3 2-5 2-7 0-2 3-4 3-4z"/>
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M13 2L4 14h6l-1 8 9-12h-6z"/>
    </svg>
  ),
  bookmark: (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M6 4h12v17l-6-3.5L6 21V4z"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M12 21s-7-4.5-9-9C1.5 8 4 4.5 7.5 4.5c2 0 3.5 1 4.5 2.5 1-1.5 2.5-2.5 4.5-2.5 3.5 0 6 3.5 4.5 7.5-2 4.5-9 9-9 9z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.4L12 17.5 6.4 20.5l1.1-6.4L3 9.7l6.2-.9z"/>
    </svg>
  ),
};

// Progress bar
function QzBar({ value = 0, max = 100, color = '#ff5470', track = 'rgba(45,27,78,0.08)', height = 6 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ width: '100%', height, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 999, transition: 'width .4s ease' }} />
    </div>
  );
}

// Tiny country / region tag
function QzRegionDot({ region, dark = false }) {
  const map = { kr: ['KR', '#ff5470'], cn: ['CN', '#e94560'], jp: ['JP', '#7c5ed3'], th: ['TH', '#ffc857'] };
  const [code, color] = map[region] || ['??', '#aaa'];
  return (
    <span style={{
      fontFamily: 'var(--display)', fontWeight: 700, fontSize: 9, letterSpacing: 1,
      padding: '3px 6px', borderRadius: 4,
      background: dark ? color : color + '22',
      color: dark ? '#fff5f0' : color,
    }}>{code}</span>
  );
}

// Bottom tab bar
function QzTabBar({ active = 'home', dark = false }) {
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
      background: dark ? 'rgba(20,14,38,0.85)' : 'rgba(255,245,240,0.88)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(45,27,78,0.06)',
      boxShadow: dark
        ? '0 6px 22px rgba(0,0,0,0.4)'
        : '0 6px 22px rgba(45,27,78,0.08)',
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        const color = isActive
          ? (dark ? '#ff5470' : '#ff5470')
          : (dark ? 'rgba(255,245,240,0.5)' : 'rgba(45,27,78,0.5)');
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color, flex: 1 }}>
            <div style={{ color, position: 'relative' }}>
              {QzIcons[t.icon]}
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
                  width: 5, height: 5, borderRadius: 5, background: '#ff5470',
                }} />
              )}
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 0.1 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { QzPhoto, QzChip, QzIcons, QzBar, QzRegionDot, QzTabBar, qzShade: shade });
