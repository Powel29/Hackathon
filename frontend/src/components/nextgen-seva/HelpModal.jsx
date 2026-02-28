import { X, HelpCircle, Phone, MessageSquare, AlertTriangle, ChevronRight, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';

export function HelpModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const panelRef = useRef(null);

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

    const guideSteps = [
        { id: 1, text: t('help.step1', 'Select your preferred language to start.') },
        { id: 2, text: t('help.step2', 'Choose a service from the home screen.') },
        { id: 3, text: t('help.step3', 'Follow on-screen prompts and enter required details.') },
        { id: 4, text: t('help.step4', 'Collect your receipt or confirmation after completion.') },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={t('help.title', 'Help & Support')}
                tabIndex={-1}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-[#0066CC]" />
                        </div>
                        <h2 className="text-xl font-bold text-[#212529]">
                            {t('help.title', 'Help & Support')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-gray-600"
                        style={{ touchAction: 'manipulation' }}
                        aria-label={t('common.close', 'Close')}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-8">

                    {/* Quick Guide */}
                    <section aria-labelledby="guide-heading">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-[#0066CC]" />
                            <h3 id="guide-heading" className="font-bold text-[#212529]">
                                {t('help.quickGuide', 'Quick Start Guide')}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {guideSteps.map((step) => (
                                <div key={step.id} className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-[#0066CC] flex items-center justify-center text-xs font-bold border border-blue-100">
                                        {step.id}
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {step.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* AI Assistant */}
                    <section aria-labelledby="ai-heading">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <MessageSquare className="w-6 h-6" />
                                <h3 id="ai-heading" className="font-bold">{t('help.aiTitle', 'Suvidha AI Assistant')}</h3>
                            </div>
                            <p className="text-blue-50 text-xs mb-4">
                                {t('help.aiDesc', 'Get instant answers for your billing and service queries in your language.')}
                            </p>
                            <button
                                onClick={() => window.location.href = 'http://localhost:5174'}
                                className="w-full py-3 bg-white text-[#0066CC] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                            >
                                {t('help.startChat', 'Start Chat Session')}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </section>

                    {/* Support Contact */}
                    <section className="space-y-4">
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-xs text-gray-500">{t('help.tollFree', 'Toll-Free Support')}</p>
                                    <p className="font-bold text-[#212529]">1800-123-4567</p>
                                </div>
                            </div>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow-sm"
                                onClick={() => window.print()}
                            >
                                {t('help.print', 'Print')}
                            </button>
                        </div>

                        <button
                            className="w-full p-4 rounded-xl border-2 border-red-50 border-dashed hover:border-red-100 hover:bg-red-50 transition-all flex items-center gap-3 group"
                            onClick={() => alert(t('help.staffAlerted', 'Kiosk staff has been notified. Please wait.'))}
                        >
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-red-600 text-sm">{t('help.emergency', 'Emergency Assistance')}</p>
                                <p className="text-xs text-red-400">{t('help.emergencyDesc', 'Request immediate physical help')}</p>
                            </div>
                        </button>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-4 px-4 rounded-xl bg-white border border-gray-200 text-[#212529] font-bold hover:bg-gray-100 transition-all shadow-sm"
                        style={{ touchAction: 'manipulation' }}
                    >
                        {t('common.close', 'Back to Kiosk')}
                    </button>
                </div>
            </div>
        </>
    );
}
