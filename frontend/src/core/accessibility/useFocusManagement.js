/**
 * SUVIDHA Kiosk - Focus Management Hooks
 * Phase 3: Accessibility & Inclusion (FR-A11Y-001, FR-A11Y-002)
 *
 * Provides three normalized focus utilities:
 *  1. useFocusOnMount(ref)         — focus element on mount (page transitions)
 *  2. useFocusTrap(ref, isActive)  — trap Tab/Shift+Tab inside a container
 *  3. useAnnounceRoute(message)    — announce route changes to screen readers
 *
 * All hooks work with the existing `a11y-announcer` div managed by AccessibilityProvider.
 */

import { useEffect, useRef } from 'react';

// ─── Focusable selector ───────────────────────────────────────────────────────

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
].join(', ');

/**
 * Get all focusable elements within a container, in DOM order.
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
        el => !el.hasAttribute('aria-hidden') && el.offsetParent !== null
    );
}

// ─── useFocusOnMount ──────────────────────────────────────────────────────────

/**
 * Focuses the referenced element (or the first focusable child within it)
 * when the component mounts. Ensures keyboard users land in the right place
 * after a page or modal transition (WCAG 2.4.3 Focus Order).
 *
 * @param {React.RefObject<HTMLElement>} ref — element to focus on mount
 * @param {object} [options]
 * @param {boolean} [options.focusFirstChild=false] — focus first focusable child instead
 * @param {number}  [options.delayMs=50]            — delay before focusing (for animation)
 *
 * @example
 * const headingRef = useRef(null);
 * useFocusOnMount(headingRef);
 * return <h1 tabIndex={-1} ref={headingRef}>Service Selection</h1>;
 */
export function useFocusOnMount(ref, { focusFirstChild = false, delayMs = 50 } = {}) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!ref.current) return;
            if (focusFirstChild) {
                const first = getFocusableElements(ref.current)[0];
                first?.focus({ preventScroll: false });
            } else {
                ref.current.focus({ preventScroll: false });
            }
        }, delayMs);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

// ─── useFocusTrap ─────────────────────────────────────────────────────────────

/**
 * Traps keyboard focus (Tab / Shift+Tab) inside a container when active.
 * Required for dialogs, modals, and slide-in panels (WCAG 2.1.2).
 *
 * Also handles Escape key — calls onEscape if provided.
 *
 * @param {React.RefObject<HTMLElement>} ref — container to trap focus within
 * @param {boolean} isActive — whether the trap is active
 * @param {{ onEscape?: Function }} [options]
 *
 * @example
 * const panelRef = useRef(null);
 * useFocusTrap(panelRef, isOpen, { onEscape: onClose });
 */
export function useFocusTrap(ref, isActive, { onEscape } = {}) {
    useEffect(() => {
        if (!isActive || !ref.current) return;

        // Save previous focus so we can restore it on close
        const previouslyFocused = document.activeElement;

        // Focus the first focusable element inside the trap
        const focusables = getFocusableElements(ref.current);
        focusables[0]?.focus({ preventScroll: false });

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onEscape?.();
                return;
            }

            if (e.key !== 'Tab') return;

            const currentFocusables = getFocusableElements(ref.current);
            if (currentFocusables.length === 0) {
                e.preventDefault();
                return;
            }

            const first = currentFocusables[0];
            const last = currentFocusables[currentFocusables.length - 1];
            const active = document.activeElement;

            if (e.shiftKey) {
                // Shift+Tab: if on first, wrap to last
                if (active === first || !ref.current.contains(active)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab: if on last, wrap to first
                if (active === last || !ref.current.contains(active)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // Restore focus to where the user was before opening
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                previouslyFocused.focus();
            }
        };
    }, [isActive, ref, onEscape]);
}

// ─── useAnnounceRoute ──────────────────────────────────────────────────────────

/**
 * Announces a route change message to screen readers via the global
 * `#a11y-announcer` live region managed by AccessibilityProvider.
 *
 * Call this in the effect of any top-level kiosk page component.
 * (WCAG 4.1.3 — Status Messages)
 *
 * @param {string} message — human-readable route description, localized
 *
 * @example
 * // In ServiceSelection.jsx:
 * useAnnounceRoute(t('serviceSelection.pageTitle', 'Select a Service'));
 */
export function useAnnounceRoute(message) {
    useEffect(() => {
        if (!message) return;
        const el = document.getElementById('a11y-announcer');
        if (!el) return;
        // Clear first to force re-announcement of the same message on re-navigation
        el.textContent = '';
        const raf = requestAnimationFrame(() => {
            el.textContent = message;
        });
        return () => cancelAnimationFrame(raf);
    }, [message]);
}

// ─── useRestoreFocus ──────────────────────────────────────────────────────────

/**
 * Captures the currently focused element and restores focus to it
 * when the component unmounts.
 *
 * Useful for modals and panels that need to return focus on close.
 *
 * @example
 * useRestoreFocus(); // call at the top of your modal component
 */
export function useRestoreFocus() {
    const savedRef = useRef(null);

    useEffect(() => {
        savedRef.current = document.activeElement;
        return () => {
            if (savedRef.current && typeof savedRef.current.focus === 'function') {
                savedRef.current.focus();
            }
        };
    }, []);
}
