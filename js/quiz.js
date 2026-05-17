'use strict';

// ════════════════════════════════════════════════════════════════════════
//  DATA
// ════════════════════════════════════════════════════════════════════════

const QUESTIONS = [
  {
    id: 'q1', axis: 'EI',
    text: 'When you have a free evening with no plans...',
    a: { text: 'I tend to reach out and make something happen', sub: 'Dinner somewhere, people to see', val: 'E' },
    b: { text: 'I look forward to time entirely on my own',     sub: 'No agenda, no obligations',     val: 'I' },
  },
  {
    id: 'q2', axis: 'EI',
    text: 'In a room full of people you don\'t know...',
    a: { text: 'I find it energising — I like meeting people', sub: 'Easy conversation, open to anyone',     val: 'E' },
    b: { text: 'I find my people and stay close to them',      sub: 'Quality over quantity, always',         val: 'I' },
  },
  {
    id: 'q3', axis: 'SN',
    text: 'When choosing something new, you trust...',
    a: { text: 'What you can see, read, and verify', sub: 'Reviews, track record, ingredients', val: 'S' },
    b: { text: 'Your gut. You know when something is right.',  sub: 'Instinct over information',     val: 'N' },
  },
  {
    id: 'q4', axis: 'SN',
    text: 'Your ideal holiday is...',
    a: { text: 'Planned well in advance, every detail considered', sub: 'Itinerary, bookings, no surprises', val: 'S' },
    b: { text: 'Booked on a whim, destination decided last minute', sub: 'The unknown is the whole point', val: 'N' },
  },
  {
    id: 'q5', axis: 'TF',
    text: 'When a friend comes to you with a problem...',
    a: { text: 'I help them think through it clearly', sub: 'What are the options? What makes sense?', val: 'T' },
    b: { text: 'I make sure they feel heard before anything else', sub: 'Logic can wait — presence first', val: 'F' },
  },
  {
    id: 'q6', axis: 'TF',
    text: 'The mood you most want a fragrance to give you...',
    a: { text: 'Sharp, composed, quietly powerful', sub: 'A scent that says something without words', val: 'T' },
    b: { text: 'Warm, intimate — a feeling more than a statement', sub: 'Like comfort. Like memory. Like home.', val: 'F' },
  },
  {
    id: 'q7', axis: 'JP',
    text: 'Your morning routine is...',
    a: { text: 'The same order, every day — it\'s efficient', sub: 'Predictability is its own kind of comfort', val: 'J' },
    b: { text: 'Different depending on how you feel when you wake', sub: 'Mood-driven, always shifting', val: 'P' },
  },
  {
    id: 'q8', axis: 'JP',
    text: 'When it comes to getting dressed...',
    a: { text: 'You have a style that works and you refine it', sub: 'A consistent signature, deliberately built', val: 'J' },
    b: { text: 'You choose by mood — it changes constantly', sub: 'Today\'s outfit says something tomorrow\'s won\'t', val: 'P' },
  },
];

const SCENT_FAMILIES = [
  { id: 'fresh-citrus',  name: 'Fresh & Citrus',     desc: 'Clean, bright, energising',   icon: '◎' },
  { id: 'warm-woody',    name: 'Warm & Woody',        desc: 'Grounded, rich, comforting',  icon: '◆' },
  { id: 'floral',        name: 'Floral & Romantic',   desc: 'Soft, expressive, sensual',   icon: '◇' },
  { id: 'dark-musky',    name: 'Dark & Musky',        desc: 'Bold, magnetic, nocturnal',   icon: '▲' },
  { id: 'clean-aquatic', name: 'Clean & Aquatic',     desc: 'Crisp, minimal, effortless',  icon: '●' },
];

const AGE_RANGES    = ['18–24', '25–34', '35–44', '45–54', '55+'];
const LIFESTYLE_OPT = [
  { id: 'office',  label: 'Office-based'     },
  { id: 'wfh',     label: 'Work from home'   },
  { id: 'active',  label: 'Active lifestyle' },
  { id: 'student', label: 'Student'          },
  { id: 'mixed',   label: 'Mixed'            },
];
const OCCASION_OPT  = [
  { id: 'daily',    label: 'Daily wear'        },
  { id: 'evenings', label: 'Evenings out'      },
  { id: 'work',     label: 'Work'              },
  { id: 'special',  label: 'Special occasions' },
  { id: 'all',      label: 'All occasions'     },
];

// Progress phases: label + which step numbers fall in each phase
const PHASES = [
  { label: 'Account',     steps: [1]                      },
  { label: 'Personality', steps: [2,3,4,5,6,7,8,9,10]    },
  { label: 'Your Life',   steps: [11,12]                  },
  { label: 'Connect',     steps: [13,14]                  },
  { label: 'Saving',      steps: [15]                     },
  { label: 'Checkout',    steps: [16,17]                  },
];

// ════════════════════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════════════════════

const state = {
  step: 0,
  auth: { email: '', password: '', mode: 'signup' },
  personality: {},                         // { q1:'E', q2:'I', ... }
  demographics: { age: null, lifestyle: [], occasion: [] },
  scentPrefs: [],                          // up to 2 family ids
  connections: { spotify: false, instagram: false },
  order: { subscription: false },
  profileId: null,
  processingTimer: null,
  _procInterval: null,
};

// ════════════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════════════

function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function buildPayload() {
  return {
    profileId:   state.profileId || uid(),
    createdAt:   new Date().toISOString(),
    email:       state.auth.email,
    personality: state.personality,
    demographics: state.demographics,
    scentPreferences: state.scentPrefs,
    connections: {
      spotify:   { connected: state.connections.spotify,   token: state.connections.spotify   ? 'mock_spotify_' + uid()   : null },
      instagram: { connected: state.connections.instagram, token: state.connections.instagram ? 'mock_instagram_' + uid() : null },
    },
    order: { kit: true, subscription: state.order.subscription },
  };
}

async function submitProfile(payload) {
  // Store locally for inspection / handoff to real backend
  localStorage.setItem('velai_profile', JSON.stringify(payload));
  console.log('[Velai] Profile payload ready for DB ingestion:', JSON.stringify(payload, null, 2));

  // Placeholder POST — swap base URL once backend exists
  try {
    await fetch('https://api.velai.com/profiles', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (_) {
    // Expected to fail until backend is wired — data is safe in localStorage
  }
}

// ════════════════════════════════════════════════════════════════════════
//  PROGRESS BAR
// ════════════════════════════════════════════════════════════════════════

function renderProgress() {
  const el = document.getElementById('qProgress');
  const back = document.getElementById('qBack');
  if (!el) return;

  if (state.step === 0 || state.step === 15 || state.step === 17) {
    el.innerHTML = '';
    back.hidden = true;
    return;
  }

  back.hidden = state.step <= 1;

  const currentPhaseIdx = PHASES.findIndex(p => p.steps.includes(state.step));

  el.innerHTML = PHASES.map((phase, i) => {
    const done   = i < currentPhaseIdx;
    const active = i === currentPhaseIdx;
    const cls    = done ? 'done' : active ? 'active' : '';
    const check  = done ? `<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#09080b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : '';
    return `<div class="qp-phase ${cls}">
      <div class="qp-dot">${check}</div>
      <span class="qp-label">${phase.label}</span>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════════════════════

function goTo(n, dir = 'fwd') {
  if (state.processingTimer) { clearTimeout(state.processingTimer); state.processingTimer = null; }
  if (state._procInterval)   { clearInterval(state._procInterval);  state._procInterval  = null; }

  const main = document.getElementById('qMain');
  const xOut = dir === 'fwd' ? '-20px' : '20px';
  const xIn  = dir === 'fwd' ?  '20px' : '-20px';

  // Slide + fade out
  main.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
  main.style.opacity    = '0';
  main.style.transform  = `translateX(${xOut})`;

  setTimeout(() => {
    state.step = n;
    renderProgress();
    main.innerHTML = getStep(state.step);

    // Snap to enter-side without transition
    main.style.transition = 'none';
    main.style.opacity    = '0';
    main.style.transform  = `translateX(${xIn})`;

    // Force reflow so browser registers the snap before animating in
    main.getBoundingClientRect();

    // Slide + fade in
    main.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
    main.style.opacity    = '1';
    main.style.transform  = 'none';

    main.scrollTop = 0;
    mountStep();
  }, 200);
}

function next()                 { goTo(state.step + 1, 'fwd');  }
function back()                 { goTo(state.step - 1, 'back'); }
function goToStep(n)            { goTo(n, 'fwd'); }

// ════════════════════════════════════════════════════════════════════════
//  STEP RENDERERS  (return HTML strings)
// ════════════════════════════════════════════════════════════════════════

function stepWelcome() {
  return `
    <div class="qstep">
      <div class="welcome-hero">
        <p class="q-eyebrow">Powered by AI &middot; Crafted in France</p>
        <h1 class="q-h1">Let's find your<br /><em>forever scent.</em></h1>
        <p class="q-body">
          A short personality quiz. Your music taste. A few lifestyle questions.
          Our AI will use everything you share to craft a fragrance profile
          unique to you — then we'll match it to your Discovery Kit.
        </p>
        <div class="welcome-meta">
          <span>8 questions</span>
          <span>Under 2 minutes</span>
          <span>No commitment</span>
        </div>
      </div>
      <button class="btn btn--gold btn--lg" id="btnWelcomeNext">Begin &rarr;</button>
    </div>`;
}

function stepAuth() {
  const isLogin = state.auth.mode === 'login';
  return `
    <div class="qstep">
      <p class="q-eyebrow">Step 1 of 6</p>
      <h2 class="q-h2">${isLogin ? 'Welcome back.' : 'Create your account.'}</h2>
      <p class="q-body" style="margin-bottom:28px">
        ${isLogin
          ? 'Log in to continue building your scent profile.'
          : 'Your profile is saved securely so we can match your scent and keep it yours.'}
      </p>
      <div class="auth-tabs">
        <button class="auth-tab ${!isLogin ? 'active' : ''}" data-mode="signup">Create account</button>
        <button class="auth-tab ${isLogin  ? 'active' : ''}" data-mode="login">Log in</button>
      </div>
      <div class="q-field">
        <label for="authEmail">Email address</label>
        <input id="authEmail" type="email" autocomplete="email"
               placeholder="you@example.com" value="${state.auth.email}" />
        <span class="q-field-error" id="emailErr"></span>
      </div>
      <div class="q-field">
        <label for="authPassword">${isLogin ? 'Password' : 'Create a password'}</label>
        <input id="authPassword" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}"
               placeholder="${isLogin ? '••••••••' : 'At least 8 characters'}" />
        <span class="q-field-error" id="passErr"></span>
      </div>
      <div style="margin-top:8px">
        <button class="btn btn--gold btn--full" id="btnAuthNext">
          ${isLogin ? 'Log in' : 'Create account'} &rarr;
        </button>
      </div>
      <p class="auth-terms">
        By continuing you agree to our
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </p>
    </div>`;
}

function stepQuizIntro() {
  return `
    <div class="qstep">
      <p class="q-eyebrow">Personality</p>
      <h2 class="q-h2">Eight questions.<br />Tell us how you move through the world.</h2>
      <p class="q-body" style="margin-bottom:0">
        There are no right answers. Just tap whichever option feels most like you — we'll handle the rest.
      </p>
      <div class="qintro-phases">
        <div class="qintro-phase">
          <span class="qintro-phase__num">1</span>
          <div class="qintro-phase__body">
            <h4>Energy</h4>
            <p>How you recharge and show up in the world</p>
          </div>
        </div>
        <div class="qintro-phase">
          <span class="qintro-phase__num">2</span>
          <div class="qintro-phase__body">
            <h4>Intuition</h4>
            <p>How you take in information and make decisions</p>
          </div>
        </div>
        <div class="qintro-phase">
          <span class="qintro-phase__num">3</span>
          <div class="qintro-phase__body">
            <h4>Feeling</h4>
            <p>What drives your choices and your values</p>
          </div>
        </div>
        <div class="qintro-phase">
          <span class="qintro-phase__num">4</span>
          <div class="qintro-phase__body">
            <h4>Rhythm</h4>
            <p>How you structure your time and your habits</p>
          </div>
        </div>
      </div>
      <button class="btn btn--gold btn--lg" id="btnIntroNext">Let's begin &rarr;</button>
    </div>`;
}

function stepQuestion(qIdx) {
  const q        = QUESTIONS[qIdx];
  const answered = state.personality[q.id];
  const progress = Math.round(((qIdx) / QUESTIONS.length) * 100);

  return `
    <div class="qstep">
      <div class="q-qnum">
        <span>${qIdx + 1} of ${QUESTIONS.length}</span>
        <div class="q-qnum-bar">
          <div class="q-qnum-fill" style="width:${progress}%"></div>
        </div>
        <span>${q.axis}</span>
      </div>
      <p class="q-question">${q.text}</p>
      <div class="q-choices">
        <button class="q-choice ${answered === q.a.val ? 'selected' : ''}" data-val="${q.a.val}">
          <span class="q-choice__text">${q.a.text}</span>
          <span class="q-choice__sub">${q.a.sub}</span>
        </button>
        <button class="q-choice ${answered === q.b.val ? 'selected' : ''}" data-val="${q.b.val}">
          <span class="q-choice__text">${q.b.text}</span>
          <span class="q-choice__sub">${q.b.sub}</span>
        </button>
      </div>
    </div>`;
}

function stepDemographics() {
  const d = state.demographics;

  const ageHtml = AGE_RANGES.map(a =>
    `<button class="q-pill ${d.age === a ? 'selected' : ''}" data-group="age" data-val="${a}">${a}</button>`
  ).join('');

  const lifeHtml = LIFESTYLE_OPT.map(o =>
    `<button class="q-pill ${d.lifestyle.includes(o.id) ? 'selected' : ''}" data-group="lifestyle" data-val="${o.id}">${o.label}</button>`
  ).join('');

  const occHtml = OCCASION_OPT.map(o =>
    `<button class="q-pill ${d.occasion.includes(o.id) ? 'selected' : ''}" data-group="occasion" data-val="${o.id}">${o.label}</button>`
  ).join('');

  return `
    <div class="qstep">
      <p class="q-eyebrow">Your Life</p>
      <h2 class="q-h2">A little about your lifestyle.</h2>
      <p class="q-body" style="margin-bottom:32px">
        This helps us understand the context your fragrance will live in day to day.
      </p>
      <div class="q-pill-section">
        <p class="q-pill-label">Age range</p>
        <div class="q-pill-group" id="pillAge">${ageHtml}</div>
      </div>
      <div class="q-pill-section">
        <p class="q-pill-label">Lifestyle <span style="font-weight:300;text-transform:none;letter-spacing:0">(select all that apply)</span></p>
        <div class="q-pill-group" id="pillLife">${lifeHtml}</div>
      </div>
      <div class="q-pill-section">
        <p class="q-pill-label">When do you wear fragrance? <span style="font-weight:300;text-transform:none;letter-spacing:0">(select all that apply)</span></p>
        <div class="q-pill-group" id="pillOcc">${occHtml}</div>
      </div>
      <div class="q-demo-actions">
        <button class="btn btn--gold" id="btnDemoNext" ${!d.age ? 'disabled' : ''}>Continue &rarr;</button>
        <span class="q-field-error" id="demoErr"></span>
      </div>
    </div>`;
}

function stepScentPrefs() {
  const cards = SCENT_FAMILIES.map(f => `
    <button class="q-scent-card ${state.scentPrefs.includes(f.id) ? 'selected' : ''}" data-id="${f.id}">
      <span class="q-scent-card__icon">${f.icon}</span>
      <span class="q-scent-card__name">${f.name}</span>
      <span class="q-scent-card__desc">${f.desc}</span>
    </button>`).join('');

  return `
    <div class="qstep">
      <p class="q-eyebrow">Your instincts</p>
      <h2 class="q-h2">Which of these resonates?</h2>
      <p class="q-body">Pick up to two. Your answer is a direction, not a constraint — our AI uses it alongside everything else.</p>
      <div class="q-scent-grid">${cards}</div>
      <p class="q-scent-hint" id="scentHint">${state.scentPrefs.length === 0 ? 'Select at least one to continue.' : `${state.scentPrefs.length} selected`}</p>
      <div style="margin-top:20px;display:flex;flex-direction:column;gap:10px">
        <button class="btn btn--gold" id="btnScentNext" ${state.scentPrefs.length === 0 ? 'disabled' : ''}>Continue &rarr;</button>
      </div>
    </div>`;
}

function stepConnect(platform) {
  const isSpotify   = platform === 'spotify';
  const connected   = state.connections[platform];
  const icon        = isSpotify
    ? `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;

  const brandClass  = `qmodal__brand--${platform}`;
  const title       = isSpotify ? 'Spotify' : 'Instagram';
  const desc        = isSpotify
    ? `We'll look at your top artists and genres to understand the emotional world your music lives in — and what it tells us about you.`
    : `We'll look at who you follow to read your visual aesthetic — fashion, art, interiors, lifestyle. Nothing is stored beyond your scent profile.`;
  const dataChips   = isSpotify
    ? ['Top artists', 'Genres', 'Listening patterns']
    : ['Accounts you follow', 'Public profile'];
  const btnClass    = `btn--${platform}`;
  const btnLabel    = `Connect ${title}`;
  const connectedId = `btn${platform.charAt(0).toUpperCase() + platform.slice(1)}Connect`;

  return `
    <div class="qstep">
      <p class="q-eyebrow">Connect · ${isSpotify ? '1 of 2' : '2 of 2'}</p>
      <h2 class="q-h2">${isSpotify ? 'Your music tells us a lot.' : 'Your feed tells us even more.'}</h2>
      <p class="q-body" style="margin-bottom:28px">Both connections are optional — but the more context we have, the more accurate your match.</p>
      <div class="q-connect-card ${connected ? 'connected' : ''}">
        <div class="q-connect-brand">
          <div class="qmodal__brand ${brandClass}" style="padding:6px 10px;gap:8px;font-size:0.8rem">
            ${icon} ${title}
          </div>
        </div>
        <h3>${connected ? `${title} connected` : `Connect your ${title}`}</h3>
        <p>${desc}</p>
        <div class="q-connect-data">
          ${dataChips.map(c => `<span class="q-data-chip">${c}</span>`).join('')}
        </div>
        ${connected
          ? `<div class="q-connect-status">Connected — data ready</div>`
          : `<button class="btn ${btnClass}" id="${connectedId}">${btnLabel}</button>`
        }
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn--gold" id="btnConnectNext">
          ${connected ? 'Continue →' : 'Continue without connecting →'}
        </button>
      </div>
    </div>`;
}

function stepProcessing() {
  const messages = [
    'Saving your personality profile…',
    'Logging your preferences…',
    'Securing your data…',
    'Almost done…',
  ];
  return `
    <div class="qstep qstep--center">
      <div class="q-processing">
        <div class="q-spinner"></div>
        <p class="q-processing-text" id="procText">${messages[0]}</p>
        <p class="q-processing-sub">Your data is being stored securely.<br />This takes just a moment.</p>
      </div>
    </div>`;
}

function stepPayment() {
  const sub   = state.order.subscription;
  const total = sub ? '46.00' : '18.00';

  return `
    <div class="qstep qstep--wide">
      <p class="q-eyebrow">Almost there</p>
      <div class="pay-layout">

        <div class="pay-summary">
          <p class="pay-summary__title">Order summary</p>
          <div class="pay-item">
            <div class="pay-item__info">
              <span class="pay-item__name">Discovery Kit</span>
              <span class="pay-item__sub">3 × 2ml AI-matched vials &middot; luxury case</span>
            </div>
            <span class="pay-item__price">£18.00</span>
          </div>
          <label class="pay-sub-toggle">
            <input type="checkbox" id="subToggle" ${sub ? 'checked' : ''} />
            <div class="pay-sub-label">
              <span>Add monthly subscription</span>
              <span>10ml refill every month &middot; cancel anytime</span>
            </div>
            <span class="pay-sub-price">+ £28</span>
          </label>
          <div class="pay-total">
            <span>Total today</span>
            <span class="pay-total-amount" id="payTotal">£${total}</span>
          </div>
          <ul class="pay-trust">
            <li>Free returns within 30 days</li>
            <li>Crafted by Guerlain-trained perfumers</li>
            <li>Ships in 3–5 business days</li>
            <li>Cancel subscription anytime</li>
          </ul>
        </div>

        <div class="pay-form">
          <p class="pay-form-title">Payment details</p>
          <div class="q-field">
            <label for="payName">Name on card</label>
            <input id="payName" type="text" autocomplete="cc-name" placeholder="Jane Smith" />
            <span class="q-field-error" id="payNameErr"></span>
          </div>
          <div class="q-field q-field--card">
            <label for="payCard">Card number</label>
            <input id="payCard" type="text" inputmode="numeric" autocomplete="cc-number"
                   placeholder="1234  5678  9012  3456" maxlength="19" />
            <span class="q-field-error" id="payCardErr"></span>
          </div>
          <div class="q-field--row">
            <div class="q-field">
              <label for="payExpiry">Expiry</label>
              <input id="payExpiry" type="text" inputmode="numeric" autocomplete="cc-exp"
                     placeholder="MM / YY" maxlength="7" />
              <span class="q-field-error" id="payExpiryErr"></span>
            </div>
            <div class="q-field">
              <label for="payCvc">CVC</label>
              <input id="payCvc" type="text" inputmode="numeric" autocomplete="cc-csc"
                     placeholder="123" maxlength="4" />
              <span class="q-field-error" id="payCvcErr"></span>
            </div>
          </div>
          <p class="pay-secure">Payments are encrypted end-to-end. We never store card details.</p>
          <div class="pay-submit-wrap">
            <button class="btn btn--gold btn--full btn--lg" id="btnPaySubmit">
              Place order — £<span id="btnPayAmt">${total}</span>
            </button>
            <span class="q-field-error" style="text-align:center" id="payGenErr"></span>
          </div>
        </div>

      </div>
    </div>`;
}

function stepConfirmation() {
  const orderId = 'VLI-' + Date.now().toString(36).toUpperCase();
  const payload = buildPayload();
  const connected = [
    state.connections.spotify   && 'Spotify',
    state.connections.instagram && 'Instagram',
  ].filter(Boolean);

  return `
    <div class="qstep qstep--center">
      <div class="q-confirm">
        <div class="q-confirm__check">&#10003;</div>
        <p class="q-eyebrow">Order confirmed</p>
        <h2 class="q-h2">Your kit is on its way.</h2>
        <p class="q-body" style="text-align:center;max-width:42ch">
          We'll craft your scent matches once our AI has processed your full profile.
          Expect an email within 48 hours.
        </p>
        <span class="q-confirm__order">${orderId}</span>
        <div class="q-confirm__detail">
          <div class="q-confirm__detail-row">
            <span>Discovery Kit</span><span>3 × 2ml vials</span>
          </div>
          ${state.order.subscription ? `<div class="q-confirm__detail-row"><span>Monthly subscription</span><span>10ml / month — starts next month</span></div>` : ''}
          ${connected.length ? `<div class="q-confirm__detail-row"><span>Connected</span><span>${connected.join(', ')}</span></div>` : ''}
          <div class="q-confirm__detail-row">
            <span>Profile saved</span><span style="font-family:monospace;font-size:0.75rem">${payload.profileId}</span>
          </div>
        </div>
        <div class="q-confirm__actions">
          <a href="index.html" class="btn btn--ghost">Back to Velai</a>
        </div>
      </div>
    </div>`;
}

// ════════════════════════════════════════════════════════════════════════
//  STEP ROUTER
// ════════════════════════════════════════════════════════════════════════

function getStep(n) {
  if (n === 0)                return stepWelcome();
  if (n === 1)                return stepAuth();
  if (n === 2)                return stepQuizIntro();
  if (n >= 3 && n <= 10)      return stepQuestion(n - 3);
  if (n === 11)               return stepDemographics();
  if (n === 12)               return stepScentPrefs();
  if (n === 13)               return stepConnect('spotify');
  if (n === 14)               return stepConnect('instagram');
  if (n === 15)               return stepProcessing();
  if (n === 16)               return stepPayment();
  if (n === 17)               return stepConfirmation();
  return '<p style="color:var(--muted);padding:40px">Unknown step.</p>';
}

// ════════════════════════════════════════════════════════════════════════
//  STEP MOUNT  (attach event listeners after render)
// ════════════════════════════════════════════════════════════════════════

function mountStep() {
  const n = state.step;

  if (n === 0) mountWelcome();
  else if (n === 1)          mountAuth();
  else if (n === 2)          mountQuizIntro();
  else if (n >= 3 && n <= 10) mountQuestion(n - 3);
  else if (n === 11)         mountDemographics();
  else if (n === 12)         mountScentPrefs();
  else if (n === 13)         mountConnect('spotify');
  else if (n === 14)         mountConnect('instagram');
  else if (n === 15)         mountProcessing();
  else if (n === 16)         mountPayment();
}

function mountWelcome() {
  document.getElementById('btnWelcomeNext')?.addEventListener('click', next);
}

function mountAuth() {
  // Tab switch
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.auth.mode = tab.dataset.mode;
      goTo(1, 'fwd');
    });
  });

  const emailInput = document.getElementById('authEmail');
  const passInput  = document.getElementById('authPassword');
  const emailErr   = document.getElementById('emailErr');
  const passErr    = document.getElementById('passErr');

  // Persist values on input
  emailInput?.addEventListener('input', () => {
    state.auth.email = emailInput.value.trim();
    emailInput.classList.remove('error');
    emailErr.textContent = '';
  });
  passInput?.addEventListener('input', () => {
    state.auth.password = passInput.value;
    passInput.classList.remove('error');
    passErr.textContent = '';
  });

  document.getElementById('btnAuthNext')?.addEventListener('click', () => {
    let valid = true;
    if (!isValidEmail(state.auth.email)) {
      emailErr.textContent = 'Please enter a valid email address.';
      emailInput.classList.add('error');
      valid = false;
    }
    if (state.auth.password.length < 8) {
      passErr.textContent = 'Password must be at least 8 characters.';
      passInput.classList.add('error');
      valid = false;
    }
    if (valid) next();
  });
}

function mountQuizIntro() {
  document.getElementById('btnIntroNext')?.addEventListener('click', next);
}

function mountQuestion(qIdx) {
  const q = QUESTIONS[qIdx];
  document.querySelectorAll('.q-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      // Store answer
      state.personality[q.id] = btn.dataset.val;
      // Visual feedback then advance
      btn.classList.add('selected');
      document.querySelectorAll('.q-choice').forEach(b => {
        if (b !== btn) b.style.opacity = '0.4';
      });
      setTimeout(next, 280);
    });
  });
}

function mountDemographics() {
  function handlePill(btn) {
    const group = btn.dataset.group;
    const val   = btn.dataset.val;

    if (group === 'age') {
      state.demographics.age = val;
      document.querySelectorAll('[data-group="age"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    } else {
      const arr = state.demographics[group];
      if (arr.includes(val)) {
        arr.splice(arr.indexOf(val), 1);
        btn.classList.remove('selected');
      } else {
        arr.push(val);
        btn.classList.add('selected');
      }
    }

    const continueBtn = document.getElementById('btnDemoNext');
    if (continueBtn) continueBtn.disabled = !state.demographics.age;
  }

  document.querySelectorAll('.q-pill').forEach(btn => {
    btn.addEventListener('click', () => handlePill(btn));
  });

  document.getElementById('btnDemoNext')?.addEventListener('click', () => {
    if (!state.demographics.age) {
      document.getElementById('demoErr').textContent = 'Please select your age range.';
      return;
    }
    next();
  });
}

function mountScentPrefs() {
  function updateState() {
    const hint = document.getElementById('scentHint');
    const btn  = document.getElementById('btnScentNext');
    if (hint) hint.textContent = state.scentPrefs.length === 0
      ? 'Select at least one to continue.'
      : `${state.scentPrefs.length} selected`;
    if (btn) btn.disabled = state.scentPrefs.length === 0;
  }

  document.querySelectorAll('.q-scent-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (state.scentPrefs.includes(id)) {
        state.scentPrefs.splice(state.scentPrefs.indexOf(id), 1);
        card.classList.remove('selected');
      } else {
        if (state.scentPrefs.length >= 2) {
          const oldest = state.scentPrefs.shift();
          document.querySelector(`.q-scent-card[data-id="${oldest}"]`)?.classList.remove('selected');
        }
        state.scentPrefs.push(id);
        card.classList.add('selected');
      }
      updateState();
    });
  });

  document.getElementById('btnScentNext')?.addEventListener('click', () => {
    if (state.scentPrefs.length > 0) next();
  });
}

function mountConnect(platform) {
  const isSpotify = platform === 'spotify';
  const modalId   = isSpotify ? 'spotifyModal'    : 'instagramModal';
  const authId    = isSpotify ? 'spotifyAuthorise' : 'instagramAuthorise';
  const cancelId  = isSpotify ? 'spotifyCancel'    : 'instagramCancel';
  const connectId = `btn${platform.charAt(0).toUpperCase() + platform.slice(1)}Connect`;

  document.getElementById(connectId)?.addEventListener('click', () => {
    document.getElementById(modalId).hidden = false;
  });

  document.getElementById(authId)?.addEventListener('click', () => {
    state.connections[platform] = true;
    document.getElementById(modalId).hidden = true;
    // Re-render this step so the connected state shows
    goTo(state.step, 'fwd');
  });

  document.getElementById(cancelId)?.addEventListener('click', () => {
    document.getElementById(modalId).hidden = true;
  });

  document.getElementById(`${platform}Backdrop`)?.addEventListener('click', () => {
    document.getElementById(modalId).hidden = true;
  });

  document.getElementById('btnConnectNext')?.addEventListener('click', next);
}

function mountProcessing() {
  const messages = [
    'Saving your personality profile…',
    'Logging your preferences…',
    'Securing your data…',
    'Almost done…',
  ];
  let idx = 0;
  const textEl = document.getElementById('procText');

  state._procInterval = setInterval(() => {
    idx = (idx + 1) % messages.length;
    if (textEl) textEl.textContent = messages[idx];
  }, 900);

  // Submit data then advance to payment
  const payload = buildPayload();
  state.profileId = payload.profileId;
  submitProfile(payload);

  state.processingTimer = setTimeout(() => {
    clearInterval(state._procInterval);
    state._procInterval = null;
    next();
  }, 3600);
}

function mountPayment() {
  // Card number: auto-space every 4 digits
  const cardInput = document.getElementById('payCard');
  cardInput?.addEventListener('input', () => {
    let v = cardInput.value.replace(/\D/g, '').slice(0, 16);
    cardInput.value = v.replace(/(.{4})/g, '$1  ').trim();
  });

  // Expiry: auto-insert slash
  const expiryInput = document.getElementById('payExpiry');
  expiryInput?.addEventListener('input', e => {
    let v = expiryInput.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0,2) + ' / ' + v.slice(2);
    expiryInput.value = v;
  });

  // Subscription toggle updates total
  const subToggle = document.getElementById('subToggle');
  subToggle?.addEventListener('change', () => {
    state.order.subscription = subToggle.checked;
    const total = state.order.subscription ? '46.00' : '18.00';
    document.getElementById('payTotal').textContent = '£' + total;
    document.getElementById('btnPayAmt').textContent = total;
  });

  // Submit
  document.getElementById('btnPaySubmit')?.addEventListener('click', () => {
    const name   = document.getElementById('payName').value.trim();
    const card   = document.getElementById('payCard').value.replace(/\s/g,'');
    const expiry = document.getElementById('payExpiry').value.trim();
    const cvc    = document.getElementById('payCvc').value.trim();
    let valid = true;

    if (!name) {
      document.getElementById('payNameErr').textContent = 'Please enter the name on your card.';
      document.getElementById('payName').classList.add('error');
      valid = false;
    } else { document.getElementById('payNameErr').textContent = ''; document.getElementById('payName').classList.remove('error'); }

    if (card.length < 16) {
      document.getElementById('payCardErr').textContent = 'Please enter a valid 16-digit card number.';
      document.getElementById('payCard').classList.add('error');
      valid = false;
    } else { document.getElementById('payCardErr').textContent = ''; document.getElementById('payCard').classList.remove('error'); }

    if (!/^\d{2}\s\/\s\d{2}$/.test(expiry)) {
      document.getElementById('payExpiryErr').textContent = 'Enter expiry as MM / YY.';
      document.getElementById('payExpiry').classList.add('error');
      valid = false;
    } else { document.getElementById('payExpiryErr').textContent = ''; document.getElementById('payExpiry').classList.remove('error'); }

    if (cvc.length < 3) {
      document.getElementById('payCvcErr').textContent = 'Enter a 3 or 4 digit CVC.';
      document.getElementById('payCvc').classList.add('error');
      valid = false;
    } else { document.getElementById('payCvcErr').textContent = ''; document.getElementById('payCvc').classList.remove('error'); }

    if (!valid) return;

    const btn = document.getElementById('btnPaySubmit');
    btn.textContent = 'Processing…';
    btn.disabled = true;
    setTimeout(() => next(), 1400);
  });
}

// ════════════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Initial render
  const main = document.getElementById('qMain');
  main.innerHTML = getStep(0);
  renderProgress();
  mountStep();

  // Global back button
  document.getElementById('qBack')?.addEventListener('click', back);
});
