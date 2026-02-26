import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { authService } from '../../services/api';

const Login = ({ utilityType, onLoginSuccess }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [loading, setLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState(null);

    const onSendOtp = async (data) => {
        setLoading(true);
        try {
            const response = await authService.sendOTP(data.consumerId, data.mobile);
            setFormData(data);
            setShowOtpInput(true);

            // Show demo OTP if available (development mode)
            if (response._demoOTP && import.meta.env.DEV) {
                toast.success(`OTP sent! Demo OTP: ${response._demoOTP}`);
            } else {
                toast.success('OTP sent successfully!');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const onVerifyOtp = async () => {
        if (!formData) return;

        setLoading(true);
        try {
            const verifyResponse = await authService.verifyOTP(formData.consumerId, otp);

            if (verifyResponse.success) {
                // Storage handled by authService
                toast.success('Login successful!');
                onLoginSuccess(verifyResponse.user);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (data) => {
        if (!showOtpInput) {
            onSendOtp(data);
        } else {
            onVerifyOtp();
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h2 className="text-kiosk-xl font-bold mb-8 text-center">
                {t('login')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-kiosk-base mb-3">
                        Aadhaar Number
                    </label>
                    <input
                        {...register('consumerId', {
                            required: 'Aadhaar number is required',
                            pattern: {
                                value: /^[0-9]{12}$/,
                                message: 'Aadhaar must be exactly 12 digits'
                            }
                        })}
                        className="w-full p-6 text-kiosk-base border-2 rounded-xl"
                        placeholder="Enter 12-digit Aadhaar Number"
                        disabled={showOtpInput}
                        maxLength={12}
                    />
                    {errors.consumerId && (
                        <span className="text-red-500">{errors.consumerId.message}</span>
                    )}
                </div>

                <div>
                    <label className="block text-kiosk-base mb-3">
                        {t('mobileNumber')}
                    </label>
                    <input
                        {...register('mobile', {
                            required: 'Mobile number is required',
                            pattern: {
                                value: /^[6-9][0-9]{9}$/,
                                message: 'Enter valid 10-digit mobile number starting with 6-9'
                            }
                        })}
                        className="w-full p-6 text-kiosk-base border-2 rounded-xl"
                        placeholder="Enter Mobile Number"
                        disabled={showOtpInput}
                        maxLength={10}
                    />
                    {errors.mobile && (
                        <span className="text-red-500">
                            {errors.mobile.message}
                        </span>
                    )}
                </div>

                {showOtpInput && (
                    <div>
                        <label className="block text-kiosk-base mb-3">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-6 text-kiosk-base border-2 rounded-xl"
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white p-6 rounded-xl
                        text-kiosk-lg font-bold hover:bg-blue-700
                        disabled:opacity-50"
                >
                    {loading ? 'Loading...' : (showOtpInput ? 'Verify & Login' : 'Send OTP')}
                </button>
            </form>
        </div>
    );
};

export default Login;