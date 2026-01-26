import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { authService } from '../../services/api';

const Login = ({ utilityType, onLoginSuccess }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await authService.login({
                ...data,
                utilityType
            });

            if (response.success) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                toast.success('Login successful!');
                onLoginSuccess(response.user);
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
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
                        {t('consumerId')}
                    </label>
                    <input
                        {...register('consumerId', { required: true })}
                        className="w-full p-6 text-kiosk-base border-2 rounded-xl"
                        placeholder="Enter Consumer ID"
                    />
                    {errors.consumerId && (
                        <span className="text-red-500">This field is required</span>
                    )}
                </div>

                <div>
                    <label className="block text-kiosk-base mb-3">
                        {t('mobileNumber')}
                    </label>
                    <input
                        {...register('mobile', {
                            required: true,
                            pattern: /^[0-9]{10}$/
                        })}
                        className="w-full p-6 text-kiosk-base border-2 rounded-xl"
                        placeholder="Enter Mobile Number"
                    />
                    {errors.mobile && (
                        <span className="text-red-500">
                            Enter valid 10-digit mobile number
                        </span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white p-6 rounded-xl
                        text-kiosk-lg font-bold hover:bg-blue-700
                        disabled:opacity-50"
                >
                    {loading ? 'Loading...' : t('login')}
                </button>
            </form>
        </div>
    );
};

export default Login;