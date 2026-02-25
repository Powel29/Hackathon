/**
 * SUVIDHA Kiosk - Token Storage Security Policy
 * Phase 0: Foundation & Architecture Alignment (FR-SEC-001)
 *
 * DECISION: sessionStorage for auth tokens (approved by user).
 * - Token is cleared when tab/browser closes.
 * - Appropriate for shared kiosk hardware where sessions are per-citizen.
 * - Prevents token leakage across citizen sessions on same device.
 *
 * POLICY:
 *   ✅ sessionStorage  → auth token, current user object
 *   ✅ localStorage    → accessibility preferences, sync queue (non-PII)
 *   ❌ NEVER           → raw Aadhaar, OTP, full biometric data in any storage
 *   ❌ NEVER           → token in URL params, window.name, or cookies without Secure+HttpOnly
 */

// ─── Storage Keys Registry ──────────────────────────────────────────────────
// ALL storage keys must be declared here. Never use magic strings in components.

export const STORAGE_KEYS = {
    // sessionStorage — cleared on tab close
    AUTH_TOKEN: 'suvidha_auth_token',
    CURRENT_USER: 'suvidha_current_user',

    // localStorage — persists across sessions (accessibility, queue)
    A11Y_PREFERENCES: 'suvidha_a11y_prefs',
    SYNC_QUEUE: 'suvidha_sync_queue',
    LANGUAGE_PREFERENCE: 'suvidha_language',
};

// ─── PII Scrub List ──────────────────────────────────────────────────────────
// Fields that must NEVER be persisted in any storage layer.
// Used by storagePolicy to sanitize before write.

const PII_FIELDS = [
    'aadharNumber', 'aadhaarNumber', 'aadhar', 'aadhaar',
    'mobileNumber', 'mobile', 'phone', 'phoneNumber',
    'otp', 'password', 'pin',
    'dateOfBirth', 'dob',
    'biometric',
];

/**
 * Scrub PII fields from an object before writing to any storage.
 * @param {Record<string, unknown>} obj
 * @returns {Record<string, unknown>} sanitized object
 */
export function sanitizeForStorage(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = { ...obj };
    PII_FIELDS.forEach(field => {
        if (field in sanitized) {
            delete sanitized[field];
        }
    });
    return sanitized;
}

// ─── Auth Token API (sessionStorage) ────────────────────────────────────────

export const tokenStrategy = {
    /**
     * Store auth token in sessionStorage (not localStorage).
     * Token is auto-cleared on tab/browser close.
     */
    setToken(token) {
        if (!token) return;
        try {
            sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        } catch (e) {
            console.error('[Storage] Failed to store auth token:', e);
        }
    },

    /**
     * Retrieve auth token from sessionStorage.
     * @returns {string | null}
     */
    getToken() {
        try {
            return sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (e) {
            return null;
        }
    },

    /**
     * Remove auth token (logout, session reset, security wipe).
     */
    clearToken() {
        try {
            sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        } catch (e) {
            console.error('[Storage] Failed to clear auth token:', e);
        }
    },

    /**
     * Store the current user object.
     * PII fields are scrubbed before storage.
     * @param {Record<string, unknown>} user
     */
    setUser(user) {
        if (!user) return;
        try {
            const sanitized = sanitizeForStorage(user);
            sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sanitized));
        } catch (e) {
            console.error('[Storage] Failed to store user:', e);
        }
    },

    /**
     * Retrieve current user object.
     * @returns {Record<string, unknown> | null}
     */
    getUser() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Full security wipe — clears ALL sessionStorage keys managed by app.
     * Called on session reset and forced logout.
     */
    securityWipe() {
        try {
            Object.values(STORAGE_KEYS)
                .filter(key => [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.CURRENT_USER].includes(key))
                .forEach(key => sessionStorage.removeItem(key));
        } catch (e) {
            // Silent fail — security wipe must not throw
        }
    },
};

// ─── Preference API (localStorage) ──────────────────────────────────────────

export const prefsStorage = {
    /**
     * Save accessibility preferences to localStorage.
     * Non-PII, session-spanning preference.
     * @param {Record<string, unknown>} prefs
     */
    setA11yPrefs(prefs) {
        try {
            localStorage.setItem(STORAGE_KEYS.A11Y_PREFERENCES, JSON.stringify(prefs));
        } catch (e) {
            console.warn('[Storage] Could not persist a11y prefs:', e);
        }
    },

    /**
     * Load accessibility preferences.
     * @returns {Record<string, unknown> | null}
     */
    getA11yPrefs() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.A11Y_PREFERENCES);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Save language preference.
     * @param {string} langCode
     */
    setLanguage(langCode) {
        try {
            localStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, langCode);
        } catch (e) { /* silent */ }
    },

    /**
     * Load saved language preference.
     * @returns {string | null}
     */
    getLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
        } catch (e) {
            return null;
        }
    },
};

// ─── Migration helper: wipe old localStorage token if present ───────────────
// Runs once on app boot to clean up tokens stored by the old pattern.

export function migrateFromLocalStorage() {
    const legacyKeys = ['token', 'user'];
    let migrated = false;
    legacyKeys.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            // Token found in localStorage — transfer to session then wipe
            if (key === 'token') {
                const legacyToken = localStorage.getItem('token');
                if (legacyToken) tokenStrategy.setToken(legacyToken);
            }
            if (key === 'user') {
                try {
                    const legacyUser = JSON.parse(localStorage.getItem('user'));
                    if (legacyUser) tokenStrategy.setUser(legacyUser);
                } catch (_) { /* ignore parse errors */ }
            }
            localStorage.removeItem(key);
            migrated = true;
        }
    });
    if (migrated) {
        console.info('[Storage] Migrated token from localStorage → sessionStorage');
    }
}
