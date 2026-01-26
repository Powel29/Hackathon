import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
        { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
    ];

    return (
        <div className="grid grid-cols-3 gap-6 p-8">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`
               p-8 rounded-xl text-kiosk-lg font-bold
               transition-all duration-200
               ${i18n.language === lang.code
                            ? 'bg-primary text-white scale-105'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }
             `}
                >
                    <div className="text-6xl mb-4">{lang.flag}</div>
                    <div>{lang.name}</div>
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;