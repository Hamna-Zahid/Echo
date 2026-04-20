// echo-shared.jsx v3 — No emoji, full SVG icon system, premium design

const T = {
  bg: '#FFFFFF', bgSubtle: '#FDF8F8', surface: '#FFFFFF',
  surfaceElevated: '#FFF5F7',
  rose600: '#E11D74', rose500: '#F43F8E', rose400: '#FB7BAF',
  rose200: '#FBCFE8', rose100: '#FCE7F3', rose50: '#FFF0F6',
  charcoal: '#111827', slate: '#374151', muted: '#9CA3AF',
  border: '#F3E8EE', borderStrong: '#E9D4DD',
  success: '#10B981', warning: '#F59E0B', errorText: '#EF4444', gold: '#D97706',
};

const shadow = '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(225,29,116,0.05)';
const shadowMd = '0 4px 16px rgba(0,0,0,0.08), 0 8px 24px rgba(225,29,116,0.07)';

const _css = `
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
@keyframes pulseRing{0%,100%{opacity:0.45;transform:scale(1)}50%{opacity:0;transform:scale(1.12)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes cardEnter{from{opacity:0;transform:translateY(24px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
`;
if (!document.getElementById('echo-global-css')) {
  const s = document.createElement('style');
  s.id = 'echo-global-css'; s.textContent = _css;
  document.head.appendChild(s);
}

// ── SVG Icon set ──────────────────────────────────────────────
const Icon = {
  mic: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="13" rx="3" stroke={c} strokeWidth="1.8"/>
      <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  chart: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 20h18M7 20V12M12 20V6M17 20V10" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  home: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  check: (c='currentColor', size=16) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8l4.5 4.5L14 3.5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronRight: (c='currentColor', size=14) => (
    <svg width={size * 0.5} height={size} viewBox="0 0 7 14" fill="none">
      <path d="M1 1l5 6-5 6" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronLeft: (c='currentColor', size=14) => (
    <svg width={size * 0.7} height={size} viewBox="0 0 10 16" fill="none">
      <path d="M8 2L2 8l6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  close: (c='currentColor', size=14) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M1 1l12 12M13 1L1 13" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  edit: (c='currentColor', size=16) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M11 2l3 3L5 14H2v-3L11 2z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  swap: (c='currentColor', size=16) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 5h12M10 2l4 3-4 3M14 11H2M6 8l-4 3 4 3" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  flame: (c='currentColor', size=14) => (
    <svg width={size} height={size} viewBox="0 0 14 18" fill="none">
      <path d="M7 1c0 0 5 4 5 8.5a5 5 0 01-10 0C2 7.5 4 5 4 5s0 3 3 4.5C8.5 8 7 1 7 1z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={c} fillOpacity="0.15"/>
    </svg>
  ),
  arrow: (c='currentColor', size=16) => (
    <svg width={size} height={size} viewBox="0 0 16 10" fill="none">
      <path d="M1 5h12M9 1l4 4-4 4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  eye: (c='currentColor', size=18, open=true) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke={c} strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8"/>
      {!open && <path d="M3 3l18 18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>}
    </svg>
  ),
  target: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="5" stroke={c} strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="1.5" fill={c}/>
    </svg>
  ),
  briefcase: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="3" stroke={c} strokeWidth="1.8"/>
      <path d="M8 7V5a2 2 0 014 0v2M16 7V5a2 2 0 00-4 0" stroke={c} strokeWidth="1.8"/>
      <path d="M3 13h18" stroke={c} strokeWidth="1.8"/>
    </svg>
  ),
  chat: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  building: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  waveform: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 12h3M7 8v8M11 5v14M15 8v8M19 10v4M22 12h-3" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  clipboard: (c='currentColor', size=20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 12h6M9 16h4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  google: () => (
    <svg width="19" height="19" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
};

// ── Button ──────────────────────────────────────────────────
function EchoButton({ label, variant = 'primary', onPress, style = {}, disabled = false, icon }) {
  const [pressed, setPressed] = React.useState(false);
  const variants = {
    primary: { background: disabled ? T.rose100 : T.rose600, color: disabled ? T.rose400 : '#fff', boxShadow: pressed ? 'none' : '0 4px 20px rgba(225,29,116,0.28)' },
    secondary: { background: '#fff', color: T.rose600, border: `1.5px solid ${T.rose200}` },
    ghost: { background: 'transparent', color: T.rose600 },
    outline: { background: 'transparent', color: T.rose600, border: `1.5px solid ${T.rose600}` },
  };
  return (
    <div style={{
      height: 56, borderRadius: 999, display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none', width: '100%', boxSizing: 'border-box',
      fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 700, letterSpacing: -0.2,
      transform: pressed ? 'scale(0.966)' : 'scale(1)',
      transition: 'transform 140ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 140ms ease',
      ...variants[variant], ...style,
    }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => { setPressed(false); !disabled && onPress?.(); }}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => { setPressed(false); !disabled && onPress?.(); }}>
      {icon && icon}
      {label}
    </div>
  );
}

// ── Input ───────────────────────────────────────────────────
function EchoInput({ placeholder, type = 'text', value, onChange, rightIcon }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          height: 56, width: '100%', boxSizing: 'border-box',
          border: `1.5px solid ${focused ? T.rose600 : T.borderStrong}`,
          borderRadius: 14, padding: '0 16px', paddingRight: rightIcon ? 50 : 16,
          background: focused ? T.rose50 : '#fff',
          fontFamily: 'Inter,system-ui', fontSize: 15, color: T.charcoal,
          outline: 'none', transition: 'all 180ms ease',
          boxShadow: focused ? `0 0 0 3px ${T.rose100}` : 'none',
        }} />
      {rightIcon && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display:'flex', alignItems:'center' }}>{rightIcon}</div>}
    </div>
  );
}

// ── Chip ─────────────────────────────────────────────────────
function EchoChip({ label, active, onPress, size = 'md', color }) {
  const [pressed, setPressed] = React.useState(false);
  const activeBg = color || T.rose600;
  return (
    <div style={{
      height: size === 'sm' ? 28 : 34, padding: size === 'sm' ? '0 10px' : '0 14px',
      borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: active ? activeBg : T.rose100, color: active ? '#fff' : T.rose400,
      fontFamily: 'Inter,system-ui', fontSize: size === 'sm' ? 12 : 13, fontWeight: 600,
      cursor: 'pointer', userSelect: 'none', letterSpacing: 0.1,
      transform: pressed ? 'scale(0.95)' : 'scale(1)',
      transition: 'all 140ms cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: active ? `0 2px 8px ${activeBg}44` : 'none',
    }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onPress?.(); }}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => { setPressed(false); onPress?.(); }}>
      {label}
    </div>
  );
}

// ── Score chip ───────────────────────────────────────────────
function ScoreChip({ score, label }) {
  const n = parseFloat(score);
  const [bg, color] = n >= 7 ? ['#D1FAE5','#065F46'] : n >= 5.5 ? ['#FEF3C7','#92400E'] : [T.rose100, T.rose600];
  return (
    <div style={{ height: 28, padding: '0 10px', borderRadius: 8, background: bg, color, display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600 }}>
      {label && <span style={{ opacity: 0.65, fontSize: 10 }}>{label}</span>}
      {score}
    </div>
  );
}

// ── Accent chip — no emoji, uses text abbreviation ────────────
function AccentChip({ accent = 'American', onPress, small = false }) {
  const isUs = accent === 'American';
  return (
    <div style={{
      height: small ? 24 : 30, padding: small ? '0 8px' : '0 10px', borderRadius: 999,
      background: isUs ? '#E0F2FE' : '#EEF2FF', display: 'inline-flex', alignItems: 'center', gap: 6,
      cursor: onPress ? 'pointer' : 'default',
      fontFamily: 'Inter,system-ui', fontSize: small ? 11 : 12, fontWeight: 700,
      color: isUs ? '#0369A1' : '#4338CA', letterSpacing: 0.3,
    }} onClick={onPress}>
      <div style={{ width: small ? 14 : 16, height: small ? 10 : 11, borderRadius: 2, overflow: 'hidden', flexShrink: 0, position: 'relative', border: `1px solid ${isUs ? '#0369A133' : '#4338CA33'}` }}>
        {isUs ? (
          <svg width="16" height="11" viewBox="0 0 16 11">
            <rect width="16" height="11" fill="#B22234"/>
            {[0,2,4,6,8].map(y => <rect key={y} y={y*1.1} width="16" height="0.85" fill="#B22234"/>)}
            {[1,3,5,7,9].map(y => <rect key={y} y={y*1.1} width="16" height="0.85" fill="#fff"/>)}
            <rect width="6.5" height="5.5" fill="#3C3B6E"/>
          </svg>
        ) : (
          <svg width="16" height="11" viewBox="0 0 16 11">
            <rect width="16" height="11" fill="#012169"/>
            <path d="M0 0l16 11M16 0L0 11" stroke="#fff" strokeWidth="2.2"/>
            <path d="M0 0l16 11M16 0L0 11" stroke="#C8102E" strokeWidth="1.2"/>
            <path d="M8 0v11M0 5.5h16" stroke="#fff" strokeWidth="3"/>
            <path d="M8 0v11M0 5.5h16" stroke="#C8102E" strokeWidth="1.8"/>
          </svg>
        )}
      </div>
      {!small && <span>{isUs ? 'American' : 'British'}</span>}
    </div>
  );
}

// ── Streak chip — SVG flame ───────────────────────────────────
function StreakChip({ count = 12 }) {
  if (!count) return null;
  return (
    <div style={{
      height: 30, padding: '0 10px', borderRadius: 999,
      background: '#FEF3C7', display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600, color: '#92400E',
    }}>
      <svg width="12" height="15" viewBox="0 0 12 16" fill="none">
        <path d="M6 1c0 0 4.5 3.5 4.5 7.5a4.5 4.5 0 01-9 0C1.5 6.5 3.5 4.5 3.5 4.5s0 2.5 2.5 3.8C7.5 7 6 1 6 1z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" strokeLinejoin="round"/>
      </svg>
      <span>{count} day streak</span>
    </div>
  );
}

// ── Bottom Tab Bar ───────────────────────────────────────────
function BottomTabBar({ active = 'home', onNavigate }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: c => Icon.home(c, 22) },
    { id: 'session', label: 'Session', icon: c => Icon.mic(c, 22) },
    { id: 'progress', label: 'Progress', icon: c => Icon.chart(c, 22) },
  ];
  return (
    <div style={{ height: 72, background: '#fff', borderTop: `1px solid ${T.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexShrink: 0 }}>
      {tabs.map(tab => {
        const isCenter = tab.id === 'session', isActive = active === tab.id;
        const c = isActive ? T.rose600 : T.muted;
        return (
          <div key={tab.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', flex: 1, marginTop: isCenter ? -18 : 0 }}
            onClick={() => onNavigate?.(tab.id)}>
            {isCenter ? (
              <div style={{ width: 56, height: 56, borderRadius: 999, background: T.rose600, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(225,29,116,0.38), 0 0 0 3px #fff' }}>
                {tab.icon('#fff')}
              </div>
            ) : tab.icon(c)}
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 600, color: c, letterSpacing: 0.2 }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Waveform (RAF-driven smooth) ─────────────────────────────
function Waveform({ state = 'idle', barCount = 28 }) {
  const phaseRef = React.useRef(0);
  const rafRef = React.useRef(null);
  const [bars, setBars] = React.useState(() => Array(barCount).fill(6));

  React.useEffect(() => {
    const center = barCount / 2;
    const animate = () => {
      phaseRef.current += state === 'listening' ? 0.19 : state === 'speaking' ? 0.11 : 0.018;
      const p = phaseRef.current;
      setBars(Array.from({ length: barCount }, (_, i) => {
        const dist = Math.abs(i - center) / center;
        if (state === 'idle') return 5 + Math.sin(p + i * 0.4) * 3.5;
        if (state === 'listening') {
          const a = Math.abs(Math.sin(p * 1.7 + i * 0.85));
          const b = Math.abs(Math.sin(p * 2.9 + i * 1.5)) * 0.35;
          return 8 + (a + b) * 40;
        }
        if (state === 'processing') {
          const wave = Math.sin(p * 1.3 - i * 0.52);
          return 6 + Math.max(0, wave) * 24;
        }
        if (state === 'speaking') {
          const env = Math.pow(1 - dist, 1.5);
          return 8 + Math.abs(Math.sin(p + i * 0.33)) * 54 * env + Math.abs(Math.sin(p * 1.8 + i * 0.62)) * 8;
        }
        return 6;
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, barCount]);

  const getColor = (i) => {
    const dist = Math.abs(i - barCount / 2) / (barCount / 2);
    if (state === 'idle') return '#E2D1DA';
    if (state === 'listening') return dist < 0.25 ? T.charcoal : T.slate;
    if (state === 'processing') return dist < 0.35 ? T.rose400 : T.rose200;
    if (state === 'speaking') {
      if (dist < 0.18) return T.rose500;
      if (dist < 0.45) return T.rose400;
      return T.rose200;
    }
    return '#E2D1DA';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3.5, height: 80 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 2.5, borderRadius: 999,
          height: Math.max(3, Math.min(74, h)),
          background: getColor(i),
          transition: state === 'idle' ? 'height 900ms ease-in-out' : 'none',
        }} />
      ))}
    </div>
  );
}

// ── Status pill ──────────────────────────────────────────────
function StatusPill({ state }) {
  const cfgs = {
    idle:       { dot: T.muted,   text: 'Ready',         color: T.slate,   bg: '#fff',   border: T.borderStrong },
    listening:  { dot: T.success, text: 'Listening',     color: T.charcoal,bg: '#fff',   border: '#D1FAE5', pulse: true },
    processing: { dot: T.rose500, text: 'Thinking',      color: T.slate,   bg: '#fff',   border: T.rose200, pulse: true, italic: true },
    speaking:   { dot: T.rose600, text: 'Echo speaking', color: T.rose600, bg: T.rose50, border: T.rose200, pulse: true },
  };
  const cfg = cfgs[state] || cfgs.idle;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ width: 7, height: 7, borderRadius: 999, background: cfg.dot, flexShrink: 0, animation: cfg.pulse ? 'pulse 1.4s ease-in-out infinite' : 'none' }} />
      <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 600, color: cfg.color, fontStyle: cfg.italic ? 'italic' : 'normal', letterSpacing: -0.1 }}>{cfg.text}</span>
    </div>
  );
}

// ── Pronunciation ring ───────────────────────────────────────
function PronunciationRing({ score = 82, animate = true, feedback = '' }) {
  const R = 44, circ = 2 * Math.PI * R;
  const [displayed, setDisplayed] = React.useState(animate ? 0 : score);
  const clr = score >= 75 ? T.success : score >= 50 ? T.warning : T.rose600;
  React.useEffect(() => {
    if (!animate) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 900, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(score * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);
  const offset = circ * (1 - displayed / 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 108, height: 108 }}>
        <svg width="108" height="108" viewBox="0 0 108 108">
          <circle cx="54" cy="54" r={R} fill="none" stroke={T.rose100} strokeWidth="8"/>
          <circle cx="54" cy="54" r={R} fill="none" stroke={clr} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 54 54)" style={{ transition: 'stroke-dashoffset 40ms linear, stroke 300ms ease' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 26, fontWeight: 800, color: clr, letterSpacing: -1 }}>{displayed}</span>
        </div>
      </div>
      {feedback && <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.slate, textAlign: 'center', maxWidth: 180 }}>{feedback}</div>}
    </div>
  );
}

// ── Micro label ──────────────────────────────────────────────
function MicroLabel({ children, style = {} }) {
  return <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '1.2px', textTransform: 'uppercase', ...style }}>{children}</div>;
}

// ── Section header ───────────────────────────────────────────
function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: 'Inter,system-ui', fontSize: 17, fontWeight: 700, color: T.charcoal, letterSpacing: -0.4 }}>{title}</span>
      {action && <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600, color: T.rose600, cursor: 'pointer', letterSpacing: -0.1 }} onClick={onAction}>{action}</span>}
    </div>
  );
}

Object.assign(window, {
  T, shadow, shadowMd, Icon,
  EchoButton, EchoInput, EchoChip, ScoreChip,
  AccentChip, StreakChip, PronunciationRing,
  BottomTabBar, Waveform, StatusPill, MicroLabel, SectionHeader,
});
