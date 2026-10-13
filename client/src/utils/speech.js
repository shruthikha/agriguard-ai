/**
 * Web Speech API Utilities for AgriGuard AI
 * Text-to-Speech (TTS) and Speech-to-Text (STT) for Indian languages
 */

const LANG_CODE_MAP = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN'
};

/**
 * Reads aloud text in the target language using available synthesis voices.
 */
export function speakText(text, language = 'en', onEndCallback = () => {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text || text.trim() === '') return false;

  const utterance = new SpeechSynthesisUtterance(text);
  const targetLocale = LANG_CODE_MAP[language] || 'en-IN';
  utterance.lang = targetLocale;
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;

  // Search for matching regional voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang === targetLocale || v.lang.startsWith(language));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    onEndCallback();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    onEndCallback();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Initializes browser speech recognition if supported.
 */
export function createSpeechRecognizer(language = 'en', onResult, onError, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = LANG_CODE_MAP[language] || 'en-IN';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
