// app.jsx — Quizdram main canvas
// Lays out 2 design directions × 8 screens each as iOS frames inside a DesignCanvas.
// Section C: an interactive 3-screen mini-flow (home → quiz → result) you can click through.
// Plus a Tweaks panel for palette / theme / language / font / radius / quiz format.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#ff5470", "#2d1b4e", "#ffc857"],
  "theme": "Aydınlık",
  "language": "Türkçe",
  "font": "Unbounded",
  "radius": 18,
  "quizFormat": "Cast → Dizi"
}/*EDITMODE-END*/;

// Frame helper — iOS device wrapper with consistent sizing
function Frame({ children, dark = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
      <IOSDevice width={402} height={874} dark={dark}>{children}</IOSDevice>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Interactive flow (Section C)
// ─────────────────────────────────────────────────────────────
function InteractiveFlow({ dark = false }) {
  const [step, setStep] = React.useState(0); // 0 home, 1 quiz, 2 result
  const [picked, setPicked] = React.useState(null);

  if (dark) {
    if (step === 0) return <DHome onStartQuiz={() => setStep(1)} />;
    if (step === 1) return <DQuizPlay pickedId={picked} onPick={(id) => { setPicked(id); setTimeout(() => setStep(2), 700); }} />;
    return (
      <div style={{ height: '100%', position: 'relative' }}>
        <DResult />
        <button onClick={() => { setStep(0); setPicked(null); }} style={{
          position: 'absolute', top: 64, right: 18, padding: '6px 10px',
          background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', zIndex: 30,
        }}>↻ Tekrar</button>
      </div>
    );
  }
  if (step === 0) return <LHome onStartQuiz={() => setStep(1)} />;
  if (step === 1) return <LQuizPlay pickedId={picked} onPick={(id) => { setPicked(id); setTimeout(() => setStep(2), 700); }} />;
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <LResult />
      <button onClick={() => { setStep(0); setPicked(null); }} style={{
        position: 'absolute', top: 64, right: 18, padding: '6px 10px',
        background: 'rgba(45,27,78,0.08)', color: '#2d1b4e', border: '1px solid rgba(45,27,78,0.12)',
        borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', zIndex: 30,
      }}>↻ Tekrar</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Canvas
// ─────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks via CSS variables on :root so all screens react live.
  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--pink', t.palette[0]);
    r.style.setProperty('--plum', t.palette[1]);
    r.style.setProperty('--gold', t.palette[2]);
    r.style.setProperty('--display', `"${t.font}", "Unbounded", system-ui, sans-serif`);
    r.style.setProperty('--r-md', t.radius + 'px');
  }, [t]);

  const FONT_OPTIONS = ['Unbounded', 'Instrument Serif', 'DM Sans', 'Noto Sans KR'];
  const QUIZ_FORMATS = ['Cast → Dizi', 'Replikten Tahmin', 'Görselden Oyuncu', '1v1 Düello', 'Bugünün Quiz\'i'];
  const PALETTE_OPTIONS = [
    ['#ff5470', '#2d1b4e', '#ffc857'],     // cream K-pop
    ['#ff4d7e', '#0e0a1f', '#ffc857'],     // midnight
    ['#e94560', '#1c1c1c', '#d4a14a'],     // hanok red
    ['#ffafcc', '#a2d2ff', '#cdb4db'],     // soft pastel
    ['#00f5d4', '#0a0a0a', '#fee440'],     // neon synth
  ];

  return (
    <React.Fragment>
      <DesignCanvas>
        {/* Direction A — Cream */}
        <DCSection id="dir-a" title="A — Kore Poster ☀" subtitle="Krem / pembe / mor / altın · K-pop magazine feel">
          <DCArtboard id="a1" label="01 · Açılış" width={402} height={874}><Frame><LOnboarding /></Frame></DCArtboard>
          <DCArtboard id="a2" label="02 · Dil"    width={402} height={874}><Frame><LLanguage /></Frame></DCArtboard>
          <DCArtboard id="a3" label="03 · Ana sayfa" width={402} height={874}><Frame><LHome /></Frame></DCArtboard>
          <DCArtboard id="a4" label="04 · Quiz"  width={402} height={874}><Frame><LQuizPlay /></Frame></DCArtboard>
          <DCArtboard id="a5" label="05 · Sonuç" width={402} height={874}><Frame><LResult /></Frame></DCArtboard>
          <DCArtboard id="a6" label="06 · Cast profili" width={402} height={874}><Frame><LCast /></Frame></DCArtboard>
          <DCArtboard id="a7" label="07 · Magazin"   width={402} height={874}><Frame><LNews /></Frame></DCArtboard>
          <DCArtboard id="a8" label="08 · Liderlik"  width={402} height={874}><Frame><LRank /></Frame></DCArtboard>
          <DCArtboard id="a9" label="09 · Profil"    width={402} height={874}><Frame><LProfile /></Frame></DCArtboard>
        </DCSection>

        {/* Direction B — Midnight */}
        <DCSection id="dir-b" title="B — Midnight Magazine ☾" subtitle="Koyu sinematik · neon pembe / altın · gece okuma">
          <DCArtboard id="b1" label="01 · Açılış" width={402} height={874}><Frame dark><DOnboarding /></Frame></DCArtboard>
          <DCArtboard id="b2" label="02 · Dil"    width={402} height={874}><Frame dark><DLanguage /></Frame></DCArtboard>
          <DCArtboard id="b3" label="03 · Ana sayfa" width={402} height={874}><Frame dark><DHome /></Frame></DCArtboard>
          <DCArtboard id="b4" label="04 · Quiz"  width={402} height={874}><Frame dark><DQuizPlay /></Frame></DCArtboard>
          <DCArtboard id="b5" label="05 · Sonuç" width={402} height={874}><Frame dark><DResult /></Frame></DCArtboard>
          <DCArtboard id="b6" label="06 · Cast profili" width={402} height={874}><Frame dark><DCast /></Frame></DCArtboard>
          <DCArtboard id="b7" label="07 · Magazin"   width={402} height={874}><Frame dark><DNews /></Frame></DCArtboard>
          <DCArtboard id="b8" label="08 · Liderlik"  width={402} height={874}><Frame dark><DRank /></Frame></DCArtboard>
          <DCArtboard id="b9" label="09 · Profil"    width={402} height={874}><Frame dark><DProfile /></Frame></DCArtboard>
        </DCSection>

        {/* Section C — Interactive */}
        <DCSection id="flow" title="↻ Tıklanabilir akış" subtitle="Ana sayfada karta tıkla → quiz oyna → sonuç. Sağ-üstten sıfırla.">
          <DCArtboard id="flow-a" label="A · Aydınlık akış" width={402} height={874}>
            <Frame><InteractiveFlow dark={false} /></Frame>
          </DCArtboard>
          <DCArtboard id="flow-b" label="B · Koyu akış" width={402} height={874}>
            <Frame dark><InteractiveFlow dark={true} /></Frame>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      {/* Tweaks panel */}
      <TweaksPanel title="Quizdram tweaks">
        <TweakSection label="Tema" />
        <TweakRadio label="Mod" value={t.theme} options={['Aydınlık', 'Koyu']} onChange={(v) => setTweak('theme', v)} />
        <TweakColor label="Palet" value={t.palette} options={PALETTE_OPTIONS} onChange={(v) => setTweak('palette', v)} />

        <TweakSection label="Tipografi" />
        <TweakSelect label="Display font" value={t.font} options={FONT_OPTIONS} onChange={(v) => setTweak('font', v)} />
        <TweakSlider label="Köşe yumuşaklığı" value={t.radius} min={4} max={32} unit="px" onChange={(v) => setTweak('radius', v)} />

        <TweakSection label="İçerik" />
        <TweakSelect label="Dil" value={t.language} options={['Türkçe', 'English', '한국어', '日本語', '中文']} onChange={(v) => setTweak('language', v)} />
        <TweakSelect label="Quiz formatı" value={t.quizFormat} options={QUIZ_FORMATS} onChange={(v) => setTweak('quizFormat', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
