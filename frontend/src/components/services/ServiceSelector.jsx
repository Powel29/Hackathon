import { useTranslation } from 'react-i18next';
import { Zap, Flame, Droplet, Building2 } from 'lucide-react';

const ServiceSelector = ({ onSelectService }) => {
    const { t } = useTranslation();

    const services = [
        {
            id: 'electricity',
            name: t('electricity'),
            icon: Zap,
            color: 'bg-yellow-500'
        },
        {
            id: 'gas',
            name: t('gas'),
            icon: Flame,
            color: 'bg-orange-500'
        },
        {
            id: 'water',
            name: t('water'),
            icon: Droplet,
            color: 'bg-blue-500'
        },
        {
            id: 'municipal',
            name: t('municipal'),
            icon: Building2,
            color: 'bg-green-500'
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-8 p-8">
            {services.map((service) => {
                const Icon = service.icon;
                return (
                    <button
                        key={service.id}
                        onClick={() => onSelectService(service.id)}
                        className={`
                 ${service.color} text-white
                 p-12 rounded-2xl
                 hover:scale-105 transition-transform
                 flex flex-col items-center gap-6
               `}
                    >
                        <Icon size={80} />
                        <span className="text-kiosk-xl font-bold">
                            {service.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default ServiceSelector;
