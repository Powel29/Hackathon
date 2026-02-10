import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useStore, ServiceType } from '../store/useStore';
import { KioskLayout } from '../components/KioskLayout';
import { ServiceCard } from '../components/ServiceCard';
import { TouchButton } from '../components/TouchButton';
import { Zap, Flame, Droplets, Building2, ArrowLeft } from 'lucide-react';

export function ServiceSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSelectedService, isAuthenticated } = useStore();
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // Check if user is authenticated, if not redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login-register');
    }
  }, [isAuthenticated, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow key navigation
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % services.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + services.length) % services.length);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 2, services.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 2, 0));
      } 
      // Enter key to select
      else if (e.key === 'Enter') {
        e.preventDefault();
        handleServiceSelect(services[focusedIndex].id);
      }
      // Number keys for quick selection (1-4)
      else if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < services.length) {
          handleServiceSelect(services[index].id);
        }
      }
      // Escape to go back
      else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/login-register');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, navigate]);
  
  const services = [
    {
      id: 'electricity' as ServiceType,
      icon: <Zap className="w-8 h-8" />,
      color: '#FFD700',
      title: t('electricity')
    },
    {
      id: 'gas' as ServiceType,
      icon: <Flame className="w-8 h-8" />,
      color: '#FF6347',
      title: t('gas')
    },
    {
      id: 'water' as ServiceType,
      icon: <Droplets className="w-8 h-8" />,
      color: '#1E90FF',
      title: t('water')
    },
    {
      id: 'municipal' as ServiceType,
      icon: <Building2 className="w-8 h-8" />,
      color: '#32CD32',
      title: t('municipal')
    }
  ];
  
  const handleServiceSelect = (serviceId: ServiceType) => {
    setSelectedService(serviceId);
    // Navigate to department verification screen
    navigate('/department-verification');
  };
  
  return (
    <KioskLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/login-register')}
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