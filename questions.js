/* ============================================================================
   UpsideSound - Adaptive Question Bank (84 questions)
   Each: { id, text, type, probes[], depth, options?:[{label, leaning{}}] }
   Consumed by engine.js for info-gain-driven adaptive selection.
   ========================================================================== */
const QUESTION_BANK = [
  {
    "id": "crowd-or-quiet",
    "text": "After a long, strange week, what actually refills you: a room full of voices, or a room with none?",
    "type": "preference",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "light",
    "options": [
      {
        "label": "A room full of voices",
        "leaning": {
          "sociability": 3,
          "introspection": -2
        }
      },
      {
        "label": "A room with none",
        "leaning": {
          "introspection": 3,
          "sociability": -2
        }
      },
      {
        "label": "One trusted person and a low light",
        "leaning": {
          "introspection": 1,
          "sociability": 1
        }
      }
    ]
  },
  {
    "id": "lost-wallet",
    "text": "You find a stranger's wallet on a wet sidewalk, cash still inside. Walk me through exactly what you do next, and why.",
    "type": "scenario",
    "probes": [
      "pragmatism",
      "idealism",
      "sociability"
    ],
    "depth": "medium"
  },
  {
    "id": "past-or-future",
    "text": "You can spend one year living in any decade of the past, or one year living thirty years from now. Which do you choose, and what are you hoping to find there?",
    "type": "preference",
    "probes": [
      "idealism",
      "introspection"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "A year in the past",
        "leaning": {
          "introspection": 2,
          "pragmatism": 1
        }
      },
      {
        "label": "A year in the future",
        "leaning": {
          "idealism": 2,
          "intensity": 1
        }
      },
      {
        "label": "Neither, this exact moment is enough",
        "leaning": {
          "pragmatism": 2,
          "introspection": 1
        }
      }
    ]
  },
  {
    "id": "library-aisle",
    "text": "You walk into a vast, half-lit library with one hour before it closes. Which aisle do you go to first?",
    "type": "thisorthat",
    "probes": [
      "idealism",
      "pragmatism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "The myth, the strange, the speculative",
        "leaning": {
          "idealism": 3,
          "introspection": 1
        }
      },
      {
        "label": "History, science, how things actually work",
        "leaning": {
          "pragmatism": 3,
          "introspection": 1
        }
      }
    ]
  },
  {
    "id": "door-in-wall",
    "text": "A door appears in your bedroom wall that was never there before. It is slightly ajar. Be honest: do you open it tonight, in the morning, or not at all?",
    "type": "projective",
    "probes": [
      "intensity",
      "idealism",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "plan-or-leap",
    "text": "A rare chance lands in your lap with almost no warning. Do you take the leap now or build the plan first?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "pragmatism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Leap now, figure it out mid-air",
        "leaning": {
          "intensity": 3,
          "idealism": 1
        }
      },
      {
        "label": "Build the plan, then move",
        "leaning": {
          "pragmatism": 3,
          "introspection": 1
        }
      }
    ]
  },
  {
    "id": "storm-window",
    "text": "A violent thunderstorm rolls in at 2am. Are you the one at the window watching it, the one already asleep, or the one outside in it?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "introspection"
    ],
    "depth": "light",
    "options": [
      {
        "label": "At the window, watching it unfold",
        "leaning": {
          "introspection": 2,
          "intensity": 1
        }
      },
      {
        "label": "Already asleep, it can wait",
        "leaning": {
          "pragmatism": 2,
          "intensity": -1
        }
      },
      {
        "label": "Outside, in the rain, alive in it",
        "leaning": {
          "intensity": 3,
          "idealism": 1
        }
      }
    ]
  },
  {
    "id": "secret-talent",
    "text": "If you had a remarkable talent that no one ever found out about, would it still feel worth having? Sit with that one.",
    "type": "reflection",
    "probes": [
      "sociability",
      "introspection",
      "idealism"
    ],
    "depth": "deep"
  },
  {
    "id": "map-or-wander",
    "text": "Dropped in an unfamiliar city for a day with no obligations. Map and plan, or wander and get lost on purpose?",
    "type": "thisorthat",
    "probes": [
      "pragmatism",
      "idealism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Map it, optimize the day",
        "leaning": {
          "pragmatism": 3
        }
      },
      {
        "label": "Wander, let it surprise me",
        "leaning": {
          "idealism": 2,
          "intensity": 1
        }
      }
    ]
  },
  {
    "id": "frequency-message",
    "text": "Imagine you could broadcast one short message on a frequency that every living person would hear once, then forget who sent it. What would you say?",
    "type": "projective",
    "probes": [
      "idealism",
      "sociability",
      "introspection"
    ],
    "depth": "deep"
  },
  {
    "id": "rescue-or-warn",
    "text": "You alone know something dangerous is coming. Do you quietly prepare those closest to you, sound a public alarm, or handle it yourself in silence?",
    "type": "scenario",
    "probes": [
      "sociability",
      "intensity",
      "pragmatism"
    ],
    "depth": "deep"
  },
  {
    "id": "comfort-vs-truth",
    "text": "A friend asks for your opinion and clearly wants comfort, not honesty. Which do you give them, and does it depend on who is asking?",
    "type": "scenario",
    "probes": [
      "sociability",
      "pragmatism",
      "idealism"
    ],
    "depth": "medium"
  },
  {
    "id": "order-or-spark",
    "text": "A workspace you control completely: would you rather it be perfectly ordered and calm, or a little chaotic and full of half-finished sparks?",
    "type": "preference",
    "probes": [
      "pragmatism",
      "intensity"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Ordered and calm",
        "leaning": {
          "pragmatism": 3,
          "introspection": 1
        }
      },
      {
        "label": "Chaotic and full of sparks",
        "leaning": {
          "intensity": 2,
          "idealism": 2
        }
      },
      {
        "label": "Ordered surface, chaos in the drawers",
        "leaning": {
          "pragmatism": 1,
          "intensity": 1
        }
      }
    ]
  },
  {
    "id": "alone-on-purpose",
    "text": "When was the last time you chose to be alone, not because you had to be, but because you wanted to? What were you doing?",
    "type": "reflection",
    "probes": [
      "introspection",
      "sociability"
    ],
    "depth": "medium"
  },
  {
    "id": "hero-or-witness",
    "text": "In the story of your own life, are you more often the one who acts, or the one who watches and understands?",
    "type": "paradox",
    "probes": [
      "intensity",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "two-paths-fear",
    "text": "Two paths forward: one you want but fear, one safe but a little gray. Which pull is stronger in you, honestly, on a normal day?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "pragmatism",
      "idealism"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "The one I want but fear",
        "leaning": {
          "intensity": 3,
          "idealism": 1
        }
      },
      {
        "label": "The safe, gray, dependable one",
        "leaning": {
          "pragmatism": 3,
          "intensity": -1
        }
      }
    ]
  },
  {
    "id": "upside-down-mirror",
    "text": "There is a version of your town that looks identical but is cold, dark, and wrong. If you could visit it once and return safely, would you go? What pulls you toward or away?",
    "type": "projective",
    "probes": [
      "intensity",
      "introspection",
      "idealism"
    ],
    "depth": "deep"
  },
  {
    "id": "give-or-receive",
    "text": "Which is genuinely easier for you: giving help, or accepting it?",
    "type": "thisorthat",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Giving help",
        "leaning": {
          "sociability": 2,
          "idealism": 1
        }
      },
      {
        "label": "Accepting it",
        "leaning": {
          "introspection": 2,
          "sociability": 1
        }
      }
    ]
  },
  {
    "id": "unread-letter",
    "text": "A letter arrives addressed to you in handwriting you do not recognize. Do you open it immediately, save it for the right moment, or feel a flicker of dread? What does that say about you?",
    "type": "projective",
    "probes": [
      "intensity",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "change-the-world",
    "text": "Do you believe one ordinary person can meaningfully change the world, or is that a comforting story we tell ourselves? Where do you actually land?",
    "type": "reflection",
    "probes": [
      "idealism",
      "pragmatism"
    ],
    "depth": "deep"
  },
  {
    "id": "song-on-repeat",
    "text": "You play one song on repeat for an entire night. Is it more likely to be something that lifts you up, something that lets you sink down into a feeling, or something loud enough to drown out thought?",
    "type": "preference",
    "probes": [
      "intensity",
      "introspection",
      "idealism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Something that lifts me up",
        "leaning": {
          "idealism": 2,
          "sociability": 1
        }
      },
      {
        "label": "Something I can sink into",
        "leaning": {
          "introspection": 3
        }
      },
      {
        "label": "Something loud enough to drown out thought",
        "leaning": {
          "intensity": 3
        }
      }
    ]
  },
  {
    "id": "party-arrival",
    "text": "You arrive at a gathering where you know almost no one. What is your real first move?",
    "type": "scenario",
    "probes": [
      "sociability",
      "introspection",
      "intensity"
    ],
    "depth": "light"
  },
  {
    "id": "break-the-rule",
    "text": "A rule is clearly unfair but breaking it has real consequences for you. How much does the unfairness itself push you to act?",
    "type": "scenario",
    "probes": [
      "intensity",
      "idealism",
      "pragmatism"
    ],
    "depth": "deep"
  },
  {
    "id": "feeling-vs-fact",
    "text": "When you make a hard decision, what do you trust more in the final moment: the data in front of you, or the feeling in your gut?",
    "type": "thisorthat",
    "probes": [
      "pragmatism",
      "introspection",
      "idealism"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "The data",
        "leaning": {
          "pragmatism": 3
        }
      },
      {
        "label": "The gut feeling",
        "leaning": {
          "idealism": 2,
          "introspection": 1
        }
      }
    ]
  },
  {
    "id": "empty-stage",
    "text": "You are handed a microphone on an empty stage with a full crowd waiting and no script. Is that a nightmare, a thrill, or oddly calm? Why?",
    "type": "projective",
    "probes": [
      "sociability",
      "intensity",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "finish-or-start",
    "text": "Are you more energized by starting something brand new, or by finally finishing something long overdue?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "pragmatism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Starting something new",
        "leaning": {
          "intensity": 2,
          "idealism": 2
        }
      },
      {
        "label": "Finishing something old",
        "leaning": {
          "pragmatism": 3,
          "introspection": 1
        }
      }
    ]
  },
  {
    "id": "keep-a-secret",
    "text": "Someone trusts you with a secret that, if shared, could help others but would betray them. How do you weigh the one against the many?",
    "type": "scenario",
    "probes": [
      "sociability",
      "idealism",
      "pragmatism"
    ],
    "depth": "deep"
  },
  {
    "id": "silence-or-noise",
    "text": "In your ideal evening, is there background noise, music, voices, or a clean, full silence?",
    "type": "preference",
    "probes": [
      "introspection",
      "sociability"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Music or voices in the background",
        "leaning": {
          "sociability": 2,
          "intensity": 1
        }
      },
      {
        "label": "Clean, full silence",
        "leaning": {
          "introspection": 3,
          "sociability": -1
        }
      },
      {
        "label": "Depends entirely on my mood",
        "leaning": {
          "introspection": 1,
          "idealism": 1
        }
      }
    ]
  },
  {
    "id": "what-haunts",
    "text": "What is one thing you keep returning to in your head when no one is watching, even though you have no clear answer for it?",
    "type": "reflection",
    "probes": [
      "introspection",
      "intensity"
    ],
    "depth": "deep"
  },
  {
    "id": "trust-strangers",
    "text": "A stranger asks you for a real favor that costs you a little. Default yes, default no, or default it depends?",
    "type": "thisorthat",
    "probes": [
      "sociability",
      "pragmatism",
      "idealism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Default yes",
        "leaning": {
          "sociability": 2,
          "idealism": 1
        }
      },
      {
        "label": "Default no",
        "leaning": {
          "pragmatism": 2,
          "sociability": -1
        }
      },
      {
        "label": "It depends on the read I get",
        "leaning": {
          "pragmatism": 1,
          "introspection": 1
        }
      }
    ]
  },
  {
    "id": "perfect-or-done",
    "text": "Would you rather release something good now, or hold it back until it is genuinely perfect, knowing perfect may never come?",
    "type": "paradox",
    "probes": [
      "pragmatism",
      "idealism",
      "intensity"
    ],
    "depth": "medium"
  },
  {
    "id": "flashlight-woods",
    "text": "You are walking a dark trail and your flashlight starts to die. Do you push forward toward the end faster, turn back the way you know, or stop and let your eyes adjust?",
    "type": "scenario",
    "probes": [
      "intensity",
      "pragmatism",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "praise-or-progress",
    "text": "What lands harder for you: genuine praise for what you have done, or quiet proof that you are getting better?",
    "type": "thisorthat",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "Genuine praise from others",
        "leaning": {
          "sociability": 3
        }
      },
      {
        "label": "Quiet proof of my own progress",
        "leaning": {
          "introspection": 3,
          "pragmatism": 1
        }
      }
    ]
  },
  {
    "id": "one-warning",
    "text": "If you could send one sentence back to yourself five years ago, would it be a warning, an encouragement, or a question? What would it be?",
    "type": "reflection",
    "probes": [
      "introspection",
      "idealism",
      "intensity"
    ],
    "depth": "deep"
  },
  {
    "id": "crowd-runs",
    "text": "Something startling happens in a public place and the crowd starts to move. Are you more likely to move with them, freeze and assess, or move toward the source?",
    "type": "scenario",
    "probes": [
      "intensity",
      "pragmatism",
      "sociability"
    ],
    "depth": "medium"
  },
  {
    "id": "dream-or-do",
    "text": "Be honest about yourself: do you spend more of your energy imagining what could be, or doing what is in front of you?",
    "type": "paradox",
    "probes": [
      "idealism",
      "pragmatism"
    ],
    "depth": "medium"
  },
  {
    "id": "abandoned-arcade",
    "text": "You find an abandoned arcade, power still humming, machines glowing in the dark. What is the very first thing you feel?",
    "type": "projective",
    "probes": [
      "idealism",
      "intensity",
      "introspection"
    ],
    "depth": "light"
  },
  {
    "id": "loyalty-vs-right",
    "text": "Your closest friend does something you believe is genuinely wrong. Do you stand by them, confront them, or quietly step back? Where is your line?",
    "type": "scenario",
    "probes": [
      "idealism",
      "sociability",
      "intensity"
    ],
    "depth": "deep"
  },
  {
    "id": "win-alone",
    "text": "Would a great achievement still feel like a win if you had to celebrate it completely alone?",
    "type": "reflection",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "deep"
  },
  {
    "id": "slow-or-sudden",
    "text": "In how you live, are you built more for the slow, steady burn, or the sudden, bright flare?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "pragmatism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "The slow, steady burn",
        "leaning": {
          "pragmatism": 2,
          "introspection": 2
        }
      },
      {
        "label": "The sudden, bright flare",
        "leaning": {
          "intensity": 3,
          "idealism": 1
        }
      }
    ]
  },
  {
    "id": "ask-or-figure",
    "text": "Stuck on something you cannot solve. Do you ask for help quickly, or wrestle with it alone until you crack it?",
    "type": "thisorthat",
    "probes": [
      "sociability",
      "introspection",
      "pragmatism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Ask for help quickly",
        "leaning": {
          "sociability": 2,
          "pragmatism": 1
        }
      },
      {
        "label": "Wrestle it alone until I crack it",
        "leaning": {
          "introspection": 2,
          "intensity": 1
        }
      }
    ]
  },
  {
    "id": "radio-static",
    "text": "Late at night you catch a faint voice buried in radio static, almost a word. Do you lean in and try to decode it, or turn the dial away? What is the pull?",
    "type": "projective",
    "probes": [
      "introspection",
      "intensity",
      "idealism"
    ],
    "depth": "medium"
  },
  {
    "id": "fix-or-feel",
    "text": "When someone you love is hurting, is your first instinct to fix the problem, or to sit in the feeling with them?",
    "type": "thisorthat",
    "probes": [
      "pragmatism",
      "sociability",
      "idealism"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "Fix the problem",
        "leaning": {
          "pragmatism": 3,
          "sociability": 1
        }
      },
      {
        "label": "Sit in the feeling with them",
        "leaning": {
          "idealism": 2,
          "sociability": 2
        }
      }
    ]
  },
  {
    "id": "known-or-new",
    "text": "Same beloved meal you have had a hundred times, or a dish you have never heard of that might be a miss?",
    "type": "thisorthat",
    "probes": [
      "pragmatism",
      "intensity",
      "idealism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "The beloved, known meal",
        "leaning": {
          "pragmatism": 2,
          "introspection": 1
        }
      },
      {
        "label": "The unknown gamble",
        "leaning": {
          "intensity": 2,
          "idealism": 1
        }
      }
    ]
  },
  {
    "id": "meaning-or-comfort",
    "text": "Would you rather a life that is meaningful but difficult, or comfortable but ordinary? And do you actually live like your answer?",
    "type": "paradox",
    "probes": [
      "idealism",
      "pragmatism",
      "intensity"
    ],
    "depth": "deep"
  },
  {
    "id": "watched-room",
    "text": "You suddenly feel certain you are being watched in an empty room. Do you investigate, rationalize it away, or leave? What is your honest first move?",
    "type": "projective",
    "probes": [
      "intensity",
      "pragmatism",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "who-notices",
    "text": "When you walk into a room, do you find yourself reading the people, the exits and layout, or your own inner weather?",
    "type": "thisorthat",
    "probes": [
      "sociability",
      "pragmatism",
      "introspection"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "The people",
        "leaning": {
          "sociability": 3
        }
      },
      {
        "label": "The exits and the layout",
        "leaning": {
          "pragmatism": 2,
          "intensity": 1
        }
      },
      {
        "label": "My own inner weather",
        "leaning": {
          "introspection": 3
        }
      }
    ]
  },
  {
    "id": "forgotten-mixtape",
    "text": "You find a cassette mixtape with your name on it in handwriting you do not know, no track list. Do you play it right now, or are you almost afraid to?",
    "type": "projective",
    "probes": [
      "intensity",
      "introspection",
      "idealism"
    ],
    "depth": "medium"
  },
  {
    "id": "control-or-flow",
    "text": "Do you feel safest when you are in control of what happens next, or when you can let go and trust the current?",
    "type": "thisorthat",
    "probes": [
      "pragmatism",
      "idealism",
      "introspection"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "In control of what happens next",
        "leaning": {
          "pragmatism": 3,
          "intensity": 1
        }
      },
      {
        "label": "Letting go and trusting the current",
        "leaning": {
          "idealism": 2,
          "introspection": 2
        }
      }
    ]
  },
  {
    "id": "crowd-or-cause",
    "text": "You can either be deeply connected to a small group of people, or loosely connected to a large movement you believe in. Which calls you more?",
    "type": "preference",
    "probes": [
      "sociability",
      "idealism"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "Deeply connected to a few people",
        "leaning": {
          "sociability": 2,
          "introspection": 1
        }
      },
      {
        "label": "Loosely connected to a large cause",
        "leaning": {
          "idealism": 3,
          "sociability": 1
        }
      },
      {
        "label": "Honestly, neither, I would rather go my own way",
        "leaning": {
          "introspection": 2,
          "sociability": -2
        }
      }
    ]
  },
  {
    "id": "last-summer",
    "text": "Picture the last truly good day you had. Were other people the reason it was good, or were they incidental to it?",
    "type": "reflection",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "burn-or-build",
    "text": "Given a broken system you are part of, is your instinct to tear it down and start fresh, or to patiently repair it from inside?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "pragmatism",
      "idealism"
    ],
    "depth": "deep",
    "options": [
      {
        "label": "Tear it down, start fresh",
        "leaning": {
          "intensity": 3,
          "idealism": 1
        }
      },
      {
        "label": "Repair it patiently from inside",
        "leaning": {
          "pragmatism": 3,
          "introspection": 1
        }
      }
    ]
  },
  {
    "id": "first-domino",
    "text": "Do you tend to see the whole chain of consequences before you act, or do you trust yourself to handle them as they fall?",
    "type": "paradox",
    "probes": [
      "pragmatism",
      "intensity"
    ],
    "depth": "medium"
  },
  {
    "id": "empty-house",
    "text": "You have a large house entirely to yourself for one week, no obligations and no guests allowed. Does that read as a dream or a slow ache? Tell me honestly.",
    "type": "projective",
    "probes": [
      "introspection",
      "sociability"
    ],
    "depth": "medium"
  },
  {
    "id": "prove-or-please",
    "text": "Be ruthlessly honest: are you more driven by wanting to prove something to yourself, or by not wanting to let other people down?",
    "type": "reflection",
    "probes": [
      "introspection",
      "sociability",
      "intensity"
    ],
    "depth": "deep"
  },
  {
    "id": "first-or-best",
    "text": "Would you rather be the first to do something, or the best at something already done?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "pragmatism",
      "idealism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "The first to do it",
        "leaning": {
          "intensity": 2,
          "idealism": 2
        }
      },
      {
        "label": "The best at it",
        "leaning": {
          "pragmatism": 2,
          "intensity": 1
        }
      }
    ]
  },
  {
    "id": "mystery-solved",
    "text": "Would you rather a mystery you love stay a mystery forever, or finally get the full, possibly disappointing, answer?",
    "type": "paradox",
    "probes": [
      "idealism",
      "pragmatism",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "crowd-energy-drain",
    "text": "After hours of being around people, even good people, do you feel charged up or quietly drained?",
    "type": "thisorthat",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Charged up, I want more",
        "leaning": {
          "sociability": 3
        }
      },
      {
        "label": "Quietly drained, I need to recover",
        "leaning": {
          "introspection": 3,
          "sociability": -1
        }
      }
    ]
  },
  {
    "id": "red-or-blue",
    "text": "Two glowing doorways: one warm red and humming, one cold blue and silent. Without overthinking, which one do you step through?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "introspection",
      "idealism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "The warm red, humming one",
        "leaning": {
          "intensity": 2,
          "sociability": 1
        }
      },
      {
        "label": "The cold blue, silent one",
        "leaning": {
          "introspection": 2,
          "idealism": 1
        }
      }
    ]
  },
  {
    "id": "who-tells-story",
    "text": "When something incredible happens to you, what is your honest first impulse: to share it with someone, or to hold it close and turn it over privately first?",
    "type": "scenario",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "hope-vs-realism",
    "text": "At the bottom of things, do you expect the world to bend toward better, or do you brace for it to stay hard? Which has served you?",
    "type": "reflection",
    "probes": [
      "idealism",
      "pragmatism",
      "introspection"
    ],
    "depth": "deep"
  },
  {
    "id": "dare-or-decline",
    "text": "A group dares you to do something a little reckless but harmless. Do you do it for the rush, do it for the group, or sit it out?",
    "type": "scenario",
    "probes": [
      "intensity",
      "sociability",
      "pragmatism"
    ],
    "depth": "light"
  },
  {
    "id": "unfinished-feeling",
    "text": "What is something you started and never finished that still tugs at you? What stopped you, really?",
    "type": "reflection",
    "probes": [
      "introspection",
      "intensity",
      "pragmatism"
    ],
    "depth": "deep"
  },
  {
    "id": "signal-or-noise",
    "text": "In a flood of information, are you better at finding the one true signal, or at sensing the mood underneath all the noise?",
    "type": "thisorthat",
    "probes": [
      "pragmatism",
      "introspection",
      "idealism"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "Finding the one true signal",
        "leaning": {
          "pragmatism": 3,
          "introspection": 1
        }
      },
      {
        "label": "Sensing the mood underneath",
        "leaning": {
          "idealism": 2,
          "introspection": 1
        }
      }
    ]
  },
  {
    "id": "protect-or-free",
    "text": "If you love someone, are you more likely to protect them from risk, or to push them toward the risk that could grow them?",
    "type": "thisorthat",
    "probes": [
      "idealism",
      "pragmatism",
      "sociability"
    ],
    "depth": "deep",
    "options": [
      {
        "label": "Protect them from the risk",
        "leaning": {
          "pragmatism": 2,
          "sociability": 1
        }
      },
      {
        "label": "Push them toward growth",
        "leaning": {
          "idealism": 2,
          "intensity": 1
        }
      }
    ]
  },
  {
    "id": "midnight-call",
    "text": "It is past midnight and your phone rings from a number you do not know. Do you answer, let it ring, or sit there wondering for an hour?",
    "type": "projective",
    "probes": [
      "intensity",
      "introspection",
      "pragmatism"
    ],
    "depth": "light"
  },
  {
    "id": "legacy-or-now",
    "text": "Would you rather be remembered by many for a long time, or fully present and deeply known by a few here and now?",
    "type": "preference",
    "probes": [
      "sociability",
      "idealism",
      "introspection"
    ],
    "depth": "deep",
    "options": [
      {
        "label": "Remembered by many, for a long time",
        "leaning": {
          "sociability": 2,
          "idealism": 2
        }
      },
      {
        "label": "Deeply known by a few, here and now",
        "leaning": {
          "introspection": 2,
          "sociability": 1
        }
      },
      {
        "label": "Neither matters to me much",
        "leaning": {
          "introspection": 2,
          "sociability": -1
        }
      }
    ]
  },
  {
    "id": "rules-of-game",
    "text": "When you join something new, do you learn the rules first, watch others play, or start moving and learn by colliding with things?",
    "type": "scenario",
    "probes": [
      "pragmatism",
      "introspection",
      "intensity"
    ],
    "depth": "light"
  },
  {
    "id": "two-truths-pull",
    "text": "You can keep a comforting belief that is probably false, or trade it for a hard truth you cannot unsee. Which do you reach for?",
    "type": "paradox",
    "probes": [
      "pragmatism",
      "idealism",
      "introspection"
    ],
    "depth": "deep"
  },
  {
    "id": "light-the-room",
    "text": "In a group that has gone quiet and tense, are you the one who breaks the silence, the one who waits it out, or the one watching to see who breaks first?",
    "type": "scenario",
    "probes": [
      "sociability",
      "intensity",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "old-photo",
    "text": "You find an old photograph of yourself from years ago. What is the first emotion that rises, and what does that tell you about how you carry your past?",
    "type": "reflection",
    "probes": [
      "introspection",
      "idealism"
    ],
    "depth": "deep"
  },
  {
    "id": "adventure-or-home",
    "text": "Friday night offer: an unplanned adventure with an uncertain ending, or a known comfort with the people you trust. Which wins more often for you?",
    "type": "thisorthat",
    "probes": [
      "intensity",
      "sociability",
      "pragmatism"
    ],
    "depth": "light",
    "options": [
      {
        "label": "The unplanned adventure",
        "leaning": {
          "intensity": 3,
          "idealism": 1
        }
      },
      {
        "label": "The known comfort with my people",
        "leaning": {
          "sociability": 2,
          "pragmatism": 1
        }
      }
    ]
  },
  {
    "id": "speak-or-write",
    "text": "When something matters deeply to you, do you find it easier to say it out loud to someone, or to write it down alone first?",
    "type": "thisorthat",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Say it out loud to someone",
        "leaning": {
          "sociability": 2,
          "intensity": 1
        }
      },
      {
        "label": "Write it down alone first",
        "leaning": {
          "introspection": 3
        }
      }
    ]
  },
  {
    "id": "unknown-frequency",
    "text": "You build a small radio and one night it locks onto a station that should not exist, playing music you have never heard. Do you keep listening, record it, or unplug it and pretend it never happened?",
    "type": "projective",
    "probes": [
      "idealism",
      "intensity",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "chaos-tolerance",
    "text": "How much disorder can you actually live inside before it starts to cost you peace?",
    "type": "reflection",
    "probes": [
      "pragmatism",
      "intensity",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "save-one-thing",
    "text": "Your home, a fire, you have ten seconds and everyone is already safe. What single object do you grab, and what does it really represent?",
    "type": "projective",
    "probes": [
      "introspection",
      "idealism",
      "sociability"
    ],
    "depth": "deep"
  },
  {
    "id": "lead-or-support",
    "text": "On a team chasing something hard, are you happier holding the wheel, or being the one the driver completely depends on?",
    "type": "thisorthat",
    "probes": [
      "sociability",
      "intensity",
      "pragmatism"
    ],
    "depth": "medium",
    "options": [
      {
        "label": "Holding the wheel",
        "leaning": {
          "intensity": 2,
          "sociability": 1
        }
      },
      {
        "label": "Being the one they depend on",
        "leaning": {
          "pragmatism": 2,
          "sociability": 1
        }
      }
    ]
  },
  {
    "id": "forgive-or-cut",
    "text": "Someone you cared about hurt you badly. Are you more likely to keep the door cracked open, or to close it cleanly and move on?",
    "type": "thisorthat",
    "probes": [
      "idealism",
      "pragmatism",
      "intensity"
    ],
    "depth": "deep",
    "options": [
      {
        "label": "Keep the door cracked open",
        "leaning": {
          "idealism": 2,
          "sociability": 1
        }
      },
      {
        "label": "Close it cleanly and move on",
        "leaning": {
          "pragmatism": 2,
          "intensity": 1
        }
      }
    ]
  },
  {
    "id": "why-or-how",
    "text": "When something fascinates you, are you more pulled toward why it exists, or how it actually works?",
    "type": "thisorthat",
    "probes": [
      "idealism",
      "pragmatism",
      "introspection"
    ],
    "depth": "light",
    "options": [
      {
        "label": "Why it exists",
        "leaning": {
          "idealism": 2,
          "introspection": 1
        }
      },
      {
        "label": "How it works",
        "leaning": {
          "pragmatism": 3
        }
      }
    ]
  },
  {
    "id": "crowd-vanishes",
    "text": "You wake up and every other person has vanished from the earth, but everything else still works. Day one: relief, terror, or a strange calm? Be honest about your first hour.",
    "type": "projective",
    "probes": [
      "sociability",
      "introspection",
      "intensity"
    ],
    "depth": "deep"
  },
  {
    "id": "effort-or-ease",
    "text": "Do you trust things more when they came hard and cost you something, or are you fine letting good things arrive easily?",
    "type": "paradox",
    "probes": [
      "pragmatism",
      "intensity",
      "introspection"
    ],
    "depth": "medium"
  },
  {
    "id": "stranger-on-train",
    "text": "A talkative stranger sits beside you on a long late-night ride. Do you welcome the conversation, give polite short answers, or pretend to sleep?",
    "type": "scenario",
    "probes": [
      "sociability",
      "introspection"
    ],
    "depth": "light"
  },
  {
    "id": "intuition-trust",
    "text": "Tell me about a time your gut told you something before you had any proof, and what you did with it.",
    "type": "reflection",
    "probes": [
      "introspection",
      "idealism",
      "intensity"
    ],
    "depth": "deep"
  },
  {
    "id": "finite-or-infinite",
    "text": "If you somehow knew exactly how many days you had left, would that make you live harder or live calmer? Which version of you do you think shows up?",
    "type": "paradox",
    "probes": [
      "intensity",
      "introspection",
      "idealism"
    ],
    "depth": "deep"
  }
];
