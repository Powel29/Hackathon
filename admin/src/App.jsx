import { useState } from 'react';
import { useAdminStore } from './store/adminStore';
import { AdminLogin } from './screens/AdminLogin';
import { AdminRegister } from './screens/AdminRegister';
import { AdminLayout } from './components/AdminLayout';
import { OverviewDashboard } from './screens/OverviewDashboard';
import { ComplaintsModule } from './screens/ComplaintsModule';
import { BillingModule } from './screens/BillingModule';
import { ConnectionsModule } from './screens/ConnectionsModule';
import { ServiceRequests } from './screens/ServiceRequests';
import { DeptAlertsModule } from './screens/DeptAlertsModule';
import { UsersModule } from './screens/UsersModule';
import { AccountApprovals } from './screens/AccountApprovals';
import { KioskMonitor } from './screens/KioskMonitor';
import { DeviceState } from './screens/DeviceState';
function AdminApp() {
    const [activeRoute, setActiveRoute] = useState('dashboard');
    const renderScreen = () => {
        switch (activeRoute) {
            case 'dashboard': return <OverviewDashboard />;
            case 'complaints': return <ComplaintsModule />;
            case 'billing': return <BillingModule />;
            case 'connections': return <ConnectionsModule />;
            case 'requests': return <ServiceRequests />;
            case 'dept-alerts': return <DeptAlertsModule />;
            case 'users': return <UsersModule />;
            case 'account-approvals': return <AccountApprovals />;
            case 'kiosks': return <KioskMonitor />;
            case 'device-state': return <DeviceState />;
            default: return <OverviewDashboard />;
        }
    };
    return (<AdminLayout activeRoute={activeRoute} onNavigate={(r) => setActiveRoute(r)}>
        {renderScreen()}
    </AdminLayout>);
}
export default function App() {
    const { isLoggedIn } = useAdminStore();
    const [showRegister, setShowRegister] = useState(false);
    if (showRegister) {
        return <AdminRegister onBack={() => setShowRegister(false)} />;
    }
    if (!isLoggedIn) {
        return <AdminLogin onRegister={() => setShowRegister(true)} />;
    }
    return <AdminApp />;
}
