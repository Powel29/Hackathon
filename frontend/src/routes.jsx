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
import { RegisterComplaint } from "./pages/kiosk/RegisterComplaint";
import { TrackComplaint } from "./pages/kiosk/TrackComplaint";
import { NewConnection } from "./pages/kiosk/NewConnection";
import { TrackNewConnection } from "./pages/kiosk/TrackNewConnection";
import { WaterTankerBooking } from "./pages/kiosk/WaterTankerBooking";
import { AdminDashboard } from "./pages/kiosk/AdminDashboard";

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
        Component: Dashboard,
    },
    {
        path: "/kiosk/bills",
        Component: ViewBills,
    },
    {
        path: "/kiosk/pay-bill/:billId",
        Component: PayBill,
    },
    {
        path: "/kiosk/receipt/:transactionId",
        Component: Receipt,
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
        Component: WaterTankerBooking,
    },
    {
        path: "/kiosk/admin",
        Component: AdminDashboard,
    },
]);
