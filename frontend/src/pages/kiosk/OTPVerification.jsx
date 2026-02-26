import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { LoadingScreen } from '../../components/kiosk/LoadingScreen';
import * as authService from '../../services/api/auth.service';
import { ArrowLeft, ShieldCheck, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';

export function OTPVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useKioskStore();
  const { isOnline } = useNetworkStatus();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const aadhaarNumber = location.state?.aadhaarNumber || '';
  const maskedMobile = location.state?.maskedMobile;
  const mobileNumber = location.state?.mobileNumber;

  console.log('OTPVerification State:', location.state);

  useEffect(() => {
    if (!aadhaarNumber) {
      navigate('/kiosk/login-register');
    }
  }, [aadhaarNumber, navigate]);
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleInputChange = (index, value) => {
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

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    if (canResend) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setResendTimer(30);
      setCanResend(false);

      try {
        const response = await authService.resendOTP({ aadhaarNumber, mobileNumber });
        if (!response.success) {
          setError(response.message || t('errorResendingOTP'));
        }
      } catch (err) {
        console.error('Resend OTP error', err);
        setError(t('errorResendingOTP'));
      }
    }
  };

  const handleVerify = useCallback(async () => {
    const otpValue = otp.join('');
    if (attempts === 0) {
      setError(t('noAttemptsRemaining') || 'No attempts remaining. Please try again later.');
      return;
    }
    if (otpValue.length !== 6) {
      setError(t('invalidOTP'));
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await authService.verifyOTP({
        aadhaarNumber,
        otp: otpValue
      });

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        navigate('/kiosk/dashboard');
      } else {
        setError(response.message || t('invalidOTP'));
        setAttempts((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
      setError(t('errorVerifyingOTP'));
      setAttempts((prev) => Math.max(0, prev - 1));
    } finally {
      setIsVerifying(false);
    }
  }, [otp, t, aadhaarNumber, setUser, navigate]);

  // Keyboard support for Enter and Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter' && otp.join('').length === 6) {
        e.preventDefault();
        handleVerify();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/kiosk/login-register');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [otp, navigate, handleVerify]);

  if (isVerifying) {
    return <LoadingScreen message={t('verify') + '...'} />;
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
                  {maskedMobile ? `${t('otpSentTo')} ${maskedMobile}` : t('otpSentToRegisteredMobile')}
                </p>
              </div>
            </div>

            {!isOnline && (
              <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <WifiOff className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">Connection Lost</p>
                  <p className="text-xs text-red-700 leading-relaxed">Identity verification requires an active internet connection. Please wait for connectivity to be restored or return to login to use offline mode.</p>
                </div>
              </div>
            )}
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

              {attempts === 0 ? (
                <div className="text-center">
                  <p className="text-sm text-red-600 mb-2">{t('noAttemptsRemaining') || 'No attempts remaining. Please try again later.'}</p>
                  <TouchButton variant="secondary" size="large" disabled className="w-full">
                    {t('verify')}
                  </TouchButton>
                </div>
              ) : (
                <TouchButton
                  variant="success"
                  size="large"
                  onClick={handleVerify}
                  disabled={otp.join('').length !== 6 || !isOnline}
                  className="w-full"
                >
                  {t('verify')}
                </TouchButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
