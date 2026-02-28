import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/nextgen-seva/KioskLayout';
import { ServiceCard } from '../../components/nextgen-seva/ServiceCard';
import { Zap, Flame, Droplets, Building2, ArrowLeft, WifiOff, Clock } from 'lucide-react';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useVoiceCommand } from '../../core/voice/useVoiceCommand';

export function ServiceSelection() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setSelectedService, isAuthenticated } = useKioskStore();
    const { isOnline } = useNetworkStatus();

    useVoiceCommand({
        'back': () => navigate('/nextgen-seva/login-register'),
        'select-number': (cmd) => {
            const index = cmd.value - 1;
            if (index >= 0 && index < services.length) {
                handleServiceSelect(services[index].id);
            }
        },
        'pay-bill': () => handleServiceSelect('electricity'), // Default or contextual
        'register-complaint': () => handleServiceSelect('municipal'),
    });


    // Check if user is authenticated, if not redirect to login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/nextgen-seva/login-register');
        }
    }, [isAuthenticated, navigate]);

    const services = [
        {
            id: 'electricity',
            icon: <Zap className="w-8 h-8" />,
            color: '#FFD700',
            title: t('dashboard.electricity')
        },
        {
            id: 'gas',
            icon: <Flame className="w-8 h-8" />,
            color: '#FF6347',
            title: t('dashboard.gas')
        },
        {
            id: 'water',
            icon: <Droplets className="w-8 h-8" />,
            color: '#1E90FF',
            title: t('dashboard.water')
        },
        {
            id: 'municipal',
            icon: <Building2 className="w-8 h-8" />,
            color: '#32CD32',
            title: t('dashboard.municipal')
        }
    ];

    const handleServiceSelect = (serviceId) => {
        setSelectedService(serviceId);
        // Navigate to department verification screen
        navigate('/nextgen-seva/department-verification');
    };

    return (
        <KioskLayout>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/nextgen-seva/login-register')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm rounded-xl px-4 py-2 hover:bg-gray-100 transition-colors min-h-[44px]"
                    style={{ touchAction: 'manipulation' }}
                    aria-label={t('common.back')}
                >
                    <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                    {t('common.back')}
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#212529] mb-2">
                        {t('dashboard.selectService')}
                    </h2>
                    <p className="text-gray-600">
                        {t('serviceSelection.pleaseSelectService')}
                    </p>
                </div>

                {!isOnline && (
                    <div className="mb-8 bg-orange-600 text-white rounded-2xl shadow-lg p-5 flex items-center justify-between overflow-hidden relative border-2 border-orange-500">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <WifiOff className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase tracking-wider text-sm">Offline Session Profile</h3>
                                <p className="text-xs opacity-90 font-medium italic">Hardware is currently disconnected. Transactions will be queued for later sync.</p>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                            <Clock className="w-24 h-24 text-white" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            icon={service.icon}
                            title={service.title}
                            color={service.color}
                            onClick={() => handleServiceSelect(service.id)}
                        />
                    ))}
                </div>
            </div>
        </KioskLayout>
    );
}
