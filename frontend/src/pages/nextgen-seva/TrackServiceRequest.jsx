import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { KioskLayout } from '../../components/nextgen-seva/KioskLayout';
import { TouchButton } from '../../components/nextgen-seva/TouchButton';
import {
    ArrowLeft,
    Search,
    CheckCircle,
    Clock,
    AlertCircle,
    WifiOff,
    Building2,
    FileText
} from 'lucide-react';
import { serviceRequestService } from '../../services/api';
import { useOfflineStore } from '../../store/useOfflineStore';

export function TrackServiceRequest() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectedService } = useKioskStore();
    const { isOnline } = useNetworkStatus();
    const { syncQueue } = useOfflineStore();
    const [requestId, setRequestId] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [error, setError] = useState('');
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!requestId) return;

        // Check offline queue first
        const queuedMatch = syncQueue.find(item =>
            item.operationType === 'service_request' &&
            (item.id === requestId || `QUEUED-${item.id.substring(0, 8).toUpperCase()}` === requestId)
        );

        if (queuedMatch) {
            setSelectedRequest({
                requestId: `QUEUED-${queuedMatch.id.substring(0, 8).toUpperCase()}`,
                status: 'queued',
                serviceType: queuedMatch.payload.serviceType,
                requestType: queuedMatch.payload.requestType,
                details: queuedMatch.payload.details,
                createdAt: queuedMatch.createdAt,
                updatedAt: queuedMatch.createdAt,
                ...queuedMatch.payload,
                isQueued: true
            });
            setError('');
            return;
        }

        if (!isOnline) {
            setError('Connect to internet for live lookup.');
            return;
        }

        try {
            setError('');
            setSelectedRequest(null);
            // Use the API service
            const response = await serviceRequestService.getById(requestId);

            if (response && response.success && response.request) {
                setSelectedRequest(response.request);
            } else {
                setError('Request not found. Please check the Request ID.');
            }
        } catch (e) {
            console.error("Track request failed", e);
            setError('Request not found or system error. Please try again.');
        }
    }, [requestId, isOnline, syncQueue]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && requestId.trim()) {
                e.preventDefault();
                handleSearch();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                navigate('/nextgen-seva/dashboard');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [requestId, navigate, handleSearch]);

    useEffect(() => {
        fetchUserRequests();
    }, [isOnline, syncQueue]);

    const fetchUserRequests = async () => {
        // 1. Get queued items
        const queuedRequests = syncQueue
            .filter(item => item.operationType === 'service_request' && item.status !== 'synced')
            .map(item => ({
                requestId: `QUEUED-${item.id.substring(0, 8).toUpperCase()}`,
                id: item.id,
                status: 'queued',
                serviceType: item.payload.serviceType,
                requestType: item.payload.requestType,
                details: item.payload.details,
                createdAt: item.createdAt,
                updatedAt: item.createdAt,
                isQueued: true,
                ...item.payload
            }));

        if (!isOnline) {
            const filteredQueued = selectedService && selectedService !== 'ALL'
                ? queuedRequests.filter(r => r.serviceType?.toUpperCase() === selectedService.toUpperCase())
                : queuedRequests;
            setRecentRequests(filteredQueued);
            return;
        }

        try {
            setLoading(true);
            const data = await serviceRequestService.getAll();

            if (data && data.success && data.requests) {
                // Filter by department
                let targetRequests = data.requests;
                if (selectedService && selectedService !== 'ALL') {
                    targetRequests = targetRequests.filter(r => r.serviceType?.toUpperCase() === selectedService.toUpperCase());
                }

                // Merge unique ones
                const existingIds = new Set(targetRequests.map(r => r.requestId));
                const uniqueQueued = queuedRequests.filter(q => !existingIds.has(q.requestId));

                setRecentRequests([...uniqueQueued, ...targetRequests]);
            } else {
                setRecentRequests(queuedRequests);
            }
        } catch (error) {
            console.error("Failed to fetch user requests", error);
            setRecentRequests(queuedRequests);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'queued':
            case 'pending':
                return <Clock className="w-5 h-5 text-[#FF9800]" />;
            case 'in_progress':
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-[#0066CC]" />;
            case 'resolved':
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-[#28A745]" />;
            case 'rejected':
            case 'closed':
                return <CheckCircle className="w-5 h-5 text-gray-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'queued':
            case 'pending':
                return 'bg-[#FF9800]';
            case 'in_progress':
            case 'approved':
                return 'bg-[#0066CC]';
            case 'resolved':
            case 'completed':
                return 'bg-[#28A745]';
            case 'rejected':
            case 'closed':
                return 'bg-gray-500';
            default:
                return 'bg-gray-400';
        }
    };

    const statusColors = {
        queued: 'bg-orange-100 text-orange-800 border-orange-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
        approved: 'bg-blue-100 text-blue-800 border-blue-200',
        resolved: 'bg-green-100 text-green-800 border-green-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
        <KioskLayout>
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => selectedRequest ? setSelectedRequest(null) : navigate('/nextgen-seva/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {selectedRequest ? 'Back to list' : t('common.back')}
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FF9800] bg-opacity-10 rounded-lg flex items-center justify-center">
                                <Search className="w-5 h-5 text-[#FF9800]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#212529]">
                                Track Service Request
                            </h2>
                        </div>
                    </div>

                    {!isOnline && (
                        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3 shadow-md">
                            <WifiOff className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="text-sm font-bold text-orange-800 uppercase tracking-tight">Offline Mode</p>
                                <p className="text-xs text-orange-700">Connect to internet for live lookup of requests.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={requestId}
                            onChange={(e) => {
                                setRequestId(e.target.value.toUpperCase());
                                setError('');
                            }}
                            placeholder="Enter Request ID"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-base font-mono focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                            maxLength={40}
                        />
                        <TouchButton
                            variant="primary"
                            size="medium"
                            icon={<Search className="w-4 h-4" />}
                            onClick={handleSearch}
                            disabled={!requestId}
                        >
                            Search Request
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

                {selectedRequest ? (
                    <div className="grid grid-cols-3 gap-6">
                        {/* Request Details */}
                        <div className="col-span-3 space-y-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-[#212529] mb-4">
                                    Request Details
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-700">Request ID:</span>
                                        <span className="text-sm font-bold text-[#0066CC] font-mono">
                                            {selectedRequest.requestId}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-700">Request Type:</span>
                                        <span className="text-sm font-bold text-[#212529] capitalize">
                                            {selectedRequest.requestType?.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-700">Department:</span>
                                        <span className="text-sm font-bold text-[#212529] capitalize flex items-center gap-1">
                                            <Building2 className="w-4 h-4" /> {selectedRequest.serviceType}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-700">Status:</span>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(selectedRequest.status)}
                                            <span className={`${getStatusColor(selectedRequest.status)} text-white px-3 py-1 rounded-lg text-sm font-bold capitalize`}>
                                                {selectedRequest.status?.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pb-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-700 block mb-2">Description:</span>
                                        <p className="text-sm text-[#212529] bg-gray-50 p-3 rounded-lg">
                                            {selectedRequest.details?.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <span className="text-sm text-gray-700">Created On:</span>
                                        <span className="text-sm font-bold text-[#212529]">
                                            {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {selectedRequest.updatedAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">Last Updated:</span>
                                            <span className="text-sm font-bold text-[#212529]">
                                                {new Date(selectedRequest.updatedAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Your Recent Requests</h3>

                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading requests...</div>
                        ) : recentRequests.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {recentRequests.map(request => (
                                    <div
                                        key={request.requestId}
                                        onClick={() => setSelectedRequest(request)}
                                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-blue-300"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded truncate max-w-[150px]">
                                                {request.requestId.split('-')[0]}...
                                            </span>
                                            <span className={`text-[10px] px-2 py-1 rounded-full border capitalize ${statusColors[request.status?.toLowerCase()] || 'bg-gray-100'}`}>
                                                {request.status?.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{request.requestType?.replace(/_/g, ' ')}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                                            {request.details?.description || 'No description...'}
                                        </p>

                                        <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t">
                                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {request.serviceType}</span>
                                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900">No requests found</h4>
                                <p className="text-gray-500 mt-1">You haven't made any service requests yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </KioskLayout>
    );
}
