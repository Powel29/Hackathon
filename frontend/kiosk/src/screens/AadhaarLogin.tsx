import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { KioskLayout } from '../components/KioskLayout';
import { TouchButton } from '../components/TouchButton';
import { ArrowLeft, CreditCard } from 'lucide-react';

export function AadhaarLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [aadhaar, setAadhaar] = useState('');
  const [error, setError] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaar(value);
    setError('');
  };
  
  const handleSubmit = () => {
    if (aadhaar.length !== 12) {
      setError(t('invalidAadhaar'));
      return;
    }
    
    navigate('/otp-verification', { state: { aadhaarNumber: aadhaar } });
  };
  
  const formatAadhaar = (value: string) => {
    return value.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && aadhaar.length === 12) {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/service-selection');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aadhaar, navigate]);
  
  return (
    <KioskLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/service-selection')}
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
