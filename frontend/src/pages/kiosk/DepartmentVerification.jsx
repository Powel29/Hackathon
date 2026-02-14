import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { ArrowLeft, Shield, Zap, Flame, Droplets, Building2 } from 'lucide-react';
import { departmentService } from '../../services/api';

export function DepartmentVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedService, setUser, user } = useKioskStore();
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!selectedService) {
      navigate('/kiosk/service-selection');
    }
  }, [selectedService, navigate]);

  const getDepartmentInfo = () => {
    switch (selectedService) {
      case 'electricity':
        return {
          name: 'Electricity Department',
          icon: <Zap className="w-12 h-12 text-yellow-600" />,
          color: 'from-yellow-50 to-yellow-100',
          borderColor: 'border-yellow-200',
          idLabel: 'Electricity Consumer Number',
          idPlaceholder: 'Enter your EC Number',
          idPrefix: 'EC',
          maxLength: 30,
          description: 'Enter your electricity consumer number to access your account'
        };
      case 'gas':
        return {
          name: 'Gas Department',
          icon: <Flame className="w-12 h-12 text-orange-600" />,
          color: 'from-orange-50 to-orange-100',
          borderColor: 'border-orange-200',
          idLabel: 'Gas Consumer Number',
          idPlaceholder: 'Enter your GC Number',
          idPrefix: 'GC',
          maxLength: 30,
          description: 'Enter your gas consumer number to access your account'
        };
      case 'water':
        return {
          name: 'Water Department',
          icon: <Droplets className="w-12 h-12 text-blue-600" />,
          color: 'from-blue-50 to-blue-100',
          borderColor: 'border-blue-200',
          idLabel: 'Water Consumer Number',
          idPlaceholder: 'Enter your WC Number',
          idPrefix: 'WC',
          maxLength: 30,
          description: 'Enter your water consumer number to access your account'
        };
      case 'municipal':
        return {
          name: 'Municipal Services',
          icon: <Building2 className="w-12 h-12 text-green-600" />,
          color: 'from-green-50 to-green-100',
          borderColor: 'border-green-200',
          idLabel: 'Property Tax Number',
          idPlaceholder: 'Enter your PT Number',
          idPrefix: 'PT',
          maxLength: 30,
          description: 'Enter your property tax number to access municipal services'
        };
      default:
        return {
          name: 'Department',
          icon: <Shield className="w-12 h-12 text-gray-600" />,
          color: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          idLabel: 'Department ID',
          idPlaceholder: 'Enter your Department ID',
          idPrefix: 'ID',
          maxLength: 11,
          description: 'Enter your department ID to access your account'
        };
    }
  };

  const deptInfo = getDepartmentInfo();

  const handleVerify = async () => {
    setError('');
    setIsVerifying(true);

    try {
      // Validation
      if (!departmentId.trim()) {
        setError('Please enter your department ID number');
        setIsVerifying(false);
        return;
      }

      if (departmentId.trim().length < 8) {
        setError('Department ID must be at least 8 characters');
        setIsVerifying(false);
        return;
      }

      // Call backend API to verify account
      const response = await departmentService.verifyAccount(
        selectedService,
        departmentId.trim()
      );

      if (response.success) {
        // Update user with department-specific consumer ID and account info
        if (user) {
          setUser({
            ...user,
            consumerId: response.account.consumerNumber,
            accountId: response.account.accountId,
            ownerName: response.account.ownerName,
            connectionType: response.account.connectionType
          });
        }

        // Navigate to dashboard
        navigate('/kiosk/dashboard');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify account. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (value) => {
    setDepartmentId(value);
    setError(''); // Clear error when user types
  };

  return (
    <KioskLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => navigate('/kiosk/service-selection')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Department Header */}
            <div className={`bg-gradient-to-r ${deptInfo.color} ${deptInfo.borderColor} border rounded-xl p-6 mb-6`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  {deptInfo.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#212529]">{deptInfo.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{deptInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Department Verification</h3>
                  <p className="text-sm text-gray-600">Enter your ID to access your account</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {deptInfo.idLabel} *
                </label>
                <input
                  type="text"
                  value={departmentId}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={deptInfo.idPlaceholder}
                  maxLength={deptInfo.maxLength}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleVerify();
                    }
                  }}
                />
                {error && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <span>⚠️</span> {error}
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>ℹ️ Note:</strong> Your department ID is printed on your bills and correspondence.
                  If you don't have your ID, please contact your department office or call the helpline.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <TouchButton
                  variant="secondary"
                  size="medium"
                  onClick={() => navigate('/kiosk/service-selection')}
                  className="flex-1"
                >
                  {t('cancel')}
                </TouchButton>

                <TouchButton
                  variant="primary"
                  size="medium"
                  onClick={handleVerify}
                  className="flex-1"
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                </TouchButton>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Call Helpline: <span className="font-bold text-[#0066CC]">1800-XXX-XXXX</span>
            </p>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}