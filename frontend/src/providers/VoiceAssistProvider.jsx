/**
 * SUVIDHA Kiosk - Voice Assist Provider
 * Phase 4: Voice Navigation (FR-VOICE-001..003)
 *
 * Thin wrapper that mounts the VoiceEngine when the voice
 * feature flag is enabled. Keeps voice as an optional,
 * progressive enhancement without breaking non-voice flows.
 */

import { isFeatureEnabled } from '../config/featureFlags';
import { VoiceEngine } from '../core/voice/VoiceEngine';

export function VoiceAssistProvider({ children }) {
  const voiceEnabled = isFeatureEnabled('voice');

  return (
    <>
      {children}
      {voiceEnabled && <VoiceEngine />}
    </>
  );
}

