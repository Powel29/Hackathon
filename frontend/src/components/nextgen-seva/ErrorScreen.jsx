/**
 * ErrorScreen — Phase 1: Touch UX Hardening (UI-DES-009)
 *
 * Standardized error display with:
 * - Primary recovery CTA + secondary safe exit
 * - 80px touch targets
 * - Localized, plain-language messaging
 * - aria-live for screen reader announcement
 * - Technical details hidden (available in console)
 *
 * Variants: api (retryable) | validation | offline | fatal
 */

import { XCircle, WifiOff, AlertTriangle, ShieldAlert } from 'lucide-react';
import { TouchButton } from './TouchButton';
import { useTranslation } from 'react-i18next';

const VARIANT_CONFIG = {
    api: { icon: XCircle, color: '#DC3545', bgColor: 'bg-red-50' },
    validation: { icon: AlertTriangle, color: '#FF9800', bgColor: 'bg-orange-50' },
    offline: { icon: WifiOff, color: '#2563eb', bgColor: 'bg-blue-50' },
    fatal: { icon: ShieldAlert, color: '#DC3545', bgColor: 'bg-red-50' },
};

export function ErrorScreen({
    message,
    onRetry,
    onGoBack,
    onGoHome,
    variant = 'api',
    title,
}) {
    const { t } = useTranslation();
    const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.api;
    const Icon = config.icon;

    const defaultTitle = {
        api: t('error.apiTitle', 'Something went wrong'),
        validation: t('error.validationTitle', 'Please check your input'),
        offline: t('error.offlineTitle', 'No connection'),
        fatal: t('error.fatalTitle', 'Unexpected error'),
    };

    return (
        <div
            className="flex flex-col items-center gap-6 py-12 px-4"
            role="alert"
            aria-live="assertive"
        >
            <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center`}>
                <Icon className="w-12 h-12" style={{ color: config.color }} aria-hidden="true" />
            </div>

            <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold mb-2" style={{ color: config.color }}>
                    {title || defaultTitle[variant]}
                </h2>
                <p className="text-base text-gray-600 leading-relaxed">
                    {message || t('error.defaultMessage', 'Please try again or contact support.')}
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
                {onRetry && (
                    <TouchButton variant="primary" size="large" onClick={onRetry} className="w-full">
                        {t('retry', 'Try Again')}
                    </TouchButton>
                )}
                {onGoBack && (
                    <TouchButton variant="secondary" size="large" onClick={onGoBack} className="w-full">
                        {t('goBack', 'Go Back')}
                    </TouchButton>
                )}
                {onGoHome && (
                    <TouchButton variant="ghost" size="large" onClick={onGoHome} className="w-full">
                        {t('goHome', 'Return Home')}
                    </TouchButton>
                )}
                {!onRetry && !onGoBack && !onGoHome && (
                    <TouchButton
                        variant="primary"
                        size="large"
                        onClick={() => window.location.href = '/nextgen-seva'}
                        className="w-full"
                    >
                        {t('goHome', 'Return Home')}
                    </TouchButton>
                )}
            </div>
        </div>
    );
}
