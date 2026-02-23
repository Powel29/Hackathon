import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { departmentService } from '../../services/api';

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
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.consumerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : 'N/A';

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
        {/* Current Consumption Graph Placeholder */}
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

          {/* Simple Bar Chart Visualization */}
          <div className="flex items-end justify-between gap-2 h-40">
            {[6.5, 7.2, 8.1, 7.8, 9.2, 8.5, 8.2].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-lg transition-all hover:from-yellow-600 hover:to-yellow-400"
                  style={{ height: `${(value / 10) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-600">
                  {[t('electricity.mondayShort'), t('electricity.tuesdayShort'), t('electricity.wednesdayShort'), t('electricity.thursdayShort'), t('electricity.fridayShort'), t('electricity.saturdayShort'), t('electricity.sundayShort')][index]}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t('electricity.weeklyAverage')}</span>
              <span className="font-bold text-gray-900">{t('electricity.weeklyAverageValue', { value: '7.9 kWh/day' })}</span>
            </div>
          </div>
        </div>

        {/* Power Outage & Maintenance Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t('electricity.powerAlerts')}</h3>
              <p className="text-xs text-gray-600">{t('electricity.outagesAndMaintenance')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.alertId} className={`border rounded-lg p-3 ${alert.severity === 'HIGH' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                  }`}>
                  <div className="flex items-start gap-3">
                    {alert.severity === 'HIGH' || alert.severity === 'MEDIUM' ? (
                      <Clock className={`w-4 h-4 mt-0.5 ${alert.severity === 'HIGH' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Activity className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{t('electricity.systemStatus')}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('electricity.allSystemsOperational')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Energy Saving Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t('electricity.energySavingTip')}</h3>
            <p className="text-xs text-gray-600">{t('electricity.energySavingPractices')}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          💡 {t('electricity.ledBulbTip', { min: 300, max: 400 })}
        </p>
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
