/**
 * AccessibilityPanel — Phase 1: UI-DES-006
 *
 * Slide-in accessibility settings panel.
 * Triggered from KioskLayout footer. Accessible via keyboard (Escape to close).
 * Settings apply immediately via useAccessibilityStore.
 *
 * Controls:
 * - Text Size: Standard | Large | XL
 * - Contrast: Default | High
 * - Easy Mode: On/Off
 * - Voice Guidance: On/Off (gated behind feature flag)
 */

import { X, Type, Eye, Zap, Volume2 } from 'lucide-react';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { isFeatureEnabled } from '../../config/featureFlags';

export function AccessibilityPanel({ isOpen, onClose }) {
    const { t } = useTranslation();
    const panelRef = useRef(null);

    const {
        textSize, setTextSize,
        contrast, setContrast,
        easyMode, toggleEasyMode,
        voiceGuidance, toggleVoiceGuidance,
        resetToDefaults,
    } = useAccessibilityStore();

    const voiceEnabled = isFeatureEnabled('voice');

    // Focus trap + Escape to close
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);

        // Focus the panel when it opens
        panelRef.current?.focus();

        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const textSizes = [
        { value: 'standard', label: t('a11y.standard', 'Standard') },
        { value: 'large', label: t('a11y.large', 'Large') },
        { value: 'xl', label: t('a11y.extraLarge', 'Extra Large') },
    ];

    const contrastOptions = [
        { value: 'default', label: t('a11y.default', 'Default') },
        { value: 'high', label: t('a11y.highContrast', 'High Contrast') },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={t('a11y.accessibilitySettings', 'Accessibility Settings')}
                tabIndex={-1}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-[#212529]">
                        {t('a11y.accessibilitySettings', 'Accessibility')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                        style={{ touchAction: 'manipulation' }}
                        aria-label={t('common.close', 'Close')}
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-8">

                    {/* Text Size */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Type className="w-5 h-5 text-[#0066CC]" aria-hidden="true" />
                            <span className="font-semibold text-[#212529]">
                                {t('a11y.textSize', 'Text Size')}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {textSizes.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setTextSize(value)}
                                    className={[
                                        'flex-1 py-3 px-2 rounded-xl text-sm font-semibold transition-all',
                                        'min-h-[56px]',
                                        textSize === value
                                            ? 'bg-[#0066CC] text-white shadow-md'
                                            : 'bg-gray-100 text-[#212529] hover:bg-gray-200',
                                    ].join(' ')}
                                    style={{ touchAction: 'manipulation' }}
                                    aria-pressed={textSize === value}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contrast */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-5 h-5 text-[#0066CC]" aria-hidden="true" />
                            <span className="font-semibold text-[#212529]">
                                {t('a11y.contrast', 'Contrast')}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {contrastOptions.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setContrast(value)}
                                    className={[
                                        'flex-1 py-3 px-2 rounded-xl text-sm font-semibold transition-all',
                                        'min-h-[56px]',
                                        contrast === value
                                            ? 'bg-[#0066CC] text-white shadow-md'
                                            : 'bg-gray-100 text-[#212529] hover:bg-gray-200',
                                    ].join(' ')}
                                    style={{ touchAction: 'manipulation' }}
                                    aria-pressed={contrast === value}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Easy Mode Toggle */}
                    <div>
                        <button
                            onClick={toggleEasyMode}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors min-h-[64px]"
                            style={{ touchAction: 'manipulation' }}
                            aria-pressed={easyMode}
                        >
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-[#0066CC]" aria-hidden="true" />
                                <div className="text-left">
                                    <span className="font-semibold text-[#212529]">
                                        {t('a11y.easyMode', 'Easy Mode')}
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        {t('a11y.easyModeDesc', 'Simpler screens, fewer choices')}
                                    </p>
                                </div>
                            </div>
                            <div className={[
                                'w-12 h-7 rounded-full transition-colors flex items-center px-1',
                                easyMode ? 'bg-[#28A745]' : 'bg-gray-300',
                            ].join(' ')}>
                                <div className={[
                                    'w-5 h-5 rounded-full bg-white shadow transition-transform',
                                    easyMode ? 'translate-x-5' : 'translate-x-0',
                                ].join(' ')} />
                            </div>
                        </button>
                    </div>

                    {/* Voice Guidance Toggle (if feature enabled) */}
                    {voiceEnabled && (
                        <div>
                            <button
                                onClick={toggleVoiceGuidance}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors min-h-[64px]"
                                style={{ touchAction: 'manipulation' }}
                                aria-pressed={voiceGuidance}
                            >
                                <div className="flex items-center gap-3">
                                    <Volume2 className="w-5 h-5 text-[#0066CC]" aria-hidden="true" />
                                    <div className="text-left">
                                        <span className="font-semibold text-[#212529]">
                                            {t('a11y.voiceGuidance', 'Voice Guidance')}
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            {t('a11y.voiceDesc', 'Spoken instructions each step')}
                                        </p>
                                    </div>
                                </div>
                                <div className={[
                                    'w-12 h-7 rounded-full transition-colors flex items-center px-1',
                                    voiceGuidance ? 'bg-[#28A745]' : 'bg-gray-300',
                                ].join(' ')}>
                                    <div className={[
                                        'w-5 h-5 rounded-full bg-white shadow transition-transform',
                                        voiceGuidance ? 'translate-x-5' : 'translate-x-0',
                                    ].join(' ')} />
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 space-y-3">
                    <button
                        onClick={resetToDefaults}
                        className="w-full py-3 px-4 rounded-xl bg-gray-100 text-[#212529] font-semibold hover:bg-gray-200 transition-colors min-h-[56px]"
                        style={{ touchAction: 'manipulation' }}
                    >
                        {t('a11y.resetDefaults', 'Reset to Defaults')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 rounded-xl bg-[#0066CC] text-white font-semibold hover:bg-[#0052A3] transition-colors min-h-[56px]"
                        style={{ touchAction: 'manipulation' }}
                    >
                        {t('common.close', 'Close')}
                    </button>
                </div>
            </div>
        </>
    );
}
