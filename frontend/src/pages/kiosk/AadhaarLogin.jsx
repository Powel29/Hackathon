import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { LoadingScreen } from '../../components/kiosk/LoadingScreen';
import * as authService from '../../services/api/auth.service';
import { ArrowLeft, CreditCard } from 'lucide-react';

export function AadhaarLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.sendOTP({ aadhaarNumber: aadhaar });

      if (response.success) {
        navigate('/kiosk/otp-verification', { state: { aadhaarNumber: aadhaar } });
      } else {
        setError(response.message || t('errorSendingOTP'));
      }
    } catch (err) {
      console.error(err);
      setError(t('errorSendingOTP'));
    } finally {
      setIsLoading(false);
    }
  }, [aadhaar, navigate, t]);

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
            onClick={() => navigate('/kiosk/service-selection')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#0066CC] bg-opacity-10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#0066CC]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#212529]">
                  {t('aadhaarLogin')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('enterAadhaar')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('aadhaarNumber')}
                </label>
                <input
                  type="text"
                  value={aadhaar}
                  onChange={handleInputChange}
                  placeholder={t('aadhaarPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  maxLength={12}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {t('aadhaarDigitsCounter', { count: aadhaar.length })}
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
                variant="primary"
                size="large"
                onClick={handleSubmit}
                disabled={aadhaar.length !== 12}
                className="w-full"
              >
                {t('proceedToOTP')}
              </TouchButton>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-center text-gray-700">
                  {t('aadhaarSecurityNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
