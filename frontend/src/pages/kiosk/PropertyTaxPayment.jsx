import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKioskStore } from '../../store/useKioskStore';
import { departmentService, billService } from '../../services/api';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { ArrowLeft, Home, FileText, IndianRupee, CreditCard, Building, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import govtLogo from '../../assets/kiosk/Government_of_India_logo.svg';

export function PropertyTaxPayment() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { billId } = useParams();
    const { user, updateBill } = useKioskStore();
    const { isOnline } = useNetworkStatus();
    const enqueue = useOfflineStore(s => s.enqueue);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [propertyDetails, setPropertyDetails] = useState(null);
    const [billDetails, setBillDetails] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Property Details (from Municipal Department)
                // Using 'MUNICIPAL' service type and user's consumerId (or a default/mock one if missing)
                const consumerId = user?.consumerId || '1234567890';
                const accountResponse = await departmentService.getAccountDetails('MUNICIPAL', consumerId);

                if (accountResponse.success) {
                    setPropertyDetails(accountResponse.account);
                }

                // Fetch Bill Details
                if (billId) {
                    // detailed bill fetch if ID is present
                    // For now, we can mock or use a service if available. 
                    // Since billId is optional in the route (for direct access from dashboard), we might not always have it.
                    // If direct access, we fetch 'current' bill.
                    const bills = await billService.getUserBills({ serviceType: 'MUNICIPAL', status: 'pending' });
                    const targetBill = bills.find(b => b.id === billId) || bills[0];
                    if (targetBill) {
                        setBillDetails(targetBill);
                    }
                } else {
                    // Direct access from Dashboard - fetch latest pending bill
                    const bills = await billService.getUserBills({ serviceType: 'MUNICIPAL', status: 'pending' });
                    if (bills.length > 0) {
                        setBillDetails(bills[0]);
                    } else {
                        setError("No pending property tax bill found for this account.");
                    }
                }

            } catch (err) {
                console.error("Error fetching property tax details:", err);
                setError("Failed to load property details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, billId]);

    const handlePayment = async () => {
        setProcessing(true);

        // Simulate payment processing delay
        setTimeout(() => {
            const transactionId = (isOnline ? 'TXN' : 'OFFLINE-TXN-') + Date.now();
            const paymentDate = new Date().toISOString();

            if (!isOnline) {
                // Enqueue payment for later sync
                enqueue({
                    operationType: 'municipal_pay',
                    payload: {
                        billId: billDetails?.id,
                        serviceType: 'MUNICIPAL',
                        status: 'paid',
                        transactionId,
                        paymentMethod,
                        consumerNumber: user?.consumerId || propertyId,
                        aadharHash: user?.aadharHash
                    }
                });
            }

            if (billDetails?.id) {
                updateBill(billDetails.id, { status: 'paid' }, !isOnline);
            }

            setProcessing(false);

            navigate(`/kiosk/receipt/${transactionId}`, {
                state: {
                    bill: {
                        ...billDetails,
                        transactionId,
                        status: 'paid',
                        consumerNumber: user?.consumerId || propertyId // Ensure consumer number is passed
                    },
                    paymentDate,
                    paymentMethod,
                    department: 'Municipal',
                    isOfflinePayment: !isOnline
                }
            });
        }, 2000);
    };

    if (loading) {
        return (
            <KioskLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-600 font-semibold animate-pulse">Loading Property Details...</div>
                </div>
            </KioskLayout>
        );
    }

    // Fallback data if API fails to provide specific fields
    const propertyAddress = propertyDetails?.address || "N/A";
    const propertyOwner = propertyDetails?.ownerName || user?.name || user?.fullName || "Citizen";
    const propertyId = propertyDetails?.propertyId || propertyDetails?.propertyTaxNumber || user?.consumerId || "N/A";
    const zone = propertyDetails?.zone || "N/A";
    const carpetArea = propertyDetails?.carpetArea || propertyDetails?.propertyArea ? `${propertyDetails.propertyArea} sq. ft.` : "N/A";
    const propertyType = propertyDetails?.propertyType || "N/A";

    const totalAmount = billDetails?.amount || 0;
    const billNumber = billDetails?.billNumber || "N/A";
    const dueDate = billDetails?.dueDate ? new Date(billDetails.dueDate).toLocaleDateString() : "N/A";
    const period = billDetails?.billingPeriod || "2025-2026";


    return (
        <KioskLayout>
            <div className="max-w-6xl mx-auto space-y-6 pb-20">

                {/* Header Section similar to WaterTankerBooking */}
                <div className="flex items-center gap-4 mb-6">
                    <TouchButton
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-full border-2"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </TouchButton>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Property Tax Payment</h1>
                        <p className="text-gray-600">Review property details and pay your tax</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Property & Owner Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Property Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
                                <Home className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-800">Property Information</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Property ID</label>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{propertyId}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Owner Name</label>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{propertyOwner}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Property Address</label>
                                    <div className="flex gap-2 mt-1">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <p className="text-lg font-medium text-gray-900">{propertyAddress}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Zone / Ward</label>
                                    <p className="text-base font-medium text-gray-800 mt-1">{zone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Property Type</label>
                                    <p className="text-base font-medium text-gray-800 mt-1">{propertyType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Carpet Area</label>
                                    <p className="text-base font-medium text-gray-800 mt-1">{carpetArea}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bill Details / Tax Breakdown */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-purple-600" />
                                <h2 className="text-xl font-bold text-gray-800">Tax Assessment Details</h2>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Assessment Year</p>
                                        <p className="text-xl font-bold text-gray-900">{period}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">Bill Number</p>
                                        <p className="text-xl font-bold text-gray-900">{billNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">Due Date</p>
                                        <p className="text-xl font-bold text-red-600">{dueDate}</p>
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Tax Breakdown</h3>
                                <div className="space-y-3">
                                    {billDetails?.breakdown ? (
                                        Object.entries(billDetails.breakdown).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="font-medium text-gray-900">₹{value.toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">General Tax</span>
                                                <span className="font-medium text-gray-900">₹{(totalAmount * 0.7).toFixed(0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Cess & Charges</span>
                                                <span className="font-medium text-gray-900">₹{(totalAmount * 0.3).toFixed(0)}</span>
                                            </div>
                                        </>
                                    )}

                                    <div className="border-t border-gray-200 my-3 pt-3 flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Total Payable Amount</span>
                                        <span className="text-2xl font-bold text-blue-700">₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment & Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h2>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2 text-green-600 text-sm">
                                    <span>Early Bird Rebate (applied)</span>
                                    <span>- ₹0</span>
                                </div>
                                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Net Payable</span>
                                    <span className="font-bold text-xl text-blue-600">₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            {!isOnline && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                                    <p className="text-xs text-orange-800 font-medium flex gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>You are currently offline. Your payment will be recorded and processed automatically when the connection is restored.</span>
                                    </p>
                                </div>
                            )}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Select Payment Method</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`}
                                    >
                                        <CreditCard className="w-6 h-6" />
                                        <span className="text-sm font-medium">Card</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('upi')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`}
                                    >
                                        <IndianRupee className="w-6 h-6" />
                                        <span className="text-sm font-medium">UPI</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8">
                                <TouchButton
                                    variant="primary"
                                    size="large"
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Pay ₹{totalAmount.toLocaleString()}
                                        </>
                                    )}
                                </TouchButton>
                                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Secure Payment Gateway
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </KioskLayout>
    );
}
