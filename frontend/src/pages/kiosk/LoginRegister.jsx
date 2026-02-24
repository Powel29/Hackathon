import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { KioskLayout } from '../../components/kiosk/KioskLayout';
import { TouchButton } from '../../components/kiosk/TouchButton';
import { SuccessScreen } from '../../components/kiosk/SuccessScreen';
import { ArrowLeft } from 'lucide-react';
import * as authService from '../../services/api/auth.service';
import { toast } from 'sonner';

export function LoginRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setRegistrationData } = useKioskStore();
  const [mode, setMode] = useState('choice');
  const [step, setStep] = useState(1);
  const [loginType, setLoginType] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [errors, setErrors] = useState({});
  const [maskedPhone, setMaskedPhone] = useState('');
  const [loginCredential, setLoginCredential] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    gender: '',
    aadhaarNumber: '',
    address: ''
  });

  // OTP Timer Effect
  useEffect(() => {
    if (mode === 'otp' && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode, otpTimer]);


  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = t('validation.fullNameRequired');
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = t('validation.emailRequired');
    if (!formData.mobileNumber.match(/^[0-9]{10}$/)) newErrors.mobileNumber = t('validation.mobileNumberDigits');
    if (!formData.dateOfBirth) newErrors.dateOfBirth = t('validation.dateOfBirthRequired');
    if (!formData.gender) newErrors.gender = t('validation.genderRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.aadhaarNumber.match(/^[0-9]{12}$/)) newErrors.aadhaarNumber = t('authentication.invalidAadhaar');
    if (!formData.address.trim()) newErrors.address = t('validation.addressRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (import.meta.env.DEV) console.log("👉 handleNext called. Step:", step);
    let isValid = false;

    if (step === 1) isValid = validateStep1();
    else if (step === 2) isValid = validateStep2();

    if (import.meta.env.DEV) console.log("👉 Validation result:", isValid, errors);

    if (isValid) {
      if (step < 2) {
        if (import.meta.env.DEV) console.log("👉 Moving to next step");
        setStep(step + 1);
      } else {
        if (import.meta.env.DEV) console.log("👉 Calling handleRegister");
        handleRegister();
      }
    }
  };

  const handleRegister = async () => {
    if (import.meta.env.DEV) console.log("🚀 handleRegister started");
    try {
      // Send OTP to registered mobile
      const response = await authService.sendOTP({
        aadhaarNumber: formData.aadhaarNumber,
        mobileNumber: formData.mobileNumber
      });
      console.log('✅ Register OTP Response:', response);

      if (!response.success) {
        toast.error(response.message || t('authentication.errorSendingOTP'));
        return;
      }

      // Show debugging toast if demo OTP is available (only in dev)
      if (import.meta.env.DEV && response._demoOTP) {
        toast.success(`OTP sent! Demo OTP: ${response._demoOTP}`);
      } else {
        toast.success(t('authentication.otpSentSuccessfully'));
      }

      if (response.maskedMobile) {
        setMaskedPhone(response.maskedMobile);
      }

      // Switch to OTP mode for verification
      setLoginCredential(formData.aadhaarNumber); // Use Aadhaar for verification context
      setLoginType('aadhaar'); // Context is Aadhaar based
      setMode('otp');
      setOtp(['', '', '', '', '', '']); // Reset OTP input
      setOtpTimer(60); // Reset timer

    } catch (error) {
      console.error('❌ Registration OTP Error:', error);
      toast.error(error.message || t('authentication.errorSendingOTP'));
    }
  };

  const handleLoginSubmit = async () => {
    console.log('🔵 handleLoginSubmit called', { loginType, loginCredential });

    if (!loginCredential.trim()) {
      alert(t('authentication.enterCredentials'));
      return;
    }

    // Validate based on login type
    if (loginType === 'aadhaar' && loginCredential.length !== 12) {
      alert(t('authentication.invalidAadhaar'));
      return;
    }

    if (loginType === 'mobile' && loginCredential.length !== 10) {
      alert(t('validation.mobileNumberDigits'));
      return;
    }

    try {
      let aadhar = '';
      let mobile = '';

      if (loginType === 'aadhaar') {
        aadhar = loginCredential;
      } else {
        if (loginType === 'mobile') {
          mobile = loginCredential;
        }
      }

      console.log('🔵 Sending OTP via backend:', { aadhar, mobile });
      const response = await authService.sendOTP({
        aadhaarNumber: aadhar,
        mobileNumber: mobile
      });
      console.log('✅ OTP API Response:', response);

      if (!response.success) {
        // specific handling for new users who need to register
        if (response.code === 'MOBILE_REQUIRED' || (response.message && response.message.toLowerCase().includes('mobile number'))) {
          if (confirm(t('authentication.accountNotFoundRegister', 'Account not found. Would you like to register now?'))) {
            setMode('register');
            setLoginType(null);
          }
        } else if (response.code === 'RATE_LIMIT') {
          toast.error(response.message || 'Access Restricted', {
            description: 'Due to security reasons, too many OTP requests have been made. Please try again after some time.',
            duration: 6000,
          });
        } else {
          toast.error(response.message || t('authentication.errorSendingOTP'));
        }
        return;
      }

      if (response.maskedMobile) {
        setMaskedPhone(response.maskedMobile);
      }

      // Show debugging toast if demo OTP is available (only in dev)
      if (import.meta.env.DEV && response._demoOTP) {
        toast.success(`OTP sent! Demo OTP: ${response._demoOTP}`);
      } else {
        toast.success(t('authentication.otpSentSuccessfully'));
      }
      setMode('otp');
      setOtp(['', '', '', '', '', '']);
      setOtpTimer(60);

    } catch (error) {
      console.error("❌ Login OTP Error:", error);
      toast.error(error.message || t('authentication.errorSendingOTP'));
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert(t('authentication.enterOTP'));
      return;
    }

    try {
      // Check if we are in registration flow
      const isRegistration = formData.aadhaarNumber === loginCredential && formData.fullName;
      const userData = isRegistration ? formData : null;
      console.log('🔵 Verifying OTP:', { loginCredential, otpValue, userData });

      const verifyResponse = await authService.verifyOTP({
        aadhaarNumber: loginCredential,
        otp: otpValue,
        userData: userData,
        mobileNumber: isRegistration ? formData.mobileNumber : undefined
      });

      if (verifyResponse.success) {
        // Set user in store
        const { setUser } = useKioskStore.getState();
        setUser(verifyResponse.user);

        // Store token
        localStorage.setItem('token', verifyResponse.token);
        localStorage.setItem('user', JSON.stringify(verifyResponse.user));

        toast.success('Login successful!');

        // If we were registering, show success screen first
        if (formData.aadhaarNumber === loginCredential && formData.fullName) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigate('/kiosk/service-selection');
          }, 2000);
        } else {
          // Direct login success
          navigate('/kiosk/service-selection');
        }
      } else {
        if (verifyResponse.code === 'MAX_ATTEMPTS') {
          toast.error(verifyResponse.message, {
            description: 'Please go back and request a new OTP.',
            duration: 5000,
          });
        } else {
          toast.error(verifyResponse.message || t('authentication.invalidOTP'));
        }
      }
    } catch (error) {
      console.error("❌ OTP Verify Error:", error);
      toast.error(error.message || t('authentication.invalidOTP'));
    }
  };

  const handleResendOtp = async () => {
    try {
      setOtp(['', '', '', '', '', '']);
      setOtpTimer(60);
      setCanResendOtp(false);

      let aadhar = '';
      let mobile = '';

      // Check if we are in registration flow
      const isRegistration = formData.aadhaarNumber === loginCredential && formData.fullName;

      if (isRegistration) {
        aadhar = formData.aadhaarNumber;
        mobile = formData.mobileNumber;
      } else {
        if (loginType === 'aadhaar') {
          aadhar = loginCredential;
        } else if (loginType === 'mobile') {
          mobile = loginCredential;
        }
      }

      await authService.sendOTP({ aadhaarNumber: aadhar, mobileNumber: mobile });
      toast.success(t('authentication.otpResentSuccessfully'));
    } catch (error) {
      console.error("❌ Resend OTP Error:", error);
      toast.error(error.message || t('authentication.errorResendingOTP'));
    }
  };

  if (mode === 'choice') {
    return (
      <KioskLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <button
              onClick={() => navigate('/kiosk')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#212529] mb-2">{t('authentication.welcomeTitle')}</h2>
                <p className="text-gray-600">{t('authentication.portalSubtitle')}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setMode('login')}
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-[#3B82F6] hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#3B82F6] rounded-full flex items-center justify-center group-hover:bg-[#1E40AF] transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                        <path d="M13 2C10.2386 2 8 4.23858 8 7C8 7.55228 8.44772 8 9 8C9.55228 8 10 7.55228 10 7C10 5.34315 11.3431 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H13C11.3431 20 10 18.6569 10 17C10 16.4477 9.55228 16 9 16C8.44772 16 8 16.4477 8 17C8 19.7614 10.2386 22 13 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H13Z" fill="#FFFFFF" />
                        <path d="M3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H11.2821C11.1931 13.1098 11.1078 13.2163 11.0271 13.318C10.7816 13.6277 10.5738 13.8996 10.427 14.0945C10.3536 14.1921 10.2952 14.2705 10.255 14.3251L10.2084 14.3884L10.1959 14.4055L10.1915 14.4115C10.1914 14.4116 10.191 14.4122 11 15L10.1915 14.4115C9.86687 14.8583 9.96541 15.4844 10.4122 15.809C10.859 16.1336 11.4843 16.0346 11.809 15.5879L11.8118 15.584L11.822 15.57L11.8638 15.5132C11.9007 15.4632 11.9553 15.3897 12.0247 15.2975C12.1637 15.113 12.3612 14.8546 12.5942 14.5606C13.0655 13.9663 13.6623 13.2519 14.2071 12.7071L14.9142 12L14.2071 11.2929C13.6623 10.7481 13.0655 10.0337 12.5942 9.43937C12.3612 9.14542 12.1637 8.88702 12.0247 8.7025C11.9553 8.61033 11.9007 8.53682 11.8638 8.48679L11.822 8.43002L11.8118 8.41602L11.8095 8.41281C11.4848 7.96606 10.859 7.86637 10.4122 8.19098C9.96541 8.51561 9.86636 9.14098 10.191 9.58778L11 9C10.191 9.58778 10.1909 9.58773 10.191 9.58778L10.1925 9.58985L10.1959 9.59454L10.2084 9.61162L10.255 9.67492C10.2952 9.72946 10.3536 9.80795 10.427 9.90549C10.5738 10.1004 10.7816 10.3723 11.0271 10.682C11.1078 10.7837 11.1931 10.8902 11.2821 11H3Z" fill="#FFFFFF" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#212529] mb-2">{t('common.login')}</h3>
                      <p className="text-sm text-gray-600">{t('authentication.alreadyHaveAccount')}<br />{t('authentication.loginToContinue')}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('register')}
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-[#10B981] hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center group-hover:bg-[#047857] transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 469.74" className="w-8 h-8">
                        <path d="M412.27 270.29c55.1 0 99.73 44.66 99.73 99.72 0 55.1-44.66 99.73-99.73 99.73-55.09 0-99.72-44.65-99.72-99.73 0-55.1 44.65-99.72 99.72-99.72zM232.93 0c31.47 0 61.6 6.3 89.09 17.69l.91.42c28.11 11.79 53.42 28.94 74.62 50.15 21.54 21.56 38.85 47.2 50.62 75.61 11.4 27.49 17.69 57.61 17.69 89.06 0 8.19-.43 16.3-1.27 24.27a122.985 122.985 0 0 0-34.04-10.18c.33-4.65.49-9.35.49-14.09 0-26.89-5.32-52.48-14.97-75.74a198.26 198.26 0 0 0-43.01-64.33c-18.1-18.13-39.61-32.72-63.49-42.74l-.87-.33c-23.27-9.65-48.85-14.97-75.77-14.97-26.91 0-52.5 5.32-75.76 14.97-24.26 10.02-46.07 24.74-64.31 43.01-18.13 18.1-32.72 39.63-42.74 63.5l-.33.87c-9.65 23.26-14.97 48.85-14.97 75.76 0 26.92 5.32 52.51 14.97 75.77a196.78 196.78 0 0 0 22.99 40.95c20.35-12.65 69.85-20.22 90.3-26.7 20.41-6.48 22.39-8.05 28.13-25.13-7.37-6.3-14.49-16.16-15.68-29.16l-.98.01c-2.24-.02-4.4-.54-6.42-1.69-3.24-1.85-5.52-5.01-7.06-8.58-5.2-10.26-11.3-35.05 2.36-32.81l-1.7-3.2c-.32-3.97-.4-8.76-.49-13.8-.29-18.51-.67-40.95-15.55-45.45l-6.39-1.93c32.31-40.07 90.88-98.25 137.91-40.99 47.49 4.62 62.64 75.91 30.06 107.38 1.95.07 3.8.53 5.43 1.4 6.2 3.32 6.4 10.52 4.77 16.59-1.61 5.05-3.65 10.91-5.59 15.83-2.35 6.66-5.78 7.9-12.42 7.18-.29 14.38-9.63 21.25-18.81 29.22 7.43 10.67 9.92 15.37 18.73 20.06-7.33 15.86-11.44 33.52-11.44 52.13 0 17.78 3.73 34.69 10.46 49.99l.23.52.13.28.1.22.24.52.07.15.15.35.24.51.02.03.22.47.19.42.05.09.24.5.25.51.25.51.07.15.17.34.25.5.01.04.25.46.2.41.05.08.25.49.16.29.11.22.26.48.09.17.17.32.27.5.01.03.26.46.21.4.06.08.27.48.16.29c3.79 6.68 8.17 12.99 13.12 18.84a232.552 232.552 0 0 1-84.25 15.76c-31.45 0-61.58-6.3-89.08-17.7l-.92-.41c-28.12-11.79-53.42-28.95-74.62-50.15-21.49-21.5-38.79-47.14-50.59-75.6C6.3 294.53 0 264.41 0 232.93c0-31.47 6.3-61.59 17.69-89.08l.41-.92c11.8-28.11 28.95-53.42 50.16-74.61 21.5-21.5 47.12-38.8 75.6-50.6C171.34 6.3 201.46 0 232.93 0zm162.75 326.72c-.04-4.9-.49-8.4 5.58-8.31l19.68.24c6.34-.04 8.03 1.97 7.95 7.93v26.83h26.68c4.89-.05 8.39-.49 8.3-5.58l-.24 19.67c.04 6.35-1.97 8.03-7.92 7.96h-26.82v26.81c.08 5.96-1.61 7.97-7.95 7.93l-19.68.24c-6.07.09-5.62-3.41-5.58-8.31v-26.67h-26.83c-5.95.07-7.96-1.61-7.92-7.96l-.24-19.67c-.09-6.07 3.41-5.63 8.3-5.58h26.69v-26.69z" fill="#FFFFFF" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#212529] mb-2">{t('authentication.register')}</h3>
                      <p className="text-sm text-gray-600">{t('authentication.newUser')}<br />{t('authentication.createYourAccount')}</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-center text-gray-700">
                  {t('authentication.registerOnceAccessServices')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </KioskLayout>
    );
  }

  if (mode === 'register') {
    return (
      <KioskLayout>
        {showSuccess && <SuccessScreen message={t('authentication.registrationSuccessful')} />}
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <button
              onClick={() => {
                setMode('choice');
                setStep(1);
                setFormData({
                  fullName: '',
                  email: '',
                  mobileNumber: '',
                  dateOfBirth: '',
                  gender: '',
                  aadhaarNumber: '',
                  address: ''
                });
                setErrors({});
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#10B981] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 469.74" className="w-6 h-6">
                    <path fill="#10B981" d="M412.27 270.29c55.1 0 99.73 44.66 99.73 99.72 0 55.1-44.66 99.73-99.73 99.73-55.09 0-99.72-44.65-99.72-99.73 0-55.1 44.65-99.72 99.72-99.72zM232.93 0c31.47 0 61.6 6.3 89.09 17.69l.91.42c28.11 11.79 53.42 28.94 74.62 50.15 21.54 21.56 38.85 47.2 50.62 75.61 11.4 27.49 17.69 57.61 17.69 89.06 0 8.19-.43 16.3-1.27 24.27a122.985 122.985 0 0 0-34.04-10.18c.33-4.65.49-9.35.49-14.09 0-26.89-5.32-52.48-14.97-75.74a198.26 198.26 0 0 0-43.01-64.33c-18.1-18.13-39.61-32.72-63.49-42.74l-.87-.33c-23.27-9.65-48.85-14.97-75.77-14.97-26.91 0-52.5 5.32-75.76 14.97-24.26 10.02-46.07 24.74-64.31 43.01-18.13 18.1-32.72 39.63-42.74 63.5l-.33.87c-9.65 23.26-14.97 48.85-14.97 75.76 0 26.92 5.32 52.51 14.97 75.77a196.78 196.78 0 0 0 22.99 40.95c20.35-12.65 69.85-20.22 90.3-26.7 20.41-6.48 22.39-8.05 28.13-25.13-7.37-6.3-14.49-16.16-15.68-29.16l-.98.01c-2.24-.02-4.4-.54-6.42-1.69-3.24-1.85-5.52-5.01-7.06-8.58-5.2-10.26-11.3-35.05 2.36-32.81l-1.7-3.2c-.32-3.97-.4-8.76-.49-13.8-.29-18.51-.67-40.95-15.55-45.45l-6.39-1.93c32.31-40.07 90.88-98.25 137.91-40.99 47.49 4.62 62.64 75.91 30.06 107.38 1.95.07 3.8.53 5.43 1.4 6.2 3.32 6.4 10.52 4.77 16.59-1.61 5.05-3.65 10.91-5.59 15.83-2.35 6.66-5.78 7.9-12.42 7.18-.29 14.38-9.63 21.25-18.81 29.22 7.43 10.67 9.92 15.37 18.73 20.06-7.33 15.86-11.44 33.52-11.44 52.13 0 17.78 3.73 34.69 10.46 49.99l.23.52.13.28.1.22.24.52.07.15.15.35.24.51.02.03.22.47.19.42.05.09.24.5.25.51.25.51.07.15.17.34.25.5.01.04.25.46.2.41.05.08.25.49.16.29.11.22.26.48.09.17.17.32.27.5.01.03.26.46.21.4.06.08.27.48.16.29c3.79 6.68 8.17 12.99 13.12 18.84a232.552 232.552 0 0 1-84.25 15.76c-31.45 0-61.58-6.3-89.08-17.7l-.92-.41c-28.12-11.79-53.42-28.95-74.62-50.15-21.49-21.5-38.79-47.14-50.59-75.6C6.3 294.53 0 264.41 0 232.93c0-31.47 6.3-61.59 17.69-89.08l.41-.92c11.8-28.11 28.95-53.42 50.16-74.61 21.5-21.5 47.12-38.8 75.6-50.6C171.34 6.3 201.46 0 232.93 0zm162.75 326.72c-.04-4.9-.49-8.4 5.58-8.31l19.68.24c6.34-.04 8.03 1.97 7.95 7.93v26.83h26.68c4.89-.05 8.39-.49 8.3-5.58l-.24 19.67c.04 6.35-1.97 8.03-7.92 7.96h-26.82v26.81c.08 5.96-1.61 7.97-7.95 7.93l-19.68.24c-6.07.09-5.62-3.41-5.58-8.31v-26.67h-26.83c-5.95.07-7.96-1.61-7.92-7.96l-.24-19.67c-.09-6.07 3.41-5.63 8.3-5.58h26.69v-26.69z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#212529]">{t('authentication.register')}</h2>
                  <p className="text-sm text-gray-600">{t('authentication.createYourAccount')}</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
                {[t('newConnection.applicantDetails'), t('newConnection.addressDetails')].map((label, index) => (
                  <div key={index} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${index + 1 < step ? 'bg-[#10B981] text-white' :
                        index + 1 === step ? 'bg-[#0066CC] text-white' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                        {index + 1 < step ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p className={`text-xs mt-2 font-medium ${index + 1 === step ? 'text-[#0066CC]' : 'text-gray-500'}`}>
                        {label}
                      </p>
                    </div>
                    {index < 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded-full transition-colors duration-300 ${index + 1 < step ? 'bg-[#10B981]' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                {/* Step 1: Personal Details */}
                {step === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#0066CC] rounded-full"></span>
                      {t('newConnection.applicantDetails')}
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('newConnection.fullName')} *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all shadow-sm"
                        placeholder="e.g. Amit Kumar"
                      />
                      {errors.fullName && <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('newConnection.emailAddress')}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all shadow-sm"
                          placeholder="e.g. amit@example.com"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('newConnection.mobileNumber')} *
                        </label>
                        <input
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all shadow-sm"
                        />
                        {errors.mobileNumber && <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {errors.mobileNumber}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('validation.dateOfBirthRequired')} *
                        </label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all shadow-sm"
                        />
                        {errors.dateOfBirth && <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {errors.dateOfBirth}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t('validation.genderRequired')} *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Male', 'Female', 'Other'].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => handleInputChange('gender', g)}
                              className={`py-3 px-2 rounded-lg text-sm font-medium border transition-all ${formData.gender === g
                                ? 'bg-blue-50 border-[#0066CC] text-[#0066CC] ring-1 ring-[#0066CC]'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {t(g.toLowerCase())}
                            </button>
                          ))}
                        </div>
                        {errors.gender && <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {errors.gender}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Identity & Address */}
                {step === 2 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#0066CC] rounded-full"></span>
                      {t('newConnection.addressDetails')}
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('authentication.aadhaarNumber')} *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.aadhaarNumber}
                          onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                          placeholder="XXXX XXXX XXXX"
                          maxLength={12}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all shadow-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                      </div>
                      {errors.aadhaarNumber && <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {errors.aadhaarNumber}</p>}
                      <p className="text-xs text-gray-500 mt-1.5 bg-blue-50 p-2 rounded border border-blue-100">
                        ℹ️ {t('aadhaarNumberHelper')}
                      </p>
                    </div>

                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('newConnection.address')} *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all shadow-sm resize-none"
                        placeholder={t('newConnection.addressDetails')}
                      />
                      {errors.address && <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠️ {errors.address}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <TouchButton
                    variant="outline"
                    size="medium"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    {t('newConnection.previous')}
                  </TouchButton>
                )}
                <TouchButton
                  variant="primary"
                  size="medium"
                  onClick={handleNext}
                  className="flex-1"
                >
                  {step === 2 ? t('newConnection.submit') : t('newConnection.next')}
                </TouchButton>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setMode('login');
                    setStep(1);
                    setFormData({
                      fullName: '',
                      email: '',
                      mobileNumber: '',
                      dateOfBirth: '',
                      gender: '',
                      aadhaarNumber: '',
                      address: ''
                    });
                    setErrors({});
                  }}
                  className="text-sm text-[#0066CC] hover:underline"
                >
                  {t('authentication.alreadyHaveAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </KioskLayout>
    );
  }

  if (mode === 'login') {
    return (
      <KioskLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setMode('choice');
                setLoginType(null);
                setLoginCredential('');
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#3B82F6] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M13 2C10.2386 2 8 4.23858 8 7C8 7.55228 8.44772 8 9 8C9.55228 8 10 7.55228 10 7C10 5.34315 11.3431 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H13C11.3431 20 10 18.6569 10 17C10 16.4477 9.55228 16 9 16C8.44772 16 8 16.4477 8 17C8 19.7614 10.2386 22 13 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H13Z" fill="#3B82F6" />
                    <path d="M3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H11.2821C11.1931 13.1098 11.1078 13.2163 11.0271 13.318C10.7816 13.6277 10.5738 13.8996 10.427 14.0945C10.3536 14.1921 10.2952 14.2705 10.255 14.3251L10.2084 14.3884L10.1959 14.4055L10.1915 14.4115C10.1914 14.4116 10.191 14.4122 11 15L10.1915 14.4115C9.86687 14.8583 9.96541 15.4844 10.4122 15.809C10.859 16.1336 11.4843 16.0346 11.809 15.5879L11.8118 15.584L11.822 15.57L11.8638 15.5132C11.9007 15.4632 11.9553 15.3897 12.0247 15.2975C12.1637 15.113 12.3612 14.8546 12.5942 14.5606C13.0655 13.9663 13.6623 13.2519 14.2071 12.7071L14.9142 12L14.2071 11.2929C13.6623 10.7481 13.0655 10.0337 12.5942 9.43937C12.3612 9.14542 12.1637 8.88702 12.0247 8.7025C11.9553 8.61033 11.9007 8.53682 11.8638 8.48679L11.822 8.43002L11.8118 8.41602L11.8095 8.41281C11.4848 7.96606 10.859 7.86637 10.4122 8.19098C9.96541 8.51561 9.86636 9.14098 10.191 9.58778L11 9C10.191 9.58778 10.1909 9.58773 10.191 9.58778L10.1925 9.58985L10.1959 9.59454L10.2084 9.61162L10.255 9.67492C10.2952 9.72946 10.3536 9.80795 10.427 9.90549C10.5738 10.1004 10.7816 10.3723 11.0271 10.682C11.1078 10.7837 11.1931 10.8902 11.2821 11H3Z" fill="#3B82F6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#212529]">{t('common.login')}</h2>
                  <p className="text-sm text-gray-600">{t('authentication.chooseLoginMethod')}</p>
                </div>
              </div>

              {!loginType ? (
                <div className="space-y-4 mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">{t('authentication.selectHowToLogin')}</p>

                  <button
                    onClick={() => {
                      setLoginType('aadhaar');
                      setLoginCredential('');
                    }}
                    className="w-full bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#7C3AED] hover:shadow-md transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#7C3AED] bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2500 1819.80163065" className="w-10 h-10">
                          <g clipRule="evenodd" fillRule="evenodd">
                            <path d="m0 1250.55c22.28-11.12 39.1-30.29 55.76-50.78 20.33-24.94 40.25-48.64 64.92-68.91 29.57-24.26 69.11-47.48 118.85-54.83a1031.412 1031.412 0 0 0 -15 174.52zm167.44-625.27.03.02-.02-.03c24.87 1.51 49.03-6.68 73.69-16.08 30.07-11.44 59.18-21.99 90.67-27.21 37.92-6.25 84.05-6.54 131.02 12.25-74.47 89.15-134.11 191.09-175.11 302.1-39.43-31.25-62.08-71.17-75.57-106.99-11.23-29.9-16.64-60.38-21.77-92.15-4.2-26.09-9.18-51.12-22.94-71.91zm457.54-457.73.01.02v-.03c20.77 13.76 45.8 18.75 71.87 22.94 31.76 5.14 62.24 10.55 92.11 21.79 35.98 13.54 76.06 36.36 107.36 76.14-111.07 40.83-213.09 100.4-302.34 174.78-18.83-47.03-18.56-93.24-12.29-131.21 5.22-31.5 15.76-60.62 27.2-90.7 9.42-24.68 17.6-48.86 16.08-73.73zm625-167.55v.03l.03-.03c11.1 22.31 30.28 39.14 50.76 55.8 24.93 20.35 48.62 40.28 68.88 64.95 24.4 29.77 47.76 69.64 54.95 119.84a1032.405 1032.405 0 0 0 -349.23.01c7.2-50.21 30.54-90.08 54.96-119.85 20.26-24.67 43.95-44.6 68.88-64.95 20.49-16.66 39.66-33.49 50.77-55.8zm625 167.54v.03l.02-.02c-1.52 24.87 6.67 49.04 16.08 73.72 11.42 30.08 21.98 59.2 27.2 90.7 6.25 37.96 6.52 84.17-12.3 131.2-89.23-74.38-191.27-133.93-302.32-174.78 31.3-39.77 71.38-62.58 107.35-76.13 29.88-11.25 60.36-16.66 92.12-21.8 26.07-4.18 51.1-9.17 71.85-22.92zm457.55 457.72-.02.02h.03c-13.74 20.78-18.72 45.81-22.92 71.9-5.14 31.76-10.55 62.25-21.77 92.14-13.49 35.83-36.14 75.74-75.58 106.99-40.98-111.01-100.63-212.95-175.1-302.1 46.98-18.78 93.08-18.5 131.02-12.25 31.48 5.23 60.6 15.78 90.66 27.22 24.66 9.41 48.82 17.6 73.68 16.08zm-72.08 450.75c49.73 7.36 89.29 30.57 118.86 54.84 24.67 20.26 44.59 43.96 64.93 68.91 16.64 20.48 33.47 39.66 55.76 50.78h-224.53c-.06-59.5-5.24-117.8-15.02-174.53zm-712.43-724.21c377.42 124.72 650.19 479.8 651.77 898.77h-186.75c12.37-365.98-147.3-696.31-465.02-898.77z" fill="#fab401" />
                            <path d="m1585.91 1250.55h97.05c4.7-105.5-4.35-230.5-38.46-339.65-6.73-21.53-14.44-42.45-23.19-62.4-20.65-47.16-48.45-89.86-81.59-129.32-36.83-43.82-80.73-83.24-130.21-114.29a488.13 488.13 0 0 0 -45.37-25.26v-.02a456.484 456.484 0 0 0 -48.07-20.23l-.06-.03c-189.01-67.13-380.17-19.39-540.52 67.88-31.26 17-61.35 35.51-90 54.94-28.64 19.43-55.9 39.83-81.54 60.64h-.02l-.03.04c-30.44 24.7-68.54 58.49-106.23 98.45a933.873 933.873 0 0 0 -21.88 23.97c-19.09 21.62-48.47 51.95-39.76 83.32 6.91 24.88 38.98 17.54 50.17 8.96 17.14-9.2 35.98-23.79 52.1-37.44 21.83-18.48 42.43-38.37 64.04-57.11 87.4-75.8 178.51-134.25 268.23-173.81 19.56-8.61 39.14-16.38 58.65-23.23 19.45-6.84 38.8-12.76 57.97-17.74l.09-.02c166.97-43.39 348.41-15.27 464.58 120.94 111.91 131.22 132.34 306.87 134.05 481.41zm-1204.26-148.32c10.42-9.74 21.05-22.44 32.13-36.52 15.49-19.66 17.04-38.7 10.93-52.44-2.29-5.13-5.66-9.54-9.75-12.97-4.05-3.39-8.84-5.81-14.01-6.99-12.63-2.89-27.74 1.62-40.54 17.24-14.5 17.66-34.53 47.82-38.62 74.51-.76 5.01-.97 9.87-.45 14.43.5 4.45 1.68 8.67 3.68 12.51l.01.05.01-.01c3.27 6.27 8.78 9.57 16.12 9.85 1.53.05 3.19-.01 4.94-.21 1.73-.18 3.59-.52 5.58-.99v.01l.08-.02c9.9-2.37 19.78-9.02 29.89-18.45zm1006.79 148.32h96.26c4.57-113.7-13.74-231.15-66.59-332.76-48.06-92.44-127.52-155.28-230.38-170.47-150.16-22.16-301.68 41.42-429.77 132.42-139.47 99.07-254.6 233.6-355.21 370.81l127.15-.17c114.48-162.33 377.8-408.76 571.48-410.38 61.73-.52 124.48 13.99 170.88 55.4 33.63 30.01 74.38 88.29 72.39 135.58-1.18 28.05-26.06 36.65-49.92 27.97-18.53-6.76-31.63-23.71-44.6-41.52-42.15-57.89-107.87-86.22-179.98-76.35-86 11.77-192.6 78.57-261.36 139.32-59.3 52.41-113.72 109.76-165.08 170.14h136.71c50.11-60.5 103.02-112.11 171.03-154.5 21.54-13.41 48.04-27.6 75.9-37.17 70.28-24.18 140.23-18.06 171.27 69.5 12.21 34.42 14 64.6 10.44 119.94l-.01 2.24h92.97l.23-2.84c.07-30.29-.58-50.71 2.15-80.73 2.35-25.88 10.39-52.7 34.41-55.88 51.07-10.71 48.62 102.93 49.63 139.45zm-655.28 293.88h-75.54l-18.71 65.85h-60.2l79.65-252.17h76.3l81.9 252.17h-62.84zm-66.94-42.66h57.96c-15.21-49.25-25.06-83.05-29.55-101.38h-.75l-11.96 47.89zm-210.52 42.66h-75.54l-18.71 65.85h-60.2l79.65-252.17h76.28l81.91 252.17h-62.84zm-66.94-42.66h57.95c-15.2-49.25-25.05-83.05-29.53-101.38h-.75l-11.96 47.89zm485.36 107.38v-247.69c24.93-3.73 51.61-5.59 80.04-5.59 53.73 0 92.31 11.2 115.69 33.73 23.36 22.51 35.03 51.93 35.03 88.22 0 42.9-13.28 76.15-39.9 99.72s-67.69 35.35-123.17 35.35c-25.67 0-48.24-1.24-67.69-3.74zm57.97-206.51v164.23c3.24.75 10.23 1.14 20.95 1.14 28.78 0 51.11-7.61 66.87-22.77 15.77-15.15 23.62-36.85 23.62-65.15 0-25.95-7.17-45.71-21.56-59.3s-35.16-20.39-62.21-20.39c-11.34-.01-20.56.74-27.67 2.24zm234.82-44.53h57.97v96.89h99.1v-96.89h57.96v252.17h-57.96v-105.13h-99.1v105.13h-57.97zm425.2 186.32h-75.54l-18.71 65.85h-60.21l79.65-252.17h76.29l81.89 252.17h-62.83zm-66.94-42.66h57.95c-15.2-49.25-25.06-83.05-29.54-101.38h-.75l-11.97 47.89zm344.4 42.66h-75.54l-18.71 65.85h-60.2l79.65-252.17h76.29l81.89 252.17h-62.82zm-66.95-42.66h57.96c-15.2-49.25-25.05-83.05-29.54-101.38h-.74l-11.97 47.89zm207.9 108.51v-248.81c21.19-3.73 47.25-5.59 78.16-5.59 38.15 0 65.57 6.29 82.27 18.89 16.71 12.59 25.06 30.62 25.06 54.06 0 13.97-4.17 26.56-12.59 37.85-8.41 11.29-19.33 19.28-32.66 23.89v1.5c15.71 5.86 27.05 21.32 34.03 46.38 12.83 45.16 19.82 69.1 20.95 71.85h-59.09c-4.99-9.35-10.97-28.93-17.95-58.74-3.5-14.97-8.23-25.44-14.21-31.43-5.99-5.99-15.58-8.99-28.81-8.99h-17.94v99.15h-57.22zm57.22-209.89v69.22h23.93c14.47 0 25.86-3.31 34.22-9.87 8.35-6.55 12.53-15.33 12.53-26.43 0-11.11-3.75-19.71-11.29-25.76-7.54-6.06-18.26-9.05-32.1-9.05-13.59.01-22.68.64-27.29 1.89zm-1026.29-149.61 77.15-.24c10.14-65.2-9.69-115.38-75.6-103.42-55.56 10.1-115.23 65.31-151.28 103.42l101.72-.45c11.34-7.46 33.52-15.95 42.63-9.62 3.42 2.38 5.20 5.73 5.38 10.31zm787.23-.18.7-.03h.35c10.14.56 27.77-4.12 37.94-21.28 2.03-3.43 3.76-7.35 5.08-11.8 1.35-4.53 2.28-9.67 2.67-15.43h.02l.06-1.19c7.71-269.68-74.85-492.93-215.01-644.62-27.22-29.44-56.67-56.23-88.06-80.16-31.37-23.9-64.67-44.92-99.63-62.83v.01l-.55-.29-.02-.01c-117.82-60.23-251.43-83.37-382.6-72.25a757.862 757.862 0 0 0 -76.14 10.35c-25.18 4.71-50.18 10.75-74.78 18.01l-.34.11c-134.89 39.91-260.4 119.14-362.69 223.11a944.96 944.96 0 0 0 -56.97 63.39 951.626 951.626 0 0 0 -26.12 33.32c71.74-61.91 148.68-116.22 229.18-159.38 18.13-9.72 36.37-18.84 54.65-27.31a965.09 965.09 0 0 1 55.58-23.67l.06-.02.05-.02c71.11-27.65 141.22-45.29 211.34-53.17 70.13-7.88 140.29-6 211.54 5.33 50.72 8.07 100.2 21.35 144.79 39.94 8.64 3.59 17.17 7.43 25.5 11.47 8.22 3.98 16.31 8.24 24.25 12.71h.02l.12.06v.01c156.98 85.99 266.04 262.46 314.07 461.7 9.37 38.85 16.42 78.55 21.05 118.53 4.62 39.98 6.84 80.37 6.56 120.72v.02l-.02 2.31c.8 21.59 8.19 39.64 20.85 47.76 2.37 1.51 4.92 2.69 7.64 3.45h.02c2.79.79 5.73 1.18 8.84 1.15z" fill="#d32828" />
                          </g>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#212529] mb-1">{t('authentication.usingAadhaarNumber')}</p>
                        <p className="text-xs text-gray-600">{t('authentication.twelveDigitAadhaar')}</p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <button
                    onClick={() => {
                      setLoginType(null);
                      setLoginCredential('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 mb-4"
                  >
                    {t('authentication.selectHowToLogin')}
                  </button>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('authentication.aadhaarNumber')}
                    </label>
                    <input
                      type="text"
                      value={loginCredential}
                      onChange={(e) => setLoginCredential(e.target.value)}
                      placeholder={t('authentication.enterAadhaar')}
                      maxLength={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-gray-700">
                      <strong>{t('authentication.otp')}</strong>: {t('authentication.otpVerificationNote')}
                    </p>
                  </div>
                </div>
              )}

              {/* ReCAPTCHA Container (invisible) */}
              <div id="recaptcha-container"></div>

              {loginType && (
                <TouchButton
                  variant="primary"
                  size="medium"
                  onClick={handleLoginSubmit}
                  className="w-full mb-4"
                >
                  {t('authentication.proceedToOTP')}
                </TouchButton>
              )}

              <div className="text-center">
                <button
                  onClick={() => {
                    setMode('register');
                    setLoginType(null);
                  }}
                  className="text-sm text-[#0066CC] hover:underline"
                >
                  {t('authentication.newUser')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </KioskLayout>
    );
  }

  if (mode === 'otp') {
    return (
      <KioskLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="w-full max-w-md">
            <button
              onClick={() => setMode('login')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#10B981] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M13 2C10.2386 2 8 4.23858 8 7C8 7.55228 8.44772 8 9 8C9.55228 8 10 7.55228 10 7C10 5.34315 11.3431 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H13C11.3431 20 10 18.6569 10 17C10 16.4477 9.55228 16 9 16C8.44772 16 8 16.4477 8 17C8 19.7614 10.2386 22 13 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H13Z" fill="#10B981" />
                    <path d="M3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H11.2821C11.1931 13.1098 11.1078 13.2163 11.0271 13.318C10.7816 13.6277 10.5738 13.8996 10.427 14.0945C10.3536 14.1921 10.2952 14.2705 10.255 14.3251L10.2084 14.3884L10.1959 14.4055L10.1915 14.4115C10.1914 14.4116 10.191 14.4122 11 15L10.1915 14.4115C9.86687 14.8583 9.96541 15.4844 10.4122 15.809C10.859 16.1336 11.4843 16.0346 11.809 15.5879L11.8118 15.584L11.822 15.57L11.8638 15.5132C11.9007 15.4632 11.9553 15.3897 12.0247 15.2975C12.1637 15.113 12.3612 14.8546 12.5942 14.5606C13.0655 13.9663 13.6623 13.2519 14.2071 12.7071L14.9142 12L14.2071 11.2929C13.6623 10.7481 13.0655 10.0337 12.5942 9.43937C12.3612 9.14542 12.1637 8.88702 12.0247 8.7025C11.9553 8.61033 11.9007 8.53682 11.8638 8.48679L11.822 8.43002L11.8118 8.41602L11.8095 8.41281C11.4848 7.96606 10.859 7.86637 10.4122 8.19098C9.96541 8.51561 9.86636 9.14098 10.191 9.58778L11 9C10.191 9.58778 10.1909 9.58773 10.191 9.58778L10.1925 9.58985L10.1959 9.59454L10.2084 9.61162L10.255 9.67492C10.2952 9.72946 10.3536 9.80795 10.427 9.90549C10.5738 10.1004 10.7816 10.3723 11.0271 10.682C11.1078 10.7837 11.1931 10.8902 11.2821 11H3Z" fill="#10B981" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#212529]">{t('authentication.otpVerification')}</h2>
                  <p className="text-sm text-gray-600">{t('authentication.enterOTP')}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 text-center">
                    {t('authentication.otpSentTo')} <strong>{maskedPhone}</strong>
                  </p>
                </div>

                <div className="flex gap-3 justify-center mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  ))}
                </div>

                <div className="text-center mb-6">
                  {canResendOtp ? (
                    <button
                      onClick={handleResendOtp}
                      className="text-sm text-[#0066CC] hover:underline font-semibold"
                    >
                      {t('authentication.resendOTP')}
                    </button>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {t('authentication.resendIn')} {otpTimer} {t('authentication.seconds')}
                    </p>
                  )}
                </div>
              </div>

              <TouchButton
                variant="primary"
                size="medium"
                onClick={handleOtpVerify}
                className="w-full"
              >
                {t('authentication.verify')}
              </TouchButton>
            </div>
          </div>
        </div>
      </KioskLayout>
    );
  }

  // Register mode
  if (showSuccess) {
    return <SuccessScreen message={t('authentication.registrationSuccessful')} />;
  }

  return (
    <KioskLayout>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else setMode('choice');
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 relative z-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#10B981] bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                <path d="M16 4C12.6863 4 10 6.68629 10 10C10 13.3137 12.6863 16 16 16C19.3137 16 22 13.3137 22 10C22 6.68629 19.3137 4 16 4Z" fill="#10B981" />
                <path d="M8 28C8 22.4772 12.4772 18 18 18H22V21H18C14.134 21 11 24.134 11 28V30H8V28Z" fill="#10B981" />
                <path d="M26 19V23H22V26H26V30H29V26H33V23H29V19H26Z" fill="#10B981" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#212529]">{t('registerNewAccount')}</h2>
              <p className="text-sm text-gray-600">{t('citizenRegistrationPortal')}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[t('personalStep'), t('identityStep'), t('addressStep')].map((label, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${index + 1 < step ? 'bg-[#28A745] text-white' :
                    index + 1 === step ? 'bg-[#0066CC] text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                    {index + 1}
                  </div>
                  <p className={`text-xs mt-2 ${index + 1 === step ? 'font-semibold text-[#0066CC]' : 'text-gray-600'}`}>
                    {label}
                  </p>
                </div>
                {index < 2 && (
                  <div className={`h-0.5 flex-1 mx-2 ${index + 1 < step ? 'bg-[#28A745]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#212529] mb-4">{t('personalInformation')}</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fullNameAsPerAadhaar')}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('emailAddress')} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('mobileNumber')} *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder={t('digits10')}
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  />
                  {errors.mobileNumber && <p className="text-xs text-red-600 mt-1">{errors.mobileNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dateOfBirth')} *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  />
                  {errors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('gender')} *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  >
                    <option value="">{t('selectGender')}</option>
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Identity Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#212529] mb-4">{t('identityInformation')}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('fatherName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  />
                  {errors.fatherName && <p className="text-xs text-red-600 mt-1">{errors.fatherName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('motherName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  />
                  {errors.motherName && <p className="text-xs text-red-600 mt-1">{errors.motherName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('aadhaarNumber')} *
                </label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                  placeholder={t('digits12')}
                  maxLength={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                />
                {errors.aadhaarNumber && <p className="text-xs text-red-600 mt-1">{errors.aadhaarNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('panNumber')} *
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                  placeholder={t('panPlaceholder')}
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                />
                {errors.panNumber && <p className="text-xs text-red-600 mt-1">{errors.panNumber}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Address Details */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#212529] mb-4">{t('addressInformation')}</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('completeAddress')} *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('state')} *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setFormData({ ...formData, state: newState, city: '' });
                        setErrors({ ...errors, state: '', city: '' });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent bg-white cursor-pointer"
                    >
                      <option value="">{t('selectState')}</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
                  </div>

                  <div className="relative z-10">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('city')} *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        setErrors({ ...errors, city: '' });
                      }}
                      disabled={!formData.state}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">{t('selectCity')}</option>
                      {formData.state && citiesByState[formData.state]?.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pincode')} *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder={t('digits6')}
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                  />
                  {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('occupation')} *
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                />
                {errors.occupation && <p className="text-xs text-red-600 mt-1">{errors.occupation}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-700">
                  <strong>{t('note')}</strong> {t('afterRegistrationLoginInfo')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <TouchButton
              variant="secondary"
              size="medium"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              {t('common.previous')}
            </TouchButton>
          )}

          <TouchButton
            variant="primary"
            size="medium"
            onClick={handleNext}
            className="flex-1"
          >
            {step === 3 ? t('completeRegistration') : t('common.next')}
          </TouchButton>
        </div>
      </div>
    </KioskLayout>
  );
}