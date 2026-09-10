/* Sparkle Tables – 2, 5 and 10 times tables (ages 6-8) */
'use strict';

/* ---------------- Content ---------------- */
const TABLES = [2, 5, 10];
const MULTIPLIERS = [1,2,3,4,5,6,7,8,9,10,11,12];
const INTRO_ORDER = [1,2,5,10,3,4,6,7,8,9,11,12];   // anchor facts first
const INTERVALS = [0,1,2,4,7];                        // sessions until due, by box
const FAST_MS = 6000;                                 // MTC standard
const SESSION_LEN = 10;
const MAX_NEW_PER_SESSION = 3;
const PARENT_PIN = '1964';                            // Grown-ups' corner code (child-proofing, not security)

const REALMS = {
  2:  { id:2,  name:'Fairy Glen',     emoji:'🧚', owner:'🧚', ownerName:'fairy',   ownerPlural:'fairies',  item:'⭐', itemName:'stars',  blurb:'Every fairy carries 2 stars', colour:'#c8f5d5', stages:['🌱','🌿','🌼','🌸','🧚'], coin:'2p' },
  5:  { id:5,  name:'Mermaid Lagoon', emoji:'🧜‍♀️', owner:'🧜‍♀️', ownerName:'mermaid', ownerPlural:'mermaids', item:'🐚', itemName:'shells', blurb:'Every mermaid has 5 shells', colour:'#bfe9ff', stages:['🫧','🌱','🌷','🌸','🧜‍♀️'], coin:'5p' },
  10: { id:10, name:'Unicorn Meadow', emoji:'🦄', owner:'🦄', ownerName:'unicorn', ownerPlural:'unicorns', item:'💎', itemName:'gems',   blurb:'Every unicorn has 10 gems', colour:'#ffd9ec', stages:['🌱','🌿','🌷','🌸','🦄'], coin:'10p' },
};
const MIXED = { id:'mix', name:'Rainbow Castle', emoji:'🏰', blurb:'All three tables mixed up', colour:'#e6dbff' };

const PRAISE = [
  'You worked that out beautifully!', 'Your brain just grew a little bit! 🧠', 'That’s what mathematicians do!',
  'Sparkling! ✨', 'You remembered it!', 'Brilliant thinking!', 'You’re getting quicker at that one!',
  'Wonderful – keep going!', 'Magic! That fact is getting stronger.', 'Yes! You’ve got this.',
];
const RETRY = [
  'Not quite – let’s look together.', 'Tricky one! Have a look at the picture.', 'Hmm, nearly. Let’s count it.',
  'Good try! Here’s a clue.',
];
const REVEAL = [
  'Here’s the answer – say it out loud with me!', 'That one’s a sneaky fact. We’ll see it again soon.',
  'Mistakes help us learn. Let’s remember this one together.',
];

/* ---------------- State ---------------- */
const KEY = 'sparkle-tables-v1';
let S = load();

function freshState() {
  const facts = {};
  for (const t of TABLES) for (const n of MULTIPLIERS) facts[`${t}x${n}`] = { t, n, box:0, seen:0, right:0, wrong:0, fast:0, due:0, last:0 };
  return {
    version:1, name:'', gems:0, totalGems:0, sessions:0, facts,
    doll: Object.assign({}, DOLL_DEFAULT),
    owned: DOLL_ITEMS.filter(i => i.cost === 0).map(i => i.slot + ':' + i.id),
    settings: { sound:true, speak:true },
    history: [],
  };
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); return Object.assign(freshState(), s); } } catch (e) {}
  return freshState();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------------- Helpers ---------------- */
const $ = id => document.getElementById(id);
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pence = p => p >= 100 && p % 100 === 0 ? `£${p/100}` : (p >= 100 ? `£${(p/100).toFixed(2)}` : `${p}p`);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0, 0);
}
function realmFacts(realm) {
  return Object.values(S.facts).filter(f => realm === 'mix' || f.t === realm);
}
function realmUnlocked(realm) {
  if (realm !== 'mix') return true;
  // Rainbow Castle: each table has at least 5 facts at box >= 2
  return TABLES.every(t => realmFacts(t).filter(f => f.box >= 2).length >= 5);
}
function sprintUnlocked() {
  return Object.values(S.facts).filter(f => f.box >= 3).length >= 20;
}

/* ---------------- Audio ---------------- */
let audioCtx = null;
function beep(freqs, dur = 0.12, type = 'sine', gain = 0.12) {
  if (!S.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type; o.frequency.value = f;
      const t0 = audioCtx.currentTime + i * dur * 0.8;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g).connect(audioCtx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    });
  } catch (e) {}
}
const SFX = {
  click: () => beep([880], 0.06, 'triangle', 0.05),
  good: () => beep([523, 659, 784], 0.14),
  great: () => beep([523, 659, 784, 1047], 0.14),
  oops: () => beep([330, 262], 0.2, 'sine', 0.08),
  bloom: () => beep([523, 587, 659, 784, 880, 1047], 0.1, 'triangle'),
  gem: () => beep([1200, 1600], 0.07, 'triangle', 0.06),
};

function speak(text) {
  if (!S.settings.speak || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/[✨🧚🧜‍♀️🦄🐚💎⭐]/g, ''));
    u.lang = 'en-GB'; u.rate = 0.92; u.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => /en-GB/i.test(v.lang) && /female|Kate|Serena|Stephanie|Martha|Google UK English Female/i.test(v.name)) || voices.find(v => /en-GB/i.test(v.lang));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------------- Confetti ---------------- */
const cv = $('confetti'), cx = cv.getContext('2d');
let particles = [];
function resizeCanvas() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();
function confetti(n = 60, emoji = false) {
  const cols = ['#ff7eb6', '#9b6cff', '#ffd166', '#4fd1c5', '#7ddf9a', '#fff'];
  const chars = ['✨', '⭐', '💖', '🌸', '💎'];
  for (let i = 0; i < n; i++) particles.push({
    x: cv.width / 2 + (Math.random() - 0.5) * 200, y: cv.height * 0.4,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, g: 0.35 + Math.random() * 0.2,
    r: 4 + Math.random() * 6, c: rnd(cols), ch: emoji ? rnd(chars) : null, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 90 + Math.random() * 40,
  });
  if (particles.length === n) requestAnimationFrame(tick);
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.98; p.rot += p.vr; p.life--;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = Math.min(1, p.life / 30);
    if (p.ch) { cx.font = '22px serif'; cx.fillText(p.ch, -11, 8); } else { cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); }
    cx.restore();
  }
  if (particles.length) requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height);
}

/* ---------------- Visual models ---------------- */
function groupsHTML(t, n, opts = {}) {
  const R = REALMS[t];
  const compact = t === 10 || n > 8;
  const cards = [];
  for (let i = 0; i < n; i++) {
    cards.push(`<div class="group t${t}${compact ? ' compact' : ''}" style="animation-delay:${i * 40}ms"><span class="owner">${R.owner}</span><span class="items">${Array(t).fill(`<span>${R.item}</span>`).join('')}</span></div>`);
  }
  const skips = [];
  for (let i = 1; i <= n; i++) skips.push(`<span class="${i === n ? 'total' : ''}">${i === n && opts.hideTotal ? '?' : t * i}</span>`);
  const caption = opts.caption || `${n} ${n === 1 ? R.ownerName : R.ownerPlural}, ${t} ${R.itemName} each. Count in ${t}s:`;
  return `<div class="model-caption">${caption}</div><div class="groups">${cards.join('')}</div><div class="skip">${skips.join('')}</div>`;
}

/* ---------------- Question generation ---------------- */
// kinds: intro (choices), mult, skip, missing, div, word
function makeQuestion(f, kindOverride) {
  const { t, n } = f, R = REALMS[t], p = t * n;
  let kind = kindOverride;
  if (!kind) {
    if (f.box === 0) kind = f.seen === 0 ? 'intro' : rnd(['intro', 'mult']);
    else if (f.box === 1) kind = 'mult';
    else if (f.box === 2) kind = rnd(['mult', 'mult', 'skip', 'missing']);
    else if (f.box === 3) kind = rnd(['mult', 'div', 'missing', 'word', 'word']);
    else kind = rnd(['mult', 'mult', 'div', 'word']);
  }
  if (kind === 'skip' && n < 2) kind = 'mult';
  const q = { f, kind, answer: p, hintHTML: groupsHTML(t, n), revealHTML: groupsHTML(t, n), choices: null, speakText: '' };

  if (kind === 'intro') {
    q.hintHTML = groupsHTML(t, n, { hideTotal: true });
    q.html = `${n} × ${t} = <span class="blank">?</span>`;
    q.speakText = `${n} times ${t}. How many ${R.itemName} altogether?`;
    q.showModel = true;
    const d = new Set([p]); while (d.size < 3) { const c = p + t * rnd([-2, -1, 1, 2]); if (c > 0) d.add(c); }
    q.choices = shuffle([...d]);
  } else if (kind === 'mult') {
    const flip = f.box >= 2 && Math.random() < 0.4;
    q.html = flip ? `${t} × ${n} = <span class="blank">?</span>` : `${n} × ${t} = <span class="blank">?</span>`;
    q.speakText = flip ? `${t} times ${n}` : `${n} times ${t}`;
    if (flip) q.hintHTML = `<div class="model-caption">${t} × ${n} is the same as ${n} × ${t} – turn it round!</div>` + groupsHTML(t, n, { hideTotal: true });
    else q.hintHTML = groupsHTML(t, n, { hideTotal: true });
  } else if (kind === 'skip') {
    const shown = []; for (let i = 1; i < n; i++) shown.push(`<span>${t * i}</span>`);
    q.html = `<span class="seq">${shown.join('')}<span class="blank">?</span></span>`;
    q.speakText = `Count in ${t}s. What comes next after ${t * (n - 1)}?`;
    q.hintHTML = groupsHTML(t, n, { caption: `Count in ${t}s, one more group of ${t}:`, hideTotal: true });
  } else if (kind === 'missing') {
    q.answer = n;
    q.html = `<span class="blank">?</span> × ${t} = ${p}`;
    q.speakText = `Something times ${t} equals ${p}. What is the missing number?`;
    q.hintHTML = groupsHTML(t, n, { caption: `How many ${R.ownerPlural} do we need to make ${p} ${R.itemName}? Count the groups:` });
  } else if (kind === 'div') {
    q.answer = n;
    q.html = `${p} ÷ ${t} = <span class="blank">?</span>`;
    q.speakText = `${p} divided by ${t}`;
    q.hintHTML = groupsHTML(t, n, { caption: `${p} ${R.itemName} put into groups of ${t}. How many groups?` });
  } else if (kind === 'word') {
    const w = wordProblem(f);
    q.html = w.text; q.answer = w.answer; q.speakText = w.text; q.isWord = true;
    q.hintHTML = groupsHTML(t, n, { caption: w.caption, hideTotal: w.answer === p });
    q.revealHTML = groupsHTML(t, n, { caption: w.caption });
  }
  return q;
}

function wordProblem(f) {
  const { t, n } = f, R = REALMS[t], p = t * n, name = S.name || 'Star';
  const templates = [
    { text: `${R.blurb}. How many ${R.itemName} do ${n} ${n === 1 ? R.ownerName : R.ownerPlural} have altogether?`, answer: p, caption: `${n} ${R.ownerPlural} with ${t} ${R.itemName} each:` },
    { text: `${name} has ${n} ${R.coin} coins. How much money is that, in pence?`, answer: p, caption: `${n} coins worth ${t}p each:` },
    { text: `There are ${p} ${R.itemName}. Each ${R.ownerName} gets ${t}. How many ${R.ownerPlural} get ${R.itemName}?`, answer: n, caption: `${p} ${R.itemName} shared into groups of ${t}:` },
    { text: `A sparkly sticker costs ${t}p. ${name} spends ${pence(p)}. How many stickers did she buy?`, answer: n, caption: `${p}p in ${t}p coins – how many?` },
  ];
  if (t === 2) templates.push({ text: `Each fairy has 2 wings. How many wings do ${n} fairies have?`, answer: p, caption: `${n} fairies, 2 wings each:` });
  if (t === 5) templates.push({ text: `A starfish has 5 arms. How many arms do ${n} starfish have?`, answer: p, caption: `${n} starfish, 5 arms each:` });
  if (t === 10) templates.push({ text: `The unicorns line up in rows of 10. There are ${p} unicorns. How many rows?`, answer: n, caption: `${p} unicorns in rows of 10:` });
  return rnd(templates);
}

/* ---------------- Session engine ---------------- */
let G = null;   // current game

function buildQueue(realm) {
  const pool = realmFacts(realm);
  const unseen = pool.filter(f => f.seen === 0).sort((a, b) => INTRO_ORDER.indexOf(a.n) - INTRO_ORDER.indexOf(b.n) || a.t - b.t);
  const seen = pool.filter(f => f.seen > 0);
  const due = seen.filter(f => f.due <= S.sessions).sort((a, b) => a.box - b.box || a.last - b.last);
  const notDue = seen.filter(f => f.due > S.sessions).sort((a, b) => a.box - b.box || a.last - b.last);

  let picked = [];
  // wobbly facts first, then new facts (limited), then other due facts, then fill
  const wobbly = due.filter(f => f.box <= 1);
  picked.push(...wobbly.slice(0, 5));
  const newCount = Math.min(MAX_NEW_PER_SESSION, Math.max(1, SESSION_LEN - picked.length - 4));
  picked.push(...unseen.slice(0, unseen.length ? Math.max(1, newCount) : 0));
  for (const f of due) if (picked.length < SESSION_LEN && !picked.includes(f)) picked.push(f);
  for (const f of notDue) if (picked.length < SESSION_LEN && !picked.includes(f)) picked.push(f);
  if (picked.length === 0) picked = pool.slice(0, SESSION_LEN);

  // Fill up to SESSION_LEN by repeating the weakest facts
  let queue = shuffle(picked);
  const weakest = picked.slice().sort((a, b) => a.box - b.box);
  let i = 0;
  while (queue.length < SESSION_LEN) queue.push(weakest[i++ % weakest.length]);
  // avoid the same fact twice in a row
  for (let k = 1; k < queue.length; k++) if (queue[k] === queue[k - 1]) { const j = queue.findIndex((f, idx) => idx > k && f !== queue[k]); if (j > 0) [queue[k], queue[j]] = [queue[j], queue[k]]; }
  return queue.map(f => ({ f }));
}

function startGame(realm, sprint = false) {
  G = {
    realm, sprint, queue: sprint ? [] : buildQueue(realm), idx: 0, total: SESSION_LEN,
    gemsStart: S.gems, correct: 0, answered: 0, bloomed: [], struggled: new Set(), promoted: [],
    current: null, attempt: 0, usedHint: false, tStart: 0, input: '',
    sprintEnd: 0, sprintTimer: null,
  };
  $('sprint-bar-wrap').hidden = !sprint;
  $('q-realm').textContent = realm === 'mix' ? `${MIXED.emoji} ${MIXED.name}` : `${REALMS[realm].emoji} ${REALMS[realm].name}`;
  if (sprint) {
    $('q-realm').textContent = '⚡ Sparkle Sprint – 60 seconds!';
    G.sprintEnd = Date.now() + 60000;
    G.sprintTimer = setInterval(() => {
      const left = Math.max(0, G.sprintEnd - Date.now());
      $('sprint-bar').style.width = (left / 600) + '%';
      if (left <= 0) { clearInterval(G.sprintTimer); if (!$('feedback').hidden) return; endGame(); }
    }, 250);
  }
  showScreen('screen-play');
  nextQuestion();
}

function pickSprintFact() {
  const pool = Object.values(S.facts).filter(f => f.box >= 2);
  return rnd(pool.length ? pool : Object.values(S.facts));
}

function nextQuestion() {
  if (G.sprint) {
    if (Date.now() >= G.sprintEnd) return endGame();
    G.current = { f: pickSprintFact() };
    G.current.q = makeQuestion(G.current.f, rnd(['mult', 'mult', 'div']));
  } else {
    if (G.idx >= G.queue.length) return endGame();
    G.current = G.queue[G.idx];
    G.current.q = G.current.q || makeQuestion(G.current.f, G.current.kind);
  }
  G.attempt = 0; G.usedHint = false; G.input = '';
  renderQuestion();
  G.tStart = Date.now();
}

function renderQuestion() {
  const q = G.current.q;
  $('feedback').hidden = true;
  $('question-card').style.display = '';
  $('play-progress').style.width = G.sprint ? '100%' : (G.idx / G.total * 100) + '%';
  $('play-gems').textContent = S.gems;
  const qt = $('q-text');
  qt.innerHTML = q.html; qt.classList.toggle('word', !!q.isWord);
  $('model').innerHTML = q.showModel ? q.hintHTML : '';
  $('choices').innerHTML = '';
  if (q.choices) {
    $('answer-row').style.display = 'none'; $('keypad').style.display = 'none';
    $('choices').innerHTML = q.choices.map(c => `<button data-c="${c}">${c}</button>`).join('');
  } else {
    $('answer-row').style.display = ''; $('keypad').style.display = '';
    $('btn-hint').style.display = (q.showModel || G.sprint) ? 'none' : '';
    $('answer-text').textContent = '';
  }
  if (q.isWord) speak(q.speakText);
}

function keyInput(k) {
  if (!G || !$('feedback').hidden) return;
  if (G.current.q.choices) {           // keyboard fallback for multiple choice: type the number
    if (k === 'go' || k === 'del') { G.input = ''; return; }
    G.input = (G.input + k).slice(-3);
    const b = [...$('choices').querySelectorAll('button')].find(b => b.dataset.c === G.input && !b.disabled);
    if (b) { G.input = ''; b.click(); }
    return;
  }
  SFX.click();
  if (k === 'del') G.input = G.input.slice(0, -1);
  else if (k === 'go') { if (G.input !== '') submit(parseInt(G.input, 10)); return; }
  else if (G.input.length < 3) G.input += k;
  $('answer-text').textContent = G.input;
}

function showHint() {
  if (!G) return;
  G.usedHint = true;
  $('model').innerHTML = G.current.q.hintHTML;
  $('btn-hint').style.display = 'none';
}

function submit(val) {
  const q = G.current.q, f = G.current.f;
  const elapsed = Date.now() - G.tStart;
  if (val === q.answer) return onCorrect(elapsed);
  // wrong
  G.attempt++;
  SFX.oops();
  $('answer-box').classList.remove('shake'); void $('answer-box').offsetWidth; $('answer-box').classList.add('shake');
  if (G.attempt === 1 && !G.sprint) {
    // show model and let her try again
    G.usedHint = true;
    $('model').innerHTML = `<div class="model-caption" style="color:#c0506e;font-weight:900">${rnd(RETRY)}</div>` + q.hintHTML;
    $('btn-hint').style.display = 'none';
    G.input = ''; $('answer-text').textContent = '';
    if (q.choices) { // remove the wrong choice
      $('choices').querySelectorAll('button').forEach(b => { if (parseInt(b.dataset.c, 10) === val) b.disabled = true; });
    }
    speak(q.kind === 'missing' || q.kind === 'div' ? 'Not quite. Count the groups.' : 'Not quite. Count them together.');
    return;
  }
  onWrong();
}

function equationText(q) {
  const { t, n } = q.f, p = t * n;
  if (q.kind === 'div') return `${p} ÷ ${t} = ${n}`;
  if (q.kind === 'missing') return `${n} × ${t} = ${p}`;
  if (q.kind === 'skip') return `${n} × ${t} = ${p}`;
  return `${n} × ${t} = ${p}`;
}

function onCorrect(elapsed) {
  const f = G.current.f, q = G.current.q;
  const fast = elapsed < FAST_MS && !G.usedHint;
  const clean = !G.usedHint && G.attempt === 0;
  G.correct++; G.answered++;
  let gems = 1 + (clean ? 1 : 0) + (fast ? 1 : 0);
  let bloomed = false, msg = rnd(PRAISE);

  {
    f.seen++; f.right++; f.last = Date.now(); if (fast) f.fast++;
    if (clean) {
      const before = f.box;
      if (f.box < 3) f.box++;
      else if (f.box === 3 && fast) f.box = 4;
      if (f.box === 4 && before < 4) { bloomed = true; gems += 5; G.bloomed.push(f); }
      else if (f.box > before) G.promoted.push(f);
    }
    f.due = S.sessions + 1 + INTERVALS[f.box];
  }
  S.gems += gems; S.totalGems += gems; save();

  if (bloomed) { SFX.bloom(); confetti(90, true); msg = `${REALMS[f.t].owner} A ${REALMS[f.t].ownerName} has come to live on your flower! ${f.n} × ${f.t} is now fluent!`; }
  else if (clean && fast) { SFX.great(); confetti(30); }
  else SFX.good();

  showFeedback('good', bloomed ? '🌸✨' : rnd(['🌟', '✨', '💖', '🦄', '🧚', '🧜‍♀️', '🌈']), `${msg}<span class="eq">${equationText(q)}</span>`, `+${gems} 💎`);
}

function onWrong() {
  const f = G.current.f, q = G.current.q;
  G.answered++; G.struggled.add(f);
  f.seen++; f.wrong++; f.last = Date.now();
  f.box = Math.max(0, f.box - 1); f.due = S.sessions;   // due again next session
  save();
  if (!G.sprint) {
    // comeback: re-ask this fact later in the session, as a simpler multiplication
    const insertAt = Math.min(G.queue.length, G.idx + 3 + Math.floor(Math.random() * 2));
    G.queue.splice(insertAt, 0, { f, kind: 'mult' });
    G.total = G.queue.length;
  }
  const R = REALMS[f.t];
  showFeedback('oops', '💛', `${rnd(REVEAL)}<span class="eq">${equationText(q)}</span>`, '', q.revealHTML || q.hintHTML);
  speak(`${equationText(q).replace(/=/, 'equals')}`);
}

function showFeedback(cls, emoji, text, gemsText, modelHTML = '') {
  $('question-card').style.display = 'none';
  const fb = $('feedback');
  fb.className = 'feedback ' + cls; fb.hidden = false;
  $('fb-emoji').textContent = emoji;
  $('fb-text').innerHTML = text + (gemsText ? `<div style="margin-top:8px;color:#7a4fe0">${gemsText}</div>` : '');
  $('fb-model').innerHTML = modelHTML;
  $('play-gems').textContent = S.gems;
  if (!G.sprint) $('play-progress').style.width = ((G.idx + 1) / G.total * 100) + '%';
  if (G.sprint && cls === 'good') { setTimeout(() => { if (!fb.hidden) advance(); }, 700); }
}

function advance() {
  if (!G) return;
  G.idx++;
  nextQuestion();
}

function endGame() {
  if (G.sprintTimer) clearInterval(G.sprintTimer);
  const earned = S.gems - G.gemsStart;
  S.sessions++;
  S.history.push({ date: new Date().toISOString().slice(0, 10), realm: G.realm, sprint: G.sprint, correct: G.correct, answered: G.answered, gems: earned });
  save();
  $('sum-emoji').textContent = G.bloomed.length ? '🌸✨🧚' : rnd(['🌈', '💖', '🦄', '✨']);
  $('sum-title').textContent = G.sprint ? `Sparkle Sprint: ${G.correct} sparkles!` : rnd(['Quest complete!', 'Wonderful work!', 'You did it!', 'Magic session!']);
  $('sum-gems').textContent = earned;
  $('sum-facts').textContent = `You answered ${G.correct} out of ${G.answered} correctly.`;
  const items = [];
  for (const f of G.bloomed) items.push(`<span>🌸 ${f.n} × ${f.t} bloomed!</span>`);
  for (const f of G.promoted) items.push(`<span>${REALMS[f.t].stages[f.box]} ${f.n} × ${f.t} grew</span>`);
  $('sum-bloom').innerHTML = items.join('');
  const s = [...G.struggled];
  $('sum-practise').textContent = s.length ? `One to keep an eye on: ${s.map(f => `${f.n} × ${f.t} = ${f.n * f.t}`).join(', ')}. It will come back soon – that’s how we learn it!` : 'Every answer right – your memory is sparkling!';
  if (G.bloomed.length) confetti(120, true);
  showScreen('screen-summary');
  speak(`${$('sum-title').textContent} You collected ${earned} gems.`);
}

/* ---------------- Home ---------------- */
function renderHome() {
  $('home-name').textContent = S.name;
  $('home-gems').textContent = S.gems;
  $('home-doll').innerHTML = renderDoll(S.doll);
  const list = $('realm-list');
  const cards = [];
  for (const t of TABLES) {
    const R = REALMS[t], facts = realmFacts(t);
    const secure = facts.filter(f => f.box >= 3).length, fluent = facts.filter(f => f.box === 4).length;
    const garden = facts.map(f => `<span class="s${f.box}" title="${f.n} × ${t}">${R.stages[f.box]}</span>`).join('');
    cards.push(`<button class="realm" data-realm="${t}"><div class="realm-emoji" style="background:${R.colour}">${R.emoji}</div>
      <div class="realm-info"><div class="realm-name">${R.name} <span class="small">· ${t}s</span></div>
      <div class="realm-sub">${fluent === 12 ? 'All 12 facts fluent! 🎉' : secure ? `${secure} of 12 facts secure` : R.blurb}</div>
      <div class="garden">${garden}</div></div><div class="realm-arrow">➜</div></button>`);
  }
  const mixOk = realmUnlocked('mix');
  cards.push(`<button class="realm ${mixOk ? '' : 'locked'}" data-realm="mix"><div class="realm-emoji" style="background:${MIXED.colour}">${mixOk ? MIXED.emoji : '🔒'}</div>
    <div class="realm-info"><div class="realm-name">${MIXED.name}</div>
    <div class="realm-sub">${mixOk ? MIXED.blurb : 'Unlocks when each realm has 5 growing flowers'}</div></div><div class="realm-arrow">${mixOk ? '➜' : ''}</div></button>`);
  list.innerHTML = cards.join('');
  const sp = $('btn-sprint');
  sp.classList.toggle('locked', !sprintUnlocked());
  sp.textContent = sprintUnlocked() ? '⚡ Sparkle Sprint' : '🔒 Sparkle Sprint';
  const total4 = Object.values(S.facts).filter(f => f.box === 4).length;
  const bubbles = ['Which realm shall we visit today?', 'Your flowers are waiting for you! 🌸', 'Every fact you practise makes your garden grow.', total4 ? `${total4} magical friends live in your garden now!` : 'Let’s make a friend come and live in your garden!'];
  $('home-bubble').textContent = rnd(bubbles);
}

/* ---------------- Wardrobe ---------------- */
let wardTab = 'outfit';
function renderWardrobe() {
  $('ward-gems').textContent = S.gems;
  $('ward-doll').innerHTML = renderDoll(S.doll);
  $('ward-tabs').innerHTML = DOLL_SLOTS.map(s => `<button data-tab="${s.id}" class="${s.id === wardTab ? 'active' : ''}">${s.name}</button>`).join('');
  $('ward-items').innerHTML = DOLL_ITEMS.filter(i => i.slot === wardTab).map(i => {
    const key = i.slot + ':' + i.id, owned = S.owned.includes(key), eq = S.doll[i.slot] === i.id;
    const ico = i.swatch ? `<span class="swatch" style="background:${i.swatch}"></span>` : `<span class="ico">${i.ico}</span>`;
    const cls = eq ? 'equipped' : owned ? '' : (S.gems >= i.cost ? 'locked' : 'locked cant');
    return `<div class="ward-item ${cls}" data-key="${key}">${ico}<div>${i.name}</div>${owned ? (eq ? '<span class="cost">Wearing ✓</span>' : '<span class="cost">Owned</span>') : `<span class="cost">💎 ${i.cost}</span>`}</div>`;
  }).join('');
}
function wardrobeClick(key) {
  const [slot, id] = key.split(':');
  const item = DOLL_ITEMS.find(i => i.slot === slot && i.id === id);
  if (!item) return;
  if (!S.owned.includes(key)) {
    if (S.gems < item.cost) { SFX.oops(); return; }
    S.gems -= item.cost; S.owned.push(key); SFX.gem(); confetti(40);
  } else SFX.click();
  S.doll[slot] = id; save(); renderWardrobe();
}

/* ---------------- Grown-ups ---------------- */
function renderGrownups() {
  const rows = TABLES.map(t => {
    const cells = MULTIPLIERS.map(n => { const f = S.facts[`${t}x${n}`]; return `<div class="cell b${f.box}" title="${n} × ${t}: box ${f.box}, ${f.right} right, ${f.wrong} wrong">${n}×${t}</div>`; }).join('');
    return `<div class="fg-row"><div class="lbl">${t}s</div>${cells}</div>`;
  }).join('');
  $('fact-grid').innerHTML = rows;
  const all = Object.values(S.facts);
  const right = all.reduce((a, f) => a + f.right, 0), wrong = all.reduce((a, f) => a + f.wrong, 0);
  const days = new Set(S.history.map(h => h.date)).size;
  const last = S.history.slice(-5).reverse().map(h => `${h.date}: ${h.realm === 'mix' ? 'Rainbow Castle' : h.sprint ? 'Sprint' : REALMS[h.realm]?.name || h.realm} – ${h.correct}/${h.answered}`).join('<br>');
  $('stats').innerHTML = `<p><b>Sessions:</b> ${S.sessions} on ${days} day${days === 1 ? '' : 's'} · <b>Answers:</b> ${right} right, ${wrong} wrong · <b>Fluent facts:</b> ${all.filter(f => f.box === 4).length} / 36 · <b>Gems earned ever:</b> ${S.totalGems}</p>${last ? `<p><b>Recent:</b><br>${last}</p>` : ''}`;
  $('set-sound').checked = S.settings.sound;
  $('set-speak').checked = S.settings.speak;
  $('set-name').value = S.name;
}

/* ---------------- Events ---------------- */
$('btn-start').addEventListener('click', () => { S.name = ($('name-input').value.trim() || 'Star').slice(0, 14); save(); SFX.click(); renderHome(); showScreen('screen-home'); });
$('name-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-start').click(); });

$('realm-list').addEventListener('click', e => {
  const b = e.target.closest('.realm'); if (!b) return;
  const realm = b.dataset.realm === 'mix' ? 'mix' : parseInt(b.dataset.realm, 10);
  if (!realmUnlocked(realm)) { SFX.oops(); $('home-bubble').textContent = 'Grow 5 flowers in each realm to open the castle! 🏰'; return; }
  SFX.click(); startGame(realm);
});
$('btn-sprint').addEventListener('click', () => {
  if (!sprintUnlocked()) { SFX.oops(); $('home-bubble').textContent = 'Sparkle Sprint opens when 20 of your flowers are nearly fluent! ⚡'; return; }
  SFX.click(); startGame('mix', true);
});
$('btn-wardrobe').addEventListener('click', () => { SFX.click(); renderWardrobe(); showScreen('screen-wardrobe'); });
$('btn-sum-wardrobe').addEventListener('click', () => { SFX.click(); renderWardrobe(); showScreen('screen-wardrobe'); });
$('btn-wardrobe-home').addEventListener('click', () => { SFX.click(); renderHome(); showScreen('screen-home'); });
/* PIN gate for the Grown-ups' corner */
let pinInput = '';
function renderPin() {
  $('pin-dots').querySelectorAll('span').forEach((d, i) => d.classList.toggle('on', i < pinInput.length));
}
function openPin() { pinInput = ''; $('pin-msg').innerHTML = '&nbsp;'; renderPin(); showScreen('screen-pin'); }
function pinKey(k) {
  if (k === 'back') { pinInput = ''; renderHome(); showScreen('screen-home'); return; }
  if (k === 'del') { pinInput = pinInput.slice(0, -1); renderPin(); return; }
  if (pinInput.length >= 4) return;
  pinInput += k; renderPin();
  if (pinInput.length === 4) {
    if (pinInput === PARENT_PIN) { pinInput = ''; renderGrownups(); showScreen('screen-grownups'); }
    else {
      SFX.oops();
      const dots = $('pin-dots'); dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
      $('pin-msg').textContent = 'That’s not the code – ask a grown-up!';
      setTimeout(() => { pinInput = ''; renderPin(); }, 500);
    }
  }
}
$('btn-grownups').addEventListener('click', openPin);
$('pin-pad').addEventListener('click', e => { const b = e.target.closest('button'); if (b) pinKey(b.dataset.k); });
document.addEventListener('keydown', e => {
  if (!$('screen-pin').classList.contains('active')) return;
  if (/^[0-9]$/.test(e.key)) pinKey(e.key);
  else if (e.key === 'Backspace') pinKey('del');
  else if (e.key === 'Escape') pinKey('back');
});
$('btn-grownups-home').addEventListener('click', () => { renderHome(); showScreen('screen-home'); });
$('btn-sum-home').addEventListener('click', () => { SFX.click(); renderHome(); showScreen('screen-home'); });
$('btn-again').addEventListener('click', () => { SFX.click(); startGame(G.realm, G.sprint); });
$('btn-quit').addEventListener('click', () => { if (G && G.sprintTimer) clearInterval(G.sprintTimer); G = null; renderHome(); showScreen('screen-home'); });

$('keypad').addEventListener('click', e => { const b = e.target.closest('button'); if (b) keyInput(b.dataset.k); });
$('choices').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) { SFX.click(); submit(parseInt(b.dataset.c, 10)); } });
$('btn-hint').addEventListener('click', () => { SFX.click(); showHint(); });
$('btn-next').addEventListener('click', () => { SFX.click(); advance(); });
$('btn-speak').addEventListener('click', () => { const on = S.settings.speak; S.settings.speak = true; speak(G.current.q.speakText); S.settings.speak = on; });

document.addEventListener('keydown', e => {
  if (!$('screen-play').classList.contains('active') || !G) return;
  if (!$('feedback').hidden) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); } return; }
  if (/^[0-9]$/.test(e.key)) keyInput(e.key);
  else if (e.key === 'Backspace') keyInput('del');
  else if (e.key === 'Enter') keyInput('go');
});

$('ward-tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { wardTab = b.dataset.tab; SFX.click(); renderWardrobe(); } });
$('ward-items').addEventListener('click', e => { const d = e.target.closest('.ward-item'); if (d) wardrobeClick(d.dataset.key); });

$('set-sound').addEventListener('change', e => { S.settings.sound = e.target.checked; save(); });
$('set-speak').addEventListener('change', e => { S.settings.speak = e.target.checked; save(); });
$('set-name').addEventListener('change', e => { S.name = (e.target.value.trim() || 'Star').slice(0, 14); save(); });
$('btn-export').addEventListener('click', () => { navigator.clipboard?.writeText(JSON.stringify(S)).then(() => alert('Progress copied to clipboard.')); });
$('btn-reset').addEventListener('click', () => { if (confirm('Reset ALL progress, gems and wardrobe? This cannot be undone.')) { localStorage.removeItem(KEY); S = freshState(); showScreen('screen-welcome'); } });

if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

/* ---------------- Boot ---------------- */
if (S.name) { renderHome(); showScreen('screen-home'); } else showScreen('screen-welcome');
