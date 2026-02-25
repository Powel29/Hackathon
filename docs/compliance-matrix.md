# SUVIDHA Kiosk Frontend — Accessibility & Inclusion Compliance Matrix (Phase 3)

This document maps the SUVIDHA frontend implementation against both the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** and applicable **Guidelines for Indian Government Websites (GIGW)**.

> **Status:** Phase 3 Base Compliance Reached
> **Last Audit:** 2026-02-25

---

## 1. Web Content Accessibility Guidelines (WCAG) 2.1 AA

| Success Criterion | Level | Status | Implementation Details |
| :--- | :---: | :---: | :--- |
| **1.1.1 Non-text Content** | A | `PASS` | All images (`<img>`) and icons (`role="img"`) have descriptive `alt` text or `aria-label`s. Decorative svgs use `aria-hidden="true"`. |
| **1.2.2 Captions (Prerecorded)** | A | `N/A` | No prerecorded video content currently in scope. |
| **1.3.1 Info and Relationships** | A | `PASS` | Semantic HTML (`<main>`, `<header>`, `<nav>`, `<h1>`–`<h6>`) is used properly. Form inputs are explicitly associated with labels using `id` and `htmlFor`. |
| **1.4.1 Use of Color** | A | `PASS` | Color is never used as the *only* visual means of conveying information (e.g., `LocalizedErrorBlock` pairs colors with unique text labels and SVG icons). |
| **1.4.3 Contrast (Minimum)** | AA | `PASS` | Default theme meets `4.5:1` ratio for normal text and `3:1` for large text. The **High Contrast** mode (via `AccessibilityPanel`) exceeds `7:1` (AAA). |
| **1.4.4 Resize text** | AA | `PASS` | Users can scale text up to 200% without loss of content/functionality using the **Text Size** toggle (+25%, +50% steps via `html.a11y-text-large` / `xl`). |
| **2.1.1 Keyboard** | A | `PASS` | All functionality is operable via Tab/Shift+Tab and Enter/Space. Verified on Service Selection, Dashboards, and Payment flows. |
| **2.1.2 No Keyboard Trap** | A | `PASS` | Modals (`SessionWarning`, `AccessibilityPanel`) trap focus *intentionally* while open, but can be exited via `Escape`. No dead-end traps exist. |
| **2.4.1 Bypass Blocks** | A | `PASS` | `<main role="main">` landmark provided. Forms use clear fieldset groupings. |
| **2.4.3 Focus Order** | A | `PASS` | Focus order matches DOM order. `useFocusOnMount` explicitly directs focus to headers on route change to prevent disorienting jumps. |
| **2.4.7 Focus Visible** | AA | `PASS` | Global CSS baseline enforces a `2px solid #0066CC` outline with `2px` offset on all interactive elements (`:focus-visible`). |
| **2.5.5 Target Size** | AAA | `PASS` | Phase 3 implementation explicitly enforces an `80px` minimum touch target (`min-height`, `min-width`) on `TouchButton`s to accommodate kiosk finger touch. |
| **3.1.1 Language of Page** | A | `PASS` | `<html>` tag `lang` attribute dynamically matches the i18n locale currently active. |
| **3.3.2 Labels or Instructions** | A | `PASS` | Form inputs have persistent visible labels. |
| **4.1.2 Name, Role, Value** | A | `PASS` | Reusable components (`TouchButton`, `Accordion`, etc.) strictly manage ARIA states (e.g., `aria-expanded`, `aria-busy`, `aria-disabled`). |
| **4.1.3 Status Messages** | AA | `PASS` | Implemented global `div#a11y-announcer` (`aria-live="assertive"` / `polite`). Route changes, API errors, and validations are automatically read aloud (via `LocalizedErrorBlock` and `useAnnounceRoute`). |

---

## 2. Guidelines for Indian Government Websites (GIGW) Alignment

*Note: GIGW incorporates WCAG 2.0 at its core, but adds specific structural and policy requirements.*

| GIGW Reference | Status | Implementation Details |
| :--- | :---: | :--- |
| **2.1.6 Contact Information** | `PASS` | Helpdesk numbers and support options available in Footer and `LocalizedErrorBlock` (fatal). |
| **2.3.1 Clear Identity** | `PASS` | Emblems and "Government of India" / State identifiers prominently placed in the Header (`KioskLayout`). |
| **3.1.5 Bi-lingual / Multi-lingual** | `PASS` | Complete localization support covering 7+ regional languages (English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali). Toggle available persistently in Footer. Covered 100% by automated CI script (`check-i18n-coverage`). |
| **4.2.1 Secure Access (HTTPS)**| `PASS` | Deployed frontend enforces SSL/TLS via ingress policy. |
| **5.2.2 Consistent Navigation** | `PASS` | Fixed Header, persistent Footer, standard Breadcrumb/Back button placements across all Service Modules. |
| **6.3.1 Form Validation** | `PASS` | Client-side validation runs before submission, generating inline ARIA-announced error messages without clearing user input automatically. |

---

## 3. Automated Dev Tooling

To prevent accessibility regressions, Phase 3 introduced:
1. **Axe-core runtime auditing:** Included via dynamic import (`AccessibilityAuditConfig.js`). Scans automatically on route transition in Development mode only, logging WCAG violations directly to the browser console.
2. **i18n Coverage CI:** `scripts/check-i18n-coverage.js` enforces a strict 99% translation coverage baseline for all non-English locales before deployment.
