#!/usr/bin/env node
/**
 * NextGen Seva Kiosk - i18n Translation Coverage Enforcement
 * Phase 3: Accessibility & Inclusion (FR-A11Y-004)
 *
 * Validates that all non-English locale files contain every key
 * present in the English (en.json) source-of-truth.
 *
 * Reports:
 *   - Coverage % per locale
 *   - List of missing keys per locale
 *
 * Exit codes:
 *   0 → All locales at ≥ REQUIRED_COVERAGE %
 *   1 → One or more locales below threshold
 *
 * Usage:
 *   node scripts/check-i18n-coverage.js
 *   node scripts/check-i18n-coverage.js --threshold=99
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ────────────────────────────────────────────────────────────────

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const SOURCE_LOCALE = 'en';
const REQUIRED_COVERAGE = parseFloat(
    (process.argv.find(a => a.startsWith('--threshold=')) || '--threshold=99').split('=')[1]
);

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Recursively extract all leaf key paths from a nested object.
 * e.g. { a: { b: "x" } } → ["a.b"]
 * @param {object} obj
 * @param {string} prefix
 * @returns {string[]}
 */
function extractKeys(obj, prefix = '') {
    const keys = [];
    for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
            keys.push(...extractKeys(v, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

/**
 * Load a locale JSON file.
 * @param {string} locale — e.g. 'hi'
 * @returns {object}
 */
function loadLocale(locale) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
        console.error(`[i18n] ❌ Locale file not found: ${filePath}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
    console.log('\n🌐 NextGen Seva i18n Coverage Report');
    console.log(`   Source locale : ${SOURCE_LOCALE}`);
    console.log(`   Required coverage : ${REQUIRED_COVERAGE}%`);
    console.log('─'.repeat(60));

    // Load source locale and extract all keys
    const sourceData = loadLocale(SOURCE_LOCALE);
    const sourceKeys = extractKeys(sourceData);
    const totalKeys = sourceKeys.length;

    console.log(`   Total keys in ${SOURCE_LOCALE}.json : ${totalKeys}\n`);

    // Find all non-source locale files
    const localeFiles = fs.readdirSync(LOCALES_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''))
        .filter(l => l !== SOURCE_LOCALE);

    let hasFailures = false;

    for (const locale of localeFiles) {
        const localeData = loadLocale(locale);
        const localeKeys = new Set(extractKeys(localeData));

        const missingKeys = sourceKeys.filter(k => !localeKeys.has(k));
        const coveredCount = totalKeys - missingKeys.length;
        const coveragePct = ((coveredCount / totalKeys) * 100).toFixed(2);
        const passed = parseFloat(coveragePct) >= REQUIRED_COVERAGE;

        const statusIcon = passed ? '✅' : '❌';
        console.log(`${statusIcon} ${locale.toUpperCase().padEnd(4)} — ${coveragePct}% (${coveredCount}/${totalKeys} keys)`);

        if (!passed) {
            hasFailures = true;
            console.log(`\n   ⚠️  Missing keys in ${locale}.json (${missingKeys.length} total):`);
            missingKeys.slice(0, 30).forEach(k => console.log(`      • ${k}`));
            if (missingKeys.length > 30) {
                console.log(`      ... and ${missingKeys.length - 30} more`);
            }
            console.log('');
        }
    }

    console.log('─'.repeat(60));

    if (hasFailures) {
        console.error(`\n❌ Coverage check FAILED. Some locales are below ${REQUIRED_COVERAGE}%.`);
        console.error('   Run the missing key filler or add translations manually.\n');
        process.exit(1);
    } else {
        console.log(`\n✅ All locales pass ${REQUIRED_COVERAGE}% coverage. i18n is production-ready.\n`);
        process.exit(0);
    }
}

main();
