// echo-screens-results.jsx v3 — no emoji, sophisticated design

// ── Session End ───────────────────────────────────────────────
function SessionEndScreen({ onViewReport, onStartAnother, onHome }) {
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setVis(true), 100); }, []);

  const scores = [
    { label: 'Fluency',        score: '6.5' },
    { label: 'Lexical',        score: '7.0' },
    { label: 'Grammar',        score: '6.0' },
    { label: 'Pronunciation',  score: '7.0' },
  ];
  const vocabUpgrades = [
    { used: 'very good', upgrade: 'exceptional' },
    { used: 'big problem', upgrade: 'significant challenge' },
  ];
  const errors = [
    { type: 'TENSE',  count: 2, color: '#F59E0B', bg: '#FEF3C7' },
    { type: 'ARTICLE',count: 1, color: '#0EA5E9', bg: '#E0F2FE' },
    { type: 'FILLER', count: 3, color: '#0D9488', bg: '#F0FDFA' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
        <div style={{ width: 34, height: 4, borderRadius: 999, background: T.borderStrong }} />
      </div>
      <div style={{ padding: '18px 22px 32px' }}>
        {/* Header */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(12px)', transition: 'all 320ms ease', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {Icon.check(T.success, 18)}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 24, fontWeight: 700, color: T.charcoal, margin: 0, letterSpacing: -0.5 }}>Session complete.</h1>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.muted, marginTop: 2 }}>14 minutes · IELTS Training</div>
            </div>
          </div>
        </div>

        {/* Score grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {scores.map((s, i) => {
            const n = parseFloat(s.score);
            const [bg, color] = n >= 7 ? ['#D1FAE5','#065F46'] : n >= 5.5 ? ['#FEF3C7','#92400E'] : [T.rose100, T.rose600];
            return (
              <div key={s.label} style={{ border: `1px solid ${T.borderStrong}`, borderRadius: 14, padding: '11px 6px', textAlign: 'center', animation: `cardEnter 320ms ease ${i * 55}ms both` }}>
                <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: T.muted, marginBottom: 5, fontWeight: 500, letterSpacing: 0.1 }}>{s.label}</div>
                <div style={{ fontFamily: 'Inter,system-ui', fontSize: 22, fontWeight: 700, color }}>{s.score}</div>
              </div>
            );
          })}
        </div>

        {/* Errors caught */}
        <div style={{ background: T.bgSubtle, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 28, fontWeight: 800, color: T.rose600, letterSpacing: -1 }}>6</span>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.charcoal, fontWeight: 500 }}>errors corrected this session</span>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {errors.map(e => (
              <div key={e.type} style={{ height: 28, padding: '0 10px', borderRadius: 999, background: e.bg, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 700, color: e.color, letterSpacing: 0.4, textTransform: 'uppercase' }}>{e.type}</span>
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: e.color, opacity: 0.6 }}>×{e.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vocabulary upgrades */}
        <div style={{ border: `1px solid ${T.borderStrong}`, borderRadius: 16, padding: '14px 16px', marginBottom: 20 }}>
          <MicroLabel style={{ marginBottom: 12 }}>Vocabulary Upgrades</MicroLabel>
          {vocabUpgrades.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < vocabUpgrades.length - 1 ? 10 : 0, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.muted, textDecoration: 'line-through', textDecorationColor: T.muted }}>"{v.used}"</span>
              {Icon.arrow(T.rose400, 14)}
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 700, color: T.rose600 }}>{v.upgrade}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <EchoButton label="View full report" variant="outline" onPress={onViewReport} />
          <EchoButton label="Start another session" onPress={onStartAnother} />
          <div style={{ textAlign: 'center', paddingTop: 2 }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.rose600, cursor: 'pointer', fontWeight: 500 }} onClick={onHome}>Back to home</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Diagnostic Results ────────────────────────────────────────
function DiagnosticScreen({ onBack, onStartTraining }) {
  const [barsIn, setBarsIn] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setBarsIn(true), 350); }, []);
  const criteria = [
    { name: 'Fluency & Coherence', score: 6.5 },
    { name: 'Lexical Resource',    score: 7.0 },
    { name: 'Grammar Range',       score: 6.0 },
    { name: 'Pronunciation',       score: 7.0 },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflowY: 'auto' }}>
      <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bgSubtle, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onBack}>
          {Icon.chevronLeft(T.charcoal, 16)}
        </div>
        <div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 17, fontWeight: 700, color: T.charcoal, letterSpacing: -0.4 }}>Your Assessment.</div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, marginTop: 1 }}>Based on your Apr 20 session</div>
        </div>
      </div>
      <div style={{ padding: '0 22px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Band card */}
        <div style={{ background: `linear-gradient(138deg, #D81B60 0%, ${T.rose600} 50%, #C2185B 100%)`, borderRadius: 22, padding: '22px 24px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 28px rgba(225,29,116,0.25)', animation: 'cardEnter 380ms ease both' }}>
          <div style={{ position: 'absolute', right: -24, top: -24, width: 110, height: 110, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <MicroLabel style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>IELTS Band</MicroLabel>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 70, fontWeight: 800, color: '#fff', lineHeight: 0.92, letterSpacing: -3 }}>6.5</div>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 8, fontWeight: 400 }}>Upper Intermediate · top 40% globally</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <MicroLabel style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>CEFR</MicroLabel>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 0.92, letterSpacing: -2 }}>B2</div>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              Estimated path to Band 7:{' '}
              <span style={{ color: '#FDE68A', fontWeight: 700 }}>12 weeks</span>{' '}at your current pace
            </span>
          </div>
        </div>

        {/* Score breakdown */}
        <div style={{ background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 20, padding: '18px 20px', boxShadow: shadow }}>
          <SectionHeader title="Score breakdown" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            {criteria.map((c, i) => {
              const clr = c.score >= 7 ? T.success : c.score >= 5.5 ? T.warning : T.rose600;
              return (
                <div key={c.name} style={{ animation: `slideUp 280ms ease ${i * 65}ms both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.charcoal, letterSpacing: -0.1 }}>{c.name}</span>
                    <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 700, color: clr }}>{c.score}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: T.rose100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${clr}, ${clr}BB)`, width: barsIn ? `${(c.score / 9) * 100}%` : '0%', transition: `width 640ms cubic-bezier(0.4,0,0.2,1) ${i * 80}ms` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths / Improve */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { title: 'Strengths', items: ['Vocabulary range', 'Pronunciation', 'Task response'], icon: Icon.check(T.success, 13), color: T.success, bg: '#F0FDF4' },
            { title: 'Improve',   items: ['Tense consistency', 'Article usage', 'Filler words'],  icon: Icon.arrow(T.rose500, 13), color: T.rose500, bg: T.rose50 },
          ].map(col => (
            <div key={col.title} style={{ background: col.bg, borderRadius: 16, padding: 14 }}>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700, color: col.color, marginBottom: 10, letterSpacing: -0.1 }}>{col.title}</div>
              {col.items.map(item => (
                <div key={item} style={{ display: 'flex', gap: 7, marginBottom: 7, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>{col.icon}</div>
                  <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.charcoal, lineHeight: 1.45, letterSpacing: -0.1 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Learning plan */}
        <div style={{ background: T.rose50, border: `1px solid ${T.rose200}`, borderRadius: 18, padding: 18 }}>
          <MicroLabel style={{ color: T.rose400, marginBottom: 10 }}>Your Learning Plan</MicroLabel>
          <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.slate, margin: '0 0 14px', lineHeight: 1.65, letterSpacing: -0.1 }}>
            You've reduced tense errors by 40% this week. Focus on article usage in your next 3 sessions — it's the fastest path to Band 7.
          </p>
          <div style={{ display: 'inline-flex', height: 30, padding: '0 14px', borderRadius: 999, background: T.rose600, alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 0.1 }}>Next focus: Article usage</span>
          </div>
        </div>
        <EchoButton label="Start training session" onPress={onStartTraining || onBack} />
      </div>
    </div>
  );
}

// ── Progress ──────────────────────────────────────────────────
function ProgressScreen({ onNavigate, onErrorDetail }) {
  const [filter, setFilter] = React.useState('All');
  const pts = [{ d: 'Feb', s: 5.0 }, { d: 'Mar', s: 5.5 }, { d: 'Apr 1', s: 6.0 }, { d: 'Apr 20', s: 6.5 }];
  const W = 286, H = 80, MIN = 4.5, MAX = 8.5;
  const px = i => (i / (pts.length - 1)) * (W - 20) + 10;
  const py = s => H - ((s - MIN) / (MAX - MIN)) * (H - 16) - 8;
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(p.s)}`).join(' ');
  const fillPath = `${linePath} L ${px(pts.length-1)} ${H} L ${px(0)} ${H} Z`;

  const errors = [
    { type: 'TENSE',       count: 7, color: '#F59E0B', bg: '#FEF3C7', original: 'I am working here since 2019',   corrected: 'I have been working here since 2019', resolved: false },
    { type: 'ARTICLE',     count: 4, color: '#0EA5E9', bg: '#E0F2FE', original: 'She is best student in class',   corrected: 'She is the best student in class',   resolved: false },
    { type: 'FILLER',      count: 2, color: '#0D9488', bg: '#F0FDFA', original: 'basically, like, so…',           corrected: 'Remove filler words',                 resolved: true  },
    { type: 'PREPOSITION', count: 1, color: '#8B5CF6', bg: '#EDE9FE', original: 'interested for this role',       corrected: 'interested in this role',             resolved: false },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bgSubtle, overflowY: 'auto' }}>
      <div style={{ background: T.bg, padding: '14px 22px 16px', borderBottom: `1px solid ${T.border}` }}>
        <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 26, fontWeight: 700, color: T.charcoal, margin: 0, letterSpacing: -0.5 }}>Progress</h1>
      </div>
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Level hero */}
        <div style={{ textAlign: 'center', padding: '6px 0' }}>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 54, fontWeight: 800, color: T.charcoal, lineHeight: 1, letterSpacing: -2.5 }}>B2</div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.muted, marginTop: 4, letterSpacing: -0.1 }}>Upper Intermediate · IELTS 6.5</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <div style={{ width: 44, height: 2, borderRadius: 999, background: T.rose600 }} />
          </div>
        </div>

        {/* IELTS chart */}
        <div style={{ background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 20, padding: '16px 18px 10px', boxShadow: shadow }}>
          <MicroLabel style={{ marginBottom: 16 }}>IELTS Score Over Time</MicroLabel>
          <svg width={W} height={H + 22} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.rose500} stopOpacity="0.12"/>
                <stop offset="100%" stopColor={T.rose500} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[5, 6, 7].map(s => (
              <React.Fragment key={s}>
                <line x1="0" y1={py(s)} x2={W} y2={py(s)} stroke={T.border} strokeWidth="1"/>
                <text x="-5" y={py(s)+4} textAnchor="end" fontFamily="Inter,system-ui" fontSize="10" fill={T.muted}>{s}</text>
              </React.Fragment>
            ))}
            <path d={fillPath} fill="url(#areaGrad)"/>
            <path d={linePath} fill="none" stroke={T.rose500} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={px(i)} cy={py(p.s)} r="5.5" fill={T.rose600}/>
                <circle cx={px(i)} cy={py(p.s)} r="3" fill="#fff"/>
                <text x={px(i)} y={H + 18} textAnchor="middle" fontFamily="Inter,system-ui" fontSize="10" fill={T.muted}>{p.d}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Recurring errors */}
        <div>
          <SectionHeader title="Recurring Errors" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 }}>
            {errors.map(e => (
              <div key={e.type} style={{ background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', opacity: e.resolved ? 0.5 : 1, transition: 'all 200ms ease' }}
                onClick={() => onErrorDetail?.(e)}>
                <div style={{ height: 25, padding: '0 8px', borderRadius: 999, background: e.bg, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700, color: e.color, letterSpacing: 0.5, textTransform: 'uppercase' }}>{e.type}</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.charcoal, fontWeight: 500, textDecoration: e.resolved ? 'none' : 'line-through', textDecorationColor: T.errorText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.original}</div>
                  <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{e.corrected}</div>
                </div>
                {e.resolved ? (
                  <div style={{ height: 22, padding: '0 8px', borderRadius: 999, background: '#D1FAE5', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700, color: '#065F46', letterSpacing: 0.3 }}>Resolved</span>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 700, color: e.count >= 5 ? T.rose600 : e.count >= 2 ? T.warning : T.muted, flexShrink: 0, letterSpacing: -0.3 }}>×{e.count}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Session history */}
        <div>
          <SectionHeader title="Sessions" />
          <div style={{ display: 'flex', gap: 7, margin: '10px 0 12px', flexWrap: 'wrap' }}>
            {['All','Training','Diagnostic','Interview'].map(f => <EchoChip key={f} label={f} active={filter === f} size="sm" onPress={() => setFilter(f)} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { mode: 'Diagnostic',    color: '#0EA5E9', date: 'Apr 20', dur: '14 min', scores: ['6.5','7.0'] },
              { mode: 'IELTS Training',color: T.rose600, date: 'Apr 18', dur: '22 min', scores: ['7.0','6.5'] },
              { mode: 'Interview Prep',color: T.warning, date: 'Apr 16', dur: '18 min', scores: ['7.0'] },
            ].map((s, i) => (
              <div key={i} style={{ background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 13, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ height: 24, padding: '0 8px', borderRadius: 999, background: s.color + '15', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.mode}</span>
                </div>
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.charcoal, flex: 1, fontWeight: 500 }}>{s.date}</span>
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, marginRight: 6 }}>{s.dur}</span>
                <div style={{ display: 'flex', gap: 4 }}>{s.scores.map((sc, j) => <ScoreChip key={j} score={sc} />)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

// ── Error Detail ──────────────────────────────────────────────
function ErrorDetailScreen({ error, onBack }) {
  const cfg = (typeof ERROR_TYPES !== 'undefined' ? ERROR_TYPES : {})[error?.type] || { color: T.rose600, bg: T.rose50 };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflowY: 'auto' }}>
      <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bgSubtle, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onBack}>
          {Icon.chevronLeft(T.charcoal, 16)}
        </div>
        <div style={{ height: 27, padding: '0 12px', borderRadius: 999, background: cfg.bg, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700, color: cfg.color, letterSpacing: 0.9, textTransform: 'uppercase' }}>{error?.type}</span>
        </div>
      </div>
      <div style={{ padding: '0 22px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 22, fontWeight: 700, color: T.charcoal, margin: '0 0 5px', letterSpacing: -0.5 }}>Tense error</h1>
          <p style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.muted, margin: 0, fontWeight: 500 }}>Seen {error?.count || 7} times across 3 sessions · Still active</p>
        </div>
        {/* Rule */}
        <div style={{ background: T.bgSubtle, borderRadius: 16, padding: 16 }}>
          <MicroLabel style={{ marginBottom: 10 }}>The Rule</MicroLabel>
          <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.slate, margin: '0 0 12px', lineHeight: 1.65 }}>
            Use <strong style={{ color: T.charcoal }}>present perfect continuous</strong> for actions that started in the past and are still ongoing. "Since" and "for" with present actions always require this form.
          </p>
          <div style={{ background: '#fff', border: `1px solid ${T.borderStrong}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.charcoal, textDecoration: 'line-through', textDecorationColor: T.errorText }}>I am working here since 2019</span>
            {Icon.arrow(T.muted, 13)}
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700, color: T.charcoal }}>I have been working here since 2019</span>
          </div>
        </div>
        {/* Usage example */}
        <div>
          <MicroLabel style={{ marginBottom: 10 }}>Usage Example</MicroLabel>
          <div style={{ background: T.rose50, borderLeft: `3px solid ${T.rose400}`, borderRadius: '0 12px 12px 0', padding: '12px 16px' }}>
            <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.slate, margin: 0, fontStyle: 'italic', lineHeight: 1.65 }}>
              "I've been working at this company since 2019, and it has been a great learning experience."
            </p>
          </div>
        </div>
        {/* Occurrences */}
        <div>
          <MicroLabel style={{ marginBottom: 10 }}>Your Occurrences</MicroLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { session: 'Apr 20 · IELTS Training', quote: '"I am working here since 2019"' },
              { session: 'Apr 18 · Training',        quote: '"She is working in that company since years"' },
              { session: 'Apr 16 · Interview Prep',  quote: '"I am doing this job since 3 years"' },
            ].map((o, i) => (
              <div key={i} style={{ background: T.bgSubtle, border: `1px solid ${T.border}`, borderRadius: 12, padding: '11px 14px' }}>
                <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: T.muted, marginBottom: 4, fontWeight: 600, letterSpacing: 0.1 }}>{o.session}</div>
                <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.charcoal, fontStyle: 'italic' }}>{o.quote}</div>
              </div>
            ))}
          </div>
        </div>
        <EchoButton label="Practice this in a session" onPress={onBack} />
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.success, fontWeight: 600, cursor: 'pointer', letterSpacing: -0.1 }}>Mark as resolved</span>
        </div>
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────
function ProfileScreen({ onBack, onSignOut }) {
  const groups = [
    { section: 'COACHING PREFERENCES', items: [
      { label: 'Target exam',          detail: 'IELTS' },
      { label: 'Target band',          detail: '7.0' },
      { label: 'Preferred accent',     detail: 'American · US' },
      { label: 'Session length',       detail: '20 min' },
      { label: 'Correction sensitivity', detail: 'All errors', isLast: true },
    ]},
    { section: 'INTERVIEW PREFERENCES', items: [
      { label: 'Job domain',       detail: 'Software Engineering' },
      { label: 'Experience level', detail: 'Mid-level', isLast: true },
    ]},
    { section: 'ACCOUNT', items: [
      { label: 'Change password' },
      { label: 'Notifications' },
      { label: 'Delete account', danger: true, isLast: true },
    ]},
    { section: 'APP', items: [
      { label: 'Rate Echo' },
      { label: 'Privacy policy' },
      { label: 'Version 1.0.0', muted: true, isLast: true },
    ]},
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bgSubtle, overflowY: 'auto' }}>
      <div style={{ background: T.bg, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.bgSubtle, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onBack}>
          {Icon.chevronLeft(T.charcoal, 16)}
        </div>
        <span style={{ fontFamily: 'Inter,system-ui', fontSize: 17, fontWeight: 700, color: T.charcoal, letterSpacing: -0.4 }}>Profile</span>
      </div>
      {/* Avatar block */}
      <div style={{ background: T.bg, padding: '22px 22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: T.rose100, border: `2px solid ${T.rose200}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 26, fontWeight: 700, color: T.rose600, letterSpacing: -1 }}>A</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 17, fontWeight: 600, color: T.charcoal, letterSpacing: -0.3 }}>Ahmad Raza</div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.muted, marginTop: 2 }}>ahmad.raza@gmail.com</div>
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <ScoreChip score="B2" />
          <ScoreChip score="6.5" label="IELTS" />
          <StreakChip count={12} />
        </div>
      </div>
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {groups.map(g => (
          <div key={g.section}>
            <MicroLabel style={{ marginBottom: 8 }}>{g.section}</MicroLabel>
            <div style={{ background: T.bg, borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.borderStrong}` }}>
              {g.items.map((item) => (
                <div key={item.label} style={{ height: 52, padding: '0 16px', display: 'flex', alignItems: 'center', borderBottom: item.isLast ? 'none' : `1px solid ${T.border}`, cursor: 'pointer' }}>
                  <span style={{ flex: 1, fontFamily: 'Inter,system-ui', fontSize: 15, color: item.danger ? T.errorText : item.muted ? T.muted : T.charcoal, letterSpacing: -0.1 }}>{item.label}</span>
                  {item.detail && <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.muted, marginRight: 6 }}>{item.detail}</span>}
                  {!item.muted && !item.danger && Icon.chevronRight(T.muted, 13)}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 15, color: T.rose500, fontWeight: 600, cursor: 'pointer', letterSpacing: -0.1 }} onClick={onSignOut}>Sign out</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SessionEndScreen, DiagnosticScreen, ProgressScreen, ErrorDetailScreen, ProfileScreen });
