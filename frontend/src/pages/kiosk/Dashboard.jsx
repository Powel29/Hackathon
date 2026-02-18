import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { ServiceCard } from '../../components/kiosk/ServiceCard';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { ElectricityDashboard } from '../../components/kiosk/ElectricityDashboard';
import { GasDashboard } from '../../components/kiosk/GasDashboard';
import { WaterDashboard } from '../../components/kiosk/WaterDashboard';
import { MunicipalDashboard } from '../../components/kiosk/MunicipalDashboard';
import {
  CreditCard,
  FileText,
  Search,
  Plus,
  LogOut,
  User,
  Zap,
  Flame,
  Droplets,
  Building2
} from 'lucide-react';
import { useEffect } from 'react';

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, resetSession, isAuthenticated, selectedService } = useKioskStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/kiosk/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;

  // Department-specific info
  const getDepartmentIcon = () => {
    switch (selectedService) {
      case 'electricity':
        return <Zap className="w-7 h-7 text-yellow-600" />;
      case 'gas':
        return <Flame className="w-7 h-7 text-orange-600" />;
      case 'water':
        return <Droplets className="w-7 h-7 text-blue-600" />;
      case 'municipal':
        return <Building2 className="w-7 h-7 text-green-600" />;
      default:
        return <User className="w-7 h-7 text-[#0066CC]" />;
    }
  };

  const getDepartmentName = () => {
    switch (selectedService) {
      case 'electricity':
        return t('dashboard.electricityDepartment');
      case 'gas':
        return t('dashboard.gasDepartment');
      case 'water':
        return t('dashboard.waterDepartment');
      case 'municipal':
        return t('dashboard.municipalServices');
      default:
        return t('authentication.portalSubtitle'); // Using portalSubtitle or common title as fallback
    }
  };

  const getDepartmentColor = () => {
    switch (selectedService) {
      case 'electricity':
        return 'from-yellow-50 to-yellow-100';
      case 'gas':
        return 'from-orange-50 to-orange-100';
      case 'water':
        return 'from-blue-50 to-blue-100';
      case 'municipal':
        return 'from-green-50 to-green-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  const actions = [
    {
      id: 'pay-bills',
      icon: <CreditCard className="w-8 h-8" />,
      color: '#0066CC',
      title: t('dashboard.payBills'),
      route: '/kiosk/bills'
    },
    {
      id: 'register-complaint',
      icon: <FileText className="w-8 h-8" />,
      color: '#DC3545',
      title: t('dashboard.registerComplaint'),
      route: '/kiosk/register-complaint'
    },
    {
      id: 'track-status',
      icon: <Search className="w-8 h-8" />,
      color: '#FF9800',
      title: t('dashboard.trackStatus'),
      route: '/kiosk/track-complaint'
    },
    {
      id: 'new-connection',
      icon: <Plus className="w-8 h-8" />,
      color: '#28A745',
      title: t('dashboard.newConnection'),
      route: '/kiosk/new-connection'
    },
    {
      id: 'track-connection',
      icon: <Search className="w-8 h-8" />,
      color: '#17A2B8',
      title: t('dashboard.trackConnection'),
      route: '/kiosk/track-new-connection'
    },
    {
      id: 'track-request',
      icon: <FileText className="w-8 h-8" />,
      color: '#6f42c1',
      title: t('dashboard.trackRequests') || 'Track Requests',
      route: '/kiosk/track-request'
    }
  ];

  const handleLogout = () => {
    resetSession();
    navigate('/kiosk/');
  };

  return (
    <KioskLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* User Info Section with Department */}
        <div className={`bg-gradient-to-r ${getDepartmentColor()} border border-gray-200 rounded-xl shadow-sm p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                {getDepartmentIcon()}
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">{getDepartmentName()}</p>
                <h2 className="text-2xl font-bold text-[#212529]">{user.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <div className="bg-white bg-opacity-70 px-3 py-1 rounded-lg">
                    <p className="text-xs text-gray-600">{t('dashboard.consumerId')}</p>
                    <p className="text-sm font-semibold text-[#212529]">{user.consumerId}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <TouchButton
                variant="secondary"
                size="medium"
                onClick={() => navigate('/kiosk/service-selection')}
              >
                {t('dashboard.changeDepartment')}
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="medium"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
              >
                {t('dashboard.logout')}
              </TouchButton>
            </div>
          </div>
        </div>
        {/* User Info Section ends here */}

        {/* Action Cards Section - Common for all departments */}
        <div>
          <h3 className="text-xl font-bold text-[#212529] mb-4">
            {t('dashboard.quickServices')}
          </h3>

          <div className="grid grid-cols-5 gap-4">
            {actions.map((action) => (
              <ServiceCard
                key={action.id}
                icon={action.icon}
                title={action.title}
                color={action.color}
                onClick={() => navigate(action.route)}
              />
            ))}
          </div>
        </div>

        {/* Department-Specific Dashboard */}
        {selectedService === 'electricity' && <ElectricityDashboard />}
        {selectedService === 'gas' && <GasDashboard />}
        {selectedService === 'water' && <WaterDashboard />}
        {selectedService === 'municipal' && <MunicipalDashboard />}


      </div>
    </KioskLayout >
  );
}
