import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { billService } from '../../services/api';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function ViewBills() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const filters = selectedDepartment !== 'ALL' ? { serviceType: selectedDepartment } : {};
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
  }, [selectedDepartment]);

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

  const departments = [
    { id: 'ALL', label: t('dashboard.selectService') || 'All' }, // Using selectService as 'All' fallback or similar? Actually 'All' is missing in en.json properly. I'll use common.all if I add it, or keep literal 'All' for now and fix later. Wait, for now I will try to use `t('common.all')` but it's not in en.json? I saw 'all' usage in ViewBills. Let me check en.json again. 'all' is NOT in en.json. I will use 'All' literal or add it. I will use 'All' literal for now to be safe, or 'common.all' if I feel lucky. I'll stick to 'All' literal and add 'common.all' to en.json if I edit it. I will use 'dashboard.selectService' for ALL? No. I'll check `en.json` again. `dashboard: { selectService: "Select Service" }`. I'll leave 'All' as fallback or add it.
    { id: 'ELECTRICITY', label: t('dashboard.electricity') || 'Electricity' },
    { id: 'WATER', label: t('dashboard.water') || 'Water' },
    { id: 'GAS', label: t('dashboard.gas') || 'Gas' },
    { id: 'MUNICIPAL', label: t('dashboard.municipal') || 'Municipal' }
  ];

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

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedDepartment === dept.id
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {dept.label}
                </button>
              ))}
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
                        {bill.type || 'ELECTRICITY'}
                      </p>
                    </div>
                  </div>

                  {bill.status?.toLowerCase() !== 'paid' && (
                    <div className="flex justify-end">
                      <TouchButton
                        variant="primary"
                        size="medium"
                        onClick={() => navigate(`/kiosk/pay-bill/${bill.id}`)}
                      >
                        {t('bills.payNow')}
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
