/**
 * SUVIDHA Kiosk - Accessibility Store
 * Phase 0: Foundation & Architecture Alignment (FR-A11Y-003, UI-DES-006)
 *
 * Persists accessibility preferences via localStorage (non-PII).
 * Settings apply immediately and persist for the active session.
 * The AccessibilityProvider reads this store and reflects
 * the current state as CSS classes on <html>.
 */

import { create } from 'zustand';
import { prefsStorage } from '../core/security/storagePolicy';

const DEFAULT_PREFS = {
    textSize: 'standard',   // 'standard' | 'large' | 'xl'
    contrast: 'default',    // 'default' | 'high'
    easyMode: false,        // fewer choices, simplified copy
    voiceGuidance: true,    // TTS guidance on each step
    screenReaderHints: false, // extended aria-live announcements
};

// Load any saved prefs from localStorage on init
const savedPrefs = prefsStorage.getA11yPrefs() || {};
const initialState = { ...DEFAULT_PREFS, ...savedPrefs };

export const useAccessibilityStore = create((set, get) => ({
    ...initialState,

    /**
     * Set text size scale.
     * @param {'standard'|'large'|'xl'} textSize
     */
    setTextSize(textSize) {
        set({ textSize });
        get()._persist();
    },

    /**
     * Set contrast mode.
     * @param {'default'|'high'} contrast
     */
    setContrast(contrast) {
        set({ contrast });
        get()._persist();
    },

    /**
     * Toggle easy mode (senior-friendly).
     */
    toggleEasyMode() {
        set(state => ({ easyMode: !state.easyMode }));
        get()._persist();
    },

    /**
     * Toggle voice guidance TTS.
     */
    toggleVoiceGuidance() {
        set(state => ({ voiceGuidance: !state.voiceGuidance }));
        get()._persist();
    },

    /**
     * Toggle extended screen reader hints.
     */
    toggleScreenReaderHints() {
        set(state => ({ screenReaderHints: !state.screenReaderHints }));
        get()._persist();
    },

    /**
     * Apply a full prefs object at once (from accessibility panel "Apply").
     * @param {object} prefs
     */
    applyPrefs(prefs) {
        set({ ...DEFAULT_PREFS, ...prefs });
        get()._persist();
    },

    /**
     * Reset to defaults (called on session reset).
     */
    resetToDefaults() {
        set({ ...DEFAULT_PREFS });
        prefsStorage.setA11yPrefs(DEFAULT_PREFS);
    },

    /**
     * Internal: persist current state to localStorage.
     * @private
     */
    _persist() {
        const state = get();
        prefsStorage.setA11yPrefs({
            textSize: state.textSize,
            contrast: state.contrast,
            easyMode: state.easyMode,
            voiceGuidance: state.voiceGuidance,
            screenReaderHints: state.screenReaderHints,
        });
    },
}));
