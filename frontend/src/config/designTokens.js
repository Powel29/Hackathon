/**
 * SUVIDHA Kiosk - Design Token System
 * Phase 0: Foundation & Architecture Alignment
 *
 * Semantic token layer. All components must reference tokens,
 * never raw Tailwind values for touch/spacing/state-color decisions.
 *
 * CSS custom properties mirror these in index.css for non-JS consumers.
 */

export const tokens = {
    /**
     * Touch ergonomics — FR-UX-001
     * Min target 80px, min gap 12px between adjacent targets.
     */
    touch: {
        targetMin: 80,       // px — minimum interactive element dimension
        targetMinPx: '80px',
        gap: 12,             // px — minimum spacing between tap targets
        gapPx: '12px',
    },

    /**
     * Z-index scale — no magic numbers in components
     */
    zIndex: {
        base: 0,
        overlay: 100,        // semi-transparent backdrops
        modal: 200,          // dialogs, session warning
        toast: 300,          // sonner toasts
        voiceWidget: 150,    // voice assist overlay
        banner: 90,          // network status banner
        accessibilityPanel: 250,
    },

    /**
     * Session timing tokens — matches ENV defaults
     * Components read from store (which reads from ENV),
     * but these document the expected values.
     */
    session: {
        warningMs: 90000,    // 1.5 minutes before timeout
        timeoutMs: 120000,   // 2 minutes total inactivity
        countdownStartMs: 60000, // show countdown for last 60s
    },

    /**
     * Network / offline state colors
     * Colorblind-safe: never use color as the only indicator (FR-A11Y-001)
     * Icons + text labels must always accompany color.
     */
    networkState: {
        online: { color: '#16a34a', bg: '#f0fdf4', label: 'Online' },
        offline: { color: '#dc2626', bg: '#fef2f2', label: 'Offline' },
        syncing: { color: '#2563eb', bg: '#eff6ff', label: 'Syncing' },
        retrying: { color: '#d97706', bg: '#fffbeb', label: 'Retrying' },
    },

    /**
     * Sync queue item state tokens
     */
    syncState: {
        queued: { color: '#6b7280', icon: '⏳', label: 'Queued' },
        retrying: { color: '#d97706', icon: '🔄', label: 'Retrying' },
        synced: { color: '#16a34a', icon: '✅', label: 'Synced' },
        failed: { color: '#dc2626', icon: '❌', label: 'Failed' },
    },

    /**
     * Typography scale — standard + easy mode (FR-A11Y-003)
     * Applied as CSS classes on <html> element by AccessibilityProvider.
     */
    typography: {
        standard: {
            base: '1rem',      // 16px
            sm: '0.875rem',  // 14px
            lg: '1.125rem',  // 18px
            xl: '1.25rem',   // 20px
            '2xl': '1.5rem',    // 24px
        },
        large: {
            base: '1.125rem',  // 18px
            sm: '1rem',      // 16px
            lg: '1.25rem',   // 20px
            xl: '1.5rem',    // 24px
            '2xl': '1.75rem',   // 28px
        },
        xl: {
            base: '1.25rem',   // 20px
            sm: '1.125rem',  // 18px
            lg: '1.5rem',    // 24px
            xl: '1.75rem',   // 28px
            '2xl': '2rem',      // 32px
        },
    },

    /**
     * Brand colors — source of truth
     */
    color: {
        primary: '#0066CC',
        primaryDark: '#0052A3',
        primaryDeep: '#004080',
        success: '#28A745',
        warning: '#FF9800',
        danger: '#DC3545',
        text: '#212529',
        textMuted: '#6c757d',
        bg: '#F8F9FA',
        surface: '#FFFFFF',
        border: '#dee2e6',
    },

    /**
     * Contrast-mode color overrides (high contrast a11y mode)
     */
    colorHighContrast: {
        primary: '#003d99',
        text: '#000000',
        bg: '#FFFFFF',
        border: '#000000',
        surface: '#f5f5f5',
    },
};

/**
 * CSS variable injection — called once at app init by AccessibilityProvider.
 * Injects token values as CSS custom properties on :root.
 */
export function injectCssTokens() {
    const root = document.documentElement;
    root.style.setProperty('--touch-target-min', tokens.touch.targetMinPx);
    root.style.setProperty('--touch-gap', tokens.touch.gapPx);
    root.style.setProperty('--color-primary', tokens.color.primary);
    root.style.setProperty('--color-primary-dark', tokens.color.primaryDark);
    root.style.setProperty('--color-text', tokens.color.text);
    root.style.setProperty('--color-bg', tokens.color.bg);
    root.style.setProperty('--color-surface', tokens.color.surface);
    root.style.setProperty('--color-border', tokens.color.border);
    root.style.setProperty('--color-success', tokens.color.success);
    root.style.setProperty('--color-warning', tokens.color.warning);
    root.style.setProperty('--color-danger', tokens.color.danger);
    root.style.setProperty('--color-online', tokens.networkState.online.color);
    root.style.setProperty('--color-offline', tokens.networkState.offline.color);
    root.style.setProperty('--color-syncing', tokens.networkState.syncing.color);
    root.style.setProperty('--color-retrying', tokens.networkState.retrying.color);
    root.style.setProperty('--z-modal', String(tokens.zIndex.modal));
    root.style.setProperty('--z-overlay', String(tokens.zIndex.overlay));
    root.style.setProperty('--z-toast', String(tokens.zIndex.toast));
    root.style.setProperty('--z-banner', String(tokens.zIndex.banner));
}
