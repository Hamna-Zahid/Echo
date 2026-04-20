// echo-screens-session.jsx v3 — no emoji, refined session states

const ERROR_TYPES = {
  TENSE:       { color: '#F59E0B', bg: '#FEF3C7', label: 'Tense' },
  ARTICLE:     { color: '#0EA5E9', bg: '#E0F2FE', label: 'Article' },
  PREPOSITION: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Preposition' },
  COLLOCATION: { color: '#F43F8E', bg: '#FCE7F3', label: 'Collocation' },
  AGREEMENT:   { color: '#F97316', bg: '#FEF0E6', label: 'Agreement' },
  VOCAB:       { color: '#6366F1', bg: '#EEF2FF', label: 'Vocabulary' },
  FILLER:      { color: '#0D9488', bg: '#F0FDFA', label: 'Filler word' },
};

const SAMPLE_CORRECTIONS = [
  { type: 'TENSE',       original: 'I am working here since 2019',    corrected: 'I have been working here since 2019',    explanation: 'Use present perfect for ongoing situations.',  full: 'I\'ve been working at this company since 2019.' },
  { type: 'ARTICLE',     original: 'She is best student in class',     corrected: 'She is the best student in the class',  explanation: 'Use "the" before superlatives.',               full: 'She is the best student in the class.' },
  { type: 'PREPOSITION', original: 'I am interested for this role',    corrected: 'I am interested in this role',           explanation: '"Interested in" is the correct collocation.',  full: 'I\'m very interested in this opportunity.' },
  { type: 'FILLER',      original: 'So basically, like, I think that', corrected: 'I think that',                          explanation: 'Remove filler words for precision.',           full: 'I believe this approach would be most effective.' },
  { type: 'VOCAB',       original: 'The problem is very bad',          corrected: 'The problem is critical',               explanation: 'Precise vocabulary raises your band score.',   full: 'This is a critical issue requiring urgent attention.' },
];

// ── Error toast (floating) ────────────────────────────────────
function ErrorToast({ type, visible }) {
  const cfg = ERROR_TYPES[type] || ERROR_TYPES.TENSE;
  return (
    <div style={{
      position: 'absolute', top: 70, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : -10}px)`,
      opacity: visible ? 1 : 0, transition: 'all 280ms cubic-bezier(0.34,1.3,0.64,1)',
      background: cfg.bg, border: `1px solid ${cfg.color}28`,
      borderRadius: 999, padding: '6px 14px',
      display: 'flex', alignItems: 'center', gap: 7,
      boxShadow: `0 4px 16px ${cfg.color}1A`, zIndex: 30, whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: 999, background: cfg.color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 600, color: cfg.color, letterSpacing: 0.1 }}>{cfg.label} error caught</span>
    </div>
  );
}

// ── Correction Card ──────────────────────────────────────────
function CorrectionCard({ correction, onDismiss }) {
  const cfg = ERROR_TYPES[correction.type] || ERROR_TYPES.TENSE;
  const [prog, setProg] = React.useState(1);
  const [entered, setEntered] = React.useState(false);
  const [dragY, setDragY] = React.useState(0);
  const dragStartY = React.useRef(null);

  React.useEffect(() => { const id = setTimeout(() => setEntered(true), 20); return () => clearTimeout(id); }, []);
  React.useEffect(() => {
    const start = Date.now(), dur = 6000;
    const id = setInterval(() => {
      const p = 1 - (Date.now() - start) / dur;
      if (p <= 0) { clearInterval(id); onDismiss(); } else setProg(p);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const onDragStart = (y) => { dragStartY.current = y; };
  const onDragMove = (y) => { if (dragStartY.current !== null) { const dy = y - dragStartY.current; if (dy > 0) setDragY(dy); } };
  const onDragEnd = () => { if (dragY > 64) onDismiss(); else { setDragY(0); dragStartY.current = null; } };

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
      transform: `translateY(${entered ? dragY : 240}px)`,
      transition: dragY > 0 ? 'none' : 'transform 360ms cubic-bezier(0.34,1.1,0.64,1)',
      cursor: 'grab',
    }}
      onTouchStart={e => onDragStart(e.touches[0].clientY)}
      onTouchMove={e => onDragMove(e.touches[0].clientY)}
      onTouchEnd={onDragEnd}
      onMouseDown={e => onDragStart(e.clientY)}
      onMouseMove={e => { if (e.buttons === 1) onDragMove(e.clientY); }}
      onMouseUp={onDragEnd}>
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.1), 0 -1px 0 rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {/* Left color strip */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: cfg.color }} />
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
          <div style={{ width: 34, height: 4, borderRadius: 999, background: T.rose200 }} />
        </div>
        <div style={{ padding: '4px 20px 20px 24px' }}>
          {/* Badge + close */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '3px 9px', borderRadius: 6, letterSpacing: 0.9, textTransform: 'uppercase' }}>{correction.type}</span>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: T.bgSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onDismiss}>
              {Icon.close(T.muted, 11)}
            </div>
          </div>
          {/* Original → Corrected */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 8, lineHeight: 1.5 }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 15, color: T.charcoal, textDecoration: 'line-through', textDecorationColor: T.errorText, textDecorationThickness: '1.5px' }}>{correction.original}</span>
            <span style={{ color: T.muted, flexShrink: 0 }}>{Icon.arrow(T.muted, 14)}</span>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 700, color: T.charcoal }}>{correction.corrected}</span>
          </div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.muted, marginBottom: 12, letterSpacing: -0.1 }}>{correction.explanation}</div>
          {/* Native version */}
          <div style={{ background: T.rose50, borderLeft: `3px solid ${T.rose300 || T.rose400}`, borderRadius: '0 10px 10px 0', padding: '10px 14px' }}>
            <MicroLabel style={{ color: T.rose400, marginBottom: 5 }}>Native version</MicroLabel>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.slate, fontStyle: 'italic', lineHeight: 1.5 }}>"{correction.full}"</div>
          </div>
        </div>
        {/* Timer drain */}
        <div style={{ height: 3, background: T.rose100 }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${T.rose600}, ${T.rose400})`, width: `${prog * 100}%`, transition: 'width 50ms linear' }} />
        </div>
      </div>
    </div>
  );
}

// ── Session Screen ───────────────────────────────────────────
function SessionScreen({ mode = 'IELTS Training', onEnd }) {
  const states = ['idle', 'listening', 'processing', 'speaking'];
  const [stateIdx, setStateIdx] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [correction, setCorrection] = React.useState(null);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastType, setToastType] = React.useState('TENSE');
  const [showInterrupt, setShowInterrupt] = React.useState(false);
  const [turnCount, setTurnCount] = React.useState(2);
  const sessionState = states[stateIdx];

  // Auto-cycle demo states
  React.useEffect(() => {
    const durations = [2400, 3000, 700, 4000];
    const id = setTimeout(() => {
      const next = (stateIdx + 1) % states.length;
      setStateIdx(next);
      if (states[stateIdx] === 'listening') {
        const err = SAMPLE_CORRECTIONS[Math.floor(Math.random() * SAMPLE_CORRECTIONS.length)];
        setToastType(err.type); setToastVisible(true);
        setTimeout(() => {
          setToastVisible(false);
          setTimeout(() => setCorrection(err), 400);
        }, 1400);
        setTurnCount(t => t + 1);
      }
    }, durations[stateIdx]);
    return () => clearTimeout(id);
  }, [stateIdx]);

  // Timer
  React.useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Interrupt hint
  React.useEffect(() => {
    setShowInterrupt(false);
    if (sessionState === 'speaking') {
      const id = setTimeout(() => setShowInterrupt(true), 2200);
      return () => clearTimeout(id);
    }
  }, [sessionState]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const bgGlow = sessionState === 'speaking';
  const greenEdge = sessionState === 'listening';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      {bgGlow && (
        <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 340, height: 340, borderRadius: 999, background: 'radial-gradient(circle, rgba(252,231,243,0.75) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'fadeIn 500ms ease both' }} />
      )}
      {/* Active recording border */}
      {greenEdge && (
        <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 2px ${T.success}`, pointerEvents: 'none', zIndex: 5, borderRadius: 52, animation: 'fadeIn 200ms ease' }} />
      )}

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', position: 'relative', zIndex: 20 }}>
        <div style={{ height: 34, padding: '0 14px', borderRadius: 10, background: T.rose100, display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'background 150ms ease' }} onClick={onEnd}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600, color: T.rose600 }}>End</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ height: 27, padding: '0 12px', borderRadius: 999, background: '#F1F5F9', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700, color: T.slate, letterSpacing: 0.8, textTransform: 'uppercase' }}>{mode.split(' ')[0]}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 999, background: T.success, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600, color: T.charcoal, letterSpacing: -0.2 }}>{mm}:{ss}</span>
        </div>
      </div>

      {/* Toast */}
      <ErrorToast type={toastType} visible={toastVisible} />

      {/* Center stage */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, position: 'relative', zIndex: 10 }}>
        {/* Pulse ring */}
        {sessionState === 'speaking' && (
          <div style={{ position: 'absolute', width: 280, height: 80, borderRadius: 999, border: `1.5px solid ${T.rose200}`, animation: 'pulseRing 2.5s ease-in-out infinite', pointerEvents: 'none' }} />
        )}
        <Waveform state={sessionState} barCount={30} />
        <StatusPill state={sessionState} />
        {sessionState === 'speaking' && (
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, opacity: showInterrupt ? 1 : 0, transition: 'opacity 500ms ease', letterSpacing: 0.1 }}>
            Tap to interrupt
          </div>
        )}
      </div>

      {/* Turn indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingBottom: 12, zIndex: 10, position: 'relative' }}>
        {Array.from({ length: Math.min(turnCount, 8) }, (_, i) => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: 999, background: i % 2 === 0 ? T.charcoal : T.rose600, opacity: i < turnCount - 1 ? 0.2 : 1, transition: 'opacity 300ms ease' }} />
        ))}
      </div>

      {/* State selector (demo) */}
      <div style={{ padding: '0 18px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 10, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {states.map((s, i) => (
            <div key={s} style={{ height: 30, padding: '0 12px', borderRadius: 999, cursor: 'pointer', background: stateIdx === i ? T.charcoal : T.bgSubtle, border: `1px solid ${stateIdx === i ? T.charcoal : T.borderStrong}`, display: 'flex', alignItems: 'center', transition: 'all 180ms ease' }} onClick={() => setStateIdx(i)}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 600, color: stateIdx === i ? '#fff' : T.muted, letterSpacing: 0.1 }}>{s}</span>
            </div>
          ))}
        </div>
        <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: T.muted, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500 }}>Preview states</span>
      </div>

      {/* Correction card */}
      {correction && <CorrectionCard correction={correction} onDismiss={() => setCorrection(null)} />}

      <style>{`
        @keyframes pulseRing { 0%,100%{opacity:0.45;transform:scale(1)} 50%{opacity:0;transform:scale(1.12)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  );
}

Object.assign(window, { ERROR_TYPES, SAMPLE_CORRECTIONS, SessionScreen, CorrectionCard });
