import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { ArrowLeft, FileText, Upload, Building2 } from 'lucide-react';
import { serviceRequestService, documentService } from '../../services/api';

export function MunicipalServiceRequests() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectedService, user } = useKioskStore();
    const { isOnline } = useNetworkStatus();
    const enqueue = useOfflineStore(s => s.enqueue);

    const [description, setDescription] = useState('');
    const [selectedRequestType, setSelectedRequestType] = useState('');
    const [files, setFiles] = useState([]);
    const [fileErrors, setFileErrors] = useState([]);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [requestId, setRequestId] = useState('');

    const MAX_FILES = 3;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];

    // Redirect if no service selected or not municipal
    useEffect(() => {
        if (!selectedService || selectedService !== 'municipal') {
            navigate('/kiosk/service-selection');
        }
    }, [selectedService, navigate]);

    // Specific Municipal Request Types
    const requestTypes = [
        'Birth Certificate',
        'Death Certificate',
        'Property Tax Assessment',
        'Trade License',
        'Building Plan Approval',
        'Water Connection',
        'Sewerage Connection',
        'Road Cutting Permission',
        'Community Hall Booking',
        'Solid Waste Management'
    ];

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newErrors = [];
            const newFiles = [...files];

            Array.from(e.target.files).forEach((selectedFile) => {
                // Check file count
                if (newFiles.length >= MAX_FILES) {
                    newErrors.push({
                        filename: selectedFile.name,
                        error: `Maximum ${MAX_FILES} files allowed`
                    });
                    return;
                }

                // Check file size
                if (selectedFile.size > MAX_FILE_SIZE) {
                    const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
                    newErrors.push({
                        filename: selectedFile.name,
                        error: `File size must be under ${sizeMB}MB (Current: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)`
                    });
                    return;
                }

                // Check file extension
                const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
                if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
                    newErrors.push({
                        filename: selectedFile.name,
                        error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`
                    });
                    return;
                }

                // All validations passed
                newFiles.push({
                    file: selectedFile,
                    id: Date.now().toString() + Math.random()
                });
            });

            setFiles(newFiles);
            setFileErrors(newErrors);
        }

        // Reset input
        e.target.value = '';
    };

    const validate = () => {
        const newErrors = {};

        if (!selectedRequestType) {
            newErrors.requestType = 'Please select a request type';
        }

        if (description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        } else if (description.length > 2000) {
            newErrors.description = 'Description must not exceed 2000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !selectedService) return;

        try {
            function getBackendRequestType(key) {
                const mapping = {
                    'birth certificate': 'BIRTH_CERTIFICATE',
                    'death certificate': 'DEATH_CERTIFICATE',
                    'property tax assessment': 'PROPERTY_TAX_ASSESSMENT',
                    'trade license': 'TRADE_LICENSE',
                    'building plan approval': 'BUILDING_PLAN_APPROVAL',
                    'water connection': 'WATER_CONNECTION',
                    'sewerage connection': 'SEWERAGE_CONNECTION',
                    'road cutting permission': 'ROAD_CUTTING_PERMISSION',
                    'community hall booking': 'COMMUNITY_HALL_BOOKING',
                    'solid waste management': 'SOLID_WASTE_MANAGEMENT',
                };
                return mapping[key.toLowerCase()] || 'OTHER';
            }

            const requestType = getBackendRequestType(selectedRequestType);

            const payloadDetails = {
                description,
                title: `Request for ${selectedRequestType}`
            };

            const requestData = {
                serviceType: selectedService.toUpperCase(),
                requestType,
                details: payloadDetails,
                aadharHash: user?.aadharHash
            };

            if (!isOnline) {
                // Offline Queue Routing
                const tempId = enqueue({
                    operationType: 'service_request',
                    payload: requestData
                });
                setRequestId(`QUEUED-${tempId.substring(0, 6).toUpperCase()}`);
                setShowSuccess(true);
                return;
            }

            const response = await serviceRequestService.create(requestData);

            if (response && response.success) {
                const newRequestId = response.requestId;
                // In actual implementation, we'd have an internalId returned if we need to attach documents to it.
                // Assuming response.request has the details needed for docs.
                const internalId = response.request?.requestId || newRequestId;
                setRequestId(newRequestId);

                // Upload files if any
                if (files.length > 0) {
                    const citizenId = response.request?.citizenId || user?.aadhaarNumber;
                    if (!citizenId) {
                        console.error('Cannot upload documents: citizenId unavailable');
                    } else {
                        const uploadErrors = [];
                        for (const fileObj of files) {
                            try {
                                await documentService.uploadDocument(fileObj.file, {
                                    citizenId,
                                    department: selectedService,
                                    relatedEntity: 'SERVICE_REQUEST',
                                    relatedId: internalId, // Must be UUID
                                    documentType: 'SUPPORTING_DOCUMENT'
                                });
                            } catch (fileErr) {
                                console.error(`Failed to upload ${fileObj.file.name}:`, fileErr);
                                uploadErrors.push(fileObj.file.name);
                            }
                        }
                        if (uploadErrors.length > 0) {
                            console.warn(`Failed to upload: ${uploadErrors.join(', ')}`);
                        }
                    }
                }

                setShowSuccess(true);
            }
        } catch (error) {
            console.error("Service request submission failed", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to submit request. Please try again.";
            alert(`Submission Error: ${errorMessage}`);
        }
    };

    if (showSuccess) {
        return (
            <KioskLayout>
                <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-lg w-full text-center">
                        <div className="w-16 h-16 bg-[#28A745] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <div className="w-10 h-10 bg-[#28A745] rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl">✓</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#212529] mb-2">
                            Service Request Submitted!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your request for {selectedRequestType} has been successfully registered.
                        </p>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-[#212529] mb-4">
                                Your Request ID
                            </h3>
                            <div className="bg-gray-50 border-2 border-[#0066CC] rounded-lg p-6">
                                <p className="text-2xl font-mono font-bold text-[#0066CC]">
                                    {requestId}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Please save this Request ID for tracking your request status
                        </p>

                        <div className="flex gap-3">
                            <TouchButton
                                variant="secondary"
                                size="medium"
                                onClick={() => navigate('/kiosk/track-service-request')}
                                className="flex-1"
                            >
                                Track Request
                            </TouchButton>

                            <TouchButton
                                variant="primary"
                                size="medium"
                                onClick={() => navigate('/kiosk/dashboard')}
                                className="flex-1"
                            >
                                Back to Dashboard
                            </TouchButton>
                        </div>
                    </div>
                </div>
            </KioskLayout>
        );
    }

    if (!selectedService || selectedService !== 'municipal') {
        return null; // Will redirect via useEffect
    }

    return (
        <KioskLayout>
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/kiosk/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-gray-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#212529]">
                                    Municipal Service Requests
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Request civic services and documents from the municipal corporation
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Request Types - Quick Select */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Select Service Request Type *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {requestTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setSelectedRequestType(type);
                                        setErrors({ ...errors, requestType: undefined });
                                    }}
                                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all text-left ${selectedRequestType === type
                                        ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        {errors.requestType && (
                            <span className="text-xs text-[#DC3545] mt-1 block">{errors.requestType}</span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Additional Details *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setErrors({ ...errors, description: undefined });
                            }}
                            placeholder="Provide necessary details for your service request (e.g., specific property address, name to be added in certificate)..."
                            className="w-full h-32 p-4 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                            maxLength={2000}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-600">
                                Minimum 20 characters • {description.length} / 2000
                            </span>
                            {errors.description && (
                                <span className="text-xs text-[#DC3545]">{errors.description}</span>
                            )}
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Upload Supporting Documents (Optional)
                        </label>
                        {!isOnline ? (
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg text-sm font-medium">
                                Document upload is currently unavailable while offline. You can still submit the request details, and it will sync when the connection is restored.
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-gray-600 mb-3">
                                    Maximum {MAX_FILES} files • Maximum 5MB per file • Allowed: JPG, PNG, PDF
                                </p>

                                <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {files.length === 0 ? 'Click to upload files' : `${files.length}/${MAX_FILES} files selected`}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            You can select multiple files at once
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </>
                        )}

                        {/* File Errors */}
                        {fileErrors.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {fileErrors.map((error, index) => (
                                    <div
                                        key={index}
                                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                                    >
                                        <p className="text-sm text-gray-700">
                                            <strong className="text-red-600">{error.filename}:</strong>
                                            <span className="text-red-600 ml-1">{error.error}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Uploaded Files List */}
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {files.map((uploadedFile) => (
                                    <div
                                        key={uploadedFile.id}
                                        className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                                <span className="text-xs text-green-700 font-bold">
                                                    {uploadedFile.file.name.split('.').pop()?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-700 font-medium">
                                                    {uploadedFile.file.name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)}MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFiles(files.filter(f => f.id !== uploadedFile.id));
                                                setFileErrors(fileErrors.filter(e => e.filename !== uploadedFile.file.name));
                                            }}
                                            className="text-sm text-red-600 hover:underline font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Important Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            <strong>ℹ️ Note:</strong> Ensure all provided details are accurate. A municipal officer may contact you for further verification or additional documents if required.
                        </p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3">
                        <TouchButton
                            variant="secondary"
                            size="medium"
                            onClick={() => navigate('/kiosk/dashboard')}
                            className="flex-1"
                        >
                            {t('common.cancel')}
                        </TouchButton>

                        <TouchButton
                            variant="primary"
                            size="medium"
                            onClick={handleSubmit}
                            className="flex-1"
                        >
                            Submit Request
                        </TouchButton>
                    </div>
                </div>
            </div>
        </KioskLayout>
    );
}
