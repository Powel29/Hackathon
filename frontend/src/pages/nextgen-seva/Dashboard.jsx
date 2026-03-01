import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/nextgen-seva/KioskLayout';
import { ServiceCard } from '../../components/nextgen-seva/ServiceCard';
import { TouchButton } from '../../components/nextgen-seva/TouchButton';
import { ElectricityDashboard } from '../../components/nextgen-seva/ElectricityDashboard';
import { GasDashboard } from '../../components/nextgen-seva/GasDashboard';
import { WaterDashboard } from '../../components/nextgen-seva/WaterDashboard';
import { MunicipalDashboard } from '../../components/nextgen-seva/MunicipalDashboard';
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
  Building2,
  RefreshCw
} from 'lucide-react';
import { useEffect } from 'react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useVoiceCommand } from '../../core/voice/useVoiceCommand';

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, resetSession, isAuthenticated, selectedService } = useKioskStore();
  const networkStatus = useOfflineStore((state) => state.networkStatus);
  const isOnline = networkStatus === 'online';

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/nextgen-seva/');
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
      route: '/nextgen-seva/bills'
    },
    {
      id: 'register-complaint',
      icon: <FileText className="w-8 h-8" />,
      color: '#DC3545',
      title: t('dashboard.registerComplaint'),
      route: '/nextgen-seva/register-complaint'
    },
    {
      id: 'track-status',
      icon: <Search className="w-8 h-8" />,
      color: '#FF9800',
      title: t('dashboard.trackStatus'),
      route: '/nextgen-seva/track-complaint'
    },
    {
      id: 'new-connection',
      icon: <Plus className="w-8 h-8" />,
      color: '#28A745',
      title: t('dashboard.newConnection'),
      route: '/nextgen-seva/new-connection'
    },
    {
      id: 'track-connection',
      icon: <Search className="w-8 h-8" />,
      color: '#17A2B8',
      title: t('dashboard.trackConnection'),
      route: '/nextgen-seva/track-new-connection'
    },
    ...(selectedService !== 'electricity' && selectedService !== 'municipal' ? [{
      id: 'track-request',
      icon: <Search className="w-8 h-8" />,
      color: '#6f42c1',
      title: t('dashboard.trackRequests') || 'Track Requests',
      route: '/nextgen-seva/track-request'
    }] : []),
    ...(selectedService === 'municipal' ? [
      {
        id: 'municipal-service-requests',
        icon: <FileText className="w-8 h-8" />,
        color: '#6f42c1',
        title: 'Service Requests',
        route: '/nextgen-seva/municipal-service-requests'
      },
      {
        id: 'track-municipal-request',
        icon: <Search className="w-8 h-8" />,
        color: '#8A2BE2',
        title: 'Track Request',
        route: '/nextgen-seva/track-service-request'
      }
    ] : []),
    {
      id: 'my-documents',
      icon: <FileText className="w-8 h-8" />,
      color: '#E83E8C',
      title: t('dashboard.myDocuments', 'My Documents'),
      route: '/nextgen-seva/my-documents'
    }
  ];

  const handleLogout = () => {
    resetSession();
    navigate('/nextgen-seva/');
  };

  useVoiceCommand({
    'logout': handleLogout,
    'pay-bill': () => navigate('/nextgen-seva/bills'),
    'register-complaint': () => navigate('/nextgen-seva/register-complaint'),
    'track-request': () => navigate('/nextgen-seva/track-request'),
    'new-connection': () => navigate('/nextgen-seva/new-connection'),
    'select-number': (cmd) => {
      const index = cmd.value - 1;
      if (index >= 0 && index < actions.length) {
        navigate(actions[index].route);
      }
    },
    'back': () => navigate('/nextgen-seva/service-selection'),
    'home': () => navigate('/nextgen-seva/dashboard')
  });

  return (
    <KioskLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Offline Mode Banner */}
        {!isOnline && (
          <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between border-2 border-red-500 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <WifiOff className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-wider text-sm">Offline Mode Active</h3>
                <p className="text-xs opacity-90">Hardware is disconnected. All transactions will be queued locally.</p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-md">
              Limited Preview
            </div>
          </div>
        )}

        {user.isOfflineSession && isOnline && (
          <div className="bg-amber-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between border-2 border-amber-400">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-wider text-sm">Unverified Session</h3>
                <p className="text-xs opacity-90">You entered while offline. Some features may be restricted until your ID is verified.</p>
              </div>
            </div>
          </div>
        )}

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
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="medium"
                onClick={() => navigate('/nextgen-seva/service-selection')}
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
