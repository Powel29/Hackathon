/**
 * NextGen Seva Kiosk - Centralized Environment Configuration
 * Phase 0: Foundation & Architecture Alignment
 *
 * ALL environment variable access must go through this module.
 * Never use import.meta.env directly in components or services.
 *
 * Profiles: dev | staging | prod | kiosk-pilot
 */

const getEnvBool = (key, fallback = false) => {
    const val = import.meta.env[key];
    if (val === undefined || val === null || val === '') return fallback;
    return val === 'true' || val === '1';
};

const getEnvNumber = (key, fallback) => {
    const val = Number(import.meta.env[key]);
    return isNaN(val) ? fallback : val;
};

const getEnvString = (key, fallback = '') => {
    return import.meta.env[key] ?? fallback;
};

export const ENV = {
    /** Current deployment profile */
    profile: getEnvString('VITE_ENV_PROFILE', 'dev'),

    /** Backend API base URL */
    apiUrl: getEnvString('VITE_API_URL', 'http://localhost:5000/api'),

    /** Enable full kiosk lockdown mode (no back nav, no external links) */
    kioskLockdown: getEnvBool('VITE_KIOSK_LOCKDOWN', false),

    /** Session inactivity warning threshold (ms). Default 90s */
    sessionWarningMs: getEnvNumber('VITE_SESSION_WARNING_MS', 90000),

    /** Session auto-logout threshold (ms). Default 120s */
    sessionTimeoutMs: getEnvNumber('VITE_SESSION_TIMEOUT_MS', 120000),

    /** Feature flags — each individually gated */
    features: {
        /** Offline transaction queue & sync manager */
        offlineQueue: getEnvBool('VITE_FEATURE_OFFLINE_QUEUE', true),
        /** Voice guidance and command recognition */
        voice: getEnvBool('VITE_FEATURE_VOICE', true),
        /** Easy mode (senior-friendly larger typography) */
        easyMode: getEnvBool('VITE_FEATURE_EASY_MODE', true),
        /** Privacy-safe analytics / telemetry */
        analytics: getEnvBool('VITE_FEATURE_ANALYTICS', false),
        /**
         * Dev-only bypass flags.
         * STRIPPED at build time via vite define() for prod.
         * Never use import.meta.env.DEV directly in features.
         */
        devBypass: import.meta.env.DEV === true,
    },

    /** Convenience: are we running in production? */
    isProd: getEnvString('VITE_ENV_PROFILE', 'dev') === 'prod',

    /** Convenience: are we in the kiosk-pilot profile? */
    isKioskPilot: getEnvString('VITE_ENV_PROFILE', 'dev') === 'kiosk-pilot',
};

/** Validate critical env vars at startup (non-throwing — logs only) */
export function validateEnv() {
    const warnings = [];
    if (!import.meta.env.VITE_API_URL) {
        warnings.push('VITE_API_URL not set — falling back to localhost:5001');
    }
    if (ENV.isProd && ENV.features.devBypass) {
        warnings.push('⚠️ SECURITY: devBypass is true in prod profile — check build config');
    }
    if (ENV.sessionTimeoutMs < ENV.sessionWarningMs) {
        warnings.push('Session timeout is less than warning threshold — fixing to timeout + 30s');
    }
    if (warnings.length > 0) {
        console.group('🔧 ENV Config Warnings');
        warnings.forEach(w => console.warn(w));
        console.groupEnd();
    }
}
