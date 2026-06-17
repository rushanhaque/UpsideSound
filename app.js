/* ============================================================================
   UpsideSound - Application / Orchestration
   Screen flow:  landing -> evaluation -> analysis -> reveal -> gallery
   Drives the canvas atmosphere, audio, adaptive evaluation, and reveal.
   Depends on: UpsideEngine (engine.js), QUESTION_BANK (questions.js), songDatabase
   ========================================================================== */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* --------------------------------------------------------------------------
     DOM
     -------------------------------------------------------------------------- */
  const screens = {
    landing: $('landing'),
    evaluation: $('evaluation'),
    analysis: $('analysis'),
    reveal: $('reveal')
  };
  const chatLog = $('chat-log');
  const inputForm = $('input-form');
  const inputField = $('chat-input');
  const sendBtn = $('chat-send');
  const counterEl = $('eval-counter');
  const progressFill = $('eval-progress-fill');
  const galleryOverlay = $('gallery-overlay');
  const galleryGrid = $('gallery-grid');
  const revealVideo = $('reveal-video');

  /* --------------------------------------------------------------------------
     STATE
     -------------------------------------------------------------------------- */
  let session = null;
  let result = null;
  let mode = 'idle';          // 'name' | 'quiz' | 'done'
  let subjectName = 'SUBJECT';
  let busy = false;
  let testMode = false;
  let sessionFreq = 0;

  /* --------------------------------------------------------------------------
     AUDIO
     -------------------------------------------------------------------------- */
  const ambient = new Audio('assets/instrumental1(homepage).weba');
  ambient.loop = true; ambient.volume = 0.55;
  const preview = new Audio();
  preview.volume = 0.85;
  let audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    [ambient, preview].forEach(a => { a.play().then(() => a.pause()).catch(() => {}); });
  }
  function playAmbient() { ambient.play().catch(() => {}); }
  function stopAmbient() { try { ambient.pause(); } catch (e) {} }

  function playPreview(url, fallbackLink) {
    stopAmbient();
    preview.pause();
    if (url) {
      preview.src = url; preview.currentTime = 0;
      preview.play().catch(() => embedSpotify(fallbackLink));
    } else {
      embedSpotify(fallbackLink);
    }
  }
  function embedSpotify(link) {
    if (!link) return;
    const id = link.split('/').pop().split('?')[0];
    $('spotify-embed').src = `https://open.spotify.com/embed/track/${id}?utm_source=generator&autoplay=1`;
  }
  function stopAllMusic() { stopAmbient(); try { preview.pause(); } catch (e) {} $('spotify-embed').src = ''; }

  /* --------------------------------------------------------------------------
     SCREEN MANAGER
     -------------------------------------------------------------------------- */
  let activeScreen = 'landing';
  function show(name) {
    Object.keys(screens).forEach(k => {
      const on = k === name;
      screens[k].classList.toggle('is-active', on);
      screens[k].setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    activeScreen = name;
  }

  /* --------------------------------------------------------------------------
     CANVAS - BREATHING VOID  (spores + fog + rare red lightning)
     -------------------------------------------------------------------------- */
  const voidCanvas = $('void-canvas');
  const vctx = voidCanvas.getContext('2d');
  let vw = 0, vh = 0, dpr = 1;
  let spores = [], fogBlobs = [];
  let lightning = null, nextBolt = 0;
  let sporeSprite = null;

  // Pre-render one spore as a sprite so the loop never rebuilds a gradient per
  // particle per frame (the dominant canvas cost). Drawn scaled + alpha'd.
  function buildSporeSprite() {
    const size = 48, r = size / 2;
    sporeSprite = document.createElement('canvas');
    sporeSprite.width = size; sporeSprite.height = size;
    const sc = sporeSprite.getContext('2d');
    const g = sc.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, 'rgba(242,237,227,1)');
    g.addColorStop(1, 'rgba(242,237,227,0)');
    sc.fillStyle = g; sc.beginPath(); sc.arc(r, r, r, 0, Math.PI * 2); sc.fill();
  }

  function sizeVoid() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth; vh = window.innerHeight;
    voidCanvas.width = vw * dpr; voidCanvas.height = vh * dpr;
    vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildField();
  }
  function buildField() {
    const count = Math.min(140, Math.max(40, Math.floor((vw * vh) / 13000)));
    spores = Array.from({ length: count }, () => newSpore(true));
    fogBlobs = Array.from({ length: 3 }, (_, i) => ({
      x: Math.random() * vw, y: vh * (0.3 + 0.25 * i),
      r: Math.max(vw, vh) * (0.35 + Math.random() * 0.25),
      vx: (Math.random() - 0.5) * 0.06, vy: (Math.random() - 0.5) * 0.04,
      hue: i % 2 === 0 ? 'red' : 'blue', a: 0.05 + Math.random() * 0.04
    }));
  }
  function newSpore(seed) {
    return {
      x: Math.random() * vw,
      y: seed ? Math.random() * vh : vh + 10,
      r: 0.6 + Math.random() * 2.2,
      vy: 0.12 + Math.random() * 0.4,
      sway: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.5,
      depth: 0.4 + Math.random() * 0.6
    };
  }

  function spawnLightning() {
    const x = vw * (0.15 + Math.random() * 0.7);
    const pts = [{ x, y: -10 }];
    let cx = x, cy = -10;
    const segs = 9 + Math.floor(Math.random() * 5);
    for (let i = 0; i < segs; i++) {
      cx += (Math.random() - 0.5) * vw * 0.12;
      cy += vh / segs * (0.7 + Math.random() * 0.6);
      pts.push({ x: cx, y: cy });
    }
    lightning = { pts, life: 1 };
  }

  function drawVoid(t) {
    vctx.clearRect(0, 0, vw, vh);
    const breath = 0.85 + 0.15 * Math.sin(t / 3400);

    // fog
    fogBlobs.forEach(f => {
      f.x += f.vx; f.y += f.vy;
      if (f.x < -f.r) f.x = vw + f.r; if (f.x > vw + f.r) f.x = -f.r;
      const g = vctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      const col = f.hue === 'red' ? '229,9,20' : '69,182,232';
      g.addColorStop(0, `rgba(${col},${f.a * breath})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      vctx.fillStyle = g;
      vctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    });

    // spores (cached sprite, scaled + alpha'd per particle)
    if (!sporeSprite) buildSporeSprite();
    spores.forEach(s => {
      s.y -= s.vy * s.depth;
      s.phase += 0.01;
      const x = s.x + Math.sin(s.phase) * s.sway * 6;
      if (s.y < -10) Object.assign(s, newSpore(false), { x: Math.random() * vw });
      const rad = s.r * 3;
      vctx.globalAlpha = Math.max(0, Math.min(1, s.alpha * breath * s.depth));
      vctx.drawImage(sporeSprite, x - rad, s.y - rad, rad * 2, rad * 2);
    });
    vctx.globalAlpha = 1;

    // rare lightning (landing/eval atmosphere)
    if (!reduceMotion && (activeScreen === 'landing' || activeScreen === 'evaluation')) {
      if (t > nextBolt) { spawnLightning(); nextBolt = t + 12000 + Math.random() * 16000; }
    }
    if (lightning) {
      vctx.save();
      vctx.globalCompositeOperation = 'lighter';
      vctx.strokeStyle = `rgba(255,45,32,${0.55 * lightning.life})`;
      vctx.shadowColor = 'rgba(229,9,20,0.8)'; vctx.shadowBlur = 24;
      vctx.lineWidth = 2;
      vctx.beginPath();
      lightning.pts.forEach((p, i) => i ? vctx.lineTo(p.x, p.y) : vctx.moveTo(p.x, p.y));
      vctx.stroke();
      vctx.restore();
      lightning.life -= 0.04;
      if (lightning.life <= 0) lightning = null;
    }
  }

  /* --------------------------------------------------------------------------
     CANVAS - OSCILLOSCOPE (listening line)
     -------------------------------------------------------------------------- */
  const scopeCanvas = $('scope-canvas');
  const sctx = scopeCanvas.getContext('2d');
  let scopeEnergy = 0, scopeFlat = false;
  function sizeScope() {
    const r = scopeCanvas.getBoundingClientRect();
    scopeCanvas.width = r.width * dpr; scopeCanvas.height = r.height * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawScope(t) {
    const w = scopeCanvas.width / dpr, h = scopeCanvas.height / dpr;
    sctx.clearRect(0, 0, w, h);
    const mid = h / 2;
    scopeEnergy *= 0.92;
    const amp = scopeFlat ? 0.6 : (1.4 + scopeEnergy * 9);
    sctx.strokeStyle = 'rgba(69,182,232,0.85)';
    sctx.shadowColor = 'rgba(69,182,232,0.7)'; sctx.shadowBlur = 6;
    sctx.lineWidth = 1.5;
    sctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const k = x / w;
      const env = Math.sin(k * Math.PI);                     // taper at edges
      const y = mid + Math.sin(k * 34 + t / 120) * amp * env
                    + Math.sin(k * 11 - t / 200) * amp * 0.4 * env;
      x ? sctx.lineTo(x, y) : sctx.moveTo(x, y);
    }
    sctx.stroke();
  }

  /* --------------------------------------------------------------------------
     CANVAS - FREQUENCY LOCK DIAL
     -------------------------------------------------------------------------- */
  const lockCanvas = $('lock-canvas');
  const lctx = lockCanvas.getContext('2d');
  let lockActive = false, locked = false;
  function sizeLock() {
    const r = lockCanvas.getBoundingClientRect();
    if (!r.width) return;
    lockCanvas.width = r.width * dpr; lockCanvas.height = r.height * dpr;
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawLock(t) {
    const w = lockCanvas.width / dpr, h = lockCanvas.height / dpr;
    if (!w) return;
    lctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 6;
    // rings
    lctx.strokeStyle = 'rgba(69,182,232,0.25)'; lctx.lineWidth = 1;
    [R, R * 0.7, R * 0.4].forEach(rr => { lctx.beginPath(); lctx.arc(cx, cy, rr, 0, Math.PI * 2); lctx.stroke(); });
    // sweep
    const ang = locked ? -Math.PI / 2 : (t / 240) % (Math.PI * 2);
    const grad = lctx.createLinearGradient(cx, cy, cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
    grad.addColorStop(0, locked ? 'rgba(229,9,20,0.9)' : 'rgba(69,182,232,0.9)');
    grad.addColorStop(1, 'rgba(229,9,20,0)');
    lctx.strokeStyle = grad; lctx.lineWidth = 2;
    lctx.shadowColor = locked ? 'rgba(229,9,20,0.8)' : 'rgba(69,182,232,0.6)'; lctx.shadowBlur = locked ? 18 : 8;
    lctx.beginPath(); lctx.moveTo(cx, cy); lctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); lctx.stroke();
    // center dot
    lctx.shadowBlur = locked ? 22 : 6;
    lctx.fillStyle = locked ? 'rgba(229,9,20,1)' : 'rgba(69,182,232,0.9)';
    lctx.beginPath(); lctx.arc(cx, cy, locked ? 5 : 3, 0, Math.PI * 2); lctx.fill();
  }

  /* --------------------------------------------------------------------------
     MAIN ANIMATION LOOP
     -------------------------------------------------------------------------- */
  let rafId = null;
  function loop(t) {
    if (vw !== window.innerWidth || vh !== window.innerHeight) sizeVoid();
    // The void is fully covered on analysis (blur scrim) and reveal (video); skip
    // its per-frame cost there. scope/lock are already screen-gated.
    if (activeScreen === 'landing' || activeScreen === 'evaluation') drawVoid(t);
    if (activeScreen === 'evaluation') drawScope(t);
    if (lockActive) drawLock(t);
    rafId = requestAnimationFrame(loop);
  }
  function startLoop() { if (!rafId) rafId = requestAnimationFrame(loop); }
  function stopLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopLoop(); stopAmbient(); }
    else if (!reduceMotion) { startLoop(); if (activeScreen !== 'reveal') playAmbient(); }
  });

  function initCanvas() {
    sizeVoid(); sizeScope();
    drawVoid(0); drawScope(0);          // always paint one frame (rAF may be throttled)
    if (!reduceMotion) startLoop();
  }
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { sizeVoid(); sizeScope(); sizeLock(); if (reduceMotion) drawVoid(0); }, 160);
  });

  /* --------------------------------------------------------------------------
     CHAT
     -------------------------------------------------------------------------- */
  function addMessage(who, text, instant) {
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (who === 'examiner' ? 'msg-examiner' : 'msg-subject');
    const tag = document.createElement('span');
    tag.className = 'msg-tag';
    tag.textContent = who === 'examiner' ? 'EXAMINER ▸' : 'SUBJECT ▸';
    const body = document.createElement('div');
    body.className = 'msg-body';
    wrap.appendChild(tag); wrap.appendChild(body);
    chatLog.appendChild(wrap);
    chatLog.scrollTop = chatLog.scrollHeight;

    if (who === 'subject' || instant || reduceMotion) {
      body.textContent = text;
      chatLog.scrollTop = chatLog.scrollHeight;
      return Promise.resolve();
    }
    // typewriter for examiner
    return new Promise(resolve => {
      body.classList.add('caret-blink');
      let i = 0;
      (function step() {
        if (i < text.length) {
          body.textContent = text.slice(0, ++i);
          chatLog.scrollTop = chatLog.scrollHeight;
          setTimeout(step, 14 + Math.random() * 26);
        } else { body.classList.remove('caret-blink'); resolve(); }
      })();
    });
  }

  function renderOptions(question) {
    const old = chatLog.querySelector('.options');
    if (old) old.remove();
    if (!question.options || !question.options.length) return;
    const box = document.createElement('div');
    box.className = 'options';
    question.options.forEach(opt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'option-chip';
      chip.textContent = opt.label;
      chip.addEventListener('click', () => { if (!busy) submitAnswer(opt.label); });
      box.appendChild(chip);
    });
    chatLog.appendChild(box);
    chatLog.scrollTop = chatLog.scrollHeight;
  }
  function clearOptions() { const o = chatLog.querySelector('.options'); if (o) o.remove(); }

  function setCounter() {
    const total = session.total;
    const n = Math.min(session.index, total);
    counterEl.textContent = `QUERY ${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    progressFill.style.width = (n / total * 100) + '%';
  }

  /* --------------------------------------------------------------------------
     EVALUATION FLOW
     -------------------------------------------------------------------------- */
  async function beginEvaluation() {
    session = UpsideEngine.createSession({ questionCount: 7 });
    chatLog.innerHTML = '';
    result = null; testMode = false; subjectName = 'SUBJECT';
    setCounter();
    show('evaluation');
    if (!reduceMotion) playAmbient();
    inputField.focus();

    busy = true;
    await sleep(500);
    await addMessage('examiner', session.intro);
    await sleep(400);
    await addMessage('examiner', 'Before we open the file, what should I record as your designation?');
    mode = 'name';
    busy = false;
    inputField.focus();
  }

  async function askNextQuestion() {
    const q = session.nextQuestion();
    if (!q) { runAnalysis(); return; }
    setCounter();
    busy = true;
    await addMessage('examiner', q.text);
    renderOptions(q);
    busy = false;
    inputField.focus();
  }

  async function submitAnswer(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    inputField.value = '';
    clearOptions();
    await addMessage('subject', text);

    if (mode === 'name') {
      subjectName = text.replace(/[^\w \-]/g, '').slice(0, 22) || 'SUBJECT';
      $('chrome-file').textContent = 'SUBJECT: ' + subjectName.toUpperCase();
      if (text.toLowerCase().replace(/\s/g, '') === 'rushanhaque') { testMode = true; }
      mode = 'quiz';
      busy = true;
      await sleep(350);
      await addMessage('examiner', 'Recorded. The seal is broken. Answer in your own words, ' + subjectName + '. There are no wrong frequencies.');
      busy = false;
      await askNextQuestion();
      if (testMode) autoComplete();
      return;
    }

    // quiz answer
    session.submit(text);
    await sleep(220);
    await askNextQuestion();
  }

  // dev helper: auto-finish with plausible answers
  async function autoComplete() {
    const samples = ['I dive in headfirst and figure it out as I go', 'quietly, alone, thinking it through', 'with the people I love around me', 'I plan it carefully first', 'I dream about what could be'];
    while (mode === 'quiz' && session.current) {
      await sleep(120);
      const q = session.current;
      const t = q && q.options ? q.options[Math.floor(Math.random() * q.options.length)].label : samples[Math.floor(Math.random() * samples.length)];
      inputField.value = '';
      clearOptions();
      await addMessage('subject', t);
      session.submit(t);
      await askNextQuestion();   // asks next, or runs analysis (clears session.current, sets mode='done')
    }
  }

  /* --------------------------------------------------------------------------
     ANALYSIS
     -------------------------------------------------------------------------- */
  const STATUS_LINES = [
    'CROSS-REFERENCING SUBJECT VECTOR...',
    'ISOLATING ACOUSTIC FREQUENCY...',
    'MATCHING PSYCHIC PROFILE...',
    'TUNING THE SIGNAL...',
    'FREQUENCY LOCK'
  ];

  async function runAnalysis() {
    mode = 'done';
    inputField.blur();
    result = session.finish();
    sessionFreq = computeFreq(result.user);

    show('analysis');
    buildGauges();
    sizeLock(); lockActive = true; locked = false;
    drawLock(0);

    const dur = reduceMotion ? 800 : 3000;
    const statusEl = $('analysis-status');
    const readoutEl = $('lock-readout');

    // fill gauges (CSS transition animates from 0). setTimeout, not rAF, so it
    // always runs even if the tab is unfocused / rAF is throttled.
    setTimeout(() => {
      UpsideEngine.TRAITS.forEach(tr => {
        const f = document.querySelector(`.gauge-fill[data-t="${tr}"]`);
        const v = document.querySelector(`.gauge-val[data-t="${tr}"]`);
        if (f) f.style.width = (result.user[tr] * 10) + '%';
        if (v) v.textContent = result.user[tr].toFixed(1);
      });
    }, 60);

    // readout count-up toward the locked frequency (timer-based)
    let shown = 0;
    const readoutTimer = setInterval(() => {
      shown += (sessionFreq - shown) * 0.14 + 0.4;
      if (shown >= sessionFreq) shown = sessionFreq;
      readoutEl.textContent = shown.toFixed(1);
    }, 55);

    // status cycling
    const steps = STATUS_LINES.length;
    const segLen = dur / steps;
    for (let i = 0; i < steps; i++) {
      statusEl.textContent = STATUS_LINES[i];
      if (i === steps - 1) { locked = true; statusEl.style.color = 'var(--primary-text)'; }
      await sleep(segLen);
    }
    clearInterval(readoutTimer);
    readoutEl.textContent = sessionFreq.toFixed(1);
    await sleep(reduceMotion ? 120 : 420);
    lockActive = false;
    statusEl.style.color = '';
    showReveal();
  }

  function buildGauges() {
    const host = $('gauges');
    host.innerHTML = '';
    UpsideEngine.TRAITS.forEach(tr => {
      const row = document.createElement('div');
      row.className = 'gauge';
      row.innerHTML =
        `<span class="gauge-label">${tr.toUpperCase()}</span>` +
        `<span class="gauge-track"><span class="gauge-fill" data-t="${tr}"></span></span>` +
        `<span class="gauge-val" data-t="${tr}">0.0</span>`;
      host.appendChild(row);
    });
  }

  function computeFreq(user) {
    const v = Math.round((user.intensity * 7 + user.idealism * 5 + user.introspection * 3 + user.sociability * 2) * 10);
    return 82 + (v % 260) / 10;   // FM-band style 82.0 - 108.0
  }

  /* --------------------------------------------------------------------------
     REVEAL
     -------------------------------------------------------------------------- */
  function showReveal() {
    const hero = result.hero.song;
    const ch = result.character;

    setCover($('result-cover'), hero);
    $('result-resonance').textContent = result.heroResonance + '%';
    $('result-sync').textContent = 'PSYCHICALLY SYNCED WITH ' + ch.name.toUpperCase();
    $('result-title').textContent = hero.title;
    $('result-artist').textContent = hero.artist;
    $('result-vibe').textContent = 'ASSIGNED FREQUENCY // ' + (hero.vibe || 'UNCLASSIFIED').toUpperCase() + '  ·  ' + result.profile.signature.toUpperCase();
    $('result-read').textContent = result.profile.lines.join(' ');
    $('result-freq').textContent = 'FREQ ' + sessionFreq.toFixed(1);
    $('spotify-btn').href = hero.link || '#';

    show('reveal');
    // Honor reduced-motion: leave the looping video paused, the static scrim carries the screen.
    if (revealVideo && !reduceMotion) revealVideo.play().catch(() => {});
    playPreview(hero.preview, hero.link);
  }

  function setCover(imgEl, song, opts) {
    opts = opts || {};
    imgEl.onerror = function () { this.onerror = null; this.src = UpsideEngine.coverFor(song); };
    imgEl.alt = song.title + ' by ' + song.artist;
    imgEl.decoding = 'async';
    if (opts.lazy) imgEl.loading = 'lazy';
    let src = UpsideEngine.imageFor(song);
    if (opts.thumb && src.indexOf('mzstatic.com') !== -1) src = src.replace('600x600bb', '300x300bb');
    imgEl.src = src;
  }

  /* --------------------------------------------------------------------------
     GALLERY (10 tailored, declassified on scroll)
     -------------------------------------------------------------------------- */
  let galleryObserver = null;
  function buildGallery() {
    galleryGrid.innerHTML = '';
    $('gallery-sub').textContent = result.more.length + ' ADDITIONAL FREQUENCIES ON YOUR WAVELENGTH';

    result.more.forEach((entry, i) => {
      const song = entry.song;
      const row = document.createElement('div');
      row.className = 'archive-row';
      row.style.transitionDelay = Math.min(i * 45, 400) + 'ms';

      const cover = document.createElement('img');
      cover.className = 'archive-cover';
      setCover(cover, song, { lazy: true, thumb: true });

      const info = document.createElement('div');
      info.className = 'archive-info';
      info.innerHTML =
        `<div class="archive-case">CASE ${String(i + 2).padStart(2, '0')} · ${entry.resonance}% MATCH</div>` +
        `<div class="archive-title"><span>${escapeHtml(song.title)}</span><span class="redaction"></span></div>` +
        `<div class="archive-artist">${escapeHtml(song.artist)}</div>`;

      const res = document.createElement('span');
      res.className = 'archive-res';
      res.textContent = entry.resonance + '%';

      const link = document.createElement('a');
      link.className = 'archive-link';
      link.href = song.link || '#'; link.target = '_blank'; link.rel = 'noopener';
      link.title = 'Open in Spotify';
      link.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zM18.84 14.4c-.3.42-.84.54-1.26.24-3.539-2.16-8.88-2.76-12.06-1.5-.48.18-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C8.28 10.02 14.16 10.68 18.12 13.08c.48.3.6.84.3 1.26zm.12-3.3c-4.26-2.52-11.28-2.76-15.36-1.5-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.68-1.44 12.48-1.14 17.4 1.74.54.3.72 1.02.42 1.56-.3.6-.96.72-1.5.3z"/></svg>';

      row.append(cover, info, res, link);
      galleryGrid.appendChild(row);
    });

    // declassify on scroll-in
    if (galleryObserver) galleryObserver.disconnect();
    if ('IntersectionObserver' in window && !reduceMotion) {
      galleryObserver = new IntersectionObserver((es) => {
        es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); galleryObserver.unobserve(e.target); } });
      }, { root: galleryGrid, threshold: 0.2 });
      galleryGrid.querySelectorAll('.archive-row').forEach(r => galleryObserver.observe(r));
    } else {
      galleryGrid.querySelectorAll('.archive-row').forEach(r => r.classList.add('in'));
    }
  }

  function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* --------------------------------------------------------------------------
     RESTART
     -------------------------------------------------------------------------- */
  function restart() {
    stopAllMusic();
    if (revealVideo) { try { revealVideo.pause(); } catch (e) {} }
    galleryOverlay.classList.remove('is-active');
    galleryOverlay.setAttribute('aria-hidden', 'true');
    screens.reveal.removeAttribute('inert');
    $('analysis-status').style.color = '';
    document.querySelector('.stamp-complete').style.opacity = '';
    beginEvaluation();
  }

  /* --------------------------------------------------------------------------
     WIRING
     -------------------------------------------------------------------------- */
  $('begin-btn').addEventListener('click', () => {
    unlockAudio();
    screens.landing.classList.add('is-sealing');
    setTimeout(beginEvaluation, reduceMotion ? 60 : 460);
  });

  inputForm.addEventListener('submit', e => { e.preventDefault(); submitAnswer(inputField.value); });
  inputField.addEventListener('input', () => { scopeEnergy = Math.min(1, scopeEnergy + 0.18); });

  $('more-btn').addEventListener('click', () => {
    buildGallery();
    galleryOverlay.classList.add('is-active');
    galleryOverlay.setAttribute('aria-hidden', 'false');
    screens.reveal.setAttribute('inert', '');     // trap focus inside the dialog
    $('gallery-close').focus();
  });
  $('gallery-close').addEventListener('click', () => {
    galleryOverlay.classList.remove('is-active');
    galleryOverlay.setAttribute('aria-hidden', 'true');
    screens.reveal.removeAttribute('inert');
    $('more-btn').focus();                         // return focus to the opener
  });
  $('restart-btn').addEventListener('click', restart);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && galleryOverlay.classList.contains('is-active')) $('gallery-close').click();
  });

  // first interaction anywhere unlocks audio + ambient on landing
  window.addEventListener('pointerdown', function once() {
    unlockAudio();
    if (activeScreen === 'landing' && !reduceMotion) playAmbient();
    window.removeEventListener('pointerdown', once);
  }, { once: true });

  /* --------------------------------------------------------------------------
     BOOT
     -------------------------------------------------------------------------- */
  function boot() {
    if (typeof QUESTION_BANK === 'undefined' || typeof songDatabase === 'undefined') {
      console.error('UpsideSound: data modules missing.');
      return;
    }
    initCanvas();
    show('landing');
  }
  boot();
})();
