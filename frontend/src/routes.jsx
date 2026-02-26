import { createBrowserRouter, Navigate } from "react-router-dom";
import { LanguageSelection } from "./pages/kiosk/LanguageSelection";
import { LoginRegister } from "./pages/kiosk/LoginRegister";
import { ServiceSelection } from "./pages/kiosk/ServiceSelection";
import { DepartmentVerification } from "./pages/kiosk/DepartmentVerification";
import { AadhaarLogin } from "./pages/kiosk/AadhaarLogin";
import { OTPVerification } from "./pages/kiosk/OTPVerification";
import { Dashboard } from "./pages/kiosk/Dashboard";
import { ViewBills } from "./pages/kiosk/ViewBills";
import { PayBill } from "./pages/kiosk/PayBill";
import { Receipt } from "./pages/kiosk/Receipt";
import { ProtectedRoute } from "./components/kiosk/ProtectedRoute";
import { RegisterComplaint } from "./pages/kiosk/RegisterComplaint";
import { TrackComplaint } from "./pages/kiosk/TrackComplaint";
import { NewConnection } from "./pages/kiosk/NewConnection";
import { TrackNewConnection } from "./pages/kiosk/TrackNewConnection";
import { WaterTankerBooking } from "./pages/kiosk/WaterTankerBooking";
import { GasCylinderBooking } from "./pages/kiosk/GasCylinderBooking";
import { TrackRequest } from "./pages/kiosk/TrackRequest";
import { AdminDashboard } from "./pages/kiosk/AdminDashboard";
import { PropertyTaxPayment } from "./pages/kiosk/PropertyTaxPayment";
import { MyDocuments } from "./pages/kiosk/MyDocuments";
import { MunicipalServiceRequests } from "./pages/kiosk/MunicipalServiceRequests";
import { TrackServiceRequest } from "./pages/kiosk/TrackServiceRequest";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/kiosk" replace />,
    },
    {
        path: "/kiosk",
        Component: LanguageSelection,
    },
    {
        path: "/kiosk/login-register",
        Component: LoginRegister,
    },
    {
        path: "/kiosk/service-selection",
        Component: ServiceSelection,
    },
    {
        path: "/kiosk/department-verification",
        Component: DepartmentVerification,
    },
    {
        path: "/kiosk/login",
        Component: AadhaarLogin,
    },
    {
        path: "/kiosk/otp-verification",
        Component: OTPVerification,
    },
    {
        path: "/kiosk/dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    },
    {
        path: "/kiosk/bills",
        element: <ProtectedRoute><ViewBills /></ProtectedRoute>,
    },
    {
        path: "/kiosk/pay-bill/:billId",
        element: <ProtectedRoute><PayBill /></ProtectedRoute>,
    },
    {
        path: "/kiosk/receipt/:transactionId",
        element: <ProtectedRoute><Receipt /></ProtectedRoute>,
    },
    {
        path: "/kiosk/register-complaint",
        Component: RegisterComplaint,
    },
    {
        path: "/kiosk/track-complaint",
        Component: TrackComplaint,
    },
    {
        path: "/kiosk/new-connection",
        Component: NewConnection,
    },
    {
        path: "/kiosk/track-new-connection",
        Component: TrackNewConnection,
    },
    {
        path: "/kiosk/water-tanker-booking",
        element: (
            <ProtectedRoute>
                <WaterTankerBooking />
            </ProtectedRoute>
        ),
    },
    {
        path: "/kiosk/gas-cylinder-booking",
        element: (
            <ProtectedRoute>
                <GasCylinderBooking />
            </ProtectedRoute>
        ),
    },
    {
        path: "/kiosk/track-request",
        element: (
            <ProtectedRoute>
                <TrackRequest />
            </ProtectedRoute>
        ),
    },
    {
        path: "/kiosk/pay-property-tax",
        element: (
            <ProtectedRoute>
                <PropertyTaxPayment />
            </ProtectedRoute>
        ),
    },
    {
        path: "/kiosk/pay-property-tax/:billId",
        element: (
            <ProtectedRoute>
                <PropertyTaxPayment />
            </ProtectedRoute>
        ),
    },
    {
        path: "/kiosk/admin",
        Component: AdminDashboard,
    },
    {
        path: "/kiosk/my-documents",
        element: (
            <ProtectedRoute>
                <MyDocuments />
            </ProtectedRoute>
        ),
    },
    {
        path: "/kiosk/municipal-service-requests",
        element: (
            <ProtectedRoute>
                <MunicipalServiceRequests />
            </ProtectedRoute>
        ),
    },
    {
        path: "/kiosk/track-service-request",
        element: (
            <ProtectedRoute>
                <TrackServiceRequest />
            </ProtectedRoute>
        ),
    },
]);
