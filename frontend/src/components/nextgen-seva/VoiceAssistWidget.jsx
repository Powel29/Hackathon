/**
 * VoiceAssistWidget - Phase 4 (UI-DES-007)
 *
 * Footer widget that surfaces voice state and controls:
 * - explicit consent
 * - start/stop listening
 * - repeat last guidance
 * - stop playback
 */

import { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVoiceStore } from '../../store/useVoiceStore';
import { isFeatureEnabled } from '../../config/featureFlags';

function getSupport() {
  if (typeof window === 'undefined') {
    return { hasRecognition: false, hasSynthesis: false };
  }
  return {
    hasRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    hasSynthesis: !!window.speechSynthesis,
  };
}

function buildSpeechLocale(language) {
  if (!language) return 'en-IN';
  if (language.includes('-')) return language;
  return `${language}-IN`;
}

export function VoiceAssistWidget() {
  const { t, i18n } = useTranslation();
  const voiceFlag = isFeatureEnabled('voice');
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  const {
    consentGiven,
    isListening,
    voiceStatus,
    currentGuidance,
    lastGuidance,
    commandFailed,
    fallbackMessage,
    grantConsent,
    revokeConsent,
    startListening,
    stopListening,
    setSpeaking,
    clearSpeaking,
  } = useVoiceStore();

  if (!voiceFlag) return null;

  const { hasRecognition, hasSynthesis } = getSupport();
  const supportsVoice = hasRecognition || hasSynthesis;

  const statusLabel = (() => {
    if (!consentGiven) return t('voice.status.tapToEnable');
    if (!supportsVoice) return t('voice.status.notSupported');
    if (voiceStatus === 'listening') return t('voice.status.listening');
    if (voiceStatus === 'processing') return t('voice.status.processing');
    if (voiceStatus === 'speaking') return t('voice.status.speaking');
    if (voiceStatus === 'fallback' || commandFailed) return t('voice.status.fallback');
    return t('voice.status.ready');
  })();

  const stopAll = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearSpeaking();
    stopListening();
  };

  const handlePrimaryClick = () => {
    if (!consentGiven) {
      setShowConsentDialog(true);
      return;
    }
    if (!hasRecognition) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleRepeat = () => {
    if (!hasSynthesis || !lastGuidance) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastGuidance);
      utterance.lang = buildSpeechLocale(i18n.language);
      setSpeaking(lastGuidance);
      utterance.onend = () => clearSpeaking();
      utterance.onerror = () => clearSpeaking();
      window.speechSynthesis.speak(utterance);
    } catch {
      clearSpeaking();
    }
  };

  const handleConsentAccept = () => {
    grantConsent();
    setShowConsentDialog(false);
  };

  const handleRevoke = () => {
    stopAll();
    revokeConsent();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrimaryClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 text-[#0066CC] hover:bg-blue-100 min-h-[48px]"
            style={{ touchAction: 'manipulation' }}
            aria-label={t('voice.widgetAriaLabel')}
          >
            {!supportsVoice ? (
              <AlertCircle className="w-4 h-4 text-gray-600" aria-hidden="true" />
            ) : isListening ? (
              <Mic className="w-4 h-4 text-green-600" aria-hidden="true" />
            ) : (
              <MicOff className="w-4 h-4 text-gray-600" aria-hidden="true" />
            )}
            <span className="text-xs">{statusLabel}</span>
          </button>

          {consentGiven && hasSynthesis && !!lastGuidance && (
            <button
              onClick={handleRepeat}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#0066CC] hover:bg-blue-100"
              style={{ touchAction: 'manipulation' }}
              aria-label={t('voice.repeat')}
              title={t('voice.repeat')}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {consentGiven && (currentGuidance || isListening) && (
            <button
              onClick={stopAll}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#0066CC] hover:bg-blue-100"
              style={{ touchAction: 'manipulation' }}
              aria-label={t('voice.stop')}
              title={t('voice.stop')}
            >
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {consentGiven && (
            <button
              onClick={handleRevoke}
              className="text-[10px] text-gray-400 underline-offset-2 hover:underline"
              style={{ touchAction: 'manipulation' }}
            >
              {t('voice.turnOff')}
            </button>
          )}
        </div>

        {(voiceStatus === 'fallback' || commandFailed) && (
          <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
            {fallbackMessage || t('voice.errors.unrecognized')}
            <span className="ml-1 text-amber-800 font-medium">
              {t('voice.tryCommands')}
            </span>
          </div>
        )}
      </div>

      {showConsentDialog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('voice.consent.title')}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-5 h-5 text-[#0066CC]" aria-hidden="true" />
              <h3 className="text-lg font-bold text-[#212529]">{t('voice.consent.title')}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">{t('voice.consent.body')}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConsentDialog(false)}
                className="flex-1 min-h-[48px] rounded-xl bg-gray-100 text-[#212529] font-semibold hover:bg-gray-200"
                style={{ touchAction: 'manipulation' }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConsentAccept}
                className="flex-1 min-h-[48px] rounded-xl bg-[#0066CC] text-white font-semibold hover:bg-[#0052A3]"
                style={{ touchAction: 'manipulation' }}
              >
                {t('voice.consent.enable')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
