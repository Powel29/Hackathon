import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { billService } from '../../services/api';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function ViewBills() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedService } = useKioskStore();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetDepartment = selectedService ? selectedService.toUpperCase() : 'ALL';

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const filters = targetDepartment !== 'ALL' ? { serviceType: targetDepartment } : {};
        const fetchedBills = await billService.getUserBills(filters);
        console.log('📋 Fetched bills:', fetchedBills);
        setBills(fetchedBills || []);
      } catch (err) {
        console.error('❌ Error fetching bills:', err);
        setError('Failed to load bills');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [targetDepartment]);
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-[#28A745]" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-[#FF9800]" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-[#DC3545]" />;
      default:
        return null;
    }
  };

  const getStatusBgColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-orange-50 border-orange-200';
      case 'overdue':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <KioskLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/kiosk/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0066CC] bg-opacity-10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0066CC]" />
              </div>
              <h2 className="text-2xl font-bold text-[#212529]">
                {t('bills.viewBills')}
              </h2>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">{t('bills.noBills')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`bg-white rounded-xl shadow-sm border-2 ${getStatusBgColor(bill.status)} overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(bill.status)}
                      <div>
                        <h3 className="text-lg font-bold text-[#212529]">
                          {bill.billNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {bill.billingPeriod}
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${bill.status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' :
                      bill.status?.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {bill.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{t('bills.amount')}</p>
                      <p className="text-xl font-bold text-[#212529]">
                        ₹{Number(bill.amount).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{t('bills.dueDate')}</p>
                      <p className="text-sm font-semibold text-[#212529]">
                        {new Date(bill.dueDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Type</p>
                      <p className="text-sm font-semibold text-[#212529]">
                        {bill.type || bill.serviceType || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {bill.status?.toLowerCase() !== 'paid' ? (
                    <div className="flex justify-end">
                      <TouchButton
                        variant="primary"
                        size="medium"
                        onClick={() => {
                          if (bill.serviceType === 'MUNICIPAL') {
                            navigate(`/kiosk/pay-property-tax/${bill.billId || bill.id}`);
                          } else {
                            navigate(`/kiosk/pay-bill/${bill.id}`);
                          }
                        }}
                      >
                        {t('bills.payNow')}
                      </TouchButton>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <TouchButton
                        variant="secondary"
                        size="medium"
                        onClick={async () => {
                          try {
                            const apiModule = await import('../../services/api');
                            const res = await apiModule.documentService.getRelatedDocuments(bill.billId || bill.id);
                            if (res.success && res.documents?.length > 0) {
                              const receipt = res.documents.find(d => d.documentType === 'PAYMENT_RECEIPT');
                              if (receipt && receipt.url) {
                                window.open(receipt.url, '_blank');
                              } else {
                                alert("Receipt document is still processing. Please try again later.");
                              }
                            } else {
                              alert("Receipt document not found.");
                            }
                          } catch (err) {
                            console.error("Failed to fetch receipt:", err);
                            alert("Failed to load receipt.");
                          }
                        }}
                      >
                        Download Receipt
                      </TouchButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
