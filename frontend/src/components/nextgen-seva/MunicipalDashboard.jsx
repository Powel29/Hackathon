
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Trash2,
  Home,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Shield
} from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { departmentService, complaintService } from '../../services/api';
import { useOfflineStore } from '../../store/useOfflineStore';

export function MunicipalDashboard() {
  const navigate = useNavigate();
  const user = useKioskStore((state) => state.user);
  const networkStatus = useOfflineStore((state) => state.networkStatus);
  const isOnline = networkStatus === 'online';
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Civic & Cleanliness tips that rotate every minute
  const civicTips = [
    "🧹 Keep your surroundings clean: Proper waste disposal prevents diseases and improves community health.",
    "♻️ Segregate your waste: Separating dry and wet waste at the source makes recycling significantly more efficient.",
    "🌱 Plant more trees: Urban greenery reduces air pollution and helps maintain a cooler city temperature.",
    "🚫 Say no to single-use plastics: Using cloth bags for shopping helps reduce landfill waste and protects the environment.",
    "💧 Save water in public spaces: Report any leaking street taps or public fountain issues immediately to the helpline.",
    "🚶 Walk or cycle for short distances: It's good for your health and helps reduce traffic congestion in our city.",
    "🗑️ Always use public trash bins: Littering in parks and on streets can lead to heavy fines and public nuisance.",
    "🚦 Follow traffic rules: Responsible driving ensures safety for pedestrians and reduces city-wide accidents.",
    "🏘️ Participate in ward meetings: Your voice matters in the development and maintenance of your local neighborhood.",
    "🐶 Be a responsible pet owner: Always clean up after your pets in public parks and residential walkways."
  ];

  // Rotate civic tip every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % civicTips.length);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.consumerId) {
        console.log('❌ No consumerId found:', user);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (!isOnline) {
          console.log('[Offline] Skipping live data fetch for MunicipalDashboard');
          setLoading(false);
          return;
        }
        console.log('🔍 Fetching municipal data for:', user.consumerId);

        // Parallel fetch for account details, alerts, and complaints
        const [accountResponse, alertsResponse, complaintsData] = await Promise.all([
          departmentService.getAccountDetails('MUNICIPAL', user.consumerId),
          departmentService.getAlerts('MUNICIPAL'),
          complaintService.getUserComplaints({ serviceType: 'MUNICIPAL' })
        ]);

        console.log('✅ Municipal account response:', accountResponse);
        console.log('✅ Municipal alerts response:', alertsResponse);

        if (accountResponse.success) {
          setAccountData(accountResponse.account);
        }

        if (alertsResponse.success) {
          setAlerts(alertsResponse.alerts);
        }

        if (complaintsData) {
          setComplaints(complaintsData);
        }
      } catch (error) {
        console.error('❌ Failed to fetch municipal data:', error);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading municipal account data...</p>
        </div>
      </div>
    );
  }

  // Use live data or fallback to defaults
  const propertyTaxDue = accountData?.dueAmount || accountData?.lastBillAmount || 0;
  const propertyType = accountData?.propertyType || 'Residential';
  const propertyArea = accountData?.propertyArea || 0;
  const taxDueDate = accountData?.taxBills?.[0]?.dueDate
    ? new Date(accountData.taxBills[0].dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Mar 31, 2026';
  const garbageCollectionDay = accountData?.garbageCollectionDay || accountData?.wasteCollectionSchedule || 'Monday, Wednesday, Friday';




  return (
    <div className="space-y-6">

      {/* Municipal-specific Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Tax Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Property Tax</h3>
              <p className="text-xs text-gray-600">Annual tax details & payment</p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-700">Current Year Tax:</span>
              <span className="text-xl font-bold text-gray-900">₹{propertyTaxDue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-semibold text-red-600">{taxDueDate}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/nextgen-seva/pay-property-tax')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mb-3"
          >
            Pay Property Tax
          </button>

          <div className="space-y-2 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Property Type:</span>
              <span className="font-semibold text-gray-900">{propertyType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Area:</span>
              <span className="font-semibold text-gray-900">{propertyArea > 0 ? `${propertyArea.toLocaleString('en-IN')} sq.ft` : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Merged Civic Insights & Alerts Center */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Shield className="w-6 h-6" />
              <div>
                <h3 className="font-bold">Civic Insights & Notices</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Official Municipal Feed</p>
              </div>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] text-white font-bold backdrop-blur-md">
              TIP {currentTipIndex + 1} OF {civicTips.length}
            </div>
          </div>

          <div className="p-5 flex-1 space-y-4">
            {/* Rotating Civic Tip - Highlighted */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {civicTips[currentTipIndex]}
                </p>
              </div>
            </div>

            {/* Department Alerts from API */}
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert) => {
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
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 text-center">No Active Municipal Notices</p>
                    <p className="text-[10px] text-blue-600 font-medium text-center">Your ward is currently operating with no reported disruptions.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Active Complaints/Requests & Waste Collection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Complaints/Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Active Municipal Requests</h3>
                <p className="text-xs text-gray-600">Your recent complaints & requests</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/nextgen-seva/register-complaint')}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              New Request →
            </button>
          </div>

          <div className="space-y-3">
            {complaints.length > 0 ? (
              complaints.slice(0, 3).map((complaint) => {
                const statusLower = complaint.status?.toLowerCase();
                const color = statusLower === 'resolved' ? 'green' :
                  statusLower === 'pending' ? 'yellow' :
                    'blue';

                return (
                  <div key={complaint.complaintId || complaint.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/nextgen-seva/track-complaint/${complaint.complaintId || complaint.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${color === 'green' ? 'bg-green-100' :
                        color === 'blue' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        } rounded-lg flex items-center justify-center`}>
                        <FileText className={`w-4 h-4 ${color === 'green' ? 'text-green-600' :
                          color === 'blue' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{complaint.title || complaint.complaintType}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color === 'green' ? 'bg-green-100 text-green-700' :
                      color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {complaint.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active requests found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Waste Collection Full Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Waste Collection Services</h3>
                <p className="text-sm text-gray-600">Schedule and waste management information</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/nextgen-seva/register-complaint')}
              className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Report Missed Pickup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Daily Routine</span>
              </div>
              <p className="font-bold text-gray-900">Regular Collection</p>
              <p className="text-xs text-gray-600 mt-1">{garbageCollectionDay}</p>
              <div className="mt-4 pt-3 border-t border-green-100">
                <p className="text-xs font-semibold text-gray-500">Collection window:</p>
                <p className="text-sm font-bold text-green-700">6:00 AM - 9:00 AM</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-white rounded-lg shadow-sm">
                  <Clock className="w-5 h-5 text-blue-600" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Weekly Special</span>
              </div>
              <p className="font-bold text-gray-900">Dry Waste Collection</p>
              <p className="text-xs text-gray-600 mt-1">Every Tuesday morning</p>
              <div className="mt-4 pt-3 border-t border-blue-100">
                <p className="text-xs font-semibold text-gray-500">Items Accepted:</p>
                <p className="text-sm font-bold text-blue-700 line-clamp-1">Plastic, Glass, Metal, Paper</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Monthly Bulk</span>
              </div>
              <p className="font-bold text-gray-900">Bulk Waste Pickup</p>
              <p className="text-xs text-gray-600 mt-1">1st Saturday of every month</p>
              <div className="mt-4 pt-3 border-t border-purple-100">
                <p className="text-xs font-semibold text-gray-500">Instructions:</p>
                <p className="text-sm font-bold text-purple-700">Keep segregated outside gate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Information */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Ward Information</h3>
            <p className="text-xs text-gray-600">Your local municipal office details</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Ward Councilor:</p>
            <p className="font-semibold text-gray-900">Shri Rajesh Kumar</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Contact Number:</p>
            <p className="font-semibold text-gray-900">+91-1800-XXX-XXXX</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Office Hours:</p>
            <p className="font-semibold text-gray-900">10 AM - 5 PM</p>
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
                onClick={() => window.location.href = '/nextgen-seva/service-selection'}
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
