
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  TrendingUp,
  Truck,
  Beaker,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
<<<<<<< HEAD
import { useOfflineStore } from '../../store/useOfflineStore';
=======
>>>>>>> origin/nayan
import { departmentService } from '../../services/api';

export function WaterDashboard() {
  const navigate = useNavigate();
  const safetyCenterRef = useRef(null);
  const { user } = useKioskStore();
<<<<<<< HEAD
  const networkStatus = useOfflineStore((state) => state.networkStatus);
  const isOnline = networkStatus === 'online';
=======
>>>>>>> origin/nayan
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Water conservation tips that rotate every minute
  const waterTips = [
    "💧 Fix leaking taps immediately - a dripping tap can waste up to 15 liters per day! Install aerators on taps to reduce water flow by 50%.",
    "🛁 A quick 5-minute shower uses significantly less water than a full bathtub. Consider switching to water-efficient showerheads.",
    "🧺 Only run your washing machine and dishwasher with full loads. This can save up to 1,000 liters of water per month.",
    "🦷 Turn off the tap while brushing your teeth or shaving. This simple habit can save more than 10 liters of water per day.",
    "🚗 Use a bucket and sponge to wash your car instead of a running hose. A hose can waste over 400 liters in just 10 minutes.",
    "🪴 Water your plants early in the morning or late in the evening to reduce evaporation. Use mulch to keep moisture in the soil.",
    "🍲 Reuse water used for washing vegetables or boiling pasta to water your garden plants once it has cooled down.",
    "🚽 Check your toilet for leaks by adding a few drops of food coloring to the tank. If color appears in the bowl, you have a leak.",
    "🌧️ Install a rain barrel to collect water from your roof gutters. Use this 'free' water for gardening and outdoor cleaning.",
    "🚿 Place a bucket in the shower while waiting for the water to warm up. Use that water for plants, cleaning, or flushing toilets."
  ];

  // Rotate water tip every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % waterTips.length);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Ensure loading state is set and always cleared on every path
      setLoading(true);

      if (!user?.consumerId) {
        console.log('❌ No consumerId found:', user);
        setLoading(false);
        return;
      }

      try {
<<<<<<< HEAD
        if (!isOnline) {
          console.log('[Offline] Skipping live data fetch for WaterDashboard');
          setLoading(false);
          return;
        }

=======
>>>>>>> origin/nayan
        console.log('🔍 Fetching water data for:', user.consumerId);

        // Parallel fetch for account details and alerts
        const [accountResponse, alertsResponse] = await Promise.all([
          departmentService.getAccountDetails('WATER', user.consumerId),
          departmentService.getAlerts('WATER')
        ]);

        console.log('✅ Water account response:', accountResponse);
        console.log('✅ Water alerts response:', alertsResponse);

        if (accountResponse.success) {
          setAccountData(accountResponse.account);
        }

        if (alertsResponse.success) {
          setAlerts(alertsResponse.alerts);
        }
      } catch (error) {
        console.error('❌ Failed to fetch water data:', error);
        if (error.code === 'ACCESS_DENIED' || error.message?.toLowerCase().includes('not belong')) {
          setAccessDenied(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.consumerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading water account data...</p>
        </div>
      </div>
    );
  }

  // Use live data or fallback to defaults
  const currentUsage = accountData?.currentMonthUsage || 0;
  const avgDailyUsage = accountData?.dailyAverage || 0;
  const lastBillAmount = accountData?.lastBillAmount || 0;
  const waterQuality = accountData?.waterQualityStatus || 'Unknown';
  const connectionType = accountData?.connectionType || 'Residential';
  const lastReading = accountData?.lastReadingDate ? new Date(accountData.lastReadingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  // Format consumption history for the chart
  const consumptionData = accountData?.consumptionHistory?.slice(0, 6).reverse().map(item => ({
    value: item.value,
    month: new Date(item.date).toLocaleDateString('en-IN', { month: 'short' })
  })) || [];

  const maxUsage = Math.max(...consumptionData.map(d => d.value), 10000);

  // Water quality metrics
  const qualityMetrics = [
    { param: 'pH Level', value: accountData?.phLevel ? accountData.phLevel.toFixed(1) : '7.2', status: 'Good', color: 'green' },
    { param: 'TDS', value: accountData?.tdsLevel ? `${accountData.tdsLevel.toFixed(0)} ppm` : '180 ppm', status: 'Good', color: 'green' },
    { param: 'Chlorine', value: accountData?.chlorineLevel ? `${accountData.chlorineLevel.toFixed(1)} mg/L` : '0.3 mg/L', status: 'Good', color: 'green' },
    { param: 'Turbidity', value: accountData?.turbidityLevel ? `${accountData.turbidityLevel.toFixed(1)} NTU` : '0.5 NTU', status: 'Excellent', color: 'green' },
    { param: 'Hardness', value: accountData?.hardnessLevel ? `${accountData.hardnessLevel.toFixed(0)} mg/L` : '95 mg/L', status: 'Moderate', color: 'yellow' }
  ];


  return (
    <div className="space-y-6">
      {/* Water Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentUsage.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-600 mt-1">Liters This Month</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-cyan-600" />
            <span className="text-xs text-cyan-700">Daily Avg</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgDailyUsage.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-600 mt-1">Liters Per Day</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Beaker className="w-6 h-6 text-green-600" />
            <span className="text-xs text-green-700">Quality</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{waterQuality}</p>
          <p className="text-xs text-gray-600 mt-1">Water Quality Status</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-xs text-purple-700">Amount</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{lastBillAmount}</p>
          <p className="text-xs text-gray-600 mt-1">Last Bill Amount</p>
        </div>
      </div>

      {/* Water-specific Features */}
      <div className="grid grid-cols-2 gap-6">
        {/* Water Supply Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Water Supply Schedule</h3>
              <p className="text-xs text-gray-600">Daily supply timings</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Morning Supply</p>
                  <p className="text-xs text-gray-600 mt-1">6:00 AM - 8:00 AM</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Evening Supply</p>
                  <p className="text-xs text-gray-600 mt-1">6:00 PM - 8:00 PM</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {/* Option 3: Disruption Linkage */}
            {alerts.some(a => (a.severity || '').toUpperCase() === 'HIGH') ? (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-black text-red-700 uppercase">Supply Disruption Active</p>
                </div>
                <button
                  onClick={() => safetyCenterRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded uppercase tracking-widest transition-all"
                >
                  View Details Below ↓
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Refer to Safety Center for live alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Tanker Booking Service */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Water Tanker Service</h3>
              <p className="text-xs text-gray-600">Emergency water supply</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 mb-4">
            <div className="text-center mb-3">
              <p className="text-2xl font-bold text-gray-900">₹500</p>
              <p className="text-xs text-gray-600">Per Tanker (5000 Liters)</p>
            </div>
            <button
              onClick={() => navigate('/kiosk/water-tanker-booking')}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Book Water Tanker
            </button>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>24/7 availability</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Delivery within 2-4 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Tested & purified water</span>
            </div>
          </div>
        </div>
      </div>

      {/* Water Quality Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Beaker className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Water Quality Report</h3>
            <p className="text-xs text-gray-600">Latest test results - Jan 25, 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {qualityMetrics.map((param, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">{param.param}</p>
              <p className="text-sm font-bold text-gray-900">{param.value}</p>
              <span className={`text-xs font-semibold ${param.color === 'green' ? 'text-green-600' : 'text-yellow-600'}`}>
                {param.status}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">Overall Water Quality: <span className="font-bold text-green-600">Safe for Drinking</span></p>
            <button className="text-sm text-blue-600 hover:underline">
              View Full Report →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Water Connection Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Connection Type</p>
            <p className="text-sm font-semibold text-gray-900">{connectionType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Last Reading</p>
            <p className="text-sm font-semibold text-gray-900">{lastReading}</p>
          </div>
        </div>
      </div>

      {/* Usage Chart - Live Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Monthly Consumption Trend</h3>
        <div className="flex items-end justify-between gap-3 h-40">
          {consumptionData.length > 0 ? (
            consumptionData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-400"
                  style={{ height: `${(item.value / maxUsage) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-600 font-bold uppercase">
                  {item.month}
                </span>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">No Consumption History Available</p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">Monthly Target:</span>
            <span className="font-bold text-blue-600">Keep under 12,000 liters</span>
          </div>
        </div>
      </div>

      {/* Merged Water Safety & Alerts Center */}
      <div ref={safetyCenterRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Shield className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Water Safety & Supply Alerts</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Live Ministry Updates</p>
            </div>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] text-white font-bold backdrop-blur-md">
            TIP {currentTipIndex + 1} OF {waterTips.length}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Rotating Water Tip - Highlighted */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex gap-3">
              <Droplets className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-800 leading-relaxed font-medium">
                {waterTips[currentTipIndex]}
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
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900 text-center">No Active Supply Disruptions</p>
                  <p className="text-[10px] text-blue-600 font-medium text-center">Water pressure and quality are currently optimal across your zone.</p>
                </div>
              </div>
            )}
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
