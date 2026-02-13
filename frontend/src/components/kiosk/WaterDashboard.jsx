
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  TrendingUp,
  Truck,
  Beaker,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';

export function WaterDashboard() {

  const navigate = useNavigate();

  // Mock data for water department
  const currentUsage = 12500; // liters this month
  const avgDailyUsage = 420; // liters per day
  const lastBillAmount = 650;
  const waterQuality = 'Good';

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
          <p className="text-2xl font-bold text-gray-900">{currentUsage}</p>
          <p className="text-xs text-gray-600 mt-1">Liters This Month</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-cyan-600" />
            <span className="text-xs text-cyan-700">Daily Avg</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgDailyUsage}</p>
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Supply Notice</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Water supply may be affected on Feb 3, 2026 due to maintenance work (10 AM - 2 PM)
                  </p>
                </div>
              </div>
            </div>
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
          {[
            { param: 'pH Level', value: '7.2', status: 'Good', color: 'green' },
            { param: 'TDS', value: '180 ppm', status: 'Good', color: 'green' },
            { param: 'Chlorine', value: '0.3 mg/L', status: 'Good', color: 'green' },
            { param: 'Turbidity', value: '0.5 NTU', status: 'Excellent', color: 'green' },
            { param: 'Hardness', value: '95 mg/L', status: 'Moderate', color: 'yellow' }
          ].map((param, index) => (
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

      {/* Connection Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Water Connection Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Connection Type</p>
            <p className="text-sm font-semibold text-gray-900">Residential</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Last Reading</p>
            <p className="text-sm font-semibold text-gray-900">Jan 28, 2026</p>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Monthly Consumption Trend</h3>
        <div className="flex items-end justify-between gap-3 h-40">
          {[11200, 10800, 12100, 11600, 12800, 12500].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-400"
                style={{ height: `${(value / 15000) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-600">
                {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][index]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">6-Month Average:</span>
            <span className="font-bold text-gray-900">11,667 liters/month</span>
          </div>
        </div>
      </div>

      {/* Water Conservation Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Water Conservation Tip</h3>
            <p className="text-xs text-gray-600">Save water, save money</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          💧 Fix leaking taps immediately - a dripping tap can waste up to 15 liters per day!
          Install aerators on taps to reduce water flow by 50% without affecting performance.
          Potential monthly savings: ₹150-200.
        </p>
      </div>
    </div>
  );
}
