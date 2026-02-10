import { createBrowserRouter } from "react-router";
import { LanguageSelection } from "./screens/LanguageSelection";
import { LoginRegister } from "./screens/LoginRegister";
import { ServiceSelection } from "./screens/ServiceSelection";
import { DepartmentVerification } from "./screens/DepartmentVerification";
import { AadhaarLogin } from "./screens/AadhaarLogin";
import { OTPVerification } from "./screens/OTPVerification";
import { Dashboard } from "./screens/Dashboard";
import { ViewBills } from "./screens/ViewBills";
import { PayBill } from "./screens/PayBill";
import { Receipt } from "./screens/Receipt";
import { RegisterComplaint } from "./screens/RegisterComplaint";
import { TrackComplaint } from "./screens/TrackComplaint";
import { NewConnection } from "./screens/NewConnection";
import { TrackNewConnection } from "./screens/TrackNewConnection";
import { WaterTankerBooking } from "./screens/WaterTankerBooking";
import { AdminDashboard } from "./screens/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LanguageSelection,
  },
  {
    path: "/login-register",
    Component: LoginRegister,
  },
  {
    path: "/service-selection",
    Component: ServiceSelection,
  },
  {
    path: "/department-verification",
    Component: DepartmentVerification,
  },
  {
    path: "/login",
    Component: AadhaarLogin,
  },
  {
    path: "/otp-verification",
    Component: OTPVerification,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/bills",
    Component: ViewBills,
  },
  {
    path: "/pay-bill/:billId",
    Component: PayBill,
  },
  {
    path: "/receipt/:transactionId",
    Component: Receipt,
  },
  {
    path: "/register-complaint",
    Component: RegisterComplaint,
  },
  {
    path: "/track-complaint",
    Component: TrackComplaint,
  },
  {
    path: "/new-connection",
    Component: NewConnection,
  },
  {
    path: "/track-new-connection",
    Component: TrackNewConnection,
  },
  {
    path: "/water-tanker-booking",
    Component: WaterTankerBooking,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
]);