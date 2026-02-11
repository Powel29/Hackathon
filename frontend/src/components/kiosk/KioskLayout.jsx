import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../store/useKioskStore';
import { Languages } from 'lucide-react';

export function KioskLayout({
    children,
    showLanguageSwitch = true,
    showHeader = true
}) {
    const { t, i18n } = useTranslation();
    const { language, setLanguage } = useKioskStore();

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
        { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
    ];

    const handleLanguageChange = (langCode) => {
        setLanguage(langCode);
        i18n.changeLanguage(langCode);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            {showHeader && (
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0066CC] rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg font-bold">S</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-[#212529]">SUVIDHA</h1>
                                <p className="text-xs text-gray-600">Smart Urban Digital Helpdesk</p>
                            </div>
                        </div>

                        {showLanguageSwitch && (
                            <div className="flex items-center gap-2">
                                <Languages className="w-4 h-4 text-gray-600" aria-hidden="true" />
                                <select
                                    id="language-select"
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                                >
                                    {languages.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.nativeName} ({lang.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </header>
            )}

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-600">
                        Government of India | Ministry of Urban Development
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        © 2026 SUVIDHA. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
