/**
 * NextGen Seva Kiosk - Feature Flag Configuration
 * Phase 0: Foundation & Architecture Alignment
 *
 * Feature flags are sourced from ENV (which reads VITE_FEATURE_* env vars).
 * This module provides the canonical flag definitions and the FeatureFlagGate.
 *
 * HOW TO USE:
 *   import { useFeatureFlag } from '../config/featureFlags';
 *   const isVoiceEnabled = useFeatureFlag('voice');
 *
 * TO GATE A COMPONENT:
 *   <FeatureFlagGate flag="voice" fallback={<TouchFallback />}>
 *     <VoiceAssistWidget />
 *   </FeatureFlagGate>
 */

import { ENV } from './env';

/**
 * Canonical feature flag map.
 * shape: { [flagName]: { enabled: boolean, description: string } }
 */
export const FEATURE_FLAGS = {
    offlineQueue: {
        enabled: ENV.features.offlineQueue,
        description: 'Offline transaction queue and sync manager',
    },
    voice: {
        enabled: ENV.features.voice,
        description: 'Voice guidance and command recognition (FR-VOICE-001..003)',
    },
    easyMode: {
        enabled: ENV.features.easyMode,
        description: 'Senior-friendly easy mode with larger typography (FR-A11Y-003)',
    },
    analytics: {
        enabled: ENV.features.analytics,
        description: 'Privacy-safe session funnel analytics (FR-DEP-002)',
    },
    kioskLockdown: {
        enabled: ENV.kioskLockdown,
        description: 'Disable back nav and external links in kiosk mode (FR-UX-004)',
    },
    devBypass: {
        enabled: ENV.features.devBypass && !ENV.isProd,
        description: 'Dev-only bypass flags — never enabled in production',
    },
};

/**
 * Check if a specific feature flag is enabled.
 * @param {keyof typeof FEATURE_FLAGS} flagName
 * @returns {boolean}
 */
export function isFeatureEnabled(flagName) {
    const flag = FEATURE_FLAGS[flagName];
    if (!flag) {
        console.warn(`[FeatureFlag] Unknown flag: "${flagName}". Defaulting to false.`);
        return false;
    }
    return flag.enabled;
}

/**
 * Log all feature flags at startup (dev only).
 */
export function logFeatureFlags() {
    if (!ENV.features.devBypass) return;
    console.group('🚩 Feature Flags');
    Object.entries(FEATURE_FLAGS).forEach(([name, { enabled, description }]) => {
        console.log(`  ${enabled ? '✅' : '⬜'} ${name.padEnd(16)} — ${description}`);
    });
    console.groupEnd();
}
