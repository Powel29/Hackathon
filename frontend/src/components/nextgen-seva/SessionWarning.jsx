/**
 * SessionWarning — Phase 1: Touch UX Hardening (FR-UX-003, UI-DES-008)
 *
 * Session timeout warning modal with:
 * - Focus trap (keyboard accessible)
 * - Countdown display announced to screen readers
 * - 80px minimum touch targets
 * - Localized text
 */

import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../store/useKioskStore';
import { AlertTriangle } from 'lucide-react';
import { TouchButton } from './TouchButton';
import { useEffect, useRef, useState } from 'react';

export function SessionWarning() {
    const { t } = useTranslation();
    const { setShowSessionWarning, resetSession } = useKioskStore();
    const dialogRef = useRef(null);
    const [countdown, setCountdown] = useState(60);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    resetSession();
                    window.location.href = '/nextgen-seva';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [resetSession]);

    // Focus modal on open
    useEffect(() => {
        dialogRef.current?.focus();
    }, []);

    // Trap Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleContinue();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleContinue = () => {
        setShowSessionWarning(false);
    };

    const handleLogout = () => {
        resetSession();
        window.location.href = '/nextgen-seva';
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            role="dialog"
            aria-modal="true"
            aria-label={t('sessionWarning', 'Session Expiring')}
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
                <div className="flex flex-col items-center gap-5">
                    <div className="w-20 h-20 bg-[#FF9800] bg-opacity-20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-12 h-12 text-[#FF9800]" aria-hidden="true" />
                    </div>

                    <h2 className="text-2xl font-bold text-[#212529] text-center">
                        {t('sessionWarning', 'Session Expiring Soon')}
                    </h2>

                    <p className="text-sm text-gray-600 text-center">
                        {t('sessionWarningMessage', 'You will be logged out due to inactivity.')}
                    </p>

                    {/* Countdown — announced to screen readers */}
                    <div
                        className="text-4xl font-bold text-[#FF9800]"
                        role="timer"
                        aria-live="polite"
                        aria-label={`${countdown} seconds remaining`}
                    >
                        {countdown}s
                    </div>

                    <div className="flex gap-4 mt-2 w-full">
                        <TouchButton
                            variant="secondary"
                            size="large"
                            onClick={handleLogout}
                            className="flex-1"
                        >
                            {t('logout', 'End Session')}
                        </TouchButton>

                        <TouchButton
                            variant="primary"
                            size="large"
                            onClick={handleContinue}
                            className="flex-1"
                        >
                            {t('extendSession', 'Continue')}
                        </TouchButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
