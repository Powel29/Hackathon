/**
 * LocalizedErrorBlock — Phase 3: Accessibility & Inclusion (FR-A11Y-002, UI-DES-009)
 *
 * Reusable, ARIA-announced error/recovery block.
 * Supports 4 error types defined in PRD UI-DES-009:
 *   - 'api'        → Retryable API error
 *   - 'validation' → Inline input validation error
 *   - 'offline'    → Offline / queue-required action notice
 *   - 'fatal'      → Unrecoverable error with safe exit
 *
 * Accessibility:
 *   - role="alert" + aria-live="assertive" → announced immediately to screen readers
 *   - Localized title + message via i18next
 *   - Primary recovery CTA + secondary safe exit
 *   - No raw technical error details shown to user
 *   - Icon + color pairing (never color-only — colorblind safe)
 *
 * Usage:
 *   <LocalizedErrorBlock
 *     type="api"
 *     messageKey="errors.paymentFailed"
 *     defaultMessage="Payment failed. Please try again."
 *     onRetry={() => retryPayment()}
 *     onExit={() => navigate('/kiosk')}
 *   />
 */

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAnnounce } from '../../providers/AccessibilityProvider';

// ─── Error Type Config ─────────────────────────────────────────────────────

const ERROR_CONFIGS = {
    api: {
        icon: '⚠️',
        bgClass: 'bg-amber-50 border-amber-300',
        iconBgClass: 'bg-amber-100',
        titleColor: 'text-amber-800',
        textColor: 'text-amber-700',
        defaultTitleKey: 'errors.apiErrorTitle',
        defaultTitle: 'Something went wrong',
        defaultMessageKey: 'errors.apiErrorMessage',
        defaultMessage: 'We could not complete your request. Please try again.',
        retryLabel: 'errors.retry',
        retryDefault: 'Try Again',
        exitLabel: 'errors.goHome',
        exitDefault: 'Go to Home',
    },
    validation: {
        icon: '❗',
        bgClass: 'bg-red-50 border-red-300',
        iconBgClass: 'bg-red-100',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
        defaultTitleKey: 'errors.validationTitle',
        defaultTitle: 'Please check your input',
        defaultMessageKey: 'errors.validationMessage',
        defaultMessage: 'Some fields need your attention before continuing.',
        retryLabel: 'errors.fixInput',
        retryDefault: 'Check again',
        exitLabel: 'errors.goBack',
        exitDefault: 'Go Back',
    },
    offline: {
        icon: '📡',
        bgClass: 'bg-blue-50 border-blue-300',
        iconBgClass: 'bg-blue-100',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
        defaultTitleKey: 'errors.offlineTitle',
        defaultTitle: 'You are offline',
        defaultMessageKey: 'errors.offlineMessage',
        defaultMessage: 'This action has been saved and will sync automatically when you are back online.',
        retryLabel: 'errors.retryNow',
        retryDefault: 'Retry Now',
        exitLabel: 'errors.continueOffline',
        exitDefault: 'Continue Offline',
    },
    fatal: {
        icon: '🚫',
        bgClass: 'bg-red-50 border-red-400',
        iconBgClass: 'bg-red-100',
        titleColor: 'text-red-900',
        textColor: 'text-red-700',
        defaultTitleKey: 'errors.fatalTitle',
        defaultTitle: 'Unable to continue',
        defaultMessageKey: 'errors.fatalMessage',
        defaultMessage: 'A critical error occurred. Please restart your session or contact support.',
        retryLabel: 'errors.startOver',
        retryDefault: 'Start Over',
        exitLabel: 'errors.contactSupport',
        exitDefault: 'Contact Support',
    },
};

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * @param {{
 *   type?: 'api'|'validation'|'offline'|'fatal'
 *   titleKey?: string
 *   title?: string
 *   messageKey?: string
 *   message?: string
 *   onRetry?: Function
 *   onExit?: Function
 *   retryLabel?: string
 *   exitLabel?: string
 *   showDetails?: boolean
 *   technicalDetails?: string   // only shown in support/admin mode
 *   compact?: boolean           // smaller layout for inline use
 *   className?: string
 * }} props
 */
export function LocalizedErrorBlock({
    type = 'api',
    titleKey,
    title,
    messageKey,
    message,
    onRetry,
    onExit,
    retryLabel,
    exitLabel,
    technicalDetails,
    compact = false,
    className = '',
}) {
    const { t } = useTranslation();
    const announce = useAnnounce();
    const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.api;

    // Resolve display text: explicit prop → i18n key → config default
    const displayTitle = title || t(titleKey || config.defaultTitleKey, config.defaultTitle);
    const displayMessage = message || t(messageKey || config.defaultMessageKey, config.defaultMessage);
    const displayRetryLabel = retryLabel || t(config.retryLabel, config.retryDefault);
    const displayExitLabel = exitLabel || t(config.exitLabel, config.exitDefault);

    // Announce to screen readers immediately on render
    useEffect(() => {
        announce(`${displayTitle}. ${displayMessage}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayTitle, displayMessage]);

    if (compact) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className={`flex items-start gap-3 p-4 rounded-xl border ${config.bgClass} ${className}`}
            >
                <span className="text-xl flex-shrink-0" aria-hidden="true">{config.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${config.titleColor}`}>{displayTitle}</p>
                    <p className={`text-sm mt-0.5 ${config.textColor}`}>{displayMessage}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className={`mt-2 text-sm font-semibold underline ${config.titleColor} hover:opacity-80`}
                            style={{ touchAction: 'manipulation' }}
                        >
                            {displayRetryLabel}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`rounded-2xl border-2 p-6 ${config.bgClass} ${className}`}
        >
            {/* Icon + Title */}
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full ${config.iconBgClass} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl" aria-hidden="true">{config.icon}</span>
                </div>
                <div>
                    <h2 className={`text-xl font-bold ${config.titleColor}`}>{displayTitle}</h2>
                </div>
            </div>

            {/* Message */}
            <p className={`text-base ${config.textColor} mb-6 leading-relaxed`}>
                {displayMessage}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex-1 py-4 px-6 rounded-xl font-semibold text-base bg-white border-2 border-current transition-all hover:opacity-90 active:scale-95 min-h-[56px]"
                        style={{ touchAction: 'manipulation', color: 'inherit' }}
                        aria-label={displayRetryLabel}
                    >
                        {displayRetryLabel}
                    </button>
                )}
                {onExit && (
                    <button
                        onClick={onExit}
                        className={`flex-1 py-4 px-6 rounded-xl font-semibold text-base text-white transition-all hover:opacity-90 active:scale-95 min-h-[56px] ${type === 'fatal' ? 'bg-red-700' :
                                type === 'offline' ? 'bg-blue-600' :
                                    type === 'validation' ? 'bg-red-600' :
                                        'bg-amber-600'
                            }`}
                        style={{ touchAction: 'manipulation' }}
                        aria-label={displayExitLabel}
                    >
                        {displayExitLabel}
                    </button>
                )}
            </div>

            {/* Technical details — support mode only, hidden from citizen view */}
            {technicalDetails && import.meta.env.DEV && (
                <details className="mt-4">
                    <summary className={`text-xs ${config.textColor} cursor-pointer opacity-60 hover:opacity-100`}>
                        Developer details
                    </summary>
                    <pre className="mt-2 text-xs bg-black bg-opacity-10 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                        {technicalDetails}
                    </pre>
                </details>
            )}
        </div>
    );
}
