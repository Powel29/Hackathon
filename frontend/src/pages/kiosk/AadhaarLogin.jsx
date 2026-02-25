import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { LoadingScreen } from '../../components/kiosk/LoadingScreen';
import * as authService from '../../services/api/auth.service';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, WifiOff, ShieldOff } from 'lucide-react';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';

export function AadhaarLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const { setUser } = useKioskStore();
  const [aadhaar, setAadhaar] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaar(value);
    setError('');
  };

  const handleSubmit = useCallback(async () => {
    if (aadhaar.length !== 12) {
      setError(t('invalidAadhaar'));
      return;
    }

    if (!isOnline) {
      handleOfflineLogin();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.sendOTP({ aadhaarNumber: aadhaar });

      if (response.success) {
        console.log('API Response:', response);
        if (import.meta.env.DEV && response._demoOTP) {
          toast.success(`OTP sent! Demo OTP: ${response._demoOTP}`);
        }
        navigate('/kiosk/otp-verification', {
          state: {
            aadhaarNumber: aadhaar,
            maskedMobile: response.maskedMobile,
            mobileNumber: response.mobileNumber
          }
        });
      } else {
        setError(response.message || t('errorSendingOTP'));
      }
    } catch (err) {
      console.error(err);
      setError(t('errorSendingOTP'));
    } finally {
      setIsLoading(false);
    }
  }, [aadhaar, navigate, t, isOnline]);

  const handleOfflineLogin = () => {
    const offlineUser = {
      name: 'Offline Citizen',
      aadhaarNumber: aadhaar,
      citizenId: `OFFLINE-${aadhaar.slice(-4)}-${Date.now()}`,
      isOfflineSession: true
    };
    setUser(offlineUser);
    toast.info('Continuing in Offline Mode. Some features may be limited.');
    navigate('/kiosk/service-selection');
  };

  const formatAadhaar = (value) => {
    return value.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && aadhaar.length === 12) {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/kiosk/service-selection');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aadhaar, navigate, handleSubmit]);

  if (isLoading) {
    return <LoadingScreen message={t('sendingOTP') + '...'} />;
  }

  return (
    <KioskLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/kiosk/login-register')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#0066CC] bg-opacity-10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#0066CC]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#212529]">
                  {t('authentication.aadhaarLogin')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('authentication.enterAadhaar')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('authentication.aadhaarNumber')}
                </label>
                <input
                  type="text"
                  value={aadhaar}
                  onChange={handleInputChange}
                  placeholder={t('authentication.aadhaarPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  maxLength={12}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {t('authentication.aadhaarDigitsCounter', { count: aadhaar.length })}
                  </span>
                  {aadhaar.length > 0 && (
                    <span className="text-sm font-mono text-gray-700">
                      {formatAadhaar(aadhaar)}
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              )}

              <TouchButton
                variant={isOnline ? "primary" : "warning"}
                size="large"
                onClick={handleSubmit}
                disabled={aadhaar.length !== 12}
                className="w-full"
                icon={!isOnline ? <WifiOff className="w-5 h-5" /> : null}
              >
                {isOnline ? t('authentication.proceedToOTP') : 'Continue Offline'}
              </TouchButton>

              {!isOnline && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <ShieldOff className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-orange-800 uppercase tracking-tight">Offline Mode Active</p>
                    <p className="text-[10px] text-orange-700 leading-relaxed mt-1">
                      Internet connection is lost. You can continue as an offline user.
                      Your identity will be verified once connection is restored.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-center text-gray-700">
                  {t('authentication.aadhaarSecurityNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
