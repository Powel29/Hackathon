import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
import { KioskLayout } from '../../components/nextgen-seva/KioskLayout';
import { TouchButton } from '../../components/nextgen-seva/TouchButton';
import { LoadingScreen } from '../../components/nextgen-seva/LoadingScreen';
import { ArrowLeft, CreditCard, FileText, WifiOff } from 'lucide-react';
import axios from 'axios';

export function PayBill() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { billId } = useParams();
  const { bills, updateBill } = useKioskStore();
  const { isOnline } = useNetworkStatus();
  const enqueue = useOfflineStore(s => s.enqueue);
  const [isProcessing, setIsProcessing] = useState(false);

  // Razorpay checkout script injection
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const bill = bills.find(b => b.id === billId);

  if (!bill) {
    return (
      <KioskLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-gray-600 mb-4">{t('payBill.billNotFound')}</p>
          <TouchButton
            variant="primary"
            size="medium"
            onClick={() => navigate('/nextgen-seva/bills')}
          >
            {t('goBack')}
          </TouchButton>
        </div>
      </KioskLayout>
    );
  }
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Use actual bill data from props or state
      const billId = bill.id || bill.billId;
      const billType = bill.type || bill.serviceType || bill.billType || "";
      const amount = bill.amount;
      const gateway = "razorpay";
      const status = "PENDING";
      const transactionRef = undefined; // will be set after payment
      // Add other bill-type-specific IDs if available
      const electricityBillId = bill.electricityBillId || undefined;
      const gasBillId = bill.gasBillId || undefined;
      const municipalBillId = bill.municipalBillId || undefined;
      const waterBillId = bill.waterBillId || undefined;

      // Create order on backend
      const { data: order } = await axios.post(
        "http://localhost:5001/api/payment/create-order",
        { amount, billId, billType, gateway, status, electricityBillId, gasBillId, municipalBillId, waterBillId }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        handler: async function (response) {
          const verifyResult = await axios.post("http://localhost:5001/api/payment/verify-payment", {
            ...response,
            billId,
            billType,
            amount,
            gateway,
            status: "SUCCESS",
            electricityBillId,
            gasBillId,
            municipalBillId,
            waterBillId
          });
          if (verifyResult.data && verifyResult.data.success) {
            // Update bill status in local state/store
            updateBill(billId, { status: "PAID" });
            // Redirect to payment success/receipt page
            navigate(`/nextgen-seva/receipt/${response.razorpay_payment_id}`, {
              state: {
                bill: { ...bill, status: "PAID" },
                transactionId: response.razorpay_payment_id,
                paymentDate: new Date().toISOString(),
                paymentMethod: "Card",
                isOfflinePayment: !isOnline
              }
            });
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to process payment');
      setIsProcessing(false);
    }
  };
  if (isProcessing) {
    return <LoadingScreen message={t('bills.processingPayment')} />;
  }
  return (
    <KioskLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/nextgen-seva/bills')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#0066CC] bg-opacity-10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#0066CC]" />
            </div>
            <h2 className="text-2xl font-bold text-[#212529]">
              {t('paymentSummary')}
            </h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-5 h-5 text-[#0066CC]" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#212529]">
                  {bill.billNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  {bill.billingPeriod}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{t('consumerNumber')}:</span>
                <span className="text-sm font-semibold text-[#212529]">
                  {bill.consumerNumber}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{t('billingPeriod')}:</span>
                <span className="text-sm font-semibold text-[#212529]">
                  {bill.billingPeriod}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{t('dueDate')}:</span>
                <span className="text-sm font-semibold text-[#212529]">
                  {new Date(bill.dueDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-700">{t('amount')}:</span>
                  <span className="text-2xl font-bold text-[#0066CC]">
                    ₹{bill.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${isOnline ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4 mb-6`}>
            <p className="text-sm text-center text-gray-700 flex items-center justify-center gap-2">
              {!isOnline && <WifiOff className="w-4 h-4 text-orange-600" />}
              {isOnline
                ? t('bills.securePayment', 'Your payment will be processed securely')
                : 'Device is offline. Payment will be recorded locally and synced when online.'}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <TouchButton
              variant="secondary"
              size="medium"
              onClick={() => navigate('/nextgen-seva/bills')}
              className="flex-1"
            >
              {t('cancel')}
            </TouchButton>

            <PayButton bill={bill} navigate={navigate} isOnline={isOnline} updateBill={updateBill} />
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

// PayButton component for explicit payment trigger
function PayButton({ bill, navigate, isOnline, updateBill }) {
  const handleRazorpay = async () => {
    // Extract all relevant attributes from bill/schema
    const billId = bill.id || bill.billId;
    const billType = bill.type || bill.serviceType || bill.billType || "";
    const amount = bill.amount;
    const gateway = "razorpay";
    const status = "PENDING";
    const electricityBillId = bill.electricityBillId || undefined;
    const gasBillId = bill.gasBillId || undefined;
    const municipalBillId = bill.municipalBillId || undefined;
    const waterBillId = bill.waterBillId || undefined;

    // Create order on backend
    const { data: order } = await axios.post(
      "http://localhost:5001/api/payment/create-order",
      { amount, billId, billType, gateway, status, electricityBillId, gasBillId, municipalBillId, waterBillId }
    );

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      handler: async function (response) {
        const verifyResult = await axios.post("http://localhost:5001/api/payment/verify-payment", {
          ...response,
          billId,
          billType,
          amount,
          gateway,
          status: "SUCCESS",
          electricityBillId,
          gasBillId,
          municipalBillId,
          waterBillId
        });
        if (verifyResult.data && verifyResult.data.success) {
          // Update bill status in local state/store
          updateBill(billId, { status: "PAID" });
          // Redirect to payment success/receipt page
          navigate(`/nextgen-seva/receipt/${response.razorpay_payment_id}`, {
            state: {
              bill: { ...bill, status: "PAID" },
              transactionId: response.razorpay_payment_id,
              paymentDate: new Date().toISOString(),
              paymentMethod: "Card",
              isOfflinePayment: !isOnline
            }
          });
        } else {
          toast.error("Payment verification failed");
        }
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={handleRazorpay} className="btn btn-primary">
      Pay
    </button>
  );
}
