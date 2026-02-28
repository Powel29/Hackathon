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
        <KioskLayout showLanguageSwitch={false} showHeader={false} mainClassName="px-2 py-1 sm:px-3 sm:py-2 overflow-hidden">
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#0066CC] to-[#004080] overflow-hidden">
                <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 md:p-5 max-w-4xl w-full mx-2 sm:mx-4 h-full max-h-full min-h-0 overflow-hidden flex flex-col">
                    <div className="flex flex-col items-center justify-center gap-0 mb-3 sm:mb-4 text-center shrink-0">
                        <div className="w-44 sm:w-52 md:w-60 flex items-center justify-center">
                            <img src={nextgenSevaLogo} alt="NextGen Seva Logo" className="w-full h-auto object-contain block mx-auto" />
                        </div>
                        <p className="text-sm text-gray-600 -mt-4 sm:-mt-5">Government of India</p>
                    </div>

                    <div className="border-t-2 border-[#0066CC] my-2 sm:my-3 shrink-0"></div>

                    <h2 className="text-lg sm:text-xl font-bold text-center text-[#212529] mb-2 sm:mb-3 shrink-0">
                        {t('language.selectLanguage')}
                    </h2>

                    <div className="grid grid-cols-4 auto-rows-fr gap-2 sm:gap-3 mb-3 sm:mb-4 shrink-0">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                aria-pressed={language === lang.code}
                                aria-label={`${lang.nativeName} (${lang.name})`}
                                className={`h-full bg-white border-2 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-all hover:shadow-md min-h-[72px] sm:min-h-[80px] ${language === lang.code
                                    ? 'border-[#0066CC] shadow-md bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base sm:text-lg font-bold ${language === lang.code
                                    ? 'bg-[#0066CC] text-white'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {lang.nativeName.charAt(0)}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm sm:text-base font-bold text-[#212529] leading-tight">
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
                        size="medium"
                        onClick={handleContinue}
                        className="w-full shrink-0"
                    >
                        {t('language.continue')}
                    </TouchButton>

                </div>
            </div>
        </KioskLayout>
    );
}
