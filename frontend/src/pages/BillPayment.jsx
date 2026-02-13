import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { billService, paymentService } from '../services/api';
import { toast } from 'sonner';

const BillPayment = ({ user }) => {
    const { t } = useTranslation();
    const [bills, setBills] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const response = await billService.getUserBills();
            setBills(response.bills);
        } catch {
            toast.error('Failed to fetch bills');
        }
    };

    const handlePayment = async (bill) => {
        setLoading(true);
        try {
            // Create Razorpay order
            const orderResponse = await paymentService.createOrder({
                amount: bill.amount,
                currency: 'INR',
                receipt: bill.id,
            });
            // Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: bill.amount * 100,
                currency: 'INR',
                name: 'SUVIDHA Kiosk',
                description: `Bill Payment - ${bill.billNumber}`,
                order_id: orderResponse.order.id,
                handler: async (response) => {
                    // Verify payment
                    const verifyResponse = await paymentService.verifyPayment({
                        billId: bill.id,
                        amount: bill.amount,
                        ...response
                    });

                    if (verifyResponse.success) {
                        toast.success('Payment successful!');
                        fetchBills(); // Refresh bills
                    }
                },
                prefill: {
                    name: user.name,
                    contact: user.mobile
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch {
            toast.error('Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-kiosk-xl font-bold mb-8">
                {t('billPayment')}
            </h2>

            <div className="space-y-4">
                {bills.map((bill) => (
                    <div
                        key={bill.id}
                        className="bg-white p-6 rounded-xl shadow-lg border-2"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-kiosk-base font-bold">
                                    Bill #{bill.billNumber}
                                </p>
                                <p className="text-gray-600">
                                    Due: {new Date(bill.dueDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-kiosk-lg font-bold text-primary">
                                    ₹{bill.amount}
                                </p>
                                {bill.status === 'UNPAID' ? (
                                    <button
                                        onClick={() => handlePayment(bill)}
                                        disabled={loading}
                                        className="mt-2 bg-green-500 text-white px-8 py-3
                              rounded-lg text-kiosk-base font-bold
                              hover:bg-green-600 disabled:opacity-50"
                                    >
                                        Pay Now
                                    </button>
                                ) : (
                                    <span className="text-green-600 font-bold">PAID</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default BillPayment;