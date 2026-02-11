import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Activity,
  Clock,
  BatteryCharging,
  BarChart3
} from 'lucide-react';

export function ElectricityDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock data for electricity department
  const currentUsage = 245; // kWh this month
  const lastBillAmount = 1850;
  const avgDailyUsage = 8.2; // kWh
  const peakLoad = 3.5; // kW

  return (
    <div className="space-y-6">
      {/* Electricity Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
              {t('active')}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentUsage}</p>
          <p className="text-xs text-gray-600 mt-1">{t('kwhThisMonth')}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-blue-700">{t('avgPerDay')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgDailyUsage}</p>
          <p className="text-xs text-gray-600 mt-1">{t('kwhDailyAverage')}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <BatteryCharging className="w-6 h-6 text-green-600" />
            <span className="text-xs text-green-700">{t('peakLoad')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{peakLoad}</p>
          <p className="text-xs text-gray-600 mt-1">{t('kwMaximumLoad')}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <span className="text-xs text-red-700">{t('alert')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{lastBillAmount}</p>
          <p className="text-xs text-gray-600 mt-1">{t('lastBillAmount')}</p>
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
              <h3 className="font-bold text-gray-900">{t('consumptionTrend')}</h3>
              <p className="text-xs text-gray-600">{t('last7DaysPattern')}</p>
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
                  {[t('mondayShort'), t('tuesdayShort'), t('wednesdayShort'), t('thursdayShort'), t('fridayShort'), t('saturdayShort'), t('sundayShort')][index]}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t('weeklyAverage')}</span>
              <span className="font-bold text-gray-900">{t('weeklyAverageValue', { value: '7.9 kWh/day' })}</span>
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
              <h3 className="font-bold text-gray-900">{t('powerAlerts')}</h3>
              <p className="text-xs text-gray-600">{t('outagesAndMaintenance')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{t('scheduledMaintenance')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('scheduledMaintenanceTime', { date: 'Feb 2, 2026', time: '10:00 AM - 2:00 PM' })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('maintenanceArea', { area: 'Sector 5, 6, 7' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Activity className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{t('systemStatus')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('allSystemsOperational')}
                  </p>
                  <p className="text-xs text-green-600 mt-1 font-semibold">
                    {t('uptimeThisMonth', { percent: 99.8 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meter Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">{t('smartMeterInfo')}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('connectionTypeLabel')}</p>
            <p className="text-sm font-semibold text-gray-900">{t('residential')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('sanctionedLoad')}</p>
            <p className="text-sm font-semibold text-gray-900">5 kW</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('lastReadingDate')}</p>
            <p className="text-sm font-semibold text-gray-900">Jan 28, 2026</p>
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
            <h3 className="font-bold text-gray-900">{t('energySavingTip')}</h3>
            <p className="text-xs text-gray-600">{t('energySavingPractices')}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          💡 {t('ledBulbTip', { min: 300, max: 400 })}
        </p>
      </div>
    </div>
  );
}
