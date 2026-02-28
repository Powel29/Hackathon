/**
 * NextGen Seva Kiosk - Voice Command Parser
 * Phase 4: Voice Navigation (FR-VOICE-001..003)
 *
 * Multilingual intent parser that maps raw STT transcripts
 * to high-level kiosk intents. Supports:
 * - English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali
 * - Number recognition ("one", "two", "1", "2", etc.)
 * - Context-aware route hints
 *
 * All intents are side-effect free; UI layers decide how to act on them.
 */

// English base commands
const BASE_COMMANDS = [
  { intent: 'next', phrases: ['next', 'go next', 'continue', 'proceed'] },
  { intent: 'back', phrases: ['back', 'go back', 'previous', 'return'] },
  { intent: 'submit', phrases: ['submit', 'confirm', 'finish', 'save', 'ok', 'okay'] },
  { intent: 'repeat', phrases: ['repeat', 'say again', 'once more', 'pardon'] },
  { intent: 'home', phrases: ['home', 'main menu', 'start over', 'beginning'] },
  { intent: 'help', phrases: ['help', 'support', 'i need help', 'assistance', 'what do i do'] },
  { intent: 'change-language', phrases: ['change language', 'switch language', 'language'] },
  { intent: 'logout', phrases: ['logout', 'log out', 'end session', 'exit', 'quit'] },
  { intent: 'pay-bill', phrases: ['pay bill', 'bill payment', 'pay bills', 'electricity', 'water', 'gas', 'power'] },
  { intent: 'register-complaint', phrases: ['register complaint', 'file complaint', 'complaint', 'problem', 'issue'] },
  { intent: 'track-request', phrases: ['track request', 'check status', 'track order', 'status', 'check status'] },
  { intent: 'new-connection', phrases: ['new connection', 'apply', 'request connection'] },
];

// Multilingual command phrases
const MULTILINGUAL_COMMANDS = {
  'hi': [ // Hindi
    { intent: 'next', phrases: ['अगला', 'आगे', 'जारी रखें', 'आगे बढ़ें'] },
    { intent: 'back', phrases: ['पीछे', 'वापस', 'पिछला', 'पीछे जाओ'] },
    { intent: 'submit', phrases: ['जमा करें', 'पुष्टि करें', 'तैयार', 'करें', 'ठीक है', 'सहमत'] },
    { intent: 'help', phrases: ['मदद', 'समर्थन', 'मुझे मदद चाहिए', 'क्या करूँ'] },
    { intent: 'home', phrases: ['होम', 'मुख्य मेनू', 'शुरुआत', 'नई शुरुआत'] },
  ],
  'kn': [ // Kannada
    { intent: 'next', phrases: ['ಮುಂದೆ', 'ಮುಂದಿನ', 'ಮುಂದುವರೆಸಿ'] },
    { intent: 'back', phrases: ['ಹಿಂದೆ', 'ಹಿಂದಿರುತ್ತ', 'ಹಿಂದಿನ'] },
    { intent: 'submit', phrases: ['ಸಮರ್ಪಿಸಿ', 'ಖಚಿತ', 'ಸಾಕು', 'ಸರಿ'] },
    { intent: 'help', phrases: ['ಸಹಾಯ', 'ನಾನು ಸಹಾಯ ಬೇಕು', 'ಯಾವುದು ಮಾಡಬೇಕು'] },
  ],
  'ta': [ // Tamil
    { intent: 'next', phrases: ['அடுத்தது', 'அடுத்த', 'தொடர்ந்து', 'மேலே'] },
    { intent: 'back', phrases: ['பின்னே', 'முந்தைய', 'வெளியே'] },
    { intent: 'submit', phrases: ['சமர்ப்பிக்கவும்', 'உறுதிசெய்', 'செய்யவும்', 'சரி'] },
    { intent: 'help', phrases: ['உதவி', 'எனக்கு உதவி தேவை', 'வழிகாட்டுங்கள்'] },
  ],
  'te': [ // Telugu
    { intent: 'next', phrases: ['తర్వాత', 'ఎదుర్లో', 'కొనసాగించండి', 'ముందుకు'] },
    { intent: 'back', phrases: ['వెనుక', 'వెనుకకు', 'గతం'] },
    { intent: 'submit', phrases: ['సమర్పించండి', 'నిర్ధారించండి', 'సరిగ్గా', 'కుదరు'] },
    { intent: 'help', phrases: ['సహాయం', 'నాకు సహాయం కావాలి', 'సూచన'] },
  ],
  'mr': [ // Marathi
    { intent: 'next', phrases: ['पुढे', 'अगले', 'सुरु ठेवा', 'पुढे जा'] },
    { intent: 'back', phrases: ['मागे', 'भाग मागे', 'मागील'] },
    { intent: 'submit', phrases: ['जमा करा', 'पुष्टी करा', 'पूर्ण करा', 'ठीक'] },
    { intent: 'help', phrases: ['मदत', 'मुझे मदत हवी', 'मार्गदर्शन'] },
  ],
  'bn': [ // Bengali
    { intent: 'next', phrases: ['পরবর্তী', 'এগিয়ে', 'চালिয়े যান'] },
    { intent: 'back', phrases: ['ফিরে', 'পূর্ববর্তী', 'পিছনে'] },
    { intent: 'submit', phrases: ['জমা দিন', 'নিশ্চिত করুন', 'সম্পন্ন', 'ठीक'] },
    { intent: 'help', phrases: ['সাহায्য', 'আমার সাহায্य দরকार', 'নির্দেশনा'] },
  ],
};

/**
 * Route-aware command hints (context-sensitive).
 * Maps routes to available intents for smarter fallback parsing.
 */
const ROUTE_HINTS = {
  '/nextgen-seva': { hints: ['home', 'help', 'change-language'], ambiguous: false },
  '/nextgen-seva/language-selection': { hints: ['next', 'back', 'help', 'select-number'], ambiguous: true },
  '/nextgen-seva/login-register': { hints: ['next', 'back', 'help', 'select-number'], ambiguous: true },
  '/nextgen-seva/dashboard': { hints: ['pay-bill', 'register-complaint', 'track-request', 'help', 'logout', 'select-number'], ambiguous: true },
  '/nextgen-seva/bills': { hints: ['next', 'back', 'submit', 'help'], ambiguous: true },
  '/nextgen-seva/register-complaint': { hints: ['next', 'back', 'submit', 'help'] },
  '/nextgen-seva/track-request': { hints: ['next', 'back', 'submit', 'help', 'select-number'] },
  '/nextgen-seva/new-connection': { hints: ['next', 'back', 'submit', 'help'] },
};

/**
 * Extract number from transcript (handles digits and words)
 */
function extractNumber(text) {
  const match = text.match(/\b([0-9])\b/);
  if (match) return parseInt(match[1]);

  const words = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5, 'sixth': 6, 'seventh': 7
  };
  for (const [word, num] of Object.entries(words)) {
    if (text.includes(word)) return num;
  }
  return null;
}

/**
 * Parse a transcript into an intent object.
 *
 * @param {Object} params
 * @param {string} params.transcript - raw transcript text from STT
 * @param {string} [params.pathname] - current location pathname
 * @param {string} [params.language] - current language code (en, hi, kn, etc.)
 * @returns {{ intent: string, raw: string, value?: number } | null}
 */
export function parseVoiceCommand({ transcript, pathname, language = 'en' }) {
  if (!transcript) return null;
  const raw = transcript.trim();
  if (!raw) return null;

  const text = raw.toLowerCase();

  // Try language-specific commands first
  if (MULTILINGUAL_COMMANDS[language]) {
    for (const cmd of MULTILINGUAL_COMMANDS[language]) {
      if (cmd.phrases.some(p => text.includes(p.toLowerCase()))) {
        return { intent: cmd.intent, raw };
      }
    }
  }

  // Then try English base commands
  for (const cmd of BASE_COMMANDS) {
    if (cmd.phrases.some(p => text.includes(p))) {
      return { intent: cmd.intent, raw };
    }
  }

  // Check for number selection
  const num = extractNumber(text);
  if (num !== null) {
    const hints = ROUTE_HINTS[pathname]?.hints || [];
    if (hints.includes('select-number')) {
      return { intent: 'select-number', raw, value: num };
    }
  }

  // Route-aware fallback: if unique intent available, match aggressively
  const routeHints = ROUTE_HINTS[pathname];
  if (routeHints && !routeHints.ambiguous && routeHints.hints.length === 1) {
    return { intent: routeHints.hints[0], raw };
  }

  return null;
}

