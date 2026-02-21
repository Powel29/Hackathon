import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
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
import { connectionService } from '../../services/api';




export function TrackNewConnection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedService } = useKioskStore();
  const [applicationId, setApplicationId] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [error, setError] = useState('');
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(false);

  const targetDepartment = selectedService ? selectedService.toUpperCase() : 'ALL';

  const handleSearch = async () => {
    if (!applicationId) return;

    try {
      setError('');
      setSelectedApp(null);

      const app = await connectionService.track(applicationId);

      if (app) {
        setSelectedApp(app);
      } else {
        setError(t('trackNewConnection.errorNotFound') || 'Application not found. Please check the Application ID.');
      }
    } catch (e) {
      console.error("Track connection failed", e);
      setError(t('trackNewConnection.errorSystem') || 'Application not found or system error. Please try again.');
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

  useEffect(() => {
    fetchUserApplications();
  }, [targetDepartment]);

  const fetchUserApplications = async () => {
    try {
      setLoading(true);
      const filters = targetDepartment !== 'ALL' ? { serviceType: targetDepartment } : {};
      const data = await connectionService.getMyApplications(filters);
      setRecentApps(data);
    } catch (error) {
      console.error("Failed to fetch user applications", error);
    } finally {
      setLoading(false);
    }
  };

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
        return t('trackNewConnection.categoryElectricity') || 'Electricity Department';
      case 'gas':
        return t('trackNewConnection.categoryGas') || 'Gas Department';
      case 'water':
        return t('trackNewConnection.categoryWater') || 'Water Department';
      case 'municipal':
        return t('trackNewConnection.categoryMunicipal') || 'Municipal Services';
      default:
        return t('trackNewConnection.categoryDefault') || 'Department';
    }
  };

  return (
    <KioskLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => selectedApp ? setSelectedApp(null) : navigate('/kiosk/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {selectedApp ? t('trackNewConnection.backToList') : t('common.back')}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0066CC] bg-opacity-10 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-[#0066CC]" />
              </div>
              <h2 className="text-2xl font-bold text-[#212529]">
                {t('trackNewConnection.pageTitle') || 'Track Application'}
              </h2>            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder={t('trackNewConnection.placeholder') || 'Enter Application ID (e.g., APP-2026-12345)'}
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
              {t('trackNewConnection.searchButton') || 'Search'}
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

        {selectedApp ? (
          <div className="grid grid-cols-3 gap-6">
            {/* Application Details */}
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(selectedApp.serviceType?.toLowerCase())}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">{t('trackNewConnection.applicationCategory')}</p>
                    <h3 className="text-lg font-bold text-[#212529]">
                      {getCategoryName(selectedApp.serviceType?.toLowerCase())}
                    </h3>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#212529] mb-4">
                  {t('trackNewConnection.applicationDetails')}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('trackNewConnection.applicationId')}:</span>
                    <span className="text-sm font-bold text-[#0066CC] font-mono">
                      {selectedApp.applicationId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('trackNewConnection.status')}:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedApp.status)}
                      <span className={`${getStatusColor(selectedApp.status)} text-white px-3 py-1 rounded-lg text-sm font-bold capitalize`}>
                        {selectedApp.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('trackNewConnection.applicantName')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.applicantName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('trackNewConnection.mobileNumber')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.mobileNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('trackNewConnection.email')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('trackNewConnection.location')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.city}, {selectedApp.state}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('trackNewConnection.applicationDate')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t('trackNewConnection.lastUpdated')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {selectedApp.updatedAt ? new Date(selectedApp.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-[#212529] mb-4">
                  {t('trackNewConnection.processingStatus')}
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
                            {statusStep === 'pending' ? t('trackNewConnection.statusReceived') : statusStep === 'approved' ? t('trackNewConnection.statusApproved') : t('trackNewConnection.statusActive')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {statusStep === 'pending' && t('trackNewConnection.statusReceivedDesc')}
                            {statusStep === 'approved' && t('trackNewConnection.statusApprovedDesc')}
                            {statusStep === 'active' && t('trackNewConnection.statusActiveDesc')}
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
                {t('trackNewConnection.quickSummary')}
              </h3>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">{t('trackNewConnection.applicationIdLabel')}</p>
                  <p className="text-lg font-bold text-[#0066CC] font-mono mt-1">
                    {selectedApp.applicationId}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">{t('trackNewConnection.currentStatus')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedApp.status)}
                    <span className={`${getStatusColor(selectedApp.status)} text-white px-3 py-1 rounded-lg text-sm font-bold capitalize`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">{t('trackNewConnection.department')}</p>
                  <p className="text-sm font-bold text-[#212529] mt-1">
                    {getCategoryName(selectedApp.serviceType?.toLowerCase())}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <TouchButton
                  variant="secondary"
                  size="medium"
                  className="w-full mb-4"
                  onClick={async () => {
                    try {
                      const apiModule = await import('../../services/api');
                      // Find docs related to this specific application ID
                      const res = await apiModule.documentService.getRelatedDocuments(selectedApp.applicationId || selectedApp.id);
                      if (res.success && res.documents?.length > 0) {
                        // Look for the specific 'APPLICATION_RECEIPT' uploaded during checkout
                        const receipt = res.documents.find(d => d.documentType === 'APPLICATION_RECEIPT');
                        if (receipt && receipt.url) {
                          window.open(receipt.url, '_blank');
                        } else {
                          alert("Application receipt is still processing. Please try again later.");
                        }
                      } else {
                        alert("Application receipt not found.");
                      }
                    } catch (err) {
                      console.error("Failed to fetch application receipt:", err);
                      alert("Failed to load receipt.");
                    }
                  }}
                >
                  Download Application
                </TouchButton>

                <p className="text-xs text-gray-600 text-center">
                  {t('trackNewConnection.smsEmailNotification')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">{t('trackNewConnection.recentApplications')}</h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">{t('trackNewConnection.loading')}</div>
            ) : recentApps.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recentApps.map(app => (
                  <div
                    key={app.applicationId}
                    onClick={async () => {
                      // We need full details, so we call handleSearch logic or just set it if we have details?
                      // `recentApps` only has summary. We should probably fetch details or use search logic.
                      // I'll reuse handleSearch logic but with ID.
                      setApplicationId(app.applicationId);
                      // Trigger search manually or just call api directly
                      try {
                        const details = await connectionService.track(app.applicationId);
                        setSelectedApp(details);
                      } catch (e) { console.error(e); }
                    }}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-[#0066CC]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-sm text-[#0066CC] bg-blue-50 px-2 py-1 rounded">
                        {app.applicationId}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getStatusColor(app.status)} text-white`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(app.serviceType.toLowerCase())}
                      <span className="font-semibold text-gray-900">{getCategoryName(app.serviceType.toLowerCase())}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t mt-2">
                      <span>{t('trackNewConnection.appliedOn')} {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : (t('trackNewConnection.na') || 'N/A')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">{t('trackNewConnection.noApplications')}</h4>
                <p className="text-gray-500 mt-1">{t('trackNewConnection.noApplicationsDesc')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
