import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/nextgen-seva/KioskLayout';
import { TouchButton } from '../../components/nextgen-seva/TouchButton';
import nextgenSevaLogo from '../../assets/logo2.png';

export function LanguageSelection() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
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

    const handleLanguageSelect = (langCode) => {
        setLanguage(langCode);
        i18n.changeLanguage(langCode);
    };

    const handleContinue = () => {
        navigate('/nextgen-seva/login-register');
    };

    return (
        <KioskLayout showLanguageSwitch={false} showHeader={false}>
            <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-gradient-to-br from-[#0066CC] to-[#004080]">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full mx-4">
                    <div className="flex flex-col items-center justify-center gap-4 mb-8">
                        <div className="w-32 h-32 flex items-center justify-center overflow-hidden">
                            <img src={nextgenSevaLogo} alt="NextGen Seva Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-[#212529]">NextGen Seva</h1>
                            <p className="text-sm text-gray-600 mt-1">Government of India</p>
                        </div>
                    </div>

                    <div className="border-t-2 border-[#0066CC] my-6"></div>

                    <h2 className="text-2xl font-bold text-center text-[#212529] mb-8">
                        {t('language.selectLanguage')}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                aria-pressed={language === lang.code}
                                aria-label={`${lang.nativeName} (${lang.name})`}
                                className={`bg-white border-2 rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md min-h-[100px] ${language === lang.code
                                    ? 'border-[#0066CC] shadow-md bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${language === lang.code
                                    ? 'bg-[#0066CC] text-white'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {lang.nativeName.charAt(0)}
                                </div>
                                <div className="text-center">
                                    <p className="text-base font-bold text-[#212529]">
                                        {lang.nativeName}
                                    </p>
                                    <p className="text-xs text-gray-500">{lang.name}</p>
                                </div>
                                {language === lang.code && (
                                    <div className="w-5 h-5 bg-[#28A745] rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs" aria-hidden="true">✓</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>


                    <TouchButton
                        variant="primary"
                        size="large"
                        onClick={handleContinue}
                        className="w-full"
                    >
                        {t('language.continue')}
                    </TouchButton>

                    <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
                        Touch your preferred language to continue<br />
                        अपनी पसंदीदा भाषा को स्पर्श करें | ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಸ್ಪರ್ಶಿಸಿ<br />
                        உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்
                    </p>
                </div>
            </div>
        </KioskLayout>
    );
}
