import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { useStore } from '../store/useStore';
import { KioskLayout } from '../components/KioskLayout';
import { TouchButton } from '../components/TouchButton';
import { LoadingScreen } from '../components/LoadingScreen';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export function OTPVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const aadhaarNumber = location.state?.aadhaarNumber || '';
  
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);
  
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };
  
  const handleResend = () => {
    if (canResend) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setResendTimer(30);
      setCanResend(false);
    }
  };
  
  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(t('invalidOTP'));
      return;
    }
    
    setIsVerifying(true);
    
    setTimeout(() => {
      const mockUser = {
        name: 'Rajesh Kumar',
        aadhaarNumber: aadhaarNumber,
        consumerId: 'CONS123456',
        phoneNumber: '+91 98765 43210',
        email: 'rajesh.kumar@example.com'
      };
      
      setUser(mockUser);
      setIsVerifying(false);
      navigate('/dashboard');
    }, 1500);
  };

  // Keyboard support for Enter and Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && otp.join('').length === 6) {
        e.preventDefault();
        handleVerify();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/login');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [otp, navigate]);
  
  if (isVerifying) {
    return <LoadingScreen message={t('verify') + '...'} />;
  }
  
  return (
    <KioskLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#28A745] bg-opacity-10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#28A745]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#212529]">
                  {t('otpVerification')}
                </h2>
                <p className="text-sm text-gray-600">
                  Sent to: ****{aadhaarNumber.slice(-4)}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  {t('enterOTP')}
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 text-center">
                    {error}
                  </p>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    {t('attemptsRemaining')}: {attempts}
                  </p>
                </div>
              )}
              
              <div className="flex justify-center">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-sm text-[#0066CC] hover:underline"
                  >
                    {t('resendOTP')}
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    {t('resendIn')}: <span className="font-semibold text-[#0066CC]">{resendTimer}s</span>
                  </p>
                )}
              </div>
              
              <TouchButton
                variant="success"
                size="large"
                onClick={handleVerify}
                disabled={otp.join('').length !== 6}
                className="w-full"
              >
                {t('verify')}
              </TouchButton>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
