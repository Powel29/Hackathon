import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { complaintService } from '../services/api';
import { toast } from 'sonner';
import { useState } from 'react';

const ComplaintRegistration = ({ utilityType }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);

    const complaintTypes = {
        electricity: [
            'Power Outage',
            'Billing Issue',
            'Meter Problem',
            'Voltage Fluctuation',
            'Other'
        ],
        gas: [
            'Gas Leak',
            'Billing Issue',
            'Meter Problem',
            'Low Pressure',
            'Other'
        ],
        water: [
            'No Water Supply',
            'Low Pressure',
            'Contaminated Water',
            'Billing Issue',
            'Other'
        ],
        municipal: [
            'Garbage Collection',
            'Street Light',
            'Road Maintenance',
            'Drainage',
            'Other'
        ]
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await complaintService.submit({
                ...data,
                utilityType
            });

            if (response.success) {
                toast.success(
                    `Complaint registered! ID: ${response.complaint.id}`
                );
                reset();
            }
        } catch {
            toast.error('Failed to register complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h2 className="text-kiosk-xl font-bold mb-8">
                {t('complaints')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-kiosk-base mb-3">
                        Complaint Type
                    </label>
                    <select
                        {...register('complaintType', { required: true })}
                        className="w-full p-6 text-kiosk-base border-2 rounded-xl"
                    >
                        <option value="">Select Type</option>
                        {complaintTypes[utilityType]?.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-kiosk-base mb-3">
                        Description
                    </label>
                    <textarea
                        {...register('description', { required: true })}
                        rows={6}
                        className="w-full p-6 text-kiosk-base border-2 rounded-xl"
                        placeholder="Describe your issue..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white p-6 rounded-xl
                     text-kiosk-lg font-bold hover:bg-blue-700"
                >
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
            </form>
        </div>
    );
};

export default ComplaintRegistration;
