# Kiosk Frontend Mobile-Friendly Enhancements

This plan details the technical changes required to make the SUVIDHA kiosk frontend responsive and usable on mobile devices.

## Proposed Changes

### [Layout & Infrastructure]

#### [MODIFY] [KioskLayout.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\components\kiosk\KioskLayout.jsx)
- Implement responsive utility classes (Tailwind) for header and footer.
- Switch to a "sticky bottom" navigation for footer buttons on screens `< 640px`.

#### [MODIFY] [AccessibilityPanel.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\components\kiosk\AccessibilityPanel.jsx) / [SyncQueuePanel.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\components\kiosk\SyncQueuePanel.jsx)
- Convert fixed-width modals to full-screen or 90% width drawers on mobile.

---

### [Authentication & Entry Flow]

#### [MODIFY] Multiple Files
- [LanguageSelection.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\LanguageSelection.jsx)
- [AadhaarLogin.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\AadhaarLogin.jsx)
- [OTPVerification.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\OTPVerification.jsx)
- [LoginRegister.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\LoginRegister.jsx)
- **Changes**: Stack cards vertically, optimize input field sizes (`16px` font), and center branding.

---

### [Service Dashboards]

#### [MODIFY] Multiple Files
- [ElectricityDashboard.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\components\kiosk\ElectricityDashboard.jsx)
- [WaterDashboard.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\components\kiosk\WaterDashboard.jsx)
- [GasDashboard.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\components\kiosk\GasDashboard.jsx)
- [MunicipalDashboard.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\components\kiosk\MunicipalDashboard.jsx)
- **Changes**: Transition from 3-4 column grids to responsive 1-2 column layouts. Stack stats cards.

---

### [Forms & Service Requests]

#### [MODIFY] Major Form Pages
- [NewConnection.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\NewConnection.jsx)
- [GasCylinderBooking.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\GasCylinderBooking.jsx)
- [WaterTankerBooking.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\WaterTankerBooking.jsx)
- [RegisterComplaint.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\RegisterComplaint.jsx)
- **Changes**: Refactor large multi-step forms to use full-width steps, vertical labels, and mobile-optimized date-pickers/selectors.

---

### [Tracking & Document Views]

#### [MODIFY] View Files
- [ViewBills.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\ViewBills.jsx)
- [TrackRequest.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\TrackRequest.jsx)
- [Receipt.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\Receipt.jsx)
- [MyDocuments.jsx](file:///d:/Powel\Hackathon\Hackathon\frontend\src\pages\kiosk\MyDocuments.jsx)
- **Changes**: Convert data tables into "Card-style" list views for mobile browsers. Optimize PDF/Image preview sizes.

## Verification Plan

### Automated Tests
- No existing automated UI tests found for responsiveness. I will verify manually using browser emulation.

### Manual Verification
1. **Device Emulation**: Use Chrome DevTools (F12 -> Toggle Device Toolbar).
2. **Mobile (375px - iPhone SE)**:
    - Verify header items don't overlap.
    - Verify dashboard cards stack vertically.
    - Verify footer buttons are clickable and well-spaced.
3. **Tablet (768px - iPad)**:
    - Verify the 2-column or 3-column grid layouts appear correctly.
4. **Desktop (1440px)**:
    - Ensure no regressions for the primary kiosk view.
