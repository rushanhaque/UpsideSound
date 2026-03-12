const ALPHABET_MAP = {
  'A': { x: 35.34, y: 15.89, color: 'white' },
  'B': { x: 39.46, y: 15.54, color: 'blue' },
  'C': { x: 42.93, y: 15.19, color: 'pink' },
  'D': { x: 47.32, y: 16.12, color: 'green' },
  'E': { x: 50.79, y: 16.82, color: 'blue' },
  'F': { x: 55.76, y: 17.52, color: 'yellow' },
  'G': { x: 58.64, y: 16.12, color: 'red' },
  'H': { x: 62.76, y: 16, color: 'white' },
  'I': { x: 30.69, y: 26.01, color: 'green' },
  'J': { x: 36.39, y: 27.52, color: 'yellow' },
  'K': { x: 39.4, y: 29.03, color: 'pink' },
  'L': { x: 43.52, y: 29.62, color: 'blue' },
  'M': { x: 48.17, y: 29.62, color: 'green' },
  'N': { x: 51.05, y: 26.82, color: 'red' },
  'O': { x: 55.82, y: 25.89, color: 'yellow' },
  'P': { x: 58.38, y: 25.78, color: 'pink' },
  'Q': { x: 65.77, y: 27.17, color: 'green' },
  'R': { x: 33.51, y: 38.69, color: 'white' },
  'S': { x: 38.74, y: 39.85, color: 'yellow' },
  'T': { x: 40.97, y: 41.83, color: 'blue' },
  'U': { x: 46.07, y: 40.55, color: 'orange' },
  'V': { x: 49.41, y: 40.67, color: 'green' },
  'W': { x: 51.96, y: 39.62, color: 'pink' },
  'X': { x: 55.76, y: 39.85, color: 'yellow' },
  'Y': { x: 59.03, y: 38.92, color: 'red' },
  'Z': { x: 66.1, y: 39.04, color: 'white' },
};

const layer = document.getElementById('lights-layer');
const img = document.getElementById('wall-img');
const bulbs = {};

function buildLights() {
  layer.innerHTML = '';
  Object.keys(ALPHABET_MAP).forEach(char => {
    const data = ALPHABET_MAP[char];
    const bulb = document.createElement('div');
    bulb.className = `light-bulb ${data.color}`;
    bulb.style.left = `${data.x}%`;
    bulb.style.top = `${data.y}%`;
    layer.appendChild(bulb);
    bulbs[char] = bulb;
  });
}

buildLights();

let ambientIntervals = [];

function startAmbient() {
  stopAmbient();
  Object.keys(bulbs).forEach(char => {
    const bulb = bulbs[char];
    const inter = setInterval(() => {
      if (Math.random() < 0.25) {
        bulb.classList.add('on');
        setTimeout(() => bulb.classList.remove('on'), 250 + Math.random() * 500);
      }
    }, 1000 + Math.random() * 2000);
    ambientIntervals.push(inter);
  });
}

function stopAmbient() {
  ambientIntervals.forEach(id => clearInterval(id));
  ambientIntervals = [];
  turnAllOff();
}

function turnAllOff() {
  Object.values(bulbs).forEach(b => b.classList.remove('on'));
}

function turnOn(char, ms = 700) {
  const c = char.toUpperCase();
  if (bulbs[c]) {
    bulbs[c].classList.add('on');
    if (ms > 0) {
      setTimeout(() => bulbs[c].classList.remove('on'), ms);
    }
  }
}

let currentSequence = ['R', 'U', 'S', 'H', 'A', 'N'];
let sequenceActive = true;
let currentPreviewAudio = new Audio();
currentPreviewAudio.volume = 0.8;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function playSequenceLoop() {
  while (true) {
    if (!sequenceActive) {
      await sleep(200);
      continue;
    }
    for (let i = 0; i < currentSequence.length; i++) {
      if (!sequenceActive) break;
      turnOn(currentSequence[i], 0);
      await sleep(600);           
    }
    if (sequenceActive) await sleep(3000);
    if (sequenceActive) turnAllOff();
    if (sequenceActive) await sleep(2000);
  }
}

setTimeout(playSequenceLoop, 1000);

async function spellSongTitle(song) {
  sequenceActive = false;
  turnAllOff();
  await sleep(1000);
  
  const cleanTitle = song.title.replace(/[^a-zA-Z]/g, '').toUpperCase();
  for (let i = 0; i < cleanTitle.length; i++) {
    turnOn(cleanTitle[i], 0);
    await sleep(600);
    turnAllOff();
    await sleep(200);
  }
  
  for(let f=0; f<5; f++) {
    turnAllOff();
    await sleep(100);
    Object.keys(bulbs).forEach(k => turnOn(k, 0));
    await sleep(100);
  }
  turnAllOff();
  
  document.getElementById('reveal-cover').src = song.image;
  document.getElementById('reveal-title').innerText = song.title;
  document.getElementById('reveal-artist').innerText = song.artist;
  document.getElementById('reveal-vibe').innerText = `Frequency: ${song.vibe}`;
  document.getElementById('reveal-btn').href = song.link;
  document.getElementById('reveal-screen').classList.remove('hidden');
  
  currentSequence = cleanTitle.split('');
  sequenceActive = true;
}

const music1 = new Audio('assets/instrumental1(homepage).weba');
music1.loop = true;
const music2 = new Audio('assets/instrumental2(recommendation page).weba');
music2.loop = true;

function switchMusic(isReveal = false) {
  music1.pause();
  if (isReveal) {
    music2.pause();
  } else {
    music2.currentTime = 0;
    music2.play().catch(e => console.error("Audio blocked:", e));
  }
}

music1.play().catch(e => {
    window.addEventListener('click', () => {
        if (music1.paused && music2.paused) {
            music1.play().catch(e => console.error("Audio blocked:", e));
        }
    }, { once: true });
});

const traitDictionaries = {
  idealism: ['burn', 'mystery', 'hope', 'create', 'believe', 'abstract', 'feeling', 'love', 'future', 'imagine', 'beyond', 'magic', 'spirit', 'change', 'light', 'destiny', 'dream', 'respect', 'dance'],
  pragmatism: ['read', 'reality', 'prepare', 'pattern', 'accept', 'know', 'logic', 'truth', 'plan', 'understand', 'system', 'build', 'order', 'reason', 'fact', 'steady', 'fix', 'analyze', 'history', 'leave', 'owner'],
  intensity: ['break', 'storm', 'watch', 'fight', 'lightning', 'chaos', 'dive', 'run', 'scream', 'push', 'wild', 'blood', 'fire', 'fast', 'hard', 'action', 'destroy', 'loud', 'energy', 'immediately'],
  introspection: ['wait', 'silence', 'inner', 'personal', 'enough', 'quiet', 'peace', 'alone', 'myself', 'think', 'reflect', 'deep', 'still', 'calm', 'mind', 'soul', 'stillness', 'analyze', 'history'],
  sociability: ['people', 'share', 'show', 'recognize', 'others', 'tell', 'connect', 'talk', 'together', 'friends', 'world', 'society', 'help', 'give', 'receive', 'seen', 'crowd', 'owner']
};

const allQuizQuestions = [
  "Do you typically seek the energy of a loud crowd or the stillness of a quiet room?",
  "You find a lost wallet. Do you track the owner yourself or leave it for someone else?",
  "Would you rather spend a year in the past or a decade in the future?",
  "You enter a library. Do you head for the 'History' aisle or the 'Science Fiction' section?",
  "Is it more important to be respected by others or to be at peace with yourself?",
  "Do you prefer music that makes you want to dance or music that makes you want to think?",
  "When a plan fails, is your first instinct to fix it immediately or to analyze why it failed?",
  "You discover a locked door. Do you search for the key or look for an alternate way in?",
  "If you could witness any event past, present, or future, what kind of event would it be?",
  "When watching a movie, do you relate more to the hero's journey or the villain's motives?",
  "Are you more afraid of failure or of never trying at all?",
  "A stranger hands you a box. You know it contains what you need most, but opening it hurts someone else. Do you open it?",
  "Do you believe chaos is a ladder to climb, or a pit to be avoided?",
  "Would you prefer a painful truth or a comforting lie?",
  "When given a set of rules, do you look for boundaries to push, or structure to follow?",
  "Is love a spontaneous feeling, or a conscious choice made every day?",
  "If art doesn't make you uncomfortable, is it still art?",
  "Do you often feel like you are waiting for your life to begin, or are you living it right now?",
  "Would you rather be known for your intellect or your boundless empathy?",
  "If you could erase one deeply painful memory forever, would you?",
  "Do you believe human nature is fundamentally self-serving or cooperative?",
  "Are you drawn more to the chaotic beauty of a storm or the calm that follows?",
  "Would you rather have a profound conversation with a stranger or comfortable silence with an old friend?",
  "Is it worse to be completely forgotten or remembered for the wrong reasons?",
  "If someone hands you a blank canvas, do you plan your painting or just start splashing color?",
  "Do you find more meaning in building something entirely new, or restoring something old?",
  "When alone in the dark, does your mind naturally drift to your grandest dreams or your deepest anxieties?",
  "Would you rather lead a chaotic revolution or govern a peaceful but boring city?",
  "Do you believe that destiny is written, or is it yours to create at every single moment?",
  "Is true freedom more about having endless choices, or having absolutely zero obligations?",
  "If you were a color, would you be a deep, consuming ocean blue or a bright, blinding neon yellow?",
  "Do you place more value on the thrill of the journey, or the achievement of the destination?"
];

let quizQuestions = [];

const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');
const introScreen = document.getElementById('intro-screen');
const chatContainer = document.getElementById('chat-container');
const beginBtn = document.getElementById('begin-btn');

let currentStep = -1;
let isTestMode = false;
let userProfile = { idealism: 0, pragmatism: 0, intensity: 0, introspection: 0, sociability: 0 };
let userName = "Traveler";

const characterDatabase = [
  { name: "Eleven", vectors: { idealism: 9, pragmatism: 2, intensity: 10, introspection: 8, sociability: 2 }, quote: "Friends don't lie." },
  { name: "Mike Wheeler", vectors: { idealism: 10, pragmatism: 3, intensity: 7, introspection: 5, sociability: 8 }, quote: "If we're both going crazy, then we'll go crazy together, right?" },
  { name: "Dustin Henderson", vectors: { idealism: 8, pragmatism: 9, intensity: 5, introspection: 4, sociability: 10 }, quote: "Why are you keeping this curiosity door locked?" },
  { name: "Will Byers", vectors: { idealism: 7, pragmatism: 4, intensity: 8, introspection: 10, sociability: 5 }, quote: "It’s like I’m still there, in the Upside Down." },
  { name: "Max Mayfield", vectors: { idealism: 4, pragmatism: 10, intensity: 9, introspection: 7, sociability: 4 }, quote: "I’m not a princess." },
  { name: "Steve Harrington", vectors: { idealism: 6, pragmatism: 8, intensity: 6, introspection: 5, sociability: 9 }, quote: "I’m a natural born leader." },
  { name: "Eddie Munson", vectors: { idealism: 9, pragmatism: 3, intensity: 10, introspection: 6, sociability: 7 }, quote: "Chrissy, this is for you." },
  { name: "Jim Hopper", vectors: { idealism: 3, pragmatism: 10, intensity: 8, introspection: 5, sociability: 2 }, quote: "Mornings are for coffee and contemplation." },
  { name: "Robin Buckley", vectors: { idealism: 8, pragmatism: 4, intensity: 5, introspection: 10, sociability: 9 }, quote: "You can't spell America without Erica." },
  { name: "Lucas Sinclair", vectors: { idealism: 4, pragmatism: 9, intensity: 8, introspection: 3, sociability: 7 }, quote: "I'm the realist." },
  { name: "Erica Sinclair", vectors: { idealism: 1, pragmatism: 10, intensity: 10, introspection: 2, sociability: 10 }, quote: "You can't spell America without Erica." },
  { name: "Jonathan Byers", vectors: { idealism: 5, pragmatism: 6, intensity: 4, introspection: 10, sociability: 1 }, quote: "I don't fit in." },
  { name: "Nancy Wheeler", vectors: { idealism: 7, pragmatism: 9, intensity: 8, introspection: 6, sociability: 6 }, quote: "I’m not just some girl." }
];

function findCharacterMatch(normalizedUser) {
  let closestChar = null;
  let lowestDistance = Infinity;
  characterDatabase.forEach(char => {
    let sumSquares = 0;
    for (const trait in normalizedUser) {
      const diff = normalizedUser[trait] - char.vectors[trait];
      sumSquares += diff * diff;
    }
    const distance = Math.sqrt(sumSquares);
    if (distance < lowestDistance) {
      lowestDistance = distance;
      closestChar = char;
    }
  });
  return closestChar;
}

async function addMessage(text, isUser = false) {
  const msg = document.createElement('div');
  msg.className = isUser ? 'msg-user' : 'msg-bot';
  chatMessages.appendChild(msg);
  if (isUser) {
    msg.textContent = text;
  } else {
    for(let i=0; i<text.length; i++) {
      msg.textContent += text[i];
      chatMessages.scrollTop = chatMessages.scrollHeight;
      await sleep(20 + Math.random() * 30);
    }
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

beginBtn.addEventListener('click', () => {
  // Mobile Fix: Unlock audio on first user interaction
  music1.play().then(() => music1.pause());
  music2.play().then(() => music2.pause());
  currentPreviewAudio.play().then(() => currentPreviewAudio.pause()).catch(() => {});
  
  const silent = new Audio();
  silent.play().catch(() => {});

  introScreen.classList.add('hidden');
  chatContainer.classList.remove('hidden');
  const shuffled = [...allQuizQuestions].sort(() => 0.5 - Math.random());
  quizQuestions = shuffled.slice(0, 8);
  setTimeout(() => {
    addMessage("This is a psychological evaluation. I don't care about your favorite color. I care about how your mind maps to the world. I will ask you eight randomly drawn questions—a mix of personality, paradoxes, and scenarios. Tell me honestly what you think. Ready?");
  }, 1000);
  
  // Start ambiance after unlock
  setTimeout(() => {
    music1.currentTime = 0;
    music1.play().catch(e => console.error("Audio blocked:", e));
  }, 500);
});

function scoreAnswer(text) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  words.forEach(word => {
    if (!word || word.length < 3) return;
    for (const [trait, keywords] of Object.entries(traitDictionaries)) {
      if (keywords.some(kw => word.includes(kw) || (kw.length > 3 && kw.includes(word)))) {
        userProfile[trait] += 3;
      }
    }
  });
}

function getTrackId(url) {
  const parts = url.split('/');
  const trackPart = parts[parts.length - 1];
  return trackPart.split('?')[0];
}

function updateSpotifyPlayer(url) {
  const trackId = getTrackId(url);
  const player = document.getElementById('spotify-player');
  const container = document.getElementById('spotify-player-container');
  container.style.opacity = "0.01";
  player.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&autoplay=1`;
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  if (currentStep === -1 && !isTestMode) userName = text;
  chatInput.value = '';
  chatInput.disabled = true;
  await addMessage(text, true);

  const lower = text.toLowerCase().replace(/\s/g, '');
  if (lower === 'rushanhaque') {
    isTestMode = true;
    currentStep = quizQuestions.length - 1;
    await addMessage(quizQuestions[currentStep]);
    chatInput.disabled = false;
    chatInput.focus();
    return;
  }
  
  Object.keys(bulbs).forEach(char => {
    if (Math.random() > 0.7) turnOn(char, 200 + Math.random() * 300);
  });
  
  if (currentStep === -1) {
    const lower = text.toLowerCase();
    if (lower.includes('no') || lower.includes('not') || lower.includes('wait')) {
      await sleep(500);
      await addMessage("Time waits for no one. The evaluation begins anyway.");
    }
    currentStep++;
    await sleep(800);
    await addMessage(quizQuestions[currentStep]);
  } else if (currentStep < quizQuestions.length - 1) {
    scoreAnswer(text);
    currentStep++;
    await sleep(600);
    await addMessage(quizQuestions[currentStep]);
  } else {
    scoreAnswer(text);
    await sleep(600);
    await analyzeAndRecommend();
  }
  chatInput.disabled = false;
  chatInput.focus();
}

async function analyzeAndRecommend() {
  sequenceActive = false;
  
  // Minimal in-chat analysis message
  await addMessage("Mapping resonance patterns... please wait.");
  
  let calcInt = setInterval(() => {
    Object.keys(bulbs).forEach(char => {
      if (Math.random() > 0.5) turnOn(char, 50);
    });
  }, 100);
  
  await sleep(3000); // 3 second analysis window for tension
  
  clearInterval(calcInt);
  turnAllOff();
  
  let maxScore = Math.max(...Object.values(userProfile));
  if (maxScore === 0) maxScore = 1;
  const normalizedUser = {
    idealism: (userProfile.idealism / maxScore) * 10,
    pragmatism: (userProfile.pragmatism / maxScore) * 10,
    intensity: (userProfile.intensity / maxScore) * 10,
    introspection: (userProfile.introspection / maxScore) * 10,
    sociability: (userProfile.sociability / maxScore) * 10
  };
  
  let bestMatch = null;
  let lowestDistance = Infinity;
  if (isTestMode) {
    bestMatch = songDatabase[Math.floor(Math.random() * songDatabase.length)];
    isTestMode = false;
  } else {
    songDatabase.forEach(song => {
      let sumSquares = 0;
      for (const trait in normalizedUser) {
        const diff = normalizedUser[trait] - song.vectors[trait];
        sumSquares += diff * diff;
      }
      const distance = Math.sqrt(sumSquares);
      if (distance < lowestDistance) {
        lowestDistance = distance;
        bestMatch = song;
      }
    });
  }
  
  const charMatch = findCharacterMatch(normalizedUser);
  sequenceActive = false;
  turnAllOff();
  await sleep(500);

  document.getElementById('reveal-cover').src = bestMatch.image;
  document.getElementById('reveal-title').innerText = bestMatch.title;
  document.getElementById('reveal-artist').innerText = bestMatch.artist;
  document.getElementById('reveal-vibe').innerText = `Frequency: ${bestMatch.vibe}`;
  document.getElementById('reveal-btn').href = bestMatch.link;
  triggerRecommendedPlayback(bestMatch.preview);
  document.querySelector('.reveal-card-subtitle').innerText = `ANALYSIS COMPLETE — PSYCHICALLY SYNCED WITH ${charMatch.name.toUpperCase()}:`;
  document.querySelector('.app-branding').style.opacity = '0';
  document.getElementById('reveal-screen').classList.remove('hidden');
  const revealVideo = document.getElementById('reveal-video');
  if (revealVideo) revealVideo.play().catch(e => console.error("Video error:", e));
}

function triggerRecommendedPlayback(previewUrl) {
    music1.pause();
    music2.pause();
    if (previewUrl) {
        currentPreviewAudio.pause();
        currentPreviewAudio.src = previewUrl;
        currentPreviewAudio.load();
        currentPreviewAudio.play().catch(e => {
            console.warn("Preview blocked, falling back to Spotify Embed:", e);
            updateSpotifyPlayer(document.getElementById('reveal-btn').href);
        });
    } else {
        updateSpotifyPlayer(document.getElementById('reveal-btn').href);
    }
}

function populateDiscoveryGrid() {
    const grid = document.getElementById('discovery-grid');
    grid.innerHTML = '';
    const currentTitle = document.getElementById('reveal-title').innerText;
    const shuffled = [...songDatabase].filter(s => s.title !== currentTitle).sort(() => 0.5 - Math.random());
    const selection = shuffled.slice(0, 30);
    selection.forEach(song => {
        const item = document.createElement('div');
        item.className = 'discovery-item';
        item.innerHTML = `
            <img src="${song.image}" alt="${song.title}" class="discovery-cover">
            <div class="discovery-info">
                <p class="discovery-song-title">${song.title}</p>
                <p class="discovery-song-artist">${song.artist}</p>
            </div>
            <a href="${song.link}" target="_blank" class="discovery-link" title="Open in Spotify">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zM18.84 14.4c-.3.42-.84.54-1.26.24-3.539-2.16-8.88-2.76-12.06-1.5-.48.18-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C8.28 10.02 14.16 10.68 18.12 13.08c.48.3.6.84.3 1.26zm.12-3.3c-4.26-2.52-11.28-2.76-15.36-1.5-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.68-1.44 12.48-1.14 17.4 1.74.54.3.72 1.02.42 1.56-.3.6-.96.72-1.5.3z"/></svg>
            </a>
        `;
        grid.appendChild(item);
    });
}

document.getElementById('browse-more-btn').addEventListener('click', () => {
    populateDiscoveryGrid();
    document.getElementById('discovery-overlay').classList.remove('hidden');
});

document.getElementById('close-discovery-btn').addEventListener('click', () => {
    document.getElementById('discovery-overlay').classList.add('hidden');
});

chatSend.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});
