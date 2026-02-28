/**
 * KioskLayout — Phase 1: Touch UX Hardening (UI-DES-001)
 *
 * Global kiosk shell layout per PRD wireframe:
 * ┌───────────────────────────────────────────────────────────────┐
 * │ [Network Status Banner — only when not online]                │
 * ├───────────────────────────────────────────────────────────────┤
 * │ Header: Logo | Current Language | Network dot | Time          │
 * ├───────────────────────────────────────────────────────────────┤
 * │ Main Content Area (single primary task)                       │
 * ├───────────────────────────────────────────────────────────────┤
 * │ Footer: Help/Home | Accessibility | Back (policy)             │
 * └───────────────────────────────────────────────────────────────┘
 *
 * Includes:
 * - NetworkStatusBanner (FR-OFF-001)
 * - AccessibilityPanel trigger (UI-DES-006)
 * - Kiosk lockdown class application (FR-UX-004)
 * - SyncQueuePanel trigger (UI-DES-005)
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../store/useKioskStore';
import { Languages, Accessibility, Clock, Home, HelpCircle, Database } from 'lucide-react';
import { NetworkStatusBanner } from './NetworkStatusBanner';
import { AccessibilityPanel } from './AccessibilityPanel';
import { SyncQueuePanel } from './SyncQueuePanel';
import { VoiceAssistWidget } from './VoiceAssistWidget';
import { useVoiceCommand } from '../../core/voice/useVoiceCommand';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
import { ENV } from '../../config/env';

export function KioskLayout({
    children,
    showLanguageSwitch = true,
    showHeader = true,
    showFooter = true,
    mainBottomOffset = '9rem',
    mainBottomOffsetDesktop,
    mainClassName = '',
}) {
    const { i18n } = useTranslation();
    const { language, setLanguage } = useKioskStore();
    const [a11yPanelOpen, setA11yPanelOpen] = useState(false);
    const [syncQueueOpen, setSyncQueueOpen] = useState(false);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [now, setNow] = useState(new Date());
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const [topBarHeight, setTopBarHeight] = useState(0);
    const topBarRef = useRef(null);
    const { isOnline } = useNetworkStatus();
    const pendingCount = useOfflineStore(s => (s.syncStats.pending || 0) + (s.syncStats.retrying || 0));
    const mainPaddingForFooter = showFooter ? 'pb-32 sm:pb-24' : '';
    const effectiveMainBottomOffset = (isDesktop && typeof mainBottomOffsetDesktop === 'string')
        ? mainBottomOffsetDesktop
        : mainBottomOffset;

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
        { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
        { code: 'mr', name: 'Marathi', nativeName: 'ಮರಾठी' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
    ];

    const handleLanguageChange = (langCode) => {
        setLanguage(langCode);
        i18n.changeLanguage(langCode);
    };

    useVoiceCommand({
        'home': () => window.location.href = '/nextgen-seva',
        'back': () => window.history.back(),
        'change-language': () => {
            const nextIdx = (languages.findIndex(l => l.code === language) + 1) % languages.length;
            handleLanguageChange(languages[nextIdx].code);
        },
        'help': () => {
            // Future help modal toggle
        }
    });

    // Live clock in header
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000); // update every 30s
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!topBarRef.current) return;

        const updateTopBarHeight = () => {
            setTopBarHeight(topBarRef.current?.getBoundingClientRect().height || 0);
        };

        updateTopBarHeight();

        const observer = new ResizeObserver(() => updateTopBarHeight());
        observer.observe(topBarRef.current);
        window.addEventListener('resize', updateTopBarHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateTopBarHeight);
        };
    }, [showHeader, showLanguageSwitch, isOnline, language]);

    // Kiosk lockdown class on body (FR-UX-004)
    useEffect(() => {
        if (ENV.kioskLockdown) {
            document.body.classList.add('kiosk-lockdown');
        }
        return () => document.body.classList.remove('kiosk-lockdown');
    }, []);

    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <div ref={topBarRef} className="fixed top-0 left-0 right-0 z-50">
                {/* Network Status Banner — persistent when not online */}
                <NetworkStatusBanner onOpenQueue={() => setSyncQueueOpen(true)} />

                {showHeader && (
                    <header className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
                        {/* Left: Logo + Branding */}
                        <div className="flex items-center shrink-0 min-w-0">
                            <img
                                src="/logo.svg"
                                alt="NextGen Seva Logo"
                                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[42vw] sm:max-w-[280px] object-contain"
                            />
                        </div>

                        {/* Right: Language + Network Dot + Clock */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0 flex-wrap justify-end">
                            {/* Network status dot */}
                            <div
                                className="flex items-center gap-1.5"
                                aria-label={isOnline ? 'Online' : 'Offline'}
                                title={isOnline ? 'Online' : 'Offline'}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]'}`} />
                                <span className="text-[11px] sm:text-sm font-semibold text-gray-600 tracking-wide whitespace-nowrap">{isOnline ? 'Online' : 'Offline'}</span>
                            </div>

                            {/* Clock */}
                            <div className="flex items-center gap-1 text-gray-500" aria-label={`Local date and time ${dateString} ${timeString}`} title={`Local date and time ${dateString} ${timeString}`}>
                                <Clock className="w-4 h-4" aria-hidden="true" />
                                <span className="text-[10px] sm:text-sm font-medium whitespace-nowrap">{dateString} • {timeString}</span>
                            </div>

                            {/* Language Selector */}
                            {showLanguageSwitch && (
                                <div className="flex items-center gap-1.5">
                                    <Languages className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <select
                                        id="language-select"
                                        value={language}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="px-2 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066CC] min-h-[36px] max-w-[120px] sm:max-w-none"
                                        style={{ touchAction: 'manipulation' }}
                                        aria-label="Select Language"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.code} value={lang.code} className="text-gray-800 bg-white">
                                                {lang.nativeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    </header>
                )}
            </div>

            {/* Main Content */}
            <main
                className={`flex-1 max-w-7xl mx-auto w-full px-4 py-6 ${mainPaddingForFooter} ${mainClassName}`.trim()}
                style={{
                    paddingTop: `${topBarHeight}px`,
                    ...(showFooter ? { paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${effectiveMainBottomOffset})` } : {})
                }}
                role="main"
            >
                {children}
            </main>

            {/* Footer with Accessibility + Help Controls */}
            {showFooter && (
                <footer
                    className="bg-white border-t border-gray-200 py-3 fixed bottom-0 left-0 right-0 z-40"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
                >
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between relative">
                        {/* Left: Home + Help */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.location.href = '/nextgen-seva'}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px]"
                                style={{ touchAction: 'manipulation' }}
                                aria-label="Go to Home"
                            >
                                <Home className="w-4 h-4" aria-hidden="true" />
                                <span className="desktop-only-label">Home</span>
                            </button>
                            <button
                                onClick={() => setHelpModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px]"
                                style={{ touchAction: 'manipulation' }}
                                aria-label="Help"
                            >
                                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                                <span className="desktop-only-label">Help</span>
                            </button>
                        </div>

                        {/* Center: Voice Assist (Phase 4) */}
                        <div className="flex-1 flex justify-center">
                            <VoiceAssistWidget />
                        </div>

                        {/* Center: Credits */}
                        <p className="hidden md:block text-[11px] lg:text-xs text-gray-400 easy-mode-hide absolute left-1/2 -translate-x-1/2 whitespace-nowrap max-w-[42%] text-center pointer-events-none">
                            © 2026 SUVIDHA | Government of India
                        </p>

                        {/* Right: Accessibility + Queue */}
                        <div className="flex items-center gap-2 justify-end">
                            <button
                                onClick={() => setA11yPanelOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#0066CC] hover:bg-blue-50 transition-colors min-h-[44px]"
                                style={{ touchAction: 'manipulation' }}
                                aria-label="Accessibility Settings"
                            >
                                <Accessibility className="w-5 h-5" aria-hidden="true" />
                                <span className="desktop-only-label">Accessibility</span>
                            </button>

                            <button
                                onClick={() => setSyncQueueOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px] relative"
                                style={{ touchAction: 'manipulation' }}
                                aria-label="View Queue"
                            >
                                <Database className="w-5 h-5" aria-hidden="true" />
                                <span className="desktop-only-label">Queue</span>
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </footer>
            )}

            {/* Accessibility Panel Overlay */}
            <AccessibilityPanel
                isOpen={a11yPanelOpen}
                onClose={() => setA11yPanelOpen(false)}
            />

            {/* Help Modal */}
            {helpModalOpen && (
                <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center p-4" onClick={() => setHelpModalOpen(false)}>
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-5"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Help and Contact"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900">Help & Support</h3>
                            <button
                                onClick={() => setHelpModalOpen(false)}
                                className="px-2 py-1 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
                                aria-label="Close help popup"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-1">Helpline Number</p>
                                <p className="text-base font-bold text-blue-900">1800-XXX-XXXX</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">Contact Email</p>
                                <p className="text-base font-semibold text-gray-900">support@nextgenseva.gov.in</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Queue Panel Overlay */}
            <SyncQueuePanel
                isOpen={syncQueueOpen}
                onClose={() => setSyncQueueOpen(false)}
            />
        </div>
    );
}
