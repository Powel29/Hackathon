/**
 * NextGen Seva Kiosk - Accessibility Provider
 * Phase 0: Foundation & Architecture Alignment (FR-A11Y-001, FR-A11Y-003)
 *
 * Applies accessibility settings from useAccessibilityStore as:
 *   1. CSS classes on <html> element (text size, contrast, easy mode)
 *   2. CSS token injection (design tokens)
 *   3. `aria-live` region mount (for dynamic announcements)
 *
 * CSS class strategy on <html>:
 *   .a11y-text-large    → typography scale L
 *   .a11y-text-xl       → typography scale XL
 *   .a11y-high-contrast → high contrast color overrides
 *   .a11y-easy-mode     → simplified layout, max 3 choices/screen
 */

import { useEffect, createContext, useContext } from 'react';
import { useAccessibilityStore } from '../store/useAccessibilityStore';
import { injectCssTokens } from '../config/designTokens';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
    const {
        textSize,
        contrast,
        easyMode,
        screenReaderHints,
    } = useAccessibilityStore();

    // Inject CSS custom property tokens once on mount
    useEffect(() => {
        injectCssTokens();
    }, []);

    // Apply / remove CSS classes on <html> reactively
    useEffect(() => {
        const html = document.documentElement;

        // Text size classes
        html.classList.remove('a11y-text-large', 'a11y-text-xl');
        if (textSize === 'large') html.classList.add('a11y-text-large');
        if (textSize === 'xl') html.classList.add('a11y-text-xl');

        // Contrast class
        if (contrast === 'high') {
            html.classList.add('a11y-high-contrast');
        } else {
            html.classList.remove('a11y-high-contrast');
        }

        // Easy mode class
        if (easyMode) {
            html.classList.add('a11y-easy-mode');
        } else {
            html.classList.remove('a11y-easy-mode');
        }
    }, [textSize, contrast, easyMode]);

    return (
        <AccessibilityContext.Provider value={useAccessibilityStore}>
            {children}

            {/* Global aria-live region for dynamic announcements (FR-A11Y-002) */}
            {/* Rendered once here — populated by useAnnounce() hook from any component */}
            <div
                id="a11y-announcer"
                aria-live={screenReaderHints ? 'assertive' : 'polite'}
                aria-atomic="true"
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: '0',
                    overflow: 'hidden',
                    clip: 'rect(0,0,0,0)',
                    whiteSpace: 'nowrap',
                    borderWidth: '0',
                }}
            />
        </AccessibilityContext.Provider>
    );
}

/**
 * Hook: announce a message to screen readers via the global aria-live region.
 * @returns {Function} announce(message: string)
 */
export function useAnnounce() {
    return function announce(message) {
        const el = document.getElementById('a11y-announcer');
        if (!el) return;
        // Clear and reset to force re-announcement of same message
        el.textContent = '';
        requestAnimationFrame(() => {
            el.textContent = message;
        });
    };
}
