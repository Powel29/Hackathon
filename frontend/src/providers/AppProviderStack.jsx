/**
 * SUVIDHA Kiosk - App Provider Stack
 * Phase 0: Foundation & Architecture Alignment
 *
 * Composes all providers in the correct dependency order.
 * This is the single import point for main.jsx.
 *
 * Provider order (outermost → innermost):
 *   ErrorBoundary           ← catch any hard React crash
 *   NetworkStatusProvider   ← network state; others may depend on it
 *   AccessibilityProvider   ← CSS classes on <html>; affects all children
 *   [children]              ← RouterProvider + app tree
 *
 * VoiceAssistProvider is injected in Phase 4 here.
 */

import { Component } from 'react';
import { NetworkStatusProvider } from './NetworkStatusProvider';
import { AccessibilityProvider } from './AccessibilityProvider';
import { VoiceAssistProvider } from './VoiceAssistProvider';
import { validateEnv } from '../config/env';
import { logFeatureFlags } from '../config/featureFlags';
import { migrateFromLocalStorage } from '../core/security/storagePolicy';
import { initA11yRouteAudit } from '../core/accessibility/AccessibilityAuditConfig';

// ─── Root Error Boundary ────────────────────────────────────────────────────

class RootErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In Phase 6 this will forward to the telemetry error tracker
        console.error('[RootErrorBoundary] Unhandled React error:', error, info);
    }

    handleReset() {
        this.setState({ hasError: false, error: null });
        window.location.href = '/kiosk';
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    role="alert"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: '2rem',
                        fontFamily: 'system-ui, sans-serif',
                        background: '#F8F9FA',
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#212529', marginBottom: '0.5rem' }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: '#6c757d', marginBottom: '1.5rem', textAlign: 'center' }}>
                        The kiosk encountered an unexpected error. Please restart your session.
                    </p>
                    <button
                        onClick={() => this.handleReset()}
                        style={{
                            padding: '0.75rem 2rem',
                            background: '#0066CC',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            minWidth: '80px',
                            minHeight: '48px',
                        }}
                    >
                        Return to Home
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── Boot-time initializations ───────────────────────────────────────────────
// These run once when the module is imported (before first render).

validateEnv();
logFeatureFlags();
migrateFromLocalStorage();
initA11yRouteAudit(); // Phase 3: arms dev-mode WCAG audit on route change (no-op in prod)

// ─── AppProviderStack ────────────────────────────────────────────────────────

/**
 * Wraps the entire app with all infrastructure providers.
 * @param {{ children: React.ReactNode }} props
 */
export function AppProviderStack({ children }) {
    return (
        <RootErrorBoundary>
            <NetworkStatusProvider>
                <AccessibilityProvider>
                    <VoiceAssistProvider>
                        {children}
                    </VoiceAssistProvider>
                </AccessibilityProvider>
            </NetworkStatusProvider>
        </RootErrorBoundary>
    );
}
