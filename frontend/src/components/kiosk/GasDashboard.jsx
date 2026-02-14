

import { useState, useEffect } from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { departmentService } from '../../services/api';
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
  const { user, selectedService } = useKioskStore();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user || !user.consumerId) {
        setLoading(false);
        return;
      }

      try {
        const response = await departmentService.getAccountDetails(
          selectedService,
          user.consumerId
        );

        if (response.success) {
          setAccountData(response.account);
        }
      } catch (error) {
        console.error('Failed to fetch gas account data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [user, selectedService]);

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
  }, [safetyTips.length]);

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
        {/* Safety & Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Safety Alerts</h3>
              <p className="text-xs text-gray-600">Important safety information</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Safety Check Complete</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Last Reading: {lastReadingDate}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Next inspection due: {nextSafetyCheck}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Safety Reminder</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ensure proper ventilation when using gas appliances
                  </p>
                  <button className="text-xs text-blue-600 hover:underline mt-2">
                    View Safety Guidelines →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Emergency Contact</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Gas Leak Helpline: <span className="font-semibold text-red-600">1906</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Available 24/7 for emergencies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Usage History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          {[
            { date: 'Jan 15, 2026', amount: '₹803', status: 'Delivered', subsidy: '₹200' },
            { date: 'Dec 10, 2025', amount: '₹803', status: 'Delivered', subsidy: '₹200' },
            { date: 'Nov 5, 2025', amount: '₹803', status: 'Delivered', subsidy: '₹200' }
          ].map((booking, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{booking.date}</p>
                  <p className="text-xs text-gray-600">Subsidy: {booking.subsidy}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{booking.amount}</p>
                <p className="text-xs text-green-600">{booking.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Safety Tip</h3>
            <p className="text-xs text-gray-600">Tip {currentTipIndex + 1} of {safetyTips.length} (Updates every minute)</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          {safetyTips[currentTipIndex]}
        </p>
      </div>
    </div>
  );
}
