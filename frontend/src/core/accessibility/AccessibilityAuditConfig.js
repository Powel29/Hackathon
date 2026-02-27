/**
 * NextGen Seva Kiosk - Accessibility Audit Configuration
 * Phase 3: Accessibility & Inclusion (FR-A11Y-001)
 *
 * Responsibilities:
 *  1. Define enforced WCAG 2.1 AA rule set
 *  2. Run axe-core audits in DEV mode only (feature-flag gated)
 *  3. Expose runA11yAudit(containerEl?) for opt-in component-level scanning
 *
 * Production impact: ZERO — all axe imports are inside dynamic import guards.
 * In production, this module exports only static config objects.
 */

// ─── WCAG 2.1 AA Enforced Rule Definitions ────────────────────────────────

/**
 * Canonical WCAG 2.1 AA acceptance criteria used as the audit baseline.
 * Each entry maps to an axe-core rule and a compliance requirement.
 *
 * @type {Array<{ ruleId: string, level: 'A'|'AA', description: string, wcagRef: string }>}
 */
export const WCAG_RULES = [
    // ── Perceivable ────────────────────────────────────────────────────────
    { ruleId: 'color-contrast', level: 'AA', wcagRef: '1.4.3', description: 'Text contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)' },
    { ruleId: 'image-alt', level: 'A', wcagRef: '1.1.1', description: 'All images have descriptive alt text' },
    { ruleId: 'video-caption', level: 'A', wcagRef: '1.2.2', description: 'Videos have captions' },
    { ruleId: 'empty-heading', level: 'A', wcagRef: '1.3.1', description: 'Headings are not empty' },
    { ruleId: 'list', level: 'A', wcagRef: '1.3.1', description: 'List semantics are correct' },
    { ruleId: 'landmark-one-main', level: 'A', wcagRef: '1.3.6', description: 'Page has exactly one main landmark' },

    // ── Operable ───────────────────────────────────────────────────────────
    { ruleId: 'keyboard', level: 'A', wcagRef: '2.1.1', description: 'All functionality operable via keyboard' },
    { ruleId: 'focus-visible', level: 'AA', wcagRef: '2.4.7', description: 'Focus indicator visible on all interactive elements' },
    { ruleId: 'scrollable-region-focusable', level: 'AA', wcagRef: '2.4.3', description: 'Scrollable regions are focusable' },
    { ruleId: 'skip-link', level: 'A', wcagRef: '2.4.1', description: 'Skip navigation link provided' },
    { ruleId: 'bypass', level: 'A', wcagRef: '2.4.1', description: 'Repeated blocks can be bypassed' },
    { ruleId: 'page-has-heading-one', level: 'A', wcagRef: '2.4.6', description: 'Page has h1 heading' },

    // ── Understandable ─────────────────────────────────────────────────────
    { ruleId: 'html-has-lang', level: 'A', wcagRef: '3.1.1', description: 'HTML element has lang attribute' },
    { ruleId: 'html-lang-valid', level: 'A', wcagRef: '3.1.1', description: 'HTML lang attribute is valid BCP 47' },
    { ruleId: 'label', level: 'A', wcagRef: '3.3.2', description: 'Form inputs have associated labels' },
    { ruleId: 'select-name', level: 'A', wcagRef: '4.1.2', description: 'Select elements have accessible names' },

    // ── Robust ─────────────────────────────────────────────────────────────
    { ruleId: 'aria-required-attr', level: 'A', wcagRef: '4.1.2', description: 'ARIA elements have required attributes' },
    { ruleId: 'aria-valid-attr', level: 'A', wcagRef: '4.1.2', description: 'ARIA attributes are valid' },
    { ruleId: 'aria-valid-attr-value', level: 'A', wcagRef: '4.1.2', description: 'ARIA attribute values are valid' },
    { ruleId: 'aria-hidden-body', level: 'A', wcagRef: '4.1.2', description: 'aria-hidden not set on body' },
    { ruleId: 'aria-roles', level: 'A', wcagRef: '4.1.2', description: 'ARIA roles are valid' },
    { ruleId: 'button-name', level: 'A', wcagRef: '4.1.2', description: 'Buttons have accessible names' },
    { ruleId: 'dialog-name', level: 'AA', wcagRef: '4.1.3', description: 'Dialogs have accessible names' },
    { ruleId: 'role-img-alt', level: 'A', wcagRef: '1.1.1', description: 'role=img elements have alt text' },
];

/**
 * Rule IDs to include in axe scan.
 * Only Level A + AA rules from our WCAG_RULES baseline.
 */
export const AXE_RULE_IDS = WCAG_RULES.map(r => r.ruleId);

// ─── DEV-MODE Audit Runner ────────────────────────────────────────────────

let _axeLoaded = false;
let _axeInstance = null;

/**
 * Load axe-core asynchronously (only in dev, never in prod bundle).
 * @returns {Promise<object|null>} axe instance or null if unavailable
 */
async function loadAxe() {
    if (_axeLoaded) return _axeInstance;
    try {
        // Dynamic import ensures axe-core is never bundled into prod output.
        // Tree-shaking + Vite's build will drop this block if import.meta.env.DEV is false.
        const axe = await import('axe-core');
        _axeInstance = axe.default || axe;
        _axeLoaded = true;
        return _axeInstance;
    } catch {
        // axe-core is not installed — fail silently
        _axeLoaded = true;
        _axeInstance = null;
        return null;
    }
}

/**
 * Run a WCAG 2.1 AA accessibility audit on a container element.
 * No-op in production. Logs violations to console in dev.
 *
 * @param {HTMLElement} [container=document.body] — element to audit
 * @returns {Promise<Array>} array of axe violations, or [] if no axe / prod
 */
export async function runA11yAudit(container = document.body) {
    // Guard: never run in production
    if (import.meta.env.PROD) return [];

    const axe = await loadAxe();
    if (!axe) {
        // axe-core not installed — install with: npm install --save-dev axe-core
        console.info('[A11y] Install axe-core to enable dev accessibility audits: npm i -D axe-core');
        return [];
    }

    try {
        const results = await axe.run(container, {
            runOnly: {
                type: 'rule',
                values: AXE_RULE_IDS,
            },
            resultTypes: ['violations'],
        });

        const { violations } = results;

        if (violations.length === 0) {
            console.info('[A11y] ✅ No WCAG violations detected on this page.');
        } else {
            console.group(`[A11y] ⚠️ ${violations.length} WCAG violation(s) detected`);
            violations.forEach(v => {
                const wcagEntry = WCAG_RULES.find(r => r.ruleId === v.id);
                console.warn(
                    `  [${v.impact?.toUpperCase() || 'UNKNOWN'}] ${v.id}`,
                    `\n  WCAG: ${wcagEntry?.wcagRef || 'N/A'} — ${v.description}`,
                    `\n  Affected nodes:`, v.nodes.map(n => n.html).join('\n')
                );
            });
            console.groupEnd();
        }

        return violations;
    } catch (err) {
        console.warn('[A11y] Audit runner error:', err);
        return [];
    }
}

/**
 * Register an axe audit to run after each route navigation.
 * Call once at app boot in dev mode.
 *
 * Usage: initA11yRouteAudit() — called from AppProviderStack in dev.
 */
export function initA11yRouteAudit() {
    if (import.meta.env.PROD) return;

    // Debounce to avoid running mid-transition
    let debounceTimer = null;
    const auditAfterDelay = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            runA11yAudit(document.querySelector('[role="main"]') || document.body);
        }, 800);
    };

    // Listen for React Router navigation events via popstate
    window.addEventListener('popstate', auditAfterDelay);

    // Also run once on initial load
    if (document.readyState === 'complete') {
        auditAfterDelay();
    } else {
        window.addEventListener('load', auditAfterDelay, { once: true });
    }

    console.info('[A11y] Route-level WCAG audit armed (dev only). Install axe-core to activate.');
}
