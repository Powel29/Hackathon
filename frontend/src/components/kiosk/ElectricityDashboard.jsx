import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { departmentService } from '../../services/api';
import { useOfflineStore } from '../../store/useOfflineStore';

import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Activity,
  Clock,
  BatteryCharging,
  BarChart3,
  Shield
} from 'lucide-react';

export function ElectricityDashboard() {
  const { t } = useTranslation();
  const { user, selectedService } = useKioskStore();
  const networkStatus = useOfflineStore((state) => state.networkStatus);
  const isOnline = networkStatus === 'online';
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Energy saving tips that rotate every minute
  const energyTips = [
    "💡 Switch to LED bulbs: They use 75% less energy and last 25 times longer than incandescent lighting.",
    "🔌 Unplug phantom loads: Electronic devices continue to draw power even when turned off if they are plugged in.",
    "🌡️ Set your AC to 24°C: This is the optimal temperature for comfort and energy efficiency.",
    "🧼 Clean your AC filters regularly: Dirty filters can increase energy consumption by up to 15%.",
    "☀️ Use natural light: Open curtains during the day to reduce the need for artificial lighting.",
    "👕 Wash clothes in cold water: About 90% of the energy used by washing machines goes to heating the water.",
    "🧊 Keep your fridge full: A full refrigerator stays cool more efficiently than an empty one.",
    "💻 Enable power-saving modes: Use sleep/hibernate modes on your computer and monitor during breaks.",
    "🚿 Install a water-efficient showerhead: It saves water and the energy used to heat it.",
    "🥘 Use the right size burner: Matching your pot size to the stove burner prevents wasted heat."
  ];

  // Rotate energy tip every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % energyTips.length);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.consumerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (!isOnline) {
          console.log('[Offline] Skipping live data fetch for ElectricityDashboard');
          setLoading(false);
          return;
        }
        // Parallel fetch for account details and alerts
        const [accountResponse, alertsResponse] = await Promise.all([
          departmentService.getAccountDetails('ELECTRICITY', user.consumerId),
          departmentService.getAlerts('ELECTRICITY')
        ]);

        if (accountResponse.success) {
          setAccountData(accountResponse.account);
        }

        if (alertsResponse.success) {
          setAlerts(alertsResponse.alerts);
        }
      } catch (error) {
        console.error('Failed to fetch electricity data:', error);
        // If 403 or specific error message, show access denied
        if (error.code === 'ACCESS_DENIED' || error.message?.toLowerCase().includes('not belong')) {
          setAccessDenied(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, user?.consumerId]);

  // Use real data from API or fallback to defaults
  const currentUsage = accountData?.currentMonthUsage || 0;
  const lastBillAmount = accountData?.lastBillAmount || 0;
  const avgDailyUsage = accountData?.dailyAverage || 0;
  const peakLoad = accountData?.peakLoad || 0;
  const sanctionedLoad = accountData?.sanctionedLoad || '5 kW';
  const connectionType = accountData?.connectionType || 'Residential';
  const lastReadingDate = accountData?.lastReadingDate
    ? new Date(accountData.lastReadingDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
    : 'N/A';

  // Format consumption history for the chart
  const consumptionData = accountData?.consumptionHistory?.slice(0, 7).reverse().map(item => ({
    value: item.value,
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
  })) || [];

  const maxUsage = Math.max(...consumptionData.map(d => d.value), 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Meter Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">{t('electricity.smartMeterInfo')}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('electricity.connectionTypeLabel')}</p>
            <p className="text-sm font-semibold text-gray-900">{connectionType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('electricity.sanctionedLoad')}</p>
            <p className="text-sm font-semibold text-gray-900">{sanctionedLoad}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('electricity.lastReadingDate')}</p>
            <p className="text-sm font-semibold text-gray-900">{lastReadingDate}</p>
          </div>
        </div>
      </div>

      {/* Electricity Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
              {t('electricity.active')}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentUsage}</p>
          <p className="text-xs text-gray-600 mt-1">{t('electricity.kwhThisMonth')}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-blue-700">{t('electricity.avgPerDay')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgDailyUsage}</p>
          <p className="text-xs text-gray-600 mt-1">{t('electricity.kwhDailyAverage')}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <BatteryCharging className="w-6 h-6 text-green-600" />
            <span className="text-xs text-green-700">{t('electricity.peakLoad')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{peakLoad}</p>
          <p className="text-xs text-gray-600 mt-1">{t('electricity.kwMaximumLoad')}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <span className="text-xs text-red-700">{t('electricity.alert')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{lastBillAmount}</p>
          <p className="text-xs text-gray-600 mt-1">{t('electricity.lastBillAmount')}</p>
        </div>
      </div>

      {/* Electricity-specific Features */}
      <div className="grid grid-cols-2 gap-6">
        {/* Current Consumption Graph - Live Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t('electricity.consumptionTrend')}</h3>
              <p className="text-xs text-gray-600">{t('electricity.last7DaysPattern')}</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-40">
            {consumptionData.length > 0 ? (
              consumptionData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-lg transition-all hover:from-yellow-600 hover:to-yellow-400"
                    style={{ height: `${(item.value / maxUsage) * 100}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{item.day}</span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No Recent Consumption Data</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Daily Avg Target:</span>
              <span className="font-bold text-green-600">Under 8.0 kWh</span>
            </div>
          </div>
        </div>

        {/* Merged Electricity Safety & Alerts Center */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Shield className="w-6 h-6" />
              <div>
                <h3 className="font-bold">Grid Safety & Status</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Live Power Updates</p>
              </div>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] text-white font-bold backdrop-blur-md">
              TIP {currentTipIndex + 1} OF {energyTips.length}
            </div>
          </div>

          <div className="p-5 flex-1 space-y-4 overflow-y-auto max-h-[300px]">
            {/* Rotating Energy Tip - Highlighted */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {energyTips[currentTipIndex]}
                </p>
              </div>
            </div>

            {/* Department Alerts from API */}
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => {
                  const sev = (alert.severity || 'INFO').toUpperCase();
                  const isHigh = sev === 'HIGH' || sev === 'DANGER';
                  const isMed = sev === 'MEDIUM' || sev === 'WARNING';
                  const isSuccess = sev === 'SUCCESS';

                  return (
                    <div key={alert.alertId} className={`border border-l-4 rounded-lg p-3 transition-all hover:brightness-95 animate-in fade-in slide-in-from-right-4 duration-500 ${isHigh
                      ? 'bg-red-50 border-red-500/30 border-l-red-600'
                      : isMed
                        ? 'bg-amber-50 border-amber-500/30 border-l-amber-600'
                        : isSuccess
                          ? 'bg-emerald-50 border-emerald-500/30 border-l-emerald-600'
                          : 'bg-blue-50 border-blue-500/30 border-l-blue-600'
                      }`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-bold line-clamp-1 ${isHigh ? 'text-red-900' :
                          isMed ? 'text-amber-900' :
                            isSuccess ? 'text-emerald-900' :
                              'text-blue-900'
                          }`}>
                          {alert.title}
                        </p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${isHigh ? 'bg-red-600 text-white' :
                          isMed ? 'bg-amber-500 text-white' :
                            isSuccess ? 'bg-emerald-600 text-white' :
                              'bg-blue-600 text-white'
                          }`}>
                          {sev}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{alert.message}</p>
                    </div>
                  );
                })
              ) : (
                <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-900 text-center">Power Grid Fully Operational</p>
                    <p className="text-[10px] text-green-600 font-medium text-center">No outages or maintenance reported in your sector.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Access Denied Modal */}
      {accessDenied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-red-600 p-6 flex justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-8">
                This consumer number does not belong to your Aadhaar record. You are not authorized to view these details.
              </p>
              <button
                onClick={() => window.location.href = '/kiosk/service-selection'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Go Back to Services
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
