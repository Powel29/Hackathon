import { useState } from 'react';
import LanguageSelector from '../components/common/LanguageSelector';
// import ServiceSelector from '../components/common/ServiceSelector';
import Login from '../components/auth/Login';
import { useTranslation } from 'react-i18next';

const HomePage = ({ onSelectService, onLogin }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState('language'); // language, service, login
    const [selectedService, setSelectedService] = useState(null);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        onSelectService(service);
        setStep('login');
    };

    const handleLoginSuccess = (user) => {
        onLogin(user);
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-primary text-white p-6">
                <h1 className="text-kiosk-xl font-bold text-center">
                    {t('welcome')}
                </h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-8">
                    {step === 'language' && (
                        <>
                            <h2 className="text-kiosk-lg font-bold text-center mb-8">
                                {t('selectLanguage')}
                            </h2>
                            <LanguageSelector />
                            <button
                                onClick={() => setStep('service')}
                                className="mt-8 w-full bg-primary text-white p-6 
                           rounded-xl text-kiosk-lg font-bold"
                            >
                                Continue
                            </button>
                        </>
                    )}

                    {step === 'service' && (
                        <>
                            <h2 className="text-kiosk-lg font-bold text-center mb-8">
                                {t('selectService')}
                            </h2>
                            <ServiceSelector onSelectService={handleServiceSelect} />
                        </>
                    )}

                    {step === 'login' && (
                        <Login
                            utilityType={selectedService}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p className="text-kiosk-sm">
                    Powered by C-DAC | Smart City 2.0
                </p>
            </footer>
        </div>
    );
};

export default HomePage;
