import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { CheckCircle, Printer, Mail, MessageSquare, QrCode, Home, AlertCircle, Database } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import govtLogo from '../../assets/kiosk/Government_of_India_logo.svg';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { documentService } from '../../services/api';
import { useRef, useEffect, useState, useCallback } from 'react';

export function Receipt() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const location = useLocation();
  const { user, selectedService } = useKioskStore();
  const receiptDocRef = useRef(null);

  const { bill, paymentDate, isOfflinePayment: stateIsOfflinePayment } = location.state || {};
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const { isOnline } = useNetworkStatus();
  const isOfflinePayment = stateIsOfflinePayment || !isOnline;

  const generateAndUploadReceipt = useCallback(async (isManual = false) => {
    try {
      const cacheKey = `receipt_uploaded_${transactionId}`;
      if (!isManual && sessionStorage.getItem(cacheKey)) {
        setUploadStatus('success');
        return;
      }

      if (!receiptDocRef.current) return;
      // If offline, we can't upload.
      if (!isOnline && !isManual) {
        console.log(" [Receipt] Skipping auto-upload while offline");
        return;
      }

      if (!isOnline && isManual) {
        // For manual triggers (like download/print), we still generate PDF but skip API upload
        // Actually, let's just generate the PDF for download but not call the service if offline.
      }
      setUploadStatus('uploading');

      const element = receiptDocRef.current;
      const parent = element.closest('.print-receipt');

      // Temporarily ensure it is rendered but keep it off-screen to avoid "flashing"
      const originalParentStyle = parent.getAttribute('style') || '';
      const originalElementStyle = element.getAttribute('style') || '';

      parent.style.position = 'fixed';
      parent.style.left = '-9999px';
      parent.style.top = '0';
      parent.style.visibility = 'visible';
      parent.style.display = 'block';
      parent.style.width = '750px'; // Force container width

      element.style.width = '750px'; // Force element width
      element.style.margin = '0';    // Force left alignment
      element.style.maxWidth = 'none';

      const canvas = await html2canvas(element, {
        scale: 3, // High quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 750,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.querySelector('.print-receipt');
          if (clonedEl) {
            clonedEl.style.display = 'block';
            clonedEl.style.width = '750px';
          }
        }
      });

      // Restore
      parent.setAttribute('style', originalParentStyle);
      element.setAttribute('style', originalElementStyle);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Create PDF with size matching the content ratio
      // A4 width is 210mm. Height depends on content.
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Use [width, height] array to define custom page size in jsPDF
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `Receipt_${transactionId}.pdf`, { type: 'application/pdf' });

      // If manual trigger and offline, we just handle the PDF (e.g. download)
      // But this function is primarily for uploading.
      if (!isOnline) {
        // If they click print, window.print handles it. 
        // If they want to download, we could trigger download here.
        if (isManual) {
          pdf.save(`Receipt_${transactionId}.pdf`);
        }
        setUploadStatus('idle');
        return;
      }
      const citizenId = user?.aadhaarNumber || '111122223333';
      const relatedId = (bill.id || bill.billId || transactionId).toString();

      console.log("📤 [Receipt] Uploading high-detail PDF:", {
        width: pdfWidth,
        height: pdfHeight,
        size: (file.size / 1024).toFixed(2) + ' KB'
      });

      const payload = {
        citizenId,
        department: selectedService || location.state?.department || 'municipal',
        relatedEntity: 'BILL',
        relatedId,
        documentType: 'PAYMENT_RECEIPT'
      };

      console.log("📤 [Receipt] Upload Payload:", payload);

      await documentService.uploadDocument(file, payload);

      sessionStorage.setItem(cacheKey, 'true');
      setUploadStatus('success');
      console.log("✅ [Receipt] High-detail receipt uploaded");
    } catch (error) {
      console.error("❌ [Receipt] High-detail upload failed:", error);
      setUploadStatus('error');
    }
  }, [transactionId, user, selectedService, bill, location.state?.department, isOnline]);

  useEffect(() => {
    if (bill && transactionId && isOnline) {
      const timer = setTimeout(() => generateAndUploadReceipt(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [bill, transactionId, user, generateAndUploadReceipt, isOnline]);

  if (!bill) {
    return (
      <KioskLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center shadow-sm">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 mb-4 font-black text-2xl tracking-tight">Receipt Data Unavailable</p>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">We couldn't retrieve the payment details for this session. Please check your transaction history.</p>
            <TouchButton
              variant="primary"
              size="large"
              onClick={() => navigate('/kiosk/dashboard')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {t('bills.backToDashboard')}
            </TouchButton>
          </div>
        </div>
      </KioskLayout>
    );
  }


  const handlePrint = () => {
    // Ensure it's uploaded when they print
    if (uploadStatus !== 'success') {
      generateAndUploadReceipt(true);
    }
    window.print();
  };

  const handleSendSMS = () => {
    alert('Receipt will be sent to your registered mobile number');
  };

  const handleSendEmail = () => {
    alert('Receipt will be sent to your registered email address');
  };

  return (
    <>
      {/* Print-only Receipt Format */}
      <div className="print-receipt">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-receipt, .print-receipt * {
              visibility: visible;
            }
            .print-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 10mm;
              background: white;
            }
            @page {
              size: A4;
              margin: 5mm;
            }
          }
          .print-receipt {
            position: absolute;
            left: -9999px;
            top: 0;
            z-index: -1;
          }
          @media print {
            .print-receipt {
              position: absolute;
              left: 0;
              top: 0;
              display: block;
              font-family: 'Arial', sans-serif;
            }
          }
        `}</style>

        <div ref={receiptDocRef} style={{ maxWidth: '750px', margin: '0 auto', padding: '15px', border: '2px solid #000', backgroundColor: 'white' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ marginBottom: '8px' }}>
              <img src={govtLogo} alt="Government of India" style={{ height: '60px', margin: '0 auto' }} />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#000' }}>SUVIDHA</h1>
            <p style={{ fontSize: '13px', margin: '2px 0', color: '#333', lineHeight: '1.2' }}>Government of India - Digital Services Portal</p>
            <p style={{ fontSize: '11px', margin: '0 0', color: '#666', lineHeight: '1.2' }}>Official Payment Receipt</p>
          </div>

          {/* Receipt Title */}
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#28A745', margin: '0' }}>✓ PAYMENT RECEIPT</h2>
          </div>

          {/* Transaction Details Box */}
          <div style={{ border: '2px solid #0066CC', padding: '12px', marginBottom: '12px', backgroundColor: '#f8f9fa' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '5px 0', fontSize: '14px', fontWeight: 'bold', width: '35%' }}>Transaction ID:</td>
                  <td style={{ padding: '5px 0', fontSize: '14px', color: '#0066CC', fontWeight: 'bold' }}>{transactionId}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', fontSize: '14px', fontWeight: 'bold' }}>Date & Time:</td>
                  <td style={{ padding: '5px 0', fontSize: '14px' }}>
                    {new Date(paymentDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Consumer Details */}
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '8px' }}>CONSUMER INFORMATION</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', fontSize: '13px', width: '35%' }}>Name:</td>
                  <td style={{ padding: '4px 0', fontSize: '13px', fontWeight: 'bold' }}>{user?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontSize: '13px' }}>Consumer Number:</td>
                  <td style={{ padding: '4px 0', fontSize: '13px', fontWeight: 'bold' }}>{bill.consumerNumber}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontSize: '13px' }}>Bill Number:</td>
                  <td style={{ padding: '4px 0', fontSize: '13px', fontWeight: 'bold' }}>{bill.billNumber}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontSize: '13px' }}>Billing Period:</td>
                  <td style={{ padding: '4px 0', fontSize: '13px' }}>{bill.billingPeriod}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '8px' }}>PAYMENT DETAILS</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '13px', borderBottom: '2px solid #000' }}>Description</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontSize: '13px', borderBottom: '2px solid #000' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', fontSize: '13px', borderBottom: '1px solid #ddd' }}>Bill Amount</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', borderBottom: '1px solid #ddd' }}>₹{(bill.amount ?? 0).toLocaleString()}</td>
                </tr>
                <tr style={{ backgroundColor: '#28A745', color: 'white' }}>
                  <td style={{ padding: '10px', fontSize: '14px', fontWeight: 'bold' }}>TOTAL PAID</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold' }}>₹{(bill.amount ?? 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Status */}
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#d4edda', border: '2px solid #28A745', borderRadius: '4px', marginBottom: '12px' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#155724', margin: '0' }}>✓ PAYMENT SUCCESSFUL</p>
            <p style={{ fontSize: '12px', color: '#155724', margin: '3px 0 0 0' }}>Your payment has been processed successfully</p>
          </div>

          {/* Footer Notes */}
          <div style={{ paddingTop: '10px', borderTop: '2px solid #000' }}>
            <p style={{ fontSize: '11px', color: '#666', margin: '3px 0', lineHeight: '1.3' }}>• This is a system-generated receipt and does not require a signature.</p>
            <p style={{ fontSize: '11px', color: '#666', margin: '2px 0', lineHeight: '1.3' }}>• Please keep this receipt for your records and future reference.</p>
            <p style={{ fontSize: '11px', color: '#666', margin: '2px 0', lineHeight: '1.3' }}>• For any queries, please contact our helpline or visit the nearest office.</p>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 2px 0', textAlign: 'center', lineHeight: '1.2' }}>SUVIDHA - Government of India Digital Services Portal</p>
            <p style={{ fontSize: '10px', color: '#999', margin: '2px 0', textAlign: 'center', lineHeight: '1.2' }}>Helpline: 1800-XXX-XXXX | Website: www.suvidha.gov.in</p>
            <p style={{ fontSize: '10px', color: '#999', margin: '2px 0', textAlign: 'center', lineHeight: '1.2' }}>Generated on: {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Screen Display */}
      <KioskLayout>
        <div className="max-w-5xl mx-auto">
          {/* Success Header */}
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl shadow-lg p-8 mb-4 transform transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md animate-bounce-short">
                <CheckCircle className="w-10 h-10 text-[#10B981]" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  {t('bills.paymentSuccessful')}
                </h2>
                <p className="text-lg text-white opacity-90 font-medium">
                  {isOfflinePayment ? 'Transaction queued for offline synchronization.' : 'Your payment has been processed and your receipt is ready.'}
                </p>
              </div>
            </div>
          </div>

          {isOfflinePayment && (
            <div className="bg-orange-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between border-2 border-orange-500 mb-8 overflow-hidden relative">
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white/20 p-2 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-wider text-sm">Offline Transaction Enqueued</h3>
                  <p className="text-xs opacity-90">Your payment of ₹{bill.amount.toLocaleString()} will be synced once connection is restored.</p>
                </div>
              </div>
              <div className="hidden md:block absolute -right-4 -bottom-4 opacity-10">
                <Database className="w-24 h-24 text-white" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-6">
            {/* Receipt Display */}
            <div className="col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full opacity-50 -z-10" />

                <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-gray-200">
                  <h3 className="text-2xl font-black text-[#212529] mb-1">
                    {t('bills.digitalReceipt')}
                  </h3>
                  <p className="text-sm font-bold text-[#0066CC] tracking-wider uppercase">SUVIDHA PORTAL RECEIPT</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('bills.transactionId')}</span>
                    <span className="text-sm font-bold text-[#0066CC] font-mono">
                      {transactionId}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('bills.billNumber')}</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {bill.billNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('bills.consumerNumber')}</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {bill.consumerNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('bills.billingPeriod')}</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {bill.billingPeriod}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('bills.paidOn')}</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {new Date(paymentDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mt-6 border border-green-100">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-700">{t('bills.amount')} {t('bills.paid')}</span>
                      <span className="text-3xl font-black text-[#10B981]">
                        ₹{bill.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="flex justify-center py-6 border-t-2 border-dashed border-gray-200">
                  <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 shadow-inner">
                    <QrCode className="w-24 h-24 text-gray-800 opacity-80" />
                  </div>
                </div>

                <p className="text-center text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-[0.2em]">
                  Scan for Instant Verification
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-extrabold text-[#212529] mb-4">
                  Receipt Actions
                </h3>

                <div className="space-y-3">
                  <TouchButton
                    variant="primary"
                    size="medium"
                    icon={<Printer className="w-5 h-5" />}
                    onClick={handlePrint}
                    className="w-full shadow-md active:shadow-inner"
                  >
                    {t('bills.printReceipt')}
                  </TouchButton>

                  <TouchButton
                    variant="secondary"
                    size="medium"
                    icon={<MessageSquare className="w-5 h-5" />}
                    onClick={handleSendSMS}
                    className="w-full border-2"
                  >
                    {t('bills.sendViaSMS')}
                  </TouchButton>

                  <TouchButton
                    variant="secondary"
                    size="medium"
                    icon={<Mail className="w-5 h-5" />}
                    onClick={handleSendEmail}
                    className="w-full border-2"
                  >
                    {t('bills.sendViaEmail')}
                  </TouchButton>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <TouchButton
                  variant="success"
                  size="medium"
                  icon={<Home className="w-5 h-5" />}
                  onClick={() => navigate('/kiosk/bills')}
                  className="w-full mb-4 shadow-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {t('bills.viewBills')}
                </TouchButton>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-center text-blue-800 font-medium leading-relaxed">
                    ⓘ Your receipt has been automatically uploaded to 'My Documents' for future access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </KioskLayout>
    </>
  );
}
