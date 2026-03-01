import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { VoiceAssistProvider } from "./providers/VoiceAssistProvider";
import { LanguageSelection } from "./pages/nextgen-seva/LanguageSelection";
import { LoginRegister } from "./pages/nextgen-seva/LoginRegister";
import { ServiceSelection } from "./pages/nextgen-seva/ServiceSelection";
import { DepartmentVerification } from "./pages/nextgen-seva/DepartmentVerification";
import { AadhaarLogin } from "./pages/nextgen-seva/AadhaarLogin";
import { OTPVerification } from "./pages/nextgen-seva/OTPVerification";
import { Dashboard } from "./pages/nextgen-seva/Dashboard";
import { ViewBills } from "./pages/nextgen-seva/ViewBills";
import { PayBill } from "./pages/nextgen-seva/PayBill";
import { Receipt } from "./pages/nextgen-seva/Receipt";
import { ProtectedRoute } from "./components/nextgen-seva/ProtectedRoute";
import { RegisterComplaint } from "./pages/nextgen-seva/RegisterComplaint";
import { TrackComplaint } from "./pages/nextgen-seva/TrackComplaint";
import { NewConnection } from "./pages/nextgen-seva/NewConnection";
import { TrackNewConnection } from "./pages/nextgen-seva/TrackNewConnection";
import { WaterTankerBooking } from "./pages/nextgen-seva/WaterTankerBooking";
import { GasCylinderBooking } from "./pages/nextgen-seva/GasCylinderBooking";
import { TrackRequest } from "./pages/nextgen-seva/TrackRequest";
import { AdminDashboard } from "./pages/nextgen-seva/AdminDashboard";
import { PropertyTaxPayment } from "./pages/nextgen-seva/PropertyTaxPayment";
import { MyDocuments } from "./pages/nextgen-seva/MyDocuments";
import { MunicipalServiceRequests } from "./pages/nextgen-seva/MunicipalServiceRequests";
import { TrackServiceRequest } from "./pages/nextgen-seva/TrackServiceRequest";


export const router = createBrowserRouter([
    {
        element: (
            <VoiceAssistProvider>
                <Outlet />
            </VoiceAssistProvider>
        ),
        children: [
            {
                path: "/",
                element: <Navigate to="/nextgen-seva" replace />,
            },
            {
                path: "/nextgen-seva",
                Component: LanguageSelection,
            },
            {
                path: "/nextgen-seva/login-register",
                Component: LoginRegister,
            },
            {
                path: "/nextgen-seva/service-selection",
                Component: ServiceSelection,
            },
            {
                path: "/nextgen-seva/department-verification",
                Component: DepartmentVerification,
            },
            {
                path: "/nextgen-seva/login",
                Component: AadhaarLogin,
            },
            {
                path: "/nextgen-seva/otp-verification",
                Component: OTPVerification,
            },
            {
                path: "/nextgen-seva/dashboard",
                element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
            },
            {
                path: "/nextgen-seva/bills",
                element: <ProtectedRoute><ViewBills /></ProtectedRoute>,
            },
            {
                path: "/nextgen-seva/pay-bill/:billId",
                element: <ProtectedRoute><PayBill /></ProtectedRoute>,
            },
            {
                path: "/nextgen-seva/receipt/:transactionId",
                element: <ProtectedRoute><Receipt /></ProtectedRoute>,
            },
            {
                path: "/nextgen-seva/register-complaint",
                Component: RegisterComplaint,
            },
            {
                path: "/nextgen-seva/track-complaint",
                Component: TrackComplaint,
            },
            {
                path: "/nextgen-seva/new-connection",
                Component: NewConnection,
            },
            {
                path: "/nextgen-seva/track-new-connection",
                Component: TrackNewConnection,
            },
            {
                path: "/nextgen-seva/water-tanker-booking",
                element: (
                    <ProtectedRoute>
                        <WaterTankerBooking />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/nextgen-seva/gas-cylinder-booking",
                element: (
                    <ProtectedRoute>
                        <GasCylinderBooking />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/nextgen-seva/track-request",
                element: (
                    <ProtectedRoute>
                        <TrackRequest />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/nextgen-seva/pay-property-tax",
                element: (
                    <ProtectedRoute>
                        <PropertyTaxPayment />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/nextgen-seva/pay-property-tax/:billId",
                element: (
                    <ProtectedRoute>
                        <PropertyTaxPayment />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/nextgen-seva/admin",
                Component: AdminDashboard,
            },
            {
                path: "/nextgen-seva/my-documents",
                element: (
                    <ProtectedRoute>
                        <MyDocuments />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/nextgen-seva/municipal-service-requests",
                element: (
                    <ProtectedRoute>
                        <MunicipalServiceRequests />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/nextgen-seva/track-service-request",
                element: (
                    <ProtectedRoute>
                        <TrackServiceRequest />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/nextgen-seva/*",
                element: <Navigate to="/nextgen-seva" replace />,
            },
            {
                path: "*",
                element: <Navigate to="/nextgen-seva" replace />,
            }
        ]
    }
]);
