/**
 * NextGen Seva Kiosk - Voice Engine
 * Phase 4: Voice Navigation (FR-VOICE-001..003)
 *
 * Invisible component that wires Web Speech API (TTS + STT)
 * into global voice state. It emits intents and guidance only.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isFeatureEnabled } from '../../config/featureFlags';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { parseVoiceCommand } from './voiceCommands';

const MIN_CONFIDENCE = 0.7;
const RECOGNITION_TIMEOUT = 12000; // 12 seconds

function getRouteGuidance(pathname, t) {
  if (pathname === '/nextgen-seva' || pathname === '/nextgen-seva/language-selection') {
    return t('voice.guidance.languageSelection');
  }
  if (pathname === '/nextgen-seva/login-register') {
    return t('voice.guidance.loginRegister');
  }
  if (pathname === '/nextgen-seva/service-selection') {
    return t('voice.guidance.serviceSelection');
  }
  if (pathname === '/nextgen-seva/dashboard') {
    return t('voice.guidance.dashboard');
  }
  if (pathname.startsWith('/nextgen-seva/pay-bill') || pathname === '/nextgen-seva/bills') {
    return t('voice.guidance.bills');
  }
  if (pathname === '/nextgen-seva/register-complaint') {
    return t('voice.guidance.complaint');
  }
  if (pathname === '/nextgen-seva/track-complaint') {
    return t('voice.guidance.trackComplaint');
  }
  if (pathname === '/nextgen-seva/new-connection') {
    return t('voice.guidance.connection');
  }
  if (pathname === '/nextgen-seva/track-new-connection') {
    return t('voice.guidance.trackConnection');
  }
  return t('voice.guidance.generic');
}

function buildSpeechLocale(language) {
  if (!language) return 'en-IN';
  if (language.includes('-')) return language;
  return `${language}-IN`;
}

export function VoiceEngine() {
  const { pathname } = useLocation();
  const { i18n, t } = useTranslation();
  const voiceEnabled = isFeatureEnabled('voice');
  const { voiceGuidance } = useAccessibilityStore();

  const {
    consentGiven,
    isListening,
    voiceStatus,
    lastGuidance,
    setProcessing,
    setCommand,
    setCommandFailed,
    setSpeaking,
    clearSpeaking,
    stopListening,
  } = useVoiceStore();

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastLanguageRef = useRef(i18n.language);

  const speakSafe = useCallback((text) => {
    if (typeof window === 'undefined') return;
    if (!voiceEnabled || !voiceGuidance || !consentGiven) return;
    if (!window.speechSynthesis || !text) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = buildSpeechLocale(i18n.language);
      setSpeaking(text);
      utterance.onend = () => clearSpeaking();
      utterance.onerror = () => clearSpeaking();
      window.speechSynthesis.speak(utterance);
    } catch {
      clearSpeaking();
    }
  }, [clearSpeaking, consentGiven, i18n.language, setSpeaking, voiceEnabled, voiceGuidance]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = buildSpeechLocale(i18n.language);
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      // Clear timeout on successful result
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const last = event.results[event.results.length - 1];
      const best = last?.[0];
      const transcript = best?.transcript?.trim();

      if (!transcript) {
        const fallback = t('voice.errors.notHeard');
        setCommandFailed(fallback);
        speakSafe(fallback);
        stopListening();
        return;
      }

      if (typeof best.confidence === 'number' && best.confidence < MIN_CONFIDENCE) {
        const fallback = t('voice.errors.lowConfidence');
        setCommandFailed(fallback);
        speakSafe(fallback);
        stopListening();
        return;
      }

      setProcessing();
      // Pass current language to command parser
      const parsed = parseVoiceCommand({ transcript, pathname, language: i18n.language });

      if (!parsed) {
        const fallback = t('voice.errors.unrecognized');
        setCommandFailed(fallback);
        speakSafe(fallback);
        stopListening();
        return;
      }

      if (parsed.intent === 'repeat') {
        speakSafe(lastGuidance || t('voice.guidance.noPrevious'));
        stopListening();
        return;
      }

      if (parsed.intent === 'help') {
        speakSafe(getRouteGuidance(pathname, t));
      } else if (['home', 'back', 'submit', 'next', 'select-number'].includes(parsed.intent)) {
        speakSafe(t('voice.acknowledged'));
      }

      setCommand(parsed);
      stopListening();
    };

    recognition.onerror = (event) => {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      let fallback = t('voice.errors.recognitionError');

      // Provide specific error messages
      if (event.error === 'network') {
        fallback = t('voice.errors.networkError') || 'Network error. Please check your connection.';
      } else if (event.error === 'no-speech') {
        fallback = t('voice.errors.noSpeech') || 'No speech detected. Please try again.';
      } else if (event.error === 'permission-denied') {
        fallback = t('voice.errors.permissionDenied') || 'Microphone permission denied.';
      }

      setCommandFailed(fallback);
      stopListening();
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    };
  }, [
    i18n.language,
    lastGuidance,
    pathname,
    setCommand,
    setCommandFailed,
    setProcessing,
    speakSafe,
    stopListening,
    t,
  ]);

  useEffect(() => {
    if (!voiceEnabled || !voiceGuidance || !consentGiven) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;

    // Update language if changed
    if (lastLanguageRef.current !== i18n.language) {
      recognition.lang = buildSpeechLocale(i18n.language);
      lastLanguageRef.current = i18n.language;
    }

    if (isListening && voiceStatus !== 'processing') {
      try {
        recognition.start();

        // Set timeout for recognition (12 seconds)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          try {
            recognition.stop();
          } catch {
            // ignore
          }
          const fallback = t('voice.errors.timeout') || 'No speech detected. Please try again or use touch.';
          setCommandFailed(fallback);
          speakSafe(fallback);
        }, RECOGNITION_TIMEOUT);
      } catch {
        // start can throw if called too quickly
      }
    } else {
      try {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        recognition.stop();
      } catch {
        // ignore
      }
    }
  }, [consentGiven, isListening, voiceEnabled, voiceGuidance, voiceStatus, i18n.language, t, setCommandFailed, speakSafe]);

  useEffect(() => {
    if (!voiceEnabled || !voiceGuidance || !consentGiven) return;
    speakSafe(getRouteGuidance(pathname, t));
  }, [consentGiven, pathname, speakSafe, t, voiceEnabled, voiceGuidance]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopListening();
    };
  }, [stopListening]);

  return null;
}
