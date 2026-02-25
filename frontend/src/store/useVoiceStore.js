/**
 * SUVIDHA Kiosk - Voice Store
 * Phase 4: Voice Navigation (FR-VOICE-001..003)
 *
 * In-memory only - no persistence (privacy requirement).
 * Voice state is reset at session end and never stored to disk.
 */

import { create } from 'zustand';

export const useVoiceStore = create((set, get) => ({
    /** Has the user given explicit consent this session? */
    consentGiven: false,

    /** Is the mic currently listening? */
    isListening: false,

    /** Current processing state */
    voiceStatus: 'idle', // 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'fallback'

    /** Last recognized command object */
    lastCommand: null,

    /** Current TTS message being spoken */
    currentGuidance: null,

    /** Last successfully spoken guidance (for repeat action) */
    lastGuidance: null,

    /** Was the last command unrecognized? */
    commandFailed: false,

    /** Optional fallback helper message */
    fallbackMessage: null,

    /** User grants consent to use voice */
    grantConsent() {
        set({ consentGiven: true, commandFailed: false, fallbackMessage: null });
    },

    /** Revoke consent - stops all recording immediately */
    revokeConsent() {
        set({
            consentGiven: false,
            isListening: false,
            voiceStatus: 'idle',
            lastCommand: null,
            currentGuidance: null,
            commandFailed: false,
            fallbackMessage: null,
        });
    },

    /** Start listening (only called after consent is given) */
    startListening() {
        if (!get().consentGiven) {
            console.warn('[Voice] Cannot start listening - consent not given');
            return;
        }
        set({
            isListening: true,
            voiceStatus: 'listening',
            commandFailed: false,
            fallbackMessage: null,
        });
    },

    /** Stop listening */
    stopListening() {
        set({ isListening: false });
        if (get().voiceStatus === 'listening') {
            set({ voiceStatus: 'idle' });
        }
    },

    /** Set processing state */
    setProcessing() {
        set({ voiceStatus: 'processing', fallbackMessage: null });
    },

    /** Set command result */
    setCommand(command) {
        set({
            lastCommand: command,
            commandFailed: false,
            voiceStatus: 'idle',
            fallbackMessage: null,
        });
    },

    /** Clear the last command after it's been consumed */
    clearCommand() {
        set({ lastCommand: null });
    },

    /** Mark command as unrecognized - trigger fallback UI */
    setCommandFailed(message = null) {
        set({
            commandFailed: true,
            voiceStatus: 'fallback',
            isListening: false,
            fallbackMessage: message,
        });
    },

    /** Set TTS guidance text being spoken */
    setSpeaking(text) {
        set({
            voiceStatus: 'speaking',
            currentGuidance: text,
            lastGuidance: text,
        });
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
            lastGuidance: null,
            commandFailed: false,
            fallbackMessage: null,
        });
    },
}));
