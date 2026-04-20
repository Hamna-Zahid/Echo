// echo-screens-home.jsx v3 — no emoji, sophisticated design

const MODES = [
  { id: 'Diagnostic',           color: '#0EA5E9', bg: '#E0F2FE', badge: '5 min',        badgeBg: '#BAE6FD', badgeColor: '#0369A1', desc: 'Assess your current IELTS band',        icon: (c,s=20) => Icon.clipboard(c,s) },
  { id: 'IELTS Training',       color: '#E11D74', bg: '#FFF0F6', badge: 'Recommended',  badgeBg: '#FCE7F3', badgeColor: '#BE185D', desc: 'Target your weak points with Echo',     icon: (c,s=20) => Icon.mic(c,s) },
  { id: 'Interview Prep',       color: '#D97706', bg: '#FFFBEB', badge: 'Pro',           badgeBg: '#FEF3C7', badgeColor: '#92400E', desc: 'Nail your next job interview',          icon: (c,s=20) => Icon.briefcase(c,s) },
  { id: 'Daily Conversation',   color: '#0D9488', bg: '#F0FDFA', badge: 'Casual',        badgeBg: '#CCFBF1', badgeColor: '#0F766E', desc: 'Build fluency through real dialogue',    icon: (c,s=20) => Icon.chat(c,s) },
  { id: 'Professional English', color: '#6366F1', bg: '#EEF2FF', badge: 'Work',          badgeBg: '#E0E7FF', badgeColor: '#4338CA', desc: 'Lead meetings, pitch, close deals',     icon: (c,s=20) => Icon.building(c,s) },
  { id: 'Accent Training',      color: '#7C3AED', bg: '#F5F3FF', badge: 'New',           badgeBg: '#EDE9FE', badgeColor: '#6D28D9', desc: 'Shadow, repeat, perfect your accent',   icon: (c,s=20) => Icon.waveform(c,s) },
];

// ── Home ─────────────────────────────────────────────────────
function HomeScreen({ onNavigate }) {
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setVis(true), 60); }, []);

  const recentSessions = [
    { mode: 'Diagnostic',          modeColor: '#0EA5E9', date: 'Today',  duration: '14 min', scores: [{ v: '6.5', l: 'IELTS' }] },
    { mode: 'IELTS Training',      modeColor: '#E11D74', date: 'Apr 18', duration: '22 min', scores: [{ v: '7.0', l: null }, { v: 'B2', l: null }] },
    { mode: 'Interview Prep',      modeColor: '#D97706', date: 'Apr 16', duration: '18 min', scores: [{ v: '7.0', l: null }] },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bgSubtle, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bg, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(6px)', transition: 'all 320ms ease' }}>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, fontWeight: 500, letterSpacing: 0.1 }}>Good morning,</div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 21, fontWeight: 700, color: T.charcoal, letterSpacing: -0.5, lineHeight: 1.2 }}>Ahmad.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <StreakChip count={12} />
          <div style={{ width: 38, height: 38, borderRadius: 999, background: T.rose100, border: `1.5px solid ${T.rose200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => onNavigate('profile')}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 700, color: T.rose600 }}>A</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Level card */}
        <div style={{
          background: `linear-gradient(138deg, #D81B60 0%, ${T.rose600} 48%, #C2185B 100%)`,
          borderRadius: 22, padding: '20px 22px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 28px rgba(225,29,116,0.25), 0 2px 8px rgba(0,0,0,0.06)',
          opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(22px)',
          transition: 'all 440ms cubic-bezier(0.34,1.2,0.64,1) 80ms',
          cursor: 'pointer',
        }} onClick={() => onNavigate('diagnostic')}>
          <div style={{ position: 'absolute', right: -32, top: -32, width: 130, height: 130, borderRadius: 999, background: 'rgba(255,255,255,0.055)' }} />
          <div style={{ position: 'absolute', right: 24, bottom: -44, width: 100, height: 100, borderRadius: 999, background: 'rgba(255,255,255,0.035)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <MicroLabel style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>Current Level</MicroLabel>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 56, fontWeight: 800, color: '#fff', lineHeight: 0.95, letterSpacing: -2.5 }}>B2</div>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 400 }}>Upper Intermediate</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <MicroLabel style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>IELTS Est.</MicroLabel>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 40, fontWeight: 800, color: '#FDE68A', lineHeight: 0.95, letterSpacing: -1.5 }}>6.5</div>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 5 }}>Target: 7.0</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 16, position: 'relative' }}>
            <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.16)' }}>
              <div style={{ height: '100%', borderRadius: 999, background: '#FDE68A', width: '75%', boxShadow: '0 0 10px rgba(253,230,138,0.6)', transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: 0.2 }}>6.5</span>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: 0.2 }}>Band 7.0</span>
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 18, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            {[['47', 'Sessions'],['12', 'Day streak'],['340', 'Errors fixed']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Inter,system-ui', fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>{n}</div>
                <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.2, marginTop: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Mode cards */}
        <div>
          <SectionHeader title="Start a Session" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
            {MODES.map((m, i) => (
              <div key={m.id} style={{
                background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 17,
                padding: '12px 14px 12px 0', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateX(-10px)',
                transition: `all 330ms ease ${100 + i * 50}ms`,
              }} onClick={() => onNavigate('pre-session', { mode: m.id })}>
                {/* Color strip */}
                <div style={{ width: 3, alignSelf: 'stretch', background: m.color, flexShrink: 0, borderRadius: '0 2px 2px 0' }} />
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 11, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.icon(m.color)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 600, color: T.charcoal, letterSpacing: -0.2 }}>{m.id}</span>
                    <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700, color: m.badgeColor, background: m.badgeBg, padding: '2px 7px', borderRadius: 999, letterSpacing: 0.2 }}>{m.badge}</span>
                  </div>
                  <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.desc}</div>
                </div>
                <div style={{ color: T.muted, flexShrink: 0, marginRight: 2 }}>{Icon.chevronRight(T.muted, 13)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        <div>
          <SectionHeader title="Recent" action="View all" onAction={() => onNavigate('progress')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 }}>
            {recentSessions.map((s, i) => (
              <div key={i} style={{ background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 13, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div style={{ height: 24, padding: '0 9px', borderRadius: 999, background: s.modeColor + '15', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 700, color: s.modeColor }}>{s.mode}</span>
                </div>
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.charcoal, flex: 1, fontWeight: 500 }}>{s.date}</span>
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, marginRight: 4 }}>{s.duration}</span>
                <div style={{ display: 'flex', gap: 5 }}>{s.scores.map((sc, j) => <ScoreChip key={j} score={sc.v} label={sc.l} />)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 10 }} />
      </div>
    </div>
  );
}

// ── Pre-Session ───────────────────────────────────────────────
function PreSessionScreen({ mode = 'IELTS Training', onBegin, onClose }) {
  const modeData = MODES.find(m => m.id === mode) || MODES[1];
  const [accent, setAccent] = React.useState('American');
  const [entered, setEntered] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setEntered(true), 60); }, []);

  const descs = {
    'Diagnostic': 'A structured 5-turn speaking assessment. Echo acts as a senior IELTS examiner — no corrections during the test. You\'ll receive a full band breakdown after.',
    'IELTS Training': 'Echo leads the conversation and steers topics toward your top recurring errors. Correction cards surface silently without interrupting your flow.',
    'Interview Prep': 'Echo plays a senior interviewer. Warm-up questions lead to behavioral and situational rounds. One precise coaching note at the end.',
    'Daily Conversation': 'Casual, free-flowing dialogue. Build fluency and natural rhythm without the pressure of formal assessment.',
    'Professional English': 'Echo plays a work colleague or client. Practice meetings, proposals, giving feedback — professional register throughout.',
    'Accent Training': 'Shadow Echo\'s speech, repeat each phrase, and receive an immediate pronunciation score. Focused drills for clarity and rhythm.',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg }}>
      {/* Top */}
      <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bgSubtle, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onClose}>
          {Icon.close(T.charcoal, 13)}
        </div>
        <div style={{ height: 28, padding: '0 14px', borderRadius: 999, background: modeData.bg, display: 'flex', alignItems: 'center', gap: 7 }}>
          {modeData.icon(modeData.color, 14)}
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 700, color: modeData.color, letterSpacing: 0.4, textTransform: 'uppercase' }}>{mode}</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 22px 0', overflowY: 'auto' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(12px)', transition: 'all 300ms ease' }}>
          <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 24, fontWeight: 700, color: T.charcoal, margin: '0 0 10px', letterSpacing: -0.5 }}>{mode}</h1>
          <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.slate, margin: '0 0 24px', lineHeight: 1.65 }}>{descs[mode] || descs['IELTS Training']}</p>

          {/* Settings */}
          <div style={{ border: `1px solid ${T.borderStrong}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ height: 54, padding: '0 16px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 15, color: T.charcoal, flex: 1 }}>Topic</span>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.rose500, fontWeight: 500 }}>Career & Work</span>
              <div style={{ marginLeft: 8, color: T.rose400 }}>{Icon.edit(T.rose400, 14)}</div>
            </div>
            <div style={{ height: 54, padding: '0 16px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 15, color: T.charcoal, flex: 1 }}>Accent</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['American','British'].map(a => (
                  <div key={a} style={{ height: 28, padding: '0 10px', borderRadius: 999, border: `1.5px solid ${accent === a ? modeData.color : T.borderStrong}`, background: accent === a ? modeData.bg : '#fff', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 140ms ease' }} onClick={() => setAccent(a)}>
                    <AccentChip accent={a} small />
                    <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 600, color: accent === a ? modeData.color : T.muted }}>{a === 'American' ? 'US' : 'UK'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error targeting */}
          <div style={{ background: T.rose50, border: `1px solid ${T.rose200}`, borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <MicroLabel style={{ color: T.rose400, marginBottom: 10 }}>Targeting your top errors</MicroLabel>
            {['Tense consistency','Article usage','Preposition choice'].map(e => (
              <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: 999, background: T.rose400, flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.slate }}>{e}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 22px 28px' }}>
        <EchoButton label="Begin Session" onPress={onBegin} />
      </div>
    </div>
  );
}

Object.assign(window, { MODES, HomeScreen, PreSessionScreen });
