# SUVIDHA - Smart Urban Virtual Interactive Digital Helpdesk Assistant

## Government-Grade Touch-Based Self-Service Kiosk Frontend

This is a comprehensive government kiosk application designed for Indian civic utility platforms. Built for physical touch-screen kiosks in public government offices.

---

## 🎯 Key Features

### ✅ Complete User Journey
1. **Language Selection** - English, Hindi, Kannada support
2. **Service Selection** - Electricity, Gas, Water, Municipal services
3. **Authentication** - Aadhaar-based login with OTP verification
4. **User Dashboard** - Centralized access to all services
5. **Bill Management** - View and pay utility bills
6. **Complaint System** - Register and track complaints with timeline
7. **New Connections** - Multi-step application form with document upload
8. **Admin Portal** - Comprehensive management dashboard

### 🎨 Design Principles
- **Touch-First**: All elements minimum 80x80px
- **Large Typography**: Readable from 2 feet distance
- **High Contrast**: WCAG 2.1 AA compliant
- **No Hover**: Touch-only interactions
- **Government Style**: Professional, clean, trustworthy UI

### 🌐 Multilingual Support
- Real-time language switching
- Translations for all UI elements
- Hindi (हिंदी) and Kannada (ಕನ್ನಡ) support
- Language preference persists through session

### 🔒 Security & Session Management
- Auto-logout after 5 minutes of inactivity
- Session warning at 4 minutes
- Aadhaar-based authentication
- OTP verification with retry limits
- All sensitive data cleared on logout

---

## 📱 Screens

### 1. Language Selection
- Large language cards with native scripts
- Visual feedback for selection
- Continue button

### 2. Service Selection
- Color-coded service cards (Electricity, Gas, Water, Municipal)
- Icon-based navigation
- Back navigation

### 3. Aadhaar Login
- 12-digit numeric input
- On-screen keypad
- Progress indicator
- Client-side validation

### 4. OTP Verification
- 6-digit OTP input
- Visual progress
- Resend OTP functionality (30s cooldown)
- Attempts counter

### 5. User Dashboard
- Welcome message with user details
- Consumer ID display
- 4 action cards: Pay Bills, Register Complaint, Track Status, New Connection
- Logout button

### 6. View Bills
- Card-based bill display
- Color-coded status (Paid, Pending, Overdue)
- Detailed bill information
- Pay Now action

### 7. Pay Bill
- Payment summary screen
- Bill details review
- Mock payment processing
- Success/failure feedback

### 8. Receipt
- Digital receipt display
- QR code placeholder
- Print receipt option
- SMS/Email delivery
- Back to dashboard

### 9. Register Complaint
- Service type selection
- Pre-filled complaint options
- Description textarea (20-500 chars)
- File upload (JPG, PNG, PDF)
- Confirmation with Complaint ID

### 10. Track Complaint
- Complaint ID search
- Detailed complaint view
- Timeline visualization
- Technician information (if assigned)
- Status indicators

### 11. New Connection Application
- 5-step wizard:
  1. Applicant Details (auto-filled from user)
  2. Address Details
  3. Connection Details (type, load)
  4. Document Upload (Aadhaar, Address Proof, Photo, Signature)
  5. Review & Submit
- Progress stepper
- Digital signature canvas
- Back/Cancel at any step

### 12. Admin Dashboard
- Overview with stats cards
- Complaint management table
- User management
- Kiosk status monitoring
- Search, filter, export functionality

---

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: #0066CC - Main actions, branding
- **Success Green**: #28A745 - Success states, paid bills
- **Warning Orange**: #FF9800 - Pending states, warnings
- **Error Red**: #DC3545 - Error states, overdue

### Utility Colors
- **Electricity**: #FFD700 (Gold)
- **Gas**: #FF6347 (Tomato)
- **Water**: #1E90FF (Dodger Blue)
- **Municipal**: #32CD32 (Lime Green)

### Neutrals
- **Background**: #F8F9FA
- **Text**: #212529

---

## 🛠️ Tech Stack

- **React 18+** - UI framework
- **React Router v6** - Navigation with data mode
- **Zustand** - State management
- **i18next** - Internationalization
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **TypeScript** - Type safety

---

## 📂 Project Structure

```
/
├── App.tsx                      # Main app with session management
├── routes.ts                    # React Router configuration
├── i18n.ts                      # i18next setup with translations
├── store/
│   └── useStore.ts              # Zustand store
├── components/
│   ├── KioskLayout.tsx          # Main layout with header/footer
│   ├── TouchButton.tsx          # Touch-optimized button component
│   ├── ServiceCard.tsx          # Service selection cards
│   ├── NumericKeypad.tsx        # On-screen numeric keypad
│   ├── SessionWarning.tsx       # Session timeout warning modal
│   ├── LoadingScreen.tsx        # Loading state component
│   ├── SuccessScreen.tsx        # Success state component
│   └── ErrorScreen.tsx          # Error state component
├── screens/
│   ├── LanguageSelection.tsx    # Initial language selection
│   ├── ServiceSelection.tsx     # Service type selection
│   ├── AadhaarLogin.tsx         # Aadhaar authentication
│   ├── OTPVerification.tsx      # OTP verification
│   ├── Dashboard.tsx            # User dashboard
│   ├── ViewBills.tsx            # Bill listing
│   ├── PayBill.tsx              # Bill payment
│   ├── Receipt.tsx              # Payment receipt
│   ├── RegisterComplaint.tsx    # Complaint registration
│   ├── TrackComplaint.tsx       # Complaint tracking
│   ├── NewConnection.tsx        # New connection application
│   └── AdminDashboard.tsx       # Admin management portal
└── styles/
    └── globals.css              # Global styles and theme
```

---

## 🚀 Getting Started

The application is ready to run. All dependencies are imported directly:

```tsx
import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Zap, Flame, Droplets, Building2 } from 'lucide-react';
```

### Key Routes

- `/` - Language selection (entry point)
- `/service-selection` - Service selection
- `/login` - Aadhaar login
- `/otp-verification` - OTP verification
- `/dashboard` - User dashboard (requires auth)
- `/bills` - View bills
- `/pay-bill/:billId` - Pay specific bill
- `/receipt/:transactionId` - Payment receipt
- `/register-complaint` - Register complaint
- `/track-complaint` - Track complaint
- `/new-connection` - New connection application
- `/admin` - Admin dashboard

---

## 🔑 Mock Credentials

For testing purposes, any 12-digit Aadhaar number will work:
- Example: `123456789012`

OTP verification accepts any 6-digit code:
- Example: `123456`

Mock user data will be generated upon successful login.

---

## ♿ Accessibility Features

1. **Touch-Optimized**
   - Minimum 80x80px touch targets
   - No hover-dependent interactions
   - Large, clear tap areas

2. **Visual Accessibility**
   - High contrast ratios (WCAG AA)
   - Large font sizes (readable from 2 feet)
   - Clear visual feedback for all interactions

3. **Language Support**
   - Real-time language switching
   - Native scripts for Hindi and Kannada
   - Consistent translations across all screens

4. **Session Management**
   - Auto-logout with warning
   - Clear session state management
   - Data privacy protection

5. **Error Handling**
   - Clear error messages
   - Retry options
   - Back/Cancel always available

---

## 📊 State Management

The app uses Zustand for global state:

```typescript
interface StoreState {
  language: string;                    // Current UI language
  selectedService: ServiceType | null; // Selected service type
  user: User | null;                   // Authenticated user data
  isAuthenticated: boolean;            // Auth state
  bills: Bill[];                       // User's bills
  complaints: Complaint[];             // User's complaints
  showSessionWarning: boolean;         // Session timeout warning
}
```

---

## 🎯 Design Guidelines

### Touch Targets
- **Minimum**: 80x80px
- **Recommended**: 100x100px for primary actions
- **Spacing**: Minimum 8px between interactive elements

### Typography
- **Headers**: 3xl to 6xl (36px - 72px)
- **Body Text**: 2xl to 3xl (24px - 36px)
- **Labels**: xl to 2xl (20px - 24px)
- **Small Text**: lg to xl (18px - 20px)

### Colors
- Always ensure 4.5:1 contrast ratio minimum
- Use semantic colors consistently
- Status colors: Green (success), Orange (warning), Red (error)

### Spacing
- Generous padding: 8-16px minimum
- Card gaps: 8-12px
- Section spacing: 12-20px

---

## 🔒 Security Notes

This is a frontend-only demo application. In production:

1. **Never store sensitive data** in browser storage
2. **Use HTTPS** for all communications
3. **Implement proper authentication** with secure tokens
4. **Validate all inputs** server-side
5. **Use encrypted channels** for Aadhaar/OTP
6. **Clear session data** completely on logout
7. **Implement rate limiting** for API calls
8. **Log all transactions** for audit trails

---

## 📱 Kiosk Hardware Recommendations

- **Screen Size**: 21-27 inch touchscreen
- **Resolution**: 1920x1080 or higher
- **Touch Technology**: Capacitive multi-touch
- **Operating System**: Chrome OS or locked-down Windows/Linux
- **Browser**: Chrome 90+ or Edge 90+
- **Network**: Stable broadband connection
- **Backup Power**: UPS recommended

---

## 🌟 Future Enhancements

1. **Payment Integration**: Razorpay/UPI integration
2. **Receipt Printing**: Thermal printer support
3. **Biometric Auth**: Fingerprint scanner integration
4. **SMS/Email**: Real notification service
5. **Offline Mode**: Local caching for resilience
6. **Analytics**: Usage tracking and reporting
7. **More Languages**: Regional language support
8. **Accessibility**: Screen reader optimization

---

## 📄 License

This is a demonstration project for government kiosk applications.

---

## 👥 Support

For government departments implementing SUVIDHA:
- Customization available for specific utility requirements
- Training materials for kiosk operators
- Admin portal customization
- Integration support with existing systems

---

**Built for Indian Government Smart City Initiatives**

*Making government services accessible to every citizen*
