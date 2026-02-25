import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { documentService } from '../../services/api';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { ArrowLeft, MapPin, Flame, CheckCircle, Printer, Home, Clock, Calendar, FileText, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import govtLogo from '../../assets/kiosk/Government_of_India_logo.svg';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Andaman and Nicobar Islands', 'Lakshadweep', 'Dadra and Nagar Haveli'
];

const CITIES = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kadapa', 'Anantapur'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Bihar Sharif', 'Purnia', 'Arrah'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Giridih'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Davangere', 'Bellary', 'Gulbarga', 'Shimoga'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur', 'Alappuzha'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Ratlam', 'Dewas'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Thane', 'Kolhapur', 'Navi Mumbai'],
    'Manipur': ['Imphal', 'Thoubal', 'Churachandpur', 'Bishnupur'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bharatpur'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Ambassa'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Noida'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling', 'Bardhaman'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
    'Ladakh': ['Leh', 'Kargil'],
    'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    'Chandigarh': ['Chandigarh'],
    'Andaman and Nicobar Islands': ['Port Blair'],
    'Dadra and Nagar Haveli': ['Silvassa', 'Daman', 'Diu'],
    'Lakshadweep': ['Kavaratti']
};

export function GasCylinderBooking() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useKioskStore();
    const { isOnline } = useNetworkStatus();
    const enqueue = useOfflineStore(s => s.enqueue);
    const receiptRef = useRef(null);

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [receiptUrl, setReceiptUrl] = useState(null);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        mobileNumber: user?.phoneNumber || '',
        consumerId: user?.consumerId || '',
        houseNumber: '',
        buildingName: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        cylinderType: 'domestic_14',
        deliveryType: 'scheduled',
        deliveryDate: '',
        deliverySlot: '09:00 AM - 12:00 PM',
    });

    const [formErrors, setFormErrors] = useState({});

    const handleFieldChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (formErrors[field]) {
            setFormErrors({ ...formErrors, [field]: '' });
        }
    };

    const validateStep = (step) => {
        const errors = {};
        if (step === 1) {
            if (!formData.fullName.trim()) errors.fullName = t('validation.fullNameRequired');
            if (!formData.mobileNumber.trim()) errors.mobileNumber = t('validation.mobileNumberRequired');
            if (!formData.consumerId.trim()) errors.consumerId = 'Consumer ID is required';
        } else if (step === 2) {
            if (!formData.houseNumber.trim()) errors.houseNumber = t('validation.houseNumberRequired');
            if (!formData.street.trim()) errors.street = t('validation.streetLocalityRequired');
            if (!formData.city) errors.city = t('validation.cityRequired');
            if (!formData.state) errors.state = t('validation.stateRequired');
            if (!formData.pincode.trim()) errors.pincode = t('validation.pincodeRequired');
        } else if (step === 3) {
            if (formData.deliveryType === 'scheduled' && !formData.deliveryDate) {
                errors.deliveryDate = t('validation.deliveryDateRequired');
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep) && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const generateAndUploadReceipt = async (requestId, serviceRequestId) => {
        if (!receiptRef.current) return;

        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], `Receipt_${requestId}.pdf`, { type: 'application/pdf' });

            // Upload to server
            const citizenId = user?.aadhaarNumber || user?.aadharNumber;
            const uploadResponse = await documentService.uploadDocument(pdfFile, {
                citizenId: citizenId,
                relatedEntity: 'SERVICE_REQUEST',
                relatedId: serviceRequestId, // Use UUID from backend
                documentType: 'GAS_BOOKING_RECEIPT',
                department: 'GAS'
            });

            if (uploadResponse.success) {
                console.log('Receipt uploaded successfully');
                // You would typically get a public URL or similar
                const blobUrl = URL.createObjectURL(pdfBlob);
                setReceiptUrl(blobUrl);
            }
        } catch (error) {
            console.error('Error generating or uploading receipt:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSaving(true);
            const payload = {
                serviceType: 'GAS',
                requestType: 'GAS_CYLINDER_BOOKING',
                details: formData
            };

            if (!isOnline) {
                const tempId = enqueue({
                    operationType: 'gas_booking',
                    payload
                });
                setBookingId(`QUEUED-${tempId.substring(0, 6).toUpperCase()}`);
                setBookingSuccess(true);
                setIsSaving(false);
                return;
            }

            // Need to dynamically import to resolve correctly since it was removed from top level
            const apiModule = await import('../../services/api/serviceRequest.service');
            const response = await apiModule.serviceRequestService.create(payload);
            const newId = response.requestId || 'GAS-' + Date.now();
            setBookingId(newId);

            // Wait a small timeout for the receipt components to be fully ready in the background
            setTimeout(async () => {
                await generateAndUploadReceipt(newId, response.request?.requestId || response.requestId);
                setBookingSuccess(true);
                setIsSaving(false);
            }, 500);

        } catch (error) {
            console.error('Booking failed:', error);
            alert('Failed to book gas cylinder. Please try again.');
            setIsSaving(false);
        }
    };

    if (bookingSuccess) {
        return (
            <KioskLayout>
                <div className="h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-orange-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('gasCylinderBooking.bookingSuccess')}</h2>
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
                            <p className="text-sm font-semibold text-gray-600 mb-1">{t('gasCylinderBooking.bookingId')}</p>
                            <p className="text-2xl font-bold text-orange-600">{bookingId.substring(0, 8).toUpperCase()}</p>
                        </div>
                        <p className="text-gray-600 mb-8">{t('gasCylinderBooking.successMessage')}</p>
                        <div className="space-y-3">
                            {receiptUrl && (
                                <TouchButton variant="primary" size="large" icon={<FileText className="w-5 h-5" />} onClick={() => window.open(receiptUrl, '_blank')} className="w-full">
                                    {t('gasCylinderBooking.viewReceipt', 'View Receipt')}
                                </TouchButton>
                            )}
                            <TouchButton variant="secondary" size="large" icon={<Download className="w-5 h-5" />} onClick={() => {
                                const link = document.createElement('a');
                                link.href = receiptUrl;
                                link.download = `Receipt_${bookingId}.pdf`;
                                link.click();
                            }} className="w-full">
                                {t('gasCylinderBooking.downloadReceipt', 'Download Receipt')}
                            </TouchButton>
                            <TouchButton variant="secondary" size="large" icon={<Home className="w-5 h-5" />} onClick={() => navigate('/kiosk/dashboard')} className="w-full mt-4">
                                {t('gasCylinderBooking.backToDashboard')}
                            </TouchButton>
                        </div>
                    </div>
                </div>
            </KioskLayout>
        );
    }

    return (
        <KioskLayout>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Hidden metadata for receipt generation */}
                    <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                        <div ref={receiptRef} className="p-10 w-[210mm] min-h-[297mm] font-serif" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
                            <div className="flex justify-between items-start mb-10 pb-6" style={{ borderBottom: '4px solid #ea580c' }}>
                                <div className="flex items-center gap-4">
                                    <img src={govtLogo} alt="Govt Logo" className="w-20" />
                                    <div>
                                        <h2 className="text-2xl font-bold leading-tight" style={{ color: '#111827' }}>MUNICIPAL CORPORATION</h2>
                                        <p className="text-sm font-medium tracking-widest uppercase" style={{ color: '#4b5563' }}>Department of Civil Supplies & Gas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="px-4 py-1 inline-block font-bold text-lg mb-2" style={{ backgroundColor: '#ea580c', color: '#ffffff' }}>OFFICIAL RECEIPT</div>
                                    <p className="text-sm font-bold" style={{ color: '#4b5563' }}>Booking Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10 mb-10">
                                <div>
                                    <h3 className="font-bold uppercase text-xs tracking-wider mb-2" style={{ color: '#6b7280' }}>Consumer Information</h3>
                                    <p className="text-lg font-bold" style={{ color: '#111827' }}>{formData.fullName}</p>
                                    <p className="font-medium" style={{ color: '#4b5563' }}>Consumer ID: <span style={{ color: '#111827' }}>{formData.consumerId}</span></p>
                                    <p className="font-medium" style={{ color: '#4b5563' }}>Aadhar: <span style={{ color: '#111827' }}>{user?.aadharNumber?.substring(0, 4)} **** ****</span></p>
                                    <p className="font-medium" style={{ color: '#4b5563' }}>Mobile: <span style={{ color: '#111827' }}>+91 {formData.mobileNumber}</span></p>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold uppercase text-xs tracking-wider mb-2" style={{ color: '#6b7280' }}>Delivery Address</h3>
                                    <p className="font-bold" style={{ color: '#111827' }}>{formData.houseNumber}, {formData.buildingName && formData.buildingName + ','}</p>
                                    <p className="font-bold" style={{ color: '#111827' }}>{formData.street}, {formData.city}</p>
                                    <p className="font-bold" style={{ color: '#111827' }}>{formData.state} - {formData.pincode}</p>
                                </div>
                            </div>

                            <div className="mb-10">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6', borderTop: '2px solid #d1d5db', borderBottom: '2px solid #d1d5db' }}>
                                            <th className="py-4 px-2 text-left uppercase text-xs font-bold" style={{ color: '#374151' }}>Item Description</th>
                                            <th className="py-4 px-2 text-center uppercase text-xs font-bold" style={{ color: '#374151' }}>Category</th>
                                            <th className="py-4 px-2 text-right uppercase text-xs font-bold" style={{ color: '#374151' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td className="py-6 px-2">
                                                <p className="font-bold" style={{ color: '#111827' }}>Gas Refill - {formData.cylinderType.replace('_', ' ').toUpperCase()}</p>
                                                <p className="text-sm" style={{ color: '#6b7280' }}>Booking Reference: #{bookingId || 'PENDING'}</p>
                                                <p className="text-sm" style={{ color: '#6b7280' }}>Delivery Type: {formData.deliveryType.toUpperCase()}</p>
                                            </td>
                                            <td className="py-6 px-2 text-center font-bold uppercase text-sm" style={{ color: '#4b5563' }}>REFILL</td>
                                            <td className="py-6 px-2 text-right font-bold text-lg" style={{ color: '#111827' }}>₹ 803.00</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="2" className="py-4 px-2 text-right font-bold" style={{ color: '#4b5563' }}>Subtotal</td>
                                            <td className="py-4 px-2 text-right font-bold" style={{ color: '#111827' }}>₹ 803.00</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" className="py-1 px-2 text-right text-sm" style={{ color: '#6b7280' }}>CGST (0%)</td>
                                            <td className="py-1 px-2 text-right text-sm" style={{ color: '#6b7280' }}>₹ 0.00</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" className="py-1 px-2 text-right text-sm" style={{ color: '#6b7280' }}>SGST (0%)</td>
                                            <td className="py-1 px-2 text-right text-sm" style={{ color: '#6b7280' }}>₹ 0.00</td>
                                        </tr>
                                        <tr style={{ borderTop: '2px solid #111827' }}>
                                            <td colSpan="2" className="py-4 px-2 text-right text-xl font-black underline uppercase" style={{ color: '#111827' }}>Total Paid</td>
                                            <td className="py-4 px-2 text-right text-2xl font-black underline tracking-tighter" style={{ color: '#ea580c' }}>₹ 803.00</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="rounded-lg p-6 mb-10" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                                <h4 className="font-bold mb-2 flex items-center gap-2 italic" style={{ color: '#7c2d12' }}>
                                    <Clock className="w-4 h-4" /> Expected Delivery Slot
                                </h4>
                                <p className="text-lg font-bold tracking-tight" style={{ color: '#9a3412' }}>
                                    {formData.deliveryType === 'urgent'
                                        ? 'Today, Within 4 hours of booking'
                                        : `${formData.deliveryDate} | ${formData.deliverySlot}`}
                                </p>
                            </div>

                            <div className="flex justify-between items-end pt-10 mt-auto" style={{ borderTop: '1px solid #e5e7eb' }}>
                                <div className="text-xs font-medium" style={{ color: '#9ca3af' }}>
                                    <p>Computer Generated Receipt</p>
                                    <p>No Signature Required</p>
                                    <p className="mt-2">Transaction Hash: {crypto.randomUUID().toUpperCase()}</p>
                                </div>
                                <div className="text-center opacity-70 scale-90">
                                    <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: '#111827' }}>QR</div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Verify Authenticity</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate('/kiosk/dashboard')} className="p-3 bg-white shadow-md rounded-xl hover:bg-gray-50">
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t('gasCylinderBooking.title')}</h1>
                            <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="h-2 bg-gray-100">
                            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                        </div>

                        <div className="p-8">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <Flame className="w-6 h-6 text-orange-500" /> {t('gasCylinderBooking.customerDetails')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Full Name" value={formData.fullName} onChange={(v) => handleFieldChange('fullName', v)} error={formErrors.fullName} />
                                        <InputField label="Mobile Number" value={formData.mobileNumber} onChange={(v) => handleFieldChange('mobileNumber', v)} error={formErrors.mobileNumber} />
                                        <InputField label="Consumer ID / Connection No." value={formData.consumerId} onChange={(v) => handleFieldChange('consumerId', v)} error={formErrors.consumerId} />
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <MapPin className="w-6 h-6 text-orange-500" /> {t('gasCylinderBooking.deliveryAddress')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="House/Flat No." value={formData.houseNumber} onChange={(v) => handleFieldChange('houseNumber', v)} error={formErrors.houseNumber} />
                                        <InputField label="Building/Society Name" value={formData.buildingName} onChange={(v) => handleFieldChange('buildingName', v)} />
                                        <InputField label="Street/Locality" value={formData.street} onChange={(v) => handleFieldChange('street', v)} error={formErrors.street} />
                                        <InputField label="Pincode" value={formData.pincode} onChange={(v) => handleFieldChange('pincode', v)} error={formErrors.pincode} maxLength={6} />
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">State</label>
                                            <select value={formData.state} onChange={(e) => handleFieldChange('state', e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 transition-colors outline-none">
                                                <option value="">Select State</option>
                                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">City</label>
                                            <select value={formData.city} onChange={(e) => handleFieldChange('city', e.target.value)} disabled={!formData.state} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 transition-colors outline-none disabled:opacity-50">
                                                <option value="">Select City</option>
                                                {formData.state && CITIES[formData.state]?.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <Clock className="w-6 h-6 text-orange-500" /> {t('gasCylinderBooking.bookingDetails')}
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700">{t('gasCylinderBooking.cylinderType')}</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'domestic_14', label: t('gasCylinderBooking.domestic14') },
                                                    { id: 'commercial_19', label: t('gasCylinderBooking.commercial19') },
                                                    { id: 'domestic_5', label: t('gasCylinderBooking.domestic5') }
                                                ].map(type => (
                                                    <button key={type.id} onClick={() => handleFieldChange('cylinderType', type.id)} className={`p-4 rounded-2xl border-2 transition-all text-left ${formData.cylinderType === type.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                                                        <div className={`w-4 h-4 rounded-full border-2 mb-2 ${formData.cylinderType === type.id ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`} />
                                                        <span className="font-bold text-gray-700">{type.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700">{t('gasCylinderBooking.deliveryType')}</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'scheduled', label: t('gasCylinderBooking.scheduled'), icon: <Calendar className="w-5 h-5" /> },
                                                    { id: 'urgent', label: t('gasCylinderBooking.urgent'), icon: <Clock className="w-5 h-5" /> }
                                                ].map(type => (
                                                    <button key={type.id} onClick={() => handleFieldChange('deliveryType', type.id)} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.deliveryType === type.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                            {type.icon}
                                                        </div>
                                                        <span className="font-bold text-gray-700">{type.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.deliveryType === 'scheduled' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                                <InputField label={t('gasCylinderBooking.preferredDate')} type="date" value={formData.deliveryDate} onChange={(v) => handleFieldChange('deliveryDate', v)} error={formErrors.deliveryDate} />
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-700">{t('gasCylinderBooking.preferredTime')}</label>
                                                    <select value={formData.deliverySlot} onChange={(e) => handleFieldChange('deliverySlot', e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500">
                                                        <option>09:00 AM - 12:00 PM</option>
                                                        <option>12:00 PM - 03:00 PM</option>
                                                        <option>03:00 PM - 06:00 PM</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <CheckCircle className="w-6 h-6 text-orange-500" /> Review & Confirm
                                    </h2>
                                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                        <SummaryItem label="Consumer ID" value={formData.consumerId} />
                                        <SummaryItem label="Cylinder" value={formData.cylinderType.replace('_', ' ').toUpperCase()} />
                                        <SummaryItem label="Delivery" value={formData.deliveryType === 'urgent' ? 'Urgent' : `${formData.deliveryDate} (${formData.deliverySlot})`} />
                                        <SummaryItem label="Address" value={`${formData.houseNumber}, ${formData.street}, ${formData.city}, ${formData.pincode}`} />
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                        <p className="text-sm text-orange-800 text-center font-medium">
                                            Estimate Amount: <span className="text-xl font-bold">₹803.00</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-10">
                                {currentStep > 1 && (
                                    <TouchButton variant="secondary" size="large" onClick={handlePrevious} className="flex-1" disabled={isSaving}>
                                        Previous
                                    </TouchButton>
                                )}
                                <TouchButton variant="primary" size="large" onClick={currentStep === totalSteps ? handleSubmit : handleNext} className="flex-1" disabled={isSaving}>
                                    {isSaving ? 'Processing...' : currentStep === totalSteps ? 'Confirm Booking' : 'Next Step'}
                                </TouchButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </KioskLayout>
    );
}

function InputField({ label, value, onChange, error, type = 'text', maxLength }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all focus:bg-white ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-orange-500'}`} />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
            <span className="text-gray-600">{label}</span>
            <span className="font-bold text-gray-800">{value}</span>
        </div>
    );
}
