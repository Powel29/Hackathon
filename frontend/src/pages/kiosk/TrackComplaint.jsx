import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  MessageSquare,
  WifiOff
} from 'lucide-react';
import { complaintService } from '../../services/api';
import { useOfflineStore } from '../../store/useOfflineStore';

export function TrackComplaint() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { complaints: cachedComplaints, selectedService } = useKioskStore();
  const { isOnline } = useNetworkStatus();
  const { syncQueue } = useOfflineStore();
  const [complaintId, setComplaintId] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [error, setError] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const targetDepartment = selectedService ? selectedService.toUpperCase() : 'ALL';

  const handleSearch = useCallback(async () => {
    if (!complaintId) return;

    // Check offline queue first
    const queuedMatch = syncQueue.find(item =>
      item.operationType === 'complaint' &&
      (item.id === complaintId || `QUEUED-${item.id.substring(0, 8).toUpperCase()}` === complaintId)
    );

    if (queuedMatch) {
      setSelectedComplaint({
        complaintId: `QUEUED-${queuedMatch.id.substring(0, 8).toUpperCase()}`,
        status: 'queued',
        serviceType: queuedMatch.payload.serviceType,
        description: queuedMatch.payload.description,
        createdAt: queuedMatch.createdAt,
        updatedAt: queuedMatch.createdAt,
        ...queuedMatch.payload,
        isQueued: true
      });
      setError('');
      return;
    }

    if (!isOnline) {
      const match = (cachedComplaints || []).find(c => c.complaintId === complaintId);
      if (match) {
        setSelectedComplaint(match);
      } else {
        setError('Complaint not found in offline cache. Connect to internet for live lookup.');
      }
      return;
    }
    try {
      setError('');
      setSelectedComplaint(null);
      // Use the API service
      const complaint = await complaintService.track(complaintId);

      if (complaint) {
        setSelectedComplaint(complaint);
      } else {
        setError('Complaint not found. Please check the Complaint ID.');
      }
    } catch (e) {
      console.error("Track complaint failed", e);
      setError('Complaint not found or system error. Please try again.');
    }
  }, [complaintId, isOnline, cachedComplaints]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && complaintId.trim()) {
        e.preventDefault();
        handleSearch();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/kiosk/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [complaintId, navigate, handleSearch]);

  useEffect(() => {
    fetchUserComplaints();
  }, [targetDepartment, isOnline, syncQueue]);

  const fetchUserComplaints = async () => {
    let filtered = [];

    // 1. Get queued items
    const queuedComplaints = syncQueue
      .filter(item => item.operationType === 'complaint' && item.status !== 'synced')
      .map(item => ({
        complaintId: `QUEUED-${item.id.substring(0, 8).toUpperCase()}`,
        id: item.id,
        status: 'queued',
        serviceType: item.payload.serviceType,
        description: item.payload.description,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        isQueued: true,
        ...item.payload
      }));

    // 2. Filter by department
    const deptQueued = targetDepartment !== 'ALL'
      ? queuedComplaints.filter(c => c.serviceType?.toUpperCase() === targetDepartment)
      : queuedComplaints;

    if (!isOnline) {
      const cached = targetDepartment !== 'ALL'
        ? (cachedComplaints || []).filter(c => c.serviceType?.toUpperCase() === targetDepartment)
        : (cachedComplaints || []);
      setRecentComplaints([...deptQueued, ...cached]);
      return;
    }
    try {
      setLoading(true);
      const filters = targetDepartment !== 'ALL' ? { serviceType: targetDepartment } : {};
      const data = await complaintService.getUserComplaints(filters);
      // Merge unique ones
      const existingIds = new Set(data.map(c => c.complaintId));
      const uniqueQueued = deptQueued.filter(q => !existingIds.has(q.complaintId));

      setRecentComplaints([...uniqueQueued, ...data]);
    } catch (error) {
      console.error("Failed to fetch user complaints", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'queued':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'open':
        return <Clock className="w-5 h-5 text-[#FF9800]" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-[#0066CC]" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-[#28A745]" />;
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'queued':
        return 'bg-orange-500';
      case 'open':
        return 'bg-[#FF9800]';
      case 'in_progress':
        return 'bg-[#0066CC]';
      case 'resolved':
        return 'bg-[#28A745]';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusTranslationKey = (status) => {
    if (!status) return '';
    if (status === 'in_progress') return 'inProgress';
    return status;
  };

  const statusColors = {
    queued: 'bg-orange-100 text-orange-800 border-orange-200',
    open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <KioskLayout>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => selectedComplaint ? setSelectedComplaint(null) : navigate('/kiosk/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {selectedComplaint ? 'Back to list' : t('common.back')}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF9800] bg-opacity-10 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-[#FF9800]" />
              </div>
              <h2 className="text-2xl font-bold text-[#212529]">
                {t('complaints.trackComplaint')}
              </h2>
            </div>
          </div>

          {!isOnline && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3 shadow-md">
              <WifiOff className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-bold text-orange-800 uppercase tracking-tight">Offline Mode: Cached Data</p>
                <p className="text-xs text-orange-700">Showing complaints from your last online session. Search and status updates are limited until reconnected.</p>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => {
                setComplaintId(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder={t('complaints.enterComplaintId')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-base font-mono focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              maxLength={20}
            />
            <TouchButton
              variant="primary"
              size="medium"
              icon={<Search className="w-4 h-4" />}
              onClick={handleSearch}
              disabled={!complaintId}
            >
              {t('complaints.searchComplaint')}
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

        {selectedComplaint ? (
          <div className="grid grid-cols-3 gap-6">
            {/* Complaint Details */}
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-[#212529] mb-4">
                  {t('complaints.complaintDetails')}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('complaints.complaintId')}:</span>
                    <span className="text-sm font-bold text-[#0066CC] font-mono">
                      {selectedComplaint.complaintId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('complaints.complaintType')}:</span>
                    <span className="text-sm font-bold text-[#212529] capitalize">
                      {t(`dashboard.${selectedComplaint.serviceType.toLowerCase()}`)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('complaints.complaintStatus')}:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedComplaint.status)}
                      <span className={`${getStatusColor(selectedComplaint.status)} text-white px-3 py-1 rounded-lg text-sm font-bold capitalize`}>
                        {t(`complaints.${getStatusTranslationKey(selectedComplaint.status)}`) || selectedComplaint.status}
                      </span>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700 block mb-2">{t('complaints.description')}:</span>
                    <p className="text-sm text-[#212529] bg-gray-50 p-3 rounded-lg">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {selectedComplaint.resolutionNote && (
                    <div className="pb-3 border-b border-gray-100 italic">
                      <span className="text-sm text-[#0066CC] font-bold block mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> {t('complaints.adminNote') || 'Official Comment'}:
                      </span>
                      <p className="text-sm text-[#212529] bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        {selectedComplaint.resolutionNote}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('complaints.createdOn')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t('complaints.lastUpdated')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {new Date(selectedComplaint.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technician Info */}
              {selectedComplaint.technician && (
                <div className="bg-gradient-to-r from-[#0066CC] to-[#004080] rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {t('complaints.assignedTechnician')}
                  </h3>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white mb-1">
                        {selectedComplaint.technician.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-white opacity-90">
                        <Phone className="w-4 h-4" />
                        <span>{selectedComplaint.technician.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#212529] mb-4">
                {t('complaints.timeline')}
              </h3>

              <div className="relative">
                {(selectedComplaint.statusHistory || []).map((event, index) => (
                  <div key={index} className="relative pb-6 last:pb-0">
                    {index !== (selectedComplaint.statusHistory?.length - 1) && (
                      <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    <div className="flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(event.newStatus?.toLowerCase())}`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#212529] capitalize mb-1">
                          {t(`complaints.${getStatusTranslationKey(event.newStatus?.toLowerCase())}`) || event.newStatus?.replace('_', ' ')}
                        </p>
                        {event.citizenMessage && (
                          <p className="text-xs text-gray-700 bg-blue-50/50 p-2 rounded border border-blue-100/50 mb-1 leading-relaxed">
                            {event.citizenMessage}
                          </p>
                        )}
                        <p className="text-[10px] font-medium text-gray-400">
                          {new Date(event.changedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!selectedComplaint.statusHistory || selectedComplaint.statusHistory.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No history available</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Your Recent Complaints</h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading complaints...</div>
            ) : recentComplaints.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentComplaints.map(complaint => (
                  <div
                    key={complaint.complaintId}
                    onClick={() => setSelectedComplaint(complaint)}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-blue-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {complaint.complaintId}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border capitalize ${statusColors[complaint.status?.toLowerCase()] || 'bg-gray-100'}`}>
                        {complaint.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{complaint.title || complaint.complaintType}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                      {complaint.description}
                    </p>

                    <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t">
                      <span>{complaint.serviceType}</span>
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">No complaints found</h4>
                <p className="text-gray-500 mt-1">You haven't registered any complaints yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
