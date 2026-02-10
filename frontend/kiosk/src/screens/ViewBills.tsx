import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useStore } from '../store/useStore';
import { KioskLayout } from '../components/KioskLayout';
import { TouchButton } from '../components/TouchButton';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function ViewBills() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bills, selectedService } = useStore();
  
  // Filter bills by selected service/department
  const departmentBills = bills.filter(bill => bill.serviceType === selectedService);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
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
  
  const getStatusBgColor = (status: string) => {
    switch (status) {
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
  
  return (
    <KioskLayout>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0066CC] bg-opacity-10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#0066CC]" />
            </div>
            <h2 className="text-2xl font-bold text-[#212529]">
              {t('viewBills')}
            </h2>
          </div>
        </div>
        
        {departmentBills.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">{t('noBills')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {departmentBills.map((bill) => (
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
                    
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                      bill.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {t(bill.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{t('amount')}</p>
                      <p className="text-xl font-bold text-[#212529]">
                        ₹{bill.amount.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{t('dueDate')}</p>
                      <p className="text-sm font-semibold text-[#212529]">
                        {new Date(bill.dueDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">{t('consumerNumber')}</p>
                      <p className="text-sm font-semibold text-[#212529]">
                        {bill.consumerNumber}
                      </p>
                    </div>
                  </div>
                  
                  {bill.status !== 'paid' && (
                    <div className="flex justify-end">
                      <TouchButton
                        variant="primary"
                        size="medium"
                        onClick={() => navigate(`/pay-bill/${bill.id}`)}
                      >
                        {t('payNow')}
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
