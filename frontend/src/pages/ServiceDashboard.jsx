import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    CreditCard,
    FileText,
    AlertCircle,
    Search,
    LogOut
} from 'lucide-react';

const ServiceDashboard = ({ user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const menuItems = [
        {
            id: 'bill-payment',
            name: t('billPayment'),
            icon: CreditCard,
            path: '/bill-payment',
            color: 'bg-green-500'
        },
        {
            id: 'new-connection',
            name: t('newConnection'),
            icon: FileText,
            path: '/new-connection',
            color: 'bg-blue-500'
        },
        {
            id: 'complaints',
            name: t('complaints'),
            icon: AlertCircle,
            path: '/complaints',
            color: 'bg-orange-500'
        },
        {
            id: 'track-status',
            name: t('trackStatus'),
            icon: Search,
            path: '/track-status',
            color: 'bg-purple-500'
        }
    ];

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen p-8">
            {/* User Info */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-kiosk-lg font-bold">{user.name}</h2>
                        <p className="text-gray-600">ID: {user.consumerId}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 bg-red-500 text-white
                       px-6 py-3 rounded-lg hover:bg-red-600"
                    >
                        <LogOut size={24} />
                        <span className="text-kiosk-base">Logout</span>
                    </button>
                </div>
            </div>

            {/* Service Menu */}
            <div className="grid grid-cols-2 gap-8">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`
                ${item.color} text-white
                p-12 rounded-2xl
                hover:scale-105 transition-transform
                flex flex-col items-center gap-6
              `}
                        >
                            <Icon size={80} />
                            <span className="text-kiosk-xl font-bold">
                                {item.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ServiceDashboard;