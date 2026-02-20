import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../store/useKioskStore';
import { serviceRequestService } from '../../services/api/serviceRequest.service';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, FileText, Droplets } from 'lucide-react';

export function TrackRequest() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectedService } = useKioskStore();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const targetDepartment = selectedService ? selectedService.toUpperCase() : 'ALL';

    useEffect(() => {
        fetchRequests();
    }, [targetDepartment]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await serviceRequestService.getAll();
            let allRequests = data.requests || [];

            if (targetDepartment !== 'ALL') {
                allRequests = allRequests.filter(req => req.serviceType?.toUpperCase() === targetDepartment);
            }

            setRequests(allRequests);
        } catch (error) {
            console.error("Failed to fetch service requests", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
            case 'COMPLETED':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'PENDING':
                return <Clock className="w-6 h-6 text-orange-500" />;
            case 'REJECTED':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            default:
                return <Clock className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <KioskLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-gray-600">Loading requests...</p>
                </div>
            </KioskLayout>
        );
    }

    return (
        <KioskLayout>
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/kiosk/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('common.back') || 'Back'}
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Track Service Requests</h1>
                        <p className="text-gray-600">View status of your submitted requests</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List of Requests */}
                    <div className="lg:col-span-1 space-y-4">
                        {requests.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                                <p className="text-gray-500">No requests found</p>
                            </div>
                        ) : (
                            requests.map((request) => (
                                <div
                                    key={request.requestId}
                                    onClick={() => setSelectedRequest(request)}
                                    className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all ${selectedRequest?.requestId === request.requestId
                                        ? 'border-blue-500 ring-2 ring-blue-100'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-xs text-gray-500">
                                            #{request.requestId.slice(0, 8)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">
                                        {request.requestType?.replace('_', ' ') || 'Service Request'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Request Details */}
                    <div className="lg:col-span-2">
                        {selectedRequest ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                                        <p className="text-sm text-gray-500">ID: {selectedRequest.requestId}</p>
                                    </div>
                                    {getStatusIcon(selectedRequest.status)}
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Service Type</label>
                                            <p className="font-medium text-gray-900">{selectedRequest.serviceType}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Submitted On</label>
                                            <p className="font-medium text-gray-900">
                                                {new Date(selectedRequest.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedRequest.requestType === 'WATER_TANKER' && selectedRequest.details && (
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                            <h3 className="flex items-center gap-2 font-bold text-blue-800 mb-3">
                                                <Droplets className="w-5 h-5" />
                                                Water Tanker Details
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex justify-between border-b border-blue-200 pb-2">
                                                    <span className="text-blue-600">Quantity</span>
                                                    <span className="font-semibold text-blue-900">{selectedRequest.details.waterQuantity} L</span>
                                                </div>
                                                <div className="flex justify-between border-b border-blue-200 pb-2">
                                                    <span className="text-blue-600">Delivery Date</span>
                                                    <span className="font-semibold text-blue-900">{selectedRequest.details.deliveryType === 'immediate' ? 'Immediate' : selectedRequest.details.deliveryDate}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-blue-600 block mb-1">Address</span>
                                                    <span className="font-semibold text-blue-900 block truncate">
                                                        {selectedRequest.details.houseNumber}, {selectedRequest.details.street}, {selectedRequest.details.city}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Add more specific detail views for other request types here */}

                                    {/* Raw Details Fallback */}
                                    {selectedRequest.requestType !== 'WATER_TANKER' && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <pre className="text-xs text-gray-600 overflow-auto">
                                                {JSON.stringify(selectedRequest.details, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 h-full flex items-center justify-center p-12 text-gray-400">
                                <div className="text-center">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Select a request to view details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </KioskLayout>
    );
}
