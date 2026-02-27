import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/nextgen-seva/KioskLayout';
import { TouchButton } from '../../components/nextgen-seva/TouchButton';
import { ArrowLeft, FileText, Download, Calendar, Tag, RefreshCw, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { documentService } from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function MyDocuments() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated, selectedService } = useKioskStore();
    const { isOnline } = useNetworkStatus();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/nextgen-seva/');
            return;
        }
        if (isOnline) {
            fetchDocuments();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user, navigate, selectedService, isOnline]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const citizenId = user?.aadhaarNumber || user?.aadharNumber;
            const docs = await documentService.getUserDocuments(citizenId, selectedService);
            setDocuments(docs || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Failed to load your documents');
        } finally {
            setLoading(false);
        }
    };

    const openDocument = (url) => {
        if (!url) {
            toast.error('Document link not available');
            return;
        }
        window.open(url, '_blank');
    };

    const getEntityLabel = (entity) => {
        const labels = {
            'BILL': 'Bill / Invoice',
            'SERVICE_REQUEST': 'Service Request',
            'CONNECTION_APPLICATION': 'New Connection',
            'COMPLAINT': 'Complaint',
            'USER_IDENTITY': 'Identity Document'
        };
        return labels[entity] || entity;
    };

    const getTypeLabel = (type) => {
        const labels = {
            'PAYMENT_RECEIPT': 'Payment Receipt',
            'APPLICATION_RECEIPT': 'Application Receipt',
            'CHALLAN': 'Challan',
            'SUPPORTING_DOC': 'Supporting Document',
            'ID_PROOF': 'ID Proof',
            'ADDRESS_PROOF': 'Address Proof',
            'GAS_BOOKING_RECEIPT': 'Gas Cylinder Booking Receipt'
        };
        return labels[type] || type;
    };

    const getEntityColor = (entity) => {
        switch (entity) {
            case 'BILL': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SERVICE_REQUEST': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'CONNECTION_APPLICATION': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLAINT': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredDocuments = documents.filter(doc => filter === 'ALL' || doc.relatedEntity === filter);

    const filterOptions = [
        { value: 'ALL', label: 'All Documents' },
        { value: 'BILL', label: 'Bills & Receipts' },
        { value: 'CONNECTION_APPLICATION', label: 'Applications' },
        { value: 'SERVICE_REQUEST', label: 'Service Requests' }
    ];

    return (
        <KioskLayout>
            <div className="max-w-6xl mx-auto p-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                            aria-label={t('common.back')}
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-[#212529]">{t('dashboard.myDocuments', 'My Documents')}</h1>
                            <p className="text-gray-600 mt-1">View and download your digital receipts and records</p>
                        </div>
                    </div>
                    <TouchButton
                        variant="outline"
                        size="medium"
                        icon={<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : 'text-gray-600'}`} />}
                        onClick={fetchDocuments}
                        disabled={loading || !isOnline}
                    >
                        {t('common.refresh', 'Refresh')}
                    </TouchButton>
                </div>

                {!isOnline && (
                    <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="bg-orange-100 p-3 rounded-xl">
                            <WifiOff className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-orange-900">Documents Unavailable Offline</h3>
                            <p className="text-sm text-orange-700">Digital records and receipts require a secure connection to the central repository. Please try again once internet connectivity is restored.</p>
                        </div>
                    </div>
                )}
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${filter === option.value
                                ? 'bg-[#E83E8C] text-white border-[#E83E8C] shadow-md shadow-pink-200'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#E83E8C] hover:bg-pink-50'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#E83E8C] rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 text-lg font-medium">Fetching your documents...</p>
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
                            <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No documents found</h3>
                        <p className="text-gray-500 text-center max-w-md">
                            {filter === 'ALL'
                                ? "You haven't generated any documents, receipts, or applications yet."
                                : `You don't have any documents matching the "${filterOptions.find(o => o.value === filter)?.label}" category.`}
                        </p>
                        {filter !== 'ALL' && (
                            <TouchButton variant="secondary" size="medium" onClick={() => setFilter('ALL')} className="mt-6">
                                Clear Filters
                            </TouchButton>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredDocuments.map((doc) => (
                            <div
                                key={doc.documentId}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#E83E8C] transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                                onClick={() => openDocument(doc.url)}
                            >
                                {/* Card Header Top Accent */}
                                <div className={`h-1.5 w-full ${getEntityColor(doc.relatedEntity).split(' ')[0]}`}></div>

                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Tags Row */}
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${getEntityColor(doc.relatedEntity)}`}>
                                            {getEntityLabel(doc.relatedEntity)}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {doc.createdAt ? format(new Date(doc.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                        </span>
                                    </div>

                                    {/* Title & Info */}
                                    <div className="flex-1 mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E83E8C] transition-colors line-clamp-2">
                                            {getTypeLabel(doc.documentType)}
                                        </h3>
                                        <div className="flex flex-col gap-1.5 mt-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Tag className="w-4 h-4 opacity-70" />
                                                <span className="font-medium">Ref ID:</span>
                                                <span className="text-gray-800 truncate" title={doc.relatedId}>{(doc.relatedId || '').substring(0, 18)}...</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FileText className="w-4 h-4 opacity-70" />
                                                <span className="font-medium">File:</span>
                                                <span className="text-gray-800 truncate">{doc.fileName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button Segment */}
                                    <div className="pt-4 border-t border-gray-100 mt-auto">
                                        <div className="flex items-center justify-center w-full py-2.5 px-4 bg-gray-50 group-hover:bg-[#E83E8C] group-hover:text-white rounded-xl text-sm font-semibold text-gray-700 transition-colors gap-2">
                                            <Download className="w-4 h-4" />
                                            View Document
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </KioskLayout>
    );
}
