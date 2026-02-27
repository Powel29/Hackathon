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

import { useState, useEffect } from 'react';
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
import nextgenSevaLogo from '../../assets/logo2.png';

export function KioskLayout({
    children,
    showLanguageSwitch = true,
    showHeader = true,
    showFooter = true,
}) {
    const { i18n } = useTranslation();
    const { language, setLanguage } = useKioskStore();
    const [a11yPanelOpen, setA11yPanelOpen] = useState(false);
    const [syncQueueOpen, setSyncQueueOpen] = useState(false);
    const [now, setNow] = useState(new Date());
    const { isOnline } = useNetworkStatus();
    const pendingCount = useOfflineStore(s => (s.syncStats.pending || 0) + (s.syncStats.retrying || 0));

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

    // Kiosk lockdown class on body (FR-UX-004)
    useEffect(() => {
        if (ENV.kioskLockdown) {
            document.body.classList.add('kiosk-lockdown');
        }
        return () => document.body.classList.remove('kiosk-lockdown');
    }, []);

    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            {/* Network Status Banner — persistent when not online */}
            <NetworkStatusBanner onOpenQueue={() => setSyncQueueOpen(true)} />

            {showHeader && (
                <header className="bg-white border-b border-gray-200 sm:static sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                        {/* Left: Logo + Branding */}
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 shrink-0">
                                <img src={nextgenSevaLogo} alt="NextGen Seva Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-[#0066CC] leading-tight">NextGen Seva</h1>
                                <p className="text-xs text-gray-500 hidden sm:block">Smart Urban Digital Helpdesk</p>
                            </div>
                        </div>

                        {/* Right: Language + Network Dot + Clock */}
                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            {/* Network status dot */}
                            <div
                                className="flex items-center gap-1.5"
                                aria-label={isOnline ? 'Online' : 'Offline'}
                                title={isOnline ? 'Online' : 'Offline'}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]'}`} />
                                <span className="text-sm font-semibold text-gray-600 tracking-wide">{isOnline ? 'Online' : 'Offline'}</span>
                            </div>

                            {/* Clock */}
                            <div className="flex items-center gap-1 text-gray-500 easy-mode-hide hidden sm:flex">
                                <Clock className="w-4 h-4" aria-hidden="true" />
                                <span className="text-sm font-medium">{timeString}</span>
                            </div>

                            {/* Language Selector */}
                            {showLanguageSwitch && (
                                <div className="flex items-center gap-1.5">
                                    <Languages className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <select
                                        id="language-select"
                                        value={language}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="px-2 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066CC] min-h-[36px]"
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

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6" role="main">
                {children}
            </main>

            {/* Footer with Accessibility + Help Controls */}
            {showFooter && (
                <footer className="bg-white border-t border-gray-200 py-3 sm:static sticky bottom-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                        {/* Left: Home + Help */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.location.href = '/nextgen-seva'}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px]"
                                style={{ touchAction: 'manipulation' }}
                                aria-label="Go to Home"
                            >
                                <Home className="w-4 h-4" aria-hidden="true" />
                                <span className="easy-mode-hide hidden lg:inline">Home</span>
                            </button>
                            <button
                                onClick={() => {/* Help modal — Phase 3 */ }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px]"
                                style={{ touchAction: 'manipulation' }}
                                aria-label="Help"
                            >
                                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                                <span className="easy-mode-hide hidden lg:inline">Help</span>
                            </button>
                        </div>

                        {/* Center: Voice Assist (Phase 4) */}
                        <div className="flex-1 flex justify-center">
                            <VoiceAssistWidget />
                        </div>

                        {/* Center: Credits */}
                        <p className="text-xs text-gray-400 easy-mode-hide hidden md:block">
                            © 2026 NextGen Seva | Government of India
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
                                <span className="hidden lg:inline">Accessibility</span>
                            </button>

                            <button
                                onClick={() => setSyncQueueOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors min-h-[44px] relative"
                                style={{ touchAction: 'manipulation' }}
                                aria-label="View Queue"
                            >
                                <Database className="w-5 h-5" aria-hidden="true" />
                                <span className="easy-mode-hide hidden lg:inline">Queue</span>
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

            {/* Sync Queue Panel Overlay */}
            <SyncQueuePanel
                isOpen={syncQueueOpen}
                onClose={() => setSyncQueueOpen(false)}
            />
        </div>
    );
}
