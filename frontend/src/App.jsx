import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState } from 'react';
import './i18n/config';

import HomePage from './pages/HomePage';
import ServiceDashboard from './pages/ServiceDashboard';
import BillPayment from './pages/BillPayment';
import ComplaintRegistration from './pages/ComplaintRegistration';
// import NewConnection from './pages/NewConnection';
// import TrackStatus from './pages/TrackStatus';

function App() {
    const [user, setUser] = useState(null);
    const [selectedService, setSelectedService] = useState(null);

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
                <Toaster position="top-center" richColors />

                <Routes>
                    <Route
                        path="/"
                        element={
                            <HomePage
                                onSelectService={setSelectedService}
                                onLogin={setUser}
                            />
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            user ? (
                                <ServiceDashboard
                                    user={user}
                                    service={selectedService}
                                />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    <Route
                        path="/bill-payment"
                        element={<BillPayment user={user} />}
                    />

                    <Route
                        path="/complaints"
                        element={
                            <ComplaintRegistration utilityType={selectedService} />
                        }
                    />

                    {/* <Route
                        path="/new-connection"
                        element={<NewConnection utilityType={selectedService} />}
                    /> 

                    <Route
                        path="/track-status"
                        element={<TrackStatus />}
                    />
                    */}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
