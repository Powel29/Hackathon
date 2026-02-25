/**
 * SUVIDHA Kiosk - Voice Store
 * Phase 0: Foundation & Architecture Alignment (FR-VOICE-001..003)
 *
 * In-memory only — no persistence (privacy requirement).
 * All voice state is cleared when tab closes or session resets.
 * Consent must be re-obtained every session.
 */

import { create } from 'zustand';

export const useVoiceStore = create((set, get) => ({
    /** Has the user given explicit consent this session? */
    consentGiven: false,

    /** Is the mic currently listening? */
    isListening: false,

    /** Current processing state */
    voiceStatus: 'idle', // 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'fallback'

    /** Last recognized command text */
    lastCommand: null,

    /** Current TTS message being spoken */
    currentGuidance: null,

    /** Was the last command unrecognized? */
    commandFailed: false,

    // ─── Actions ───────────────────────────────────────────────────────────────

    /** User grants consent to use voice */
    grantConsent() {
        set({ consentGiven: true });
    },

    /** Revoke consent — stops all recording immediately */
    revokeConsent() {
        set({
            consentGiven: false,
            isListening: false,
            voiceStatus: 'idle',
            lastCommand: null,
            commandFailed: false,
        });
    },

    /** Start listening (only called after consent is given) */
    startListening() {
        if (!get().consentGiven) {
            console.warn('[Voice] Cannot start listening — consent not given');
            return;
        }
        set({ isListening: true, voiceStatus: 'listening', commandFailed: false });
    },

    /** Stop listening */
    stopListening() {
        set({ isListening: false });
        if (get().voiceStatus === 'listening') {
            set({ voiceStatus: 'idle' });
        }
    },

    /** Set processing state (command recognized, calling handler) */
    setProcessing() {
        set({ voiceStatus: 'processing' });
    },

    /** Set command result */
    setCommand(command) {
        set({ lastCommand: command, commandFailed: false, voiceStatus: 'idle' });
    },

    /** Mark command as unrecognized — trigger fallback UI */
    setCommandFailed() {
        set({ commandFailed: true, voiceStatus: 'fallback', isListening: false });
    },

    /** Set TTS guidance text being spoken */
    setSpeaking(text) {
        set({ voiceStatus: 'speaking', currentGuidance: text });
    },

    /** Clear speaking state */
    clearSpeaking() {
        set({ voiceStatus: 'idle', currentGuidance: null });
    },

    /**
     * Full reset (on session end).
     * Voice state must not leak between citizens.
     */
    reset() {
        set({
            consentGiven: false,
            isListening: false,
            voiceStatus: 'idle',
            lastCommand: null,
            currentGuidance: null,
            commandFailed: false,
        });
    },
}));
