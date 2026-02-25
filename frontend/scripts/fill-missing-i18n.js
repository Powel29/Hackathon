#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const SOURCE_LOCALE = 'en';

function loadLocale(locale) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveLocale(locale, data) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Deep merge source obj into target obj, adding missing keys.
 * Does not overwrite existing values in target.
 */
function mergeMissing(target, source) {
    let addedCount = 0;
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            addedCount += mergeMissing(target[key], source[key]);
        } else {
            if (target[key] === undefined) {
                // Auto-fill with the English text but wrapped in [EN]
                // (or just the English text if we want them to render normally for now)
                target[key] = source[key];
                addedCount++;
            }
        }
    }
    return addedCount;
}

function main() {
    console.log('🌐 Running i18n Auto-Filler');
    const sourceData = loadLocale(SOURCE_LOCALE);

    const localeFiles = fs.readdirSync(LOCALES_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''))
        .filter(l => l !== SOURCE_LOCALE);

    for (const locale of localeFiles) {
        let targetData = loadLocale(locale);
        const added = mergeMissing(targetData, sourceData);
        if (added > 0) {
            saveLocale(locale, targetData);
            console.log(`✅ Filled ${added} missing keys in ${locale}.json`);
        } else {
            console.log(`✨ ${locale}.json is already at 100%`);
        }
    }
}

main();
