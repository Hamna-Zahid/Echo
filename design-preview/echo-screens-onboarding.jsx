// echo-screens-onboarding.jsx v3 — no emoji, sophisticated design

function EchoLogo({ size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.34, background: `linear-gradient(140deg, ${T.rose600} 0%, #C2185B 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 12px rgba(225,29,116,0.32)` }}>
        <svg width={size * 0.56} height={size * 0.44} viewBox="0 0 18 14" fill="none">
          <rect x="0"   y="5.5" width="2.2" height="3"   rx="1.1" fill="white" fillOpacity="0.45"/>
          <rect x="3.8" y="3"   width="2.2" height="8"   rx="1.1" fill="white" fillOpacity="0.72"/>
          <rect x="7.6" y="0"   width="2.8" height="14"  rx="1.4" fill="white"/>
          <rect x="11.4"y="3"   width="2.2" height="8"   rx="1.1" fill="white" fillOpacity="0.72"/>
          <rect x="15.2"y="5.5" width="2.2" height="3"   rx="1.1" fill="white" fillOpacity="0.45"/>
        </svg>
      </div>
      <span style={{ fontFamily: 'Inter,system-ui', fontWeight: 800, fontSize: size * 0.72, color: T.charcoal, letterSpacing: -0.7 }}>Echo</span>
    </div>
  );
}

// ── Splash ──────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [prog, setProg] = React.useState(0);
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setVis(true), 100);
    const start = Date.now(), dur = 2000;
    const frame = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setProg(p);
      if (p < 1) requestAnimationFrame(frame);
      else setTimeout(onDone, 300);
    };
    requestAnimationFrame(frame);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      {/* Subtle bg gradient */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)', width: 280, height: 280, borderRadius: 999, background: 'radial-gradient(circle, rgba(252,231,243,0.6) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(18px)', transition: 'all 550ms cubic-bezier(0.34,1.2,0.64,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative' }}>
        <EchoLogo size={54} />
        <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.muted, margin: 0, letterSpacing: 0.2 }}>Speak with confidence.</p>
      </div>
      <div style={{ position: 'absolute', bottom: 68, left: 52, right: 52, height: 2, borderRadius: 999, background: T.rose100, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${T.rose600}, ${T.rose400})`, width: `${prog * 100}%`, transition: 'width 60ms linear' }} />
      </div>
    </div>
  );
}

// ── Onboarding ──────────────────────────────────────────────
function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = React.useState(0);

  const Slide0 = () => (
    <div style={{ flex: 1, padding: '32px 24px 0', animation: 'slideUp 380ms ease both' }}>
      {/* Giant number */}
      <div style={{ fontSize: 108, fontWeight: 800, color: T.rose600, lineHeight: 0.88, letterSpacing: -6, marginBottom: 26, fontFamily: 'Inter,system-ui', opacity: 0.9 }}>7</div>
      <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 30, fontWeight: 700, color: T.charcoal, margin: '0 0 14px', letterSpacing: -0.6, lineHeight: 1.18 }}>Your target is Band 7.</h1>
      <p style={{ fontFamily: 'Inter,system-ui', fontSize: 15, color: T.slate, margin: '0 0 28px', lineHeight: 1.65 }}>Most learners plateau at 5.5 because they never get live feedback on how they actually speak. Echo fixes that.</p>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { icon: Icon.chart(T.rose600, 18), label: 'Track your band' },
          { icon: Icon.mic(T.rose600, 18), label: 'Speak every day' },
          { icon: Icon.check(T.success, 16), label: 'Errors corrected' },
        ].map(({ icon, label }) => (
          <div key={label} style={{ flex: 1, background: T.bgSubtle, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: shadow }}>{icon}</div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 600, color: T.slate, textAlign: 'center', lineHeight: 1.3 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const Slide1 = () => (
    <div style={{ flex: 1, padding: '32px 24px 0', animation: 'slideUp 380ms ease both' }}>
      <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 28, fontWeight: 700, color: T.charcoal, margin: '0 0 6px', letterSpacing: -0.5 }}>How Echo works.</h1>
      <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.muted, margin: '0 0 22px' }}>The AI leads every session. Your job is to respond.</p>
      {[
        { n: '01', title: 'Echo opens the conversation', desc: 'The AI always starts and drives — you just respond naturally.', color: T.rose600 },
        { n: '02', title: 'Errors surface silently', desc: 'Grammar correction cards appear without ever interrupting your flow.', color: '#0EA5E9' },
        { n: '03', title: 'Your IELTS band updates', desc: 'Every session recalibrates your score estimate in real-time.', color: T.success },
      ].map((s, i) => (
        <div key={s.n} style={{ background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 18, padding: '16px 18px', display: 'flex', gap: 14, marginBottom: 10, boxShadow: shadow, animation: `slideUp 360ms ease ${i * 80}ms both` }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 0.2 }}>{s.n}</span>
          </div>
          <div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 600, color: T.charcoal, marginBottom: 3, letterSpacing: -0.2 }}>{s.title}</div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const Slide2 = () => (
    <div style={{ flex: 1, padding: '32px 24px 0', animation: 'slideUp 380ms ease both' }}>
      <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 28, fontWeight: 700, color: T.charcoal, margin: '0 0 4px', letterSpacing: -0.5 }}>Real results.</h1>
      <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.muted, margin: '0 0 22px' }}>From professionals who committed to daily practice.</p>
      {[
        { name: 'Ahmad R.', origin: 'Lahore, PK', result: '5.0 → 7.5', time: '3 months', quote: '"I finally sound confident in client meetings."' },
        { name: 'Priya S.', origin: 'Mumbai, IN', result: '5.5 → 7.0', time: '2 months', quote: '"The correction cards changed how I speak entirely."' },
        { name: 'Fatima K.', origin: 'Dhaka, BD', result: '6.0 → 7.5', time: '6 weeks',  quote: '"Echo is like having a private coach 24/7."' },
      ].map((u, i) => (
        <div key={u.name} style={{ background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 18, padding: '14px 16px', marginBottom: 10, animation: `slideUp 360ms ease ${i * 80}ms both`, boxShadow: shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
            {/* Initials avatar */}
            <div style={{ width: 36, height: 36, borderRadius: 999, background: T.rose100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 700, color: T.rose600 }}>{u.name[0]}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 600, color: T.charcoal, letterSpacing: -0.2 }}>{u.name}</div>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: T.muted }}>{u.origin} · {u.time}</div>
            </div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 700, color: T.rose600, letterSpacing: -0.3 }}>{u.result}</div>
          </div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: T.slate, fontStyle: 'italic', lineHeight: 1.5 }}>{u.quote}</div>
        </div>
      ))}
    </div>
  );

  const slides = [Slide0, Slide1, Slide2];
  const Current = slides[slide];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg }}>
      <Current key={slide} />
      {/* Page dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, padding: '20px 0 10px' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: i === slide ? 22 : 7, height: 7, borderRadius: 999, background: i === slide ? T.rose600 : T.rose100, transition: 'all 280ms cubic-bezier(0.34,1.4,0.64,1)' }} />)}
      </div>
      <div style={{ padding: '0 24px 28px' }}>
        {slide < 2 ? (
          <EchoButton label="Continue" onPress={() => setSlide(slide + 1)} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <EchoButton label="Create free account" onPress={() => onDone('register')} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.muted }}>Already have an account?{' '}
                <span style={{ color: T.rose600, fontWeight: 600, cursor: 'pointer' }} onClick={() => onDone('login')}>Sign in</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Login ────────────────────────────────────────────────────
function LoginScreen({ onDone, onRegister }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const doSignIn = () => { setLoading(true); setTimeout(() => { setLoading(false); onDone(); }, 900); };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg }}>
      <div style={{ flex: 1, padding: '24px 24px 0', animation: 'slideUp 340ms ease both' }}>
        <div style={{ marginBottom: 28 }}><EchoLogo size={28} /></div>
        <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 28, fontWeight: 700, color: T.charcoal, margin: '0 0 6px', letterSpacing: -0.6 }}>Welcome back.</h1>
        <p style={{ fontFamily: 'Inter,system-ui', fontSize: 15, color: T.muted, margin: '0 0 26px' }}>Sign in to continue your coaching.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
          <EchoInput placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <EchoInput placeholder="Password" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            rightIcon={<div style={{ cursor: 'pointer', display:'flex', alignItems:'center', color: T.rose400 }} onClick={() => setShowPass(!showPass)}>{Icon.eye(T.rose400, 18, showPass)}</div>} />
        </div>
        <div style={{ textAlign: 'right', marginBottom: 22 }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.rose500, cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
        </div>
        <EchoButton label={loading ? 'Signing in…' : 'Sign In'} disabled={loading} onPress={doSignIn} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, letterSpacing: 0.2 }}>or</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <div style={{ height: 54, borderRadius: 999, border: `1.5px solid ${T.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', background: '#fff' }}>
          {Icon.google()}
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 500, color: T.charcoal }}>Continue with Google</span>
        </div>
      </div>
      <div style={{ padding: '14px 24px 32px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.muted }}>
          Don't have an account?{' '}<span style={{ color: T.rose600, fontWeight: 600, cursor: 'pointer' }} onClick={onRegister}>Create one</span>
        </span>
      </div>
    </div>
  );
}

// ── Register ─────────────────────────────────────────────────
function RegisterScreen({ onDone, onLogin }) {
  const [goal, setGoal] = React.useState('IELTS');
  const [accent, setAccent] = React.useState('American');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflowY: 'auto' }}>
      <div style={{ padding: '24px 24px 32px', animation: 'slideUp 340ms ease both' }}>
        <div style={{ marginBottom: 24 }}><EchoLogo size={28} /></div>
        <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 28, fontWeight: 700, color: T.charcoal, margin: '0 0 24px', letterSpacing: -0.6 }}>Create your account.</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <EchoInput placeholder="Full name" />
          <EchoInput placeholder="Email address" type="email" />
          <EchoInput placeholder="Password" type="password" />
        </div>
        <MicroLabel style={{ marginBottom: 10 }}>Your Goal</MicroLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['IELTS','TOEFL','Job Interview','General English'].map(g => <EchoChip key={g} label={g} active={goal === g} onPress={() => setGoal(g)} />)}
        </div>
        <MicroLabel style={{ marginBottom: 10 }}>Preferred Accent</MicroLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {['American','British'].map(a => (
            <div key={a} style={{ display:'flex', alignItems:'center', gap:8, height:40, padding:'0 14px', borderRadius:12, border:`1.5px solid ${accent===a ? T.rose600 : T.borderStrong}`, background: accent===a ? T.rose50 : '#fff', cursor:'pointer', transition:'all 150ms ease' }} onClick={() => setAccent(a)}>
              <AccentChip accent={a} small />
              <span style={{ fontFamily:'Inter,system-ui', fontSize:14, fontWeight: accent===a ? 600 : 400, color: accent===a ? T.rose600 : T.charcoal }}>{a}</span>
            </div>
          ))}
        </div>
        <EchoButton label="Create Account" onPress={onDone} />
        <div style={{ textAlign: 'center', paddingTop: 14 }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.muted }}>
            Already have an account?{' '}<span style={{ color: T.rose600, fontWeight: 600, cursor: 'pointer' }} onClick={onLogin}>Sign in</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Post-Registration Setup ──────────────────────────────────
function PostRegistrationScreen({ onDone }) {
  const [level, setLevel] = React.useState(null);
  const [goal, setGoal] = React.useState(null);
  const levels = ['A2 – Elementary','B1 – Pre-intermediate','B1+ – Intermediate','B2 – Upper intermediate','C1 – Advanced'];
  const goals = [
    { icon: Icon.clipboard(T.rose600, 20), label: 'IELTS Band 7+' },
    { icon: Icon.briefcase(T.rose600, 20), label: 'Job interviews' },
    { icon: Icon.building(T.rose600, 20), label: 'Professional English' },
    { icon: Icon.chat(T.rose600, 20), label: 'Everyday fluency' },
  ];
  const ready = level && goal;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflowY: 'auto' }}>
      <div style={{ padding: '28px 24px 32px', animation: 'slideUp 340ms ease both' }}>
        <div style={{ marginBottom: 6 }}><EchoLogo size={26} /></div>
        <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: T.muted, marginBottom: 22, letterSpacing: 0.2, fontWeight: 500 }}>Quick setup · 30 seconds</div>
        <h1 style={{ fontFamily: 'Inter,system-ui', fontSize: 24, fontWeight: 700, color: T.charcoal, margin: '0 0 4px', letterSpacing: -0.5 }}>Where are you now?</h1>
        <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: T.muted, margin: '0 0 16px', lineHeight: 1.55 }}>Your best estimate is fine — Echo calibrates as you practice.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 26 }}>
          {levels.map((l, i) => (
            <div key={l} style={{ height: 52, borderRadius: 14, border: `1.5px solid ${level === l ? T.rose600 : T.borderStrong}`, background: level === l ? T.rose50 : '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 140ms ease', animation: `slideUp 280ms ease ${i * 45}ms both`, boxShadow: level === l ? `0 0 0 3px ${T.rose100}` : 'none' }} onClick={() => setLevel(l)}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: level === l ? 600 : 400, color: level === l ? T.rose600 : T.charcoal, flex: 1 }}>{l}</span>
              {level === l && <div style={{ width: 20, height: 20, borderRadius: 999, background: T.rose600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.check('#fff', 12)}</div>}
            </div>
          ))}
        </div>
        <h2 style={{ fontFamily: 'Inter,system-ui', fontSize: 20, fontWeight: 700, color: T.charcoal, margin: '0 0 14px', letterSpacing: -0.4 }}>What's your main goal?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 26 }}>
          {goals.map((g, i) => (
            <div key={g.label} style={{ borderRadius: 16, border: `1.5px solid ${goal === g.label ? T.rose600 : T.borderStrong}`, background: goal === g.label ? T.rose50 : '#fff', padding: '16px 14px', cursor: 'pointer', transition: 'all 140ms ease', animation: `cardEnter 280ms ease ${200 + i * 50}ms both`, boxShadow: goal === g.label ? `0 0 0 3px ${T.rose100}` : 'none' }} onClick={() => setGoal(g.label)}>
              <div style={{ marginBottom: 10 }}>{g.icon}</div>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 600, color: goal === g.label ? T.rose600 : T.charcoal, lineHeight: 1.3 }}>{g.label}</div>
            </div>
          ))}
        </div>
        <EchoButton label={ready ? 'Start coaching →' : 'Skip for now'} variant={ready ? 'primary' : 'secondary'} onPress={onDone} />
      </div>
    </div>
  );
}

Object.assign(window, { EchoLogo, SplashScreen, OnboardingScreen, LoginScreen, RegisterScreen, PostRegistrationScreen });
