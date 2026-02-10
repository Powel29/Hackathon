import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router';
import { KioskLayout } from '../components/KioskLayout';
import { TouchButton } from '../components/TouchButton';
import { CheckCircle, Printer, Mail, MessageSquare, QrCode, Home } from 'lucide-react';
import { useStore } from '../store/useStore';
import govtLogo from '../assets/Government_of_India_logo.svg';

export function Receipt() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const location = useLocation();
  const { user } = useStore();
  
  const { bill, paymentDate } = location.state || {};
  
  if (!bill) {
    return (
      <KioskLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-gray-600 mb-4">Receipt not found</p>
          <TouchButton
            variant="primary"
            size="medium"
            onClick={() => navigate('/dashboard')}
          >
            {t('backToDashboard')}
          </TouchButton>
        </div>
      </KioskLayout>
    );
  }
  
  const handlePrint = () => {
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
            display: none;
          }
          @media print {
            .print-receipt {
              display: block;
              font-family: 'Arial', sans-serif;
            }
          }
        `}</style>
        
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '15px', border: '2px solid #000' }}>
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
                  <td style={{ padding: '8px', textAlign: 'right', fontSize: '13px', borderBottom: '1px solid #ddd' }}>₹{bill.amount.toLocaleString()}</td>
                </tr>
                <tr style={{ backgroundColor: '#28A745', color: 'white' }}>
                  <td style={{ padding: '10px', fontSize: '14px', fontWeight: 'bold' }}>TOTAL PAID</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold' }}>₹{bill.amount.toLocaleString()}</td>
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
        <div className="bg-gradient-to-r from-[#28A745] to-[#20c997] rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#28A745]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {t('paymentSuccessful')}
              </h2>
              <p className="text-sm text-white opacity-90">
                Your payment has been processed successfully
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Receipt Display */}
          <div className="col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold text-[#212529] mb-1">
                  {t('digitalReceipt')}
                </h3>
                <p className="text-sm text-gray-600">SUVIDHA Payment Receipt</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{t('transactionId')}:</span>
                  <span className="text-sm font-bold text-[#0066CC]">
                    {transactionId}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{t('billNumber')}:</span>
                  <span className="text-sm font-bold text-[#212529]">
                    {bill.billNumber}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{t('consumerNumber')}:</span>
                  <span className="text-sm font-bold text-[#212529]">
                    {bill.consumerNumber}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{t('billingPeriod')}:</span>
                  <span className="text-sm font-bold text-[#212529]">
                    {bill.billingPeriod}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{t('paidOn')}:</span>
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
                
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-700">{t('amount')} {t('paid')}:</span>
                    <span className="text-2xl font-bold text-[#28A745]">
                      ₹{bill.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="flex justify-center py-4 border-t-2 border-gray-200">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-3">
                Scan QR code for digital verification
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-[#212529] mb-4">
                Receipt Actions
              </h3>
              
              <div className="space-y-3">
                <TouchButton
                  variant="primary"
                  size="medium"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={handlePrint}
                  className="w-full"
                >
                  {t('printReceipt')}
                </TouchButton>
                
                <TouchButton
                  variant="secondary"
                  size="medium"
                  icon={<MessageSquare className="w-4 h-4" />}
                  onClick={handleSendSMS}
                  className="w-full"
                >
                  {t('sendViaSMS')}
                </TouchButton>
                
                <TouchButton
                  variant="secondary"
                  size="medium"
                  icon={<Mail className="w-4 h-4" />}
                  onClick={handleSendEmail}
                  className="w-full"
                >
                  {t('sendViaEmail')}
                </TouchButton>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <TouchButton
                variant="success"
                size="medium"
                icon={<Home className="w-4 h-4" />}
                onClick={() => navigate('/bills')}
                className="w-full"
              >
                {t('backToDashboard')}
              </TouchButton>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-center text-gray-700 leading-relaxed">
                ⓘ Keep this receipt for your records
              </p>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
    </>
  );
}
