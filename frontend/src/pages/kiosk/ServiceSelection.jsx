import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { ServiceCard } from '../../components/kiosk/ServiceCard';
import { Zap, Flame, Droplets, Building2, ArrowLeft } from 'lucide-react';

export function ServiceSelection() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setSelectedService, isAuthenticated } = useKioskStore();


    // Check if user is authenticated, if not redirect to login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/kiosk/login-register');
        }
    }, [isAuthenticated, navigate]);

    const services = [
        {
            id: 'electricity',
            icon: <Zap className="w-8 h-8" />,
            color: '#FFD700',
            title: t('electricity')
        },
        {
            id: 'gas',
            icon: <Flame className="w-8 h-8" />,
            color: '#FF6347',
            title: t('gas')
        },
        {
            id: 'water',
            icon: <Droplets className="w-8 h-8" />,
            color: '#1E90FF',
            title: t('water')
        },
        {
            id: 'municipal',
            icon: <Building2 className="w-8 h-8" />,
            color: '#32CD32',
            title: t('municipal')
        }
    ];

    const handleServiceSelect = (serviceId) => {
        setSelectedService(serviceId);
        // Navigate to department verification screen
        navigate('/kiosk/department-verification');
    };

    return (
        <KioskLayout>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/kiosk/login-register')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('back')}
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#212529] mb-2">
                        {t('selectService')}
                    </h2>
                    <p className="text-gray-600">
                        Please select the utility service you want to access
                    </p>
                </div>

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
