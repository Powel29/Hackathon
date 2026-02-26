

import { useState, useEffect } from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { departmentService } from '../../services/api';
import { serviceRequestService } from '../../services/api/serviceRequest.service';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Package,
  Shield,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export function GasDashboard() {
  const navigate = useNavigate();
  const { user, selectedService } = useKioskStore();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

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
          departmentService.getAccountDetails('GAS', user.consumerId),
          departmentService.getAlerts('GAS')
        ]);

        if (accountResponse.success) {
          setAccountData(accountResponse.account);
        }

        if (alertsResponse.success) {
          setAlerts(alertsResponse.alerts);
        }

        // Fetch recent gas bookings
        try {
          const bookingResponse = await serviceRequestService.getAll();
          if (bookingResponse.success) {
            const gasBookings = bookingResponse.requests
              .filter(req => req.requestType === 'GAS_CYLINDER_BOOKING')
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 3);
            setRecentBookings(gasBookings);
          }
        } catch (err) {
          console.error('Failed to fetch recent bookings:', err);
        }
      } catch (error) {
        console.error('Failed to fetch gas data:', error);
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
  const pressure = accountData?.pressure || 0;
  const gasType = accountData?.gasType || 'PNG';
  const connectionType = accountData?.connectionType || 'Residential';
  const pipelineSize = accountData?.pipelineSize || 'N/A';
  const lastReadingDate = accountData?.lastReadingDate
    ? new Date(accountData.lastReadingDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : 'N/A';

  // Format consumption history for PNG users
  const consumptionData = accountData?.consumptionHistory?.slice(0, 6).map(item => ({
    value: item.value,
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
  })) || [];

  const maxUsage = Math.max(...consumptionData.map(d => d.value), 50);

  const nextSafetyCheck = accountData?.nextSafetyCheck
    ? new Date(accountData.nextSafetyCheck).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
    : 'N/A';

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Safety tips that rotate every minute
  const safetyTips = [
    "🔥 Always turn off the gas regulator knob after cooking. Check for gas leaks by applying soap solution on joints. If you smell gas, immediately turn off the regulator, open windows, and call the emergency helpline.",
    "🪟 Ensure proper ventilation in your kitchen by opening windows or using a chimney when cooking. Poor ventilation can lead to carbon monoxide buildup.",
    "🧪 Never use any gas appliance to heat your home or room. Gas stoves and heaters are only meant for cooking and should be used in well-ventilated areas.",
    "🔍 Inspect your LPG cylinder and pipes regularly for rust and damage. Replace damaged pipes immediately. Keep the cylinder upright and away from heat sources.",
    "⚠️ If you detect a gas smell, do NOT use electrical switches, lighters, or mobile phones. Immediately evacuate, open windows, and call the gas emergency helpline at 1906.",
    "🚫 Do not keep unused LPG cylinders inside your home. Store them in well-ventilated outdoor areas away from direct sunlight and heat.",
    "🧴 Check the rubber tube connecting your gas cylinder every 6 months for cracks or wear. Replace if damaged. Use only ISI-marked tubes.",
    "👨‍🍳 Never leave cooking unattended. Keep children and pets away from the cooking area. Always use appropriate cookware with flat bottoms.",
    "📋 Get your stove serviced by authorized technicians annually to ensure all joints are tight and there are no gas leaks.",
    "🆘 In case of a gas leak emergency, call 1906 (24/7 helpline). Move to fresh air immediately and do not re-enter the premises until it's confirmed safe."
  ];

  // Rotate safety tip every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % safetyTips.length);
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gas Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-blue-700">Current</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentUsage}</p>
          <p className="text-xs text-gray-600 mt-1">m³ Used This Month</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-green-600" />
            <span className="text-xs text-green-700">Daily Avg</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgDailyUsage}</p>
          <p className="text-xs text-gray-600 mt-1">m³ per Day</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <span className="text-xs text-purple-700">Pressure</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pressure}</p>
          <p className="text-xs text-gray-600 mt-1">PSI</p>
        </div>
      </div>

      {/* Gas-specific Features */}
      <div className="grid grid-cols-1 gap-6">
        {/* Merged Safety Center */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Shield className="w-6 h-6" />
              <div>
                <h3 className="font-bold">Safety & Alerts</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Live Service Updates</p>
              </div>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] text-white font-bold backdrop-blur-md">
              TIP {currentTipIndex + 1} OF {safetyTips.length}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Rotating Safety Tip - Highlighted */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <div className="flex gap-3">
                <Flame className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {safetyTips[currentTipIndex]}
                </p>
              </div>
            </div>

            {/* Account Specific Safety Info (if available) */}
            {accountData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Official Safety Status</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Last Verified: <span className="font-semibold text-gray-900">{lastReadingDate}</span> •
                    Next Check: <span className="font-semibold text-green-700">{nextSafetyCheck}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Department Alerts from API - Styled like Municipal Dashboard */}
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
                <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 text-center">No Active Departmental Alerts</p>
                    <p className="text-[10px] text-blue-600 font-medium">LPG Infrastructure & Pipeline health is optimal.</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[10px] text-gray-400 font-bold tracking-tighter uppercase whitespace-nowrap">Emergency Helpline</p>
                    <p className="text-lg font-black text-red-600 leading-none">1906</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gas consumption Chart (Only for PNG) */}
      {gasType === 'PNG' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Monthly Usage Trend</h3>
                <p className="text-xs text-gray-600">Consumption history for {user.consumerId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Current Status</p>
              <p className="text-sm font-black text-green-600 uppercase">Pressure Optimal</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-40">
            {consumptionData.length > 0 ? (
              consumptionData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg transition-all hover:from-orange-600 hover:to-orange-400"
                    style={{ height: `${(item.value / maxUsage) * 100}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-500 font-black uppercase">
                    {item.month}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">No PNG Consumption History</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connection Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Gas Connection Details</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Connection Type</p>
            <p className="text-sm font-semibold text-gray-900">{connectionType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Gas Type</p>
            <p className="text-sm font-semibold text-gray-900">{gasType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Pipeline Size</p>
            <p className="text-sm font-semibold text-gray-900">{pipelineSize}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Last Reading</p>
            <p className="text-sm font-semibold text-gray-900">{lastReadingDate}</p>
          </div>
        </div>
      </div>

      {/* Booking Action */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Flame className="w-24 h-24 text-orange-600" />
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Refill Gas Cylinder</h3>
            <p className="text-gray-600 text-sm">Instant cooking gas refill for your connection</p>
          </div>
          <button
            onClick={() => navigate('/kiosk/gas-cylinder-booking')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Package className="w-5 h-5" />
            Book Now
          </button>
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking, index) => (
              <div key={booking.requestId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(booking.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-600">
                      {booking.details?.cylinderType?.replace('_', ' ').toUpperCase() || 'Refill'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹803</p>
                  <p className={`text-xs font-semibold ${booking.status === 'COMPLETED' || booking.status === 'APPROVED'
                    ? 'text-green-600'
                    : booking.status === 'REJECTED'
                      ? 'text-red-600'
                      : 'text-orange-600'
                    }`}>
                    {booking.status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm text-gray-500">No recent bookings found</p>
              <button
                onClick={() => navigate('/kiosk/gas-cylinder-booking')}
                className="text-xs text-orange-600 font-bold mt-1 hover:underline"
              >
                Book your first refill →
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Access Denied Modal */}
      {
        accessDenied && (
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
