import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Flame,
  Droplets,
  Building2
} from 'lucide-react';




export function TrackNewConnection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    const apps = JSON.parse(localStorage.getItem('newConnections') || '[]');
    const found = apps.find((app) => app.applicationId === applicationId.toUpperCase());

    if (found) {
      setSelectedApp(found);
      setError('');
    } else {
      setSelectedApp(null);
      setError('Application not found. Please check the Application ID.');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && applicationId.trim()) {
        e.preventDefault();
        handleSearch();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/kiosk/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applicationId, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-[#FF9800]" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-[#0066CC]" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-[#28A745]" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-[#DC3545]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-[#FF9800]';
      case 'approved':
        return 'bg-[#0066CC]';
      case 'active':
        return 'bg-[#28A745]';
      case 'rejected':
        return 'bg-[#DC3545]';
      default:
        return 'bg-gray-400';
    }
  };

  const getCategoryIcon = (serviceType) => {
    switch (serviceType) {
      case 'electricity':
        return <Zap className="w-6 h-6 text-yellow-600" />;
      case 'gas':
        return <Flame className="w-6 h-6 text-orange-600" />;
      case 'water':
        return <Droplets className="w-6 h-6 text-blue-600" />;
      case 'municipal':
        return <Building2 className="w-6 h-6 text-green-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCategoryName = (serviceType) => {
    switch (serviceType) {
      case 'electricity':
        return 'Electricity Department';
      case 'gas':
        return 'Gas Department';
      case 'water':
        return 'Water Department';
      case 'municipal':
        return 'Municipal Services';
      default:
        return 'Department';
    }
  };

  return (
    <KioskLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/kiosk/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#0066CC] bg-opacity-10 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-[#0066CC]" />
            </div>
            <h2 className="text-2xl font-bold text-[#212529]">
              Track New Connection Application
            </h2>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Enter Application ID (e.g., APP-2026-12345)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-base font-mono focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              maxLength={20}
            />
            <TouchButton
              variant="primary"
              size="medium"
              icon={<Search className="w-4 h-4" />}
              onClick={handleSearch}
              disabled={!applicationId}
            >
              Search
            </TouchButton>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-[#DC3545] text-center font-semibold">
                {error}
              </p>
            </div>
          )}
        </div>

        {selectedApp && (
          <div className="grid grid-cols-3 gap-6">
            {/* Application Details */}
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(selectedApp.serviceType)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">APPLICATION CATEGORY</p>
                    <h3 className="text-lg font-bold text-[#212529]">
                      {getCategoryName(selectedApp.serviceType)}
                    </h3>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#212529] mb-4">
                  Application Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Application ID:</span>
                    <span className="text-sm font-bold text-[#0066CC] font-mono">
                      {selectedApp.applicationId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Status:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedApp.status)}
                      <span className={`${getStatusColor(selectedApp.status)} text-white px-3 py-1 rounded-lg text-sm font-bold capitalize`}>
                        {selectedApp.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Applicant Name:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.applicantName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Mobile Number:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.mobileNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Email:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Location:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.city}, {selectedApp.state}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">Application Date:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {new Date(selectedApp.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Last Updated:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {new Date(selectedApp.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-[#212529] mb-4">
                  Processing Status
                </h3>

                <div className="relative">
                  {['pending', 'approved', 'active'].map((statusStep, index) => (
                    <div key={statusStep} className="relative pb-6 last:pb-0">
                      {index < 2 && (
                        <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-gray-200"></div>
                      )}

                      <div className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${selectedApp.status === statusStep || (
                            selectedApp.status === 'active' && statusStep !== 'pending'
                          ) ? getStatusColor(statusStep) : 'bg-gray-200'
                          }`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#212529] capitalize mb-1">
                            {statusStep === 'pending' ? 'Application Received' : statusStep === 'approved' ? 'Approved' : 'Active Connection'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {statusStep === 'pending' && 'Your application has been received and is under review'}
                            {statusStep === 'approved' && 'Your application has been approved by the department'}
                            {statusStep === 'active' && 'Your connection is now active'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-bold text-[#212529] mb-4">
                Quick Summary
              </h3>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">APPLICATION ID</p>
                  <p className="text-lg font-bold text-[#0066CC] font-mono mt-1">
                    {selectedApp.applicationId}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">CURRENT STATUS</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedApp.status)}
                    <span className={`${getStatusColor(selectedApp.status)} text-white px-3 py-1 rounded-lg text-sm font-bold capitalize`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">DEPARTMENT</p>
                  <p className="text-sm font-bold text-[#212529] mt-1">
                    {getCategoryName(selectedApp.serviceType)}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  You will receive updates via SMS and Email
                </p>
              </div>
            </div>
          </div>
        )}

        {!selectedApp && !error && (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Enter your Application ID to track the status of your new connection request
            </p>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
