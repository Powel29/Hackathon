/**
 * SUVIDHA Kiosk - Feature Flag Gate Component
 * Phase 0: Foundation & Architecture Alignment
 *
 * Wrap any feature with this component to safely gate it behind a flag.
 * If the flag is disabled, renders `fallback` (or null).
 *
 * @example
 * <FeatureFlagGate flag="voice" fallback={null}>
 *   <VoiceAssistWidget />
 * </FeatureFlagGate>
 */

import { isFeatureEnabled } from '../../config/featureFlags';

/**
 * @param {object} props
 * @param {string} props.flag - flag name (must exist in FEATURE_FLAGS)
 * @param {React.ReactNode} [props.children] - rendered when flag is ON
 * @param {React.ReactNode} [props.fallback] - rendered when flag is OFF (default: null)
 */
export function FeatureFlagGate({ flag, children, fallback = null }) {
    if (!isFeatureEnabled(flag)) {
        return fallback;
    }
    return children;
}
