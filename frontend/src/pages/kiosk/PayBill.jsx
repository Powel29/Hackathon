import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { LoadingScreen } from '../../components/kiosk/LoadingScreen';
import { ArrowLeft, CreditCard, FileText, WifiOff } from 'lucide-react';

export function PayBill() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { billId } = useParams();
  const { bills, updateBill } = useKioskStore();
  const { isOnline } = useNetworkStatus();
  const enqueue = useOfflineStore(s => s.enqueue);
  const [isProcessing, setIsProcessing] = useState(false);

  const bill = bills.find(b => b.id === billId);

  if (!bill) {
    return (
      <KioskLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-gray-600 mb-4">{t('payBill.billNotFound')}</p>
          <TouchButton
            variant="primary"
            size="medium"
            onClick={() => navigate('/kiosk/bills')}
          >
            {t('goBack')}
          </TouchButton>
        </div>
      </KioskLayout>
    );
  }
  const handlePayment = () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const transactionId = isOnline ? 'TXN' + Date.now() : 'OFFLINE-TXN-' + Date.now();

      if (!isOnline) {
        // Enqueue payment for later sync
        enqueue({
          operationType: 'pay_bill',
          payload: {
            billId: bill.id,
            serviceType: bill.type || bill.serviceType,
            status: 'paid',
            transactionId,
            paymentMethod: 'Card',
            // Non-PII link for offline sync attribute
            aadharHash: user?.aadharHash
          }
        });
      }

      // Update bill status to paid locally
      updateBill(bill.id, { status: 'paid' }, !isOnline);

      setIsProcessing(false);
      navigate(`/kiosk/receipt/${transactionId}`, {
        state: {
          bill: { ...bill, status: 'paid' },
          transactionId,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'Card',
          isOfflinePayment: !isOnline
        }
      });
    }, 2000);
  };
  if (isProcessing) {
    return <LoadingScreen message={t('bills.processingPayment')} />;
  }
  return (
    <KioskLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/kiosk/bills')}
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

          <div className="flex gap-3">
            <TouchButton
              variant="secondary"
              size="medium"
              onClick={() => navigate('/kiosk/bills')}
              className="flex-1"
            >
              {t('cancel')}
            </TouchButton>

            <TouchButton
              variant="primary"
              size="medium"
              onClick={handlePayment}
              className="flex-1"
            >
              {t('proceedToPay')}
            </TouchButton>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
