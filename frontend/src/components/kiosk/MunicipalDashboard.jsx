
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Trash2,
  Home,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { departmentService } from '../../services/api';

export function MunicipalDashboard() {
  const navigate = useNavigate();
  const { user } = useKioskStore();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user?.consumerId) {
        console.log('❌ No consumerId found:', user);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching municipal account for:', user.consumerId);
        const response = await departmentService.getAccountDetails('MUNICIPAL', user.consumerId);
        console.log('✅ Municipal account response:', response);

        if (response.success) {
          setAccountData(response.account);
          console.log('✅ Municipal account data set:', response.account);
        } else {
          console.error('❌ API returned success: false');
        }
      } catch (error) {
        console.error('❌ Failed to fetch municipal account data:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
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
  const annualTax = accountData?.annualTaxAmount || 0;
  const propertyType = accountData?.propertyType || 'Residential';
  const propertyArea = accountData?.propertyArea || 0;
  const wardNumber = '12-A'; // This would come from address/location data
  const taxDueDate = accountData?.taxBills?.[0]?.dueDate
    ? new Date(accountData.taxBills[0].dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Mar 31, 2026';
  const garbageCollectionDay = accountData?.garbageCollection ? 'Monday, Wednesday, Friday' : 'Not Available';

  console.log('📊 Municipal Dashboard values:', { propertyTaxDue, annualTax, propertyType, propertyArea, accountData });


  return (
    <div className="space-y-6">
      {/* Municipal Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-6 h-6 text-green-600" />
            <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900">Ward {wardNumber}</p>
          <p className="text-xs text-gray-600 mt-1">Your Ward Number</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Home className="w-6 h-6 text-orange-600" />
            <span className="text-xs text-orange-700">Due</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{propertyTaxDue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-600 mt-1">Property Tax Due</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-blue-700">Deadline</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{taxDueDate}</p>
          <p className="text-xs text-gray-600 mt-1">Payment Deadline</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Trash2 className="w-6 h-6 text-purple-600" />
            <span className="text-xs text-purple-700">Schedule</span>
          </div>
          <p className="text-sm font-bold text-gray-900">Mon, Wed, Fri</p>
          <p className="text-xs text-gray-600 mt-1">Garbage Collection</p>
        </div>
      </div>

      {/* Municipal-specific Features */}
      <div className="grid grid-cols-2 gap-6">
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
            onClick={() => navigate('/kiosk/bills')}
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

        {/* Garbage Collection Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Waste Collection</h3>
              <p className="text-xs text-gray-600">Garbage pickup schedule</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">Regular Collection</p>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">{garbageCollectionDay}</p>
              <p className="text-xs text-gray-600 mt-1">Time: 6:00 AM - 9:00 AM</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">Dry Waste Collection</p>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Every Tuesday</p>
              <p className="text-xs text-gray-600 mt-1">Paper, Plastic, Glass, Metal</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">Bulk Waste Pickup</p>
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">First Saturday of Month</p>
              <p className="text-xs text-gray-600 mt-1">Furniture, Electronics, etc.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Civic Facilities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Civic Facilities Near You</h3>
            <p className="text-xs text-gray-600">Community services and amenities</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Community Hall', distance: '0.5 km', status: 'Available', color: 'green' },
            { name: 'Public Library', distance: '0.8 km', status: 'Open', color: 'green' },
            { name: 'Health Center', distance: '1.2 km', status: 'Open 24/7', color: 'blue' },
            { name: 'Park & Recreation', distance: '0.3 km', status: 'Open', color: 'green' },
            { name: 'Sports Complex', distance: '1.5 km', status: 'Available', color: 'green' },
            { name: 'Swimming Pool', distance: '2.0 km', status: 'Closed', color: 'red' }
          ].map((facility, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${facility.color === 'green' ? 'bg-green-100 text-green-700' :
                  facility.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                  {facility.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{facility.name}</p>
              <p className="text-xs text-gray-600 mt-1">{facility.distance} away</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Complaints/Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            onClick={() => navigate('/kiosk/register-complaint')}
            className="text-sm text-blue-600 hover:underline font-semibold"
          >
            New Request →
          </button>
        </div>

        <div className="space-y-3">
          {[
            { type: 'Street Light', status: 'In Progress', date: 'Jan 28, 2026', color: 'blue' },
            { type: 'Road Damage', status: 'Under Review', date: 'Jan 25, 2026', color: 'yellow' },
            { type: 'Drainage Block', status: 'Resolved', date: 'Jan 20, 2026', color: 'green' }
          ].map((complaint, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => navigate('/kiosk/track-complaint')}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${complaint.color === 'green' ? 'bg-green-100' :
                  complaint.color === 'blue' ? 'bg-blue-100' :
                    'bg-yellow-100'
                  } rounded-lg flex items-center justify-center`}>
                  <FileText className={`w-4 h-4 ${complaint.color === 'green' ? 'text-green-600' :
                    complaint.color === 'blue' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{complaint.type}</p>
                  <p className="text-xs text-gray-600">{complaint.date}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${complaint.color === 'green' ? 'bg-green-100 text-green-700' :
                complaint.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                {complaint.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events & Notices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Municipal Notices & Events</h3>
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Health Camp</p>
                <p className="text-xs text-gray-600 mt-1">
                  Free health checkup camp on Feb 5, 2026 at Ward 12-A Community Hall (9 AM - 5 PM)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Cleanliness Drive</p>
                <p className="text-xs text-gray-600 mt-1">
                  Participate in the neighborhood cleanliness drive on Feb 7, 2026 (7 AM onwards)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Road Maintenance Notice</p>
                <p className="text-xs text-gray-600 mt-1">
                  Main Street road repair work scheduled from Feb 10-15, 2026. Expect traffic diversions.
                </p>
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
        <div className="grid grid-cols-3 gap-4 text-sm">
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
    </div>
  );
}
