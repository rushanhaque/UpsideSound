/* ============================================================================
   UpsideSound - Resonance Engine
   ----------------------------------------------------------------------------
   A fully client-side "smart" recommender. No backend, no API key, launch-ready.

   Pipeline:
     1. Adaptive question selection  (unique sequence every session)
     2. Natural-language answer analysis  (negation / intensifiers / options /
        energy signals, mapped onto 5 personality traits)
     3. Trait squashing into a 0-10 resonance vector
     4. Hybrid cosine + euclidean song matching
     5. MMR diversification for the tailored "more like this" set
     6. Character match + a generated frequency profile

   Consumes globals:  QUESTION_BANK (questions.js), songDatabase (songs.js)
   Exposes global:    window.UpsideEngine
   ========================================================================== */
(function () {
  'use strict';

  const TRAITS = ['idealism', 'pragmatism', 'intensity', 'introspection', 'sociability'];

  /* --------------------------------------------------------------------------
     1. LEXICONS  - weighted keyword evidence per trait
     -------------------------------------------------------------------------- */
  const LEXICON = {
    idealism: {
      dream: 3, dreams: 3, dreaming: 2, hope: 3, hopeful: 2, believe: 2, belief: 2,
      faith: 2, magic: 3, magical: 3, wonder: 2, wondrous: 2, imagine: 3, imagination: 3,
      soul: 2, spirit: 2, destiny: 3, fate: 2, beauty: 2, beautiful: 2, love: 2, romance: 3,
      romantic: 3, heart: 2, infinite: 3, eternal: 3, transcend: 3, meaning: 2, purpose: 2,
      possibility: 2, possible: 1, wish: 2, star: 2, stars: 2, starlight: 3, light: 1,
      idealist: 3, vision: 2, inspire: 3, inspiration: 3, create: 2, creative: 2, art: 2,
      poetry: 3, poetic: 3, future: 2, utopia: 3, heaven: 3, divine: 3, miracle: 3,
      boundless: 3, limitless: 3, fly: 2, soar: 3, glow: 1, hopecore: 2, optimism: 3,
      optimistic: 3, sublime: 3, ethereal: 3, magical: 3
    },
    pragmatism: {
      real: 2, reality: 3, realistic: 3, practical: 3, logic: 3, logical: 3, reason: 2,
      rational: 3, plan: 3, planning: 3, prepare: 2, prepared: 2, control: 2, structure: 3,
      order: 2, system: 2, rules: 2, rule: 1, fact: 2, facts: 2, evidence: 2, proof: 2,
      sensible: 3, efficient: 3, useful: 2, work: 1, works: 1, fix: 3, solve: 2, solution: 2,
      build: 2, money: 2, save: 2, budget: 3, responsible: 3, duty: 2, discipline: 3,
      steady: 3, stable: 3, secure: 2, safe: 2, careful: 2, cautious: 3, prudent: 3,
      method: 2, strategy: 3, manage: 2, organize: 3, organized: 3, accept: 2, acceptance: 2,
      truth: 1, honest: 2, grounded: 3, concrete: 3, function: 2, productive: 3, focus: 2,
      pattern: 2, analyze: 2, calculate: 3, measured: 2
    },
    intensity: {
      fire: 3, burn: 3, burning: 3, storm: 3, lightning: 3, thunder: 3, chaos: 3, wild: 3,
      fierce: 3, fight: 2, fighting: 2, rage: 3, fury: 3, anger: 2, scream: 3, loud: 3,
      fast: 3, race: 2, run: 2, rush: 3, adrenaline: 3, risk: 3, risky: 3, danger: 3,
      dangerous: 3, edge: 2, extreme: 3, explode: 3, explosion: 3, energy: 3, energetic: 3,
      power: 2, powerful: 2, force: 2, push: 2, hunger: 2, hungry: 2, crave: 3, obsession: 3,
      obsessed: 3, electric: 3, alive: 2, blood: 2, war: 2, battle: 2, attack: 2, break: 2,
      smash: 3, destroy: 3, conquer: 3, dominate: 3, relentless: 3, ferocious: 3, blaze: 3,
      volcano: 3, hurricane: 3, intense: 3, passion: 2, passionate: 3, reckless: 3, raw: 2
    },
    introspection: {
      think: 2, thinking: 2, thought: 2, thoughts: 2, reflect: 3, reflection: 3, ponder: 3,
      inner: 3, within: 2, deep: 3, depth: 3, quiet: 3, silence: 3, silent: 3, alone: 3,
      solitude: 3, solitary: 3, myself: 2, mind: 2, contemplate: 3, meditate: 3, introspect: 3,
      private: 2, personal: 2, memory: 2, memories: 2, past: 2, nostalgia: 3, melancholy: 3,
      sad: 2, sadness: 2, lonely: 2, loneliness: 3, calm: 2, peace: 2, peaceful: 2, still: 2,
      stillness: 3, gentle: 2, slow: 2, observe: 2, listen: 2, understand: 1, search: 2,
      withdraw: 3, retreat: 2, journal: 3, ponderous: 2, introvert: 3, introverted: 3,
      brooding: 3, wistful: 3, pensive: 3, dusk: 2, midnight: 2
    },
    sociability: {
      people: 3, friend: 3, friends: 3, family: 2, together: 3, connection: 3, connect: 3,
      share: 3, sharing: 3, social: 3, party: 3, crowd: 3, group: 2, team: 2, community: 3,
      belong: 2, talk: 2, talking: 2, conversation: 3, laugh: 2, laughter: 3, dance: 3,
      dancing: 3, celebrate: 3, celebration: 3, fun: 2, gather: 2, gathering: 3,
      relationship: 2, others: 2, everyone: 3, tell: 1, express: 2, expression: 2, show: 1,
      perform: 3, stage: 2, attention: 2, popular: 3, outgoing: 3, warm: 2, welcoming: 3,
      hug: 3, company: 2, companion: 2, host: 2, invite: 2, extrovert: 3, extroverted: 3,
      crowds: 3, bond: 2, banter: 3, mingle: 3, neighbor: 2, neighbour: 2
    }
  };

  // Flatten to a fast lookup: token -> [{trait, weight}, ...]
  const LEX_MAP = (function () {
    const map = Object.create(null);
    for (const trait of TRAITS) {
      for (const word in LEXICON[trait]) {
        (map[word] || (map[word] = [])).push({ trait, weight: LEXICON[trait][word] });
      }
    }
    return map;
  })();

  const NEGATORS = new Set(['not', 'no', 'never', 'without', 'hardly', 'barely', 'cannot', 'cant', 'dont', 'wont', 'nor', 'neither', 'rarely', 'none']);
  const INTENSIFIERS = new Set(['very', 'really', 'so', 'extremely', 'always', 'deeply', 'completely', 'totally', 'absolutely', 'truly', 'incredibly', 'utterly', 'fiercely']);
  const DIMINISHERS = new Set(['slightly', 'somewhat', 'kinda', 'maybe', 'sometimes', 'occasionally', 'mildly', 'bit', 'little']);
  const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'to', 'or', 'and', 'in', 'on', 'for', 'with', 'you', 'your', 'are', 'is', 'be', 'do', 'would', 'rather', 'than', 'it', 'its', 'that', 'this', 'i', 'me', 'my']);

  function stems(token) {
    const out = [token];
    if (token.length > 4) {
      if (token.endsWith('ing')) out.push(token.slice(0, -3));
      else if (token.endsWith('ed')) out.push(token.slice(0, -2));
      else if (token.endsWith('s')) out.push(token.slice(0, -1));
    }
    return out;
  }

  /* --------------------------------------------------------------------------
     2. ANSWER ANALYSIS
     -------------------------------------------------------------------------- */
  function matchOption(text, options) {
    const lower = text.toLowerCase();
    const tokens = new Set(lower.split(/[^a-z']+/).filter(w => w.length > 2 && !STOPWORDS.has(w)));
    let best = null, bestScore = 0;
    options.forEach((opt, i) => {
      let score = 0;
      const optTokens = opt.label.toLowerCase().split(/[^a-z']+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
      for (const w of optTokens) if (tokens.has(w)) score += 2;
      // positional / ordinal cues
      const cues = i === 0
        ? ['first', 'former', 'one', '1', 'left', 'a', 'top', 'yes', 'definitely']
        : ['second', 'latter', 'two', '2', 'right', 'b', 'bottom', 'no', 'other'];
      for (const c of cues) if (new RegExp('\\b' + c + '\\b').test(lower)) { score += 1.2; break; }
      if (score > bestScore) { bestScore = score; best = opt; }
    });
    return bestScore > 0 ? best : null;
  }

  function analyze(text, question) {
    const deltas = { idealism: 0, pragmatism: 0, intensity: 0, introspection: 0, sociability: 0 };
    if (!text) return deltas;

    const exclam = (text.match(/!/g) || []).length;
    const qmarks = (text.match(/\?/g) || []).length;
    const capsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).length;

    let t = text.toLowerCase().replace(/n['’]t/g, ' not ');
    const tokens = t.split(/[^a-z']+/).filter(Boolean);

    let negWindow = 0;     // tokens for which polarity is inverted
    let scale = 1;         // multiplier applied to the next content token
    let contentTokens = 0;

    for (const tok of tokens) {
      if (NEGATORS.has(tok)) { negWindow = 3; continue; }
      if (INTENSIFIERS.has(tok)) { scale = 1.8; continue; }
      if (DIMINISHERS.has(tok)) { scale = 0.5; continue; }
      if (tok.length < 3) continue;   // short filler does not consume the negation window
      contentTokens++;

      let hit = null;
      for (const s of stems(tok)) { if (LEX_MAP[s]) { hit = LEX_MAP[s]; break; } }
      if (hit) {
        const sign = negWindow > 0 ? -1 : 1;
        for (const { trait, weight } of hit) deltas[trait] += sign * weight * scale;
      }
      if (negWindow > 0) negWindow--;
      scale = 1;
    }

    // Energy / form signals (how something is said, not just what)
    deltas.intensity += Math.min(exclam, 3) * 1.2 + Math.min(capsWords, 2) * 1.0;
    deltas.introspection += Math.min(qmarks, 2) * 0.8;
    if (contentTokens >= 24) { deltas.introspection += 1.6; deltas.idealism += 0.8; }
    else if (contentTokens > 0 && contentTokens <= 3) { deltas.pragmatism += 1.4; }

    // Explicit option leaning (this-or-that / preference questions)
    if (question && question.options && question.options.length) {
      const opt = matchOption(text, question.options);
      if (opt && opt.leaning) {
        for (const k in opt.leaning) if (k in deltas) deltas[k] += opt.leaning[k] * 1.6;
      }
    }
    return deltas;
  }

  /* --------------------------------------------------------------------------
     3. MATH HELPERS
     -------------------------------------------------------------------------- */
  const center = v => TRAITS.map(t => (v[t] || 0) - 5);
  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }
  function euclid(a, b) {
    let s = 0;
    for (const t of TRAITS) { const d = (a[t] || 0) - (b[t] || 0); s += d * d; }
    return Math.sqrt(s);
  }
  const MAX_EUCLID = Math.sqrt(TRAITS.length * 100); // 22.36

  function matchScore(user, song) {
    const cosMapped = (cosine(center(user), center(song.vectors)) + 1) / 2; // 0..1 (personality shape)
    const eucScore = 1 - euclid(user, song.vectors) / MAX_EUCLID;           // 0..1 (closeness)
    return 0.6 * cosMapped + 0.4 * eucScore;
  }
  // Monotonic presentation curve: preserves ranking, lifts the resonance % into a satisfying band.
  const toResonance = score => Math.round(100 * Math.pow(Math.max(0, Math.min(1, score)), 0.55));

  /* --------------------------------------------------------------------------
     4. CHARACTER DATABASE
     -------------------------------------------------------------------------- */
  const CHARACTERS = [
    { name: 'Eleven', vectors: { idealism: 9, pragmatism: 2, intensity: 10, introspection: 8, sociability: 2 }, quote: 'Friends don\'t lie.' },
    { name: 'Mike Wheeler', vectors: { idealism: 10, pragmatism: 3, intensity: 7, introspection: 5, sociability: 8 }, quote: 'If we\'re both going crazy, we\'ll go crazy together.' },
    { name: 'Dustin Henderson', vectors: { idealism: 8, pragmatism: 9, intensity: 5, introspection: 4, sociability: 10 }, quote: 'Why are you keeping this curiosity door locked?' },
    { name: 'Will Byers', vectors: { idealism: 7, pragmatism: 4, intensity: 8, introspection: 10, sociability: 5 }, quote: 'It\'s like I\'m still there, in the Upside Down.' },
    { name: 'Max Mayfield', vectors: { idealism: 4, pragmatism: 10, intensity: 9, introspection: 7, sociability: 4 }, quote: 'I\'m not a princess.' },
    { name: 'Steve Harrington', vectors: { idealism: 6, pragmatism: 8, intensity: 6, introspection: 5, sociability: 9 }, quote: 'I\'m a natural born leader.' },
    { name: 'Eddie Munson', vectors: { idealism: 9, pragmatism: 3, intensity: 10, introspection: 6, sociability: 7 }, quote: 'We never fit into Hawkins. But here, this is our home.' },
    { name: 'Jim Hopper', vectors: { idealism: 3, pragmatism: 10, intensity: 8, introspection: 5, sociability: 2 }, quote: 'Mornings are for coffee and contemplation.' },
    { name: 'Robin Buckley', vectors: { idealism: 8, pragmatism: 4, intensity: 5, introspection: 10, sociability: 9 }, quote: 'You should fight for your friends.' },
    { name: 'Lucas Sinclair', vectors: { idealism: 4, pragmatism: 9, intensity: 8, introspection: 3, sociability: 7 }, quote: 'I\'m the realist.' },
    { name: 'Erica Sinclair', vectors: { idealism: 1, pragmatism: 10, intensity: 10, introspection: 2, sociability: 10 }, quote: 'You can\'t spell America without Erica.' },
    { name: 'Jonathan Byers', vectors: { idealism: 5, pragmatism: 6, intensity: 4, introspection: 10, sociability: 1 }, quote: 'Nobody normal ever accomplished anything meaningful.' },
    { name: 'Nancy Wheeler', vectors: { idealism: 7, pragmatism: 9, intensity: 8, introspection: 6, sociability: 6 }, quote: 'I\'m not just some suburban girl.' }
  ];

  function matchCharacter(user) {
    let best = null, lowest = Infinity;
    for (const c of CHARACTERS) {
      const d = euclid(user, c.vectors);
      if (d < lowest) { lowest = d; best = c; }
    }
    return best;
  }

  /* --------------------------------------------------------------------------
     5. FREQUENCY PROFILE  (the personalized read-out)
     -------------------------------------------------------------------------- */
  const SIGNATURE = {
    idealism:      { label: 'Dreamer\'s Static',  high: ['boundless imagination', 'a wide-open, hopeful wiring', 'romance with the impossible'], low: ['a clear-eyed lack of illusions'] },
    pragmatism:    { label: 'Steady Signal',      high: ['a grounded, load-bearing mind', 'cool logic under pressure', 'an instinct for what actually works'], low: ['a refusal to be fenced in by rules'] },
    intensity:     { label: 'Live Wire',          high: ['high-voltage feeling', 'a storm you keep barely contained', 'all-or-nothing energy'], low: ['an unshakeable calm'] },
    introspection: { label: 'Deep Current',       high: ['a mind that runs deep and quiet', 'long midnight conversations with yourself', 'a pull toward the inner world'], low: ['a life lived out loud, not inward'] },
    sociability:   { label: 'Open Channel',       high: ['a current that reaches for others', 'a room you light up', 'connection as oxygen'], low: ['a self-contained, solitary frequency'] }
  };

  function buildProfile(user, rnd) {
    const sorted = TRAITS.map(t => ({ trait: t, value: user[t] })).sort((a, b) => b.value - a.value);
    const top = sorted[0], second = sorted[1], bottom = sorted[sorted.length - 1];

    const phrase = (entry, isHigh) => {
      const pool = isHigh ? SIGNATURE[entry.trait].high : SIGNATURE[entry.trait].low;
      return pool[Math.floor(rnd() * pool.length)];
    };

    const lines = [];
    lines.push(`Your signal runs on ${phrase(top, true)}, threaded with ${phrase(second, true)}.`);
    if (bottom.value < 4) lines.push(`Underneath it: ${phrase(bottom, false)}.`);

    const archetype = SIGNATURE[top.trait].label;
    const signature = TRAITS
      .map(t => ({ t, v: user[t] }))
      .filter(x => x.v >= 6.5)
      .map(x => SIGNATURE[x.t].label)
      .slice(0, 2)
      .join(' / ') || SIGNATURE[top.trait].label;

    return { archetype, signature, lines, sorted };
  }

  /* --------------------------------------------------------------------------
     6. PROCEDURAL COVER ART  (for the blanked/broken images)
     -------------------------------------------------------------------------- */
  function strHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }

  function coverFor(song) {
    const h = strHash((song.title || '') + (song.artist || ''));
    const initial = ((song.title || '?').trim()[0] || '?').toUpperCase();
    // Tint toward red or cold-blue based on the song's own intensity vs introspection.
    const v = song.vectors || {};
    const cold = (v.introspection || 5) >= (v.intensity || 5);
    const glow = cold ? '#3b8ff0' : '#ff2330';
    const glow2 = cold ? '#0c2a4d' : '#3a0608';
    const rot = (h % 60) - 30;
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>` +
      `<defs>` +
        `<radialGradient id='g' cx='${30 + (h % 40)}%' cy='${25 + (h >> 3) % 40}%' r='85%'>` +
          `<stop offset='0%' stop-color='${glow}' stop-opacity='0.55'/>` +
          `<stop offset='45%' stop-color='${glow2}' stop-opacity='0.9'/>` +
          `<stop offset='100%' stop-color='#08070a'/>` +
        `</radialGradient>` +
        `<filter id='b'><feGaussianBlur stdDeviation='2.2'/></filter>` +
      `</defs>` +
      `<rect width='600' height='600' fill='#08070a'/>` +
      `<rect width='600' height='600' fill='url(#g)'/>` +
      `<g transform='rotate(${rot} 300 300)' opacity='0.18' stroke='${glow}' stroke-width='1.5' fill='none'>` +
        `<circle cx='300' cy='300' r='150'/><circle cx='300' cy='300' r='230'/>` +
      `</g>` +
      `<text x='300' y='300' font-family='Cinzel, Georgia, serif' font-size='300' font-weight='700' ` +
        `fill='#f5ede6' fill-opacity='0.92' text-anchor='middle' dominant-baseline='central' ` +
        `filter='url(#b)' style='text-shadow:0 0 30px ${glow}'>${initial}</text>` +
      `<text x='300' y='300' font-family='Cinzel, Georgia, serif' font-size='300' font-weight='700' ` +
        `fill='#fffaf5' text-anchor='middle' dominant-baseline='central'>${initial}</text>` +
      `<g opacity='0.07' fill='#000'>` +
        Array.from({ length: 60 }, (_, i) => `<rect y='${i * 10}' width='600' height='5'/>`).join('') +
      `</g>` +
      `</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function imageFor(song) {
    return (song.image && song.image.length > 4) ? song.image : coverFor(song);
  }

  /* --------------------------------------------------------------------------
     7. RECOMMENDATION  (rank + MMR diversify)
     -------------------------------------------------------------------------- */
  function recommend(user, songs, opts) {
    opts = opts || {};
    const moreCount = opts.moreCount || 10;
    const lambda = opts.lambda != null ? opts.lambda : 0.72; // relevance vs diversity

    const ranked = songs
      .map(song => ({ song, score: matchScore(user, song) }))
      .sort((a, b) => b.score - a.score);

    const hero = ranked[0];

    // MMR over a candidate pool: tailored but varied, no near-duplicate clones, artist spread.
    const pool = ranked.slice(1, Math.min(ranked.length, 40));
    const picked = [];
    const usedArtists = {};
    while (picked.length < moreCount && pool.length) {
      let bestIdx = 0, bestVal = -Infinity;
      for (let i = 0; i < pool.length; i++) {
        const cand = pool[i];
        let maxSim = 0;
        for (const p of picked) {
          const sim = (cosine(center(cand.song.vectors), center(p.song.vectors)) + 1) / 2;
          if (sim > maxSim) maxSim = sim;
        }
        const artistPenalty = (usedArtists[cand.song.artist] || 0) * 0.12;
        const val = lambda * cand.score - (1 - lambda) * maxSim - artistPenalty;
        if (val > bestVal) { bestVal = val; bestIdx = i; }
      }
      const chosen = pool.splice(bestIdx, 1)[0];
      usedArtists[chosen.song.artist] = (usedArtists[chosen.song.artist] || 0) + 1;
      picked.push(chosen);
    }
    return { hero, more: picked, ranked };
  }

  /* --------------------------------------------------------------------------
     8. ADAPTIVE SESSION
     -------------------------------------------------------------------------- */
  const INTROS = [
    "This is not a quiz about your favorite color. It is a reading of how your mind maps the world. Answer honestly, in your own words. The signal does the rest.",
    "Somewhere in the static, there is a song tuned to exactly your frequency. To find it I need to read your wiring. Answer plainly. There are no wrong answers, only true ones.",
    "I am going to ask you a few things. Some simple, some strange. Don't overthink them. The way you answer tells me more than the answer itself.",
    "Let's map your frequency. A handful of questions, drawn fresh for you tonight. Speak in full sentences when you can. The more honest the input, the cleaner the match."
  ];

  // Seeded PRNG so a session is internally consistent (and varies per session).
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class Session {
    constructor(bank, config) {
      this.bank = (bank || []).slice();
      this.config = Object.assign({ questionCount: 7 }, config);
      this.seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
      this.rnd = mulberry32(this.seed);
      this.askedIds = new Set();
      this.asked = [];
      this.answers = [];
      this.raw = { idealism: 0, pragmatism: 0, intensity: 0, introspection: 0, sociability: 0 };
      this.coverage = { idealism: 0, pragmatism: 0, intensity: 0, introspection: 0, sociability: 0 };
      this.current = null;
      this.lastType = null;
      this.intro = INTROS[Math.floor(this.rnd() * INTROS.length)];
      this.count = Math.min(this.config.questionCount, this.bank.length);
    }

    get total() { return this.count; }
    get index() { return this.asked.length; }

    nextQuestion() {
      if (this.asked.length >= this.count) { this.current = null; return null; }
      const remaining = this.bank.filter(q => !this.askedIds.has(q.id));
      if (!remaining.length) { this.current = null; return null; }

      const phase = this.asked.length;
      let pool = remaining;
      if (phase < 2) {
        const light = remaining.filter(q => q.depth === 'light');
        if (light.length) pool = light;
      } else if (phase >= this.count - 2) {
        const deep = remaining.filter(q => q.depth === 'deep');
        if (deep.length) pool = deep;
      }

      let best = null, bestScore = -Infinity;
      for (const q of pool) {
        // Favor questions probing the least-covered traits (information gain).
        let need = 0;
        for (const tr of q.probes) need += 1 / (1 + this.coverage[tr]);
        const variety = q.type !== this.lastType ? 0.35 : 0;
        const jitter = this.rnd() * 0.6; // keeps every session's path unique
        const s = need + variety + jitter;
        if (s > bestScore) { bestScore = s; best = q; }
      }

      this.current = best;
      this.askedIds.add(best.id);
      this.asked.push(best);
      this.lastType = best.type;
      return best;
    }

    submit(text) {
      const q = this.current;
      const deltas = analyze(text, q);
      this.answers.push({ q, text, deltas });
      for (const t of TRAITS) {
        this.raw[t] += deltas[t];
        this.coverage[t] += Math.abs(deltas[t]);
      }
      // Guarantee the probed traits register *some* signal even on a terse answer,
      // so the question still does its job of differentiating.
      if (q && q.probes) for (const tr of q.probes) this.coverage[tr] += 0.5;
      return deltas;
    }

    finish() {
      // Squash net evidence into a 0-10 vector centered on 5 (neutral) via tanh.
      const SOFT = 6.5;
      const user = {};
      let totalEvidence = 0;
      for (const t of TRAITS) {
        user[t] = +(5 + 5 * Math.tanh(this.raw[t] / SOFT)).toFixed(2);
        totalEvidence += Math.abs(this.raw[t]);
      }
      // If the subject gave essentially no signal (blank/garbage), seed a small
      // deterministic tilt so neutral sessions still differ and the matcher can
      // discriminate instead of collapsing every answer onto one fixed result.
      if (totalEvidence < 1) {
        TRAITS.forEach((t, i) => {
          const j = ((this.seed >>> (i * 4)) & 0xf) / 15;   // 0..1 from the session seed
          user[t] = +(3.2 + j * 3.6).toFixed(2);            // spread across 3.2..6.8
        });
      }
      const rec = recommend(user, (typeof songDatabase !== 'undefined' ? songDatabase : []), {
        moreCount: this.config.moreCount || 10
      });
      const character = matchCharacter(user);
      const profile = buildProfile(user, this.rnd);

      return {
        user,
        hero: rec.hero,
        heroResonance: toResonance(rec.hero ? rec.hero.score : 0),
        more: rec.more.map(r => ({ song: r.song, resonance: toResonance(r.score) })),
        character,
        profile,
        seed: this.seed
      };
    }
  }

  /* --------------------------------------------------------------------------
     PUBLIC API
     -------------------------------------------------------------------------- */
  window.UpsideEngine = {
    TRAITS,
    createSession(config) {
      const bank = (typeof QUESTION_BANK !== 'undefined' && QUESTION_BANK.length) ? QUESTION_BANK : [];
      return new Session(bank, config);
    },
    analyze,
    matchScore,
    toResonance,
    coverFor,
    imageFor,
    matchCharacter,
    characters: CHARACTERS
  };
})();
