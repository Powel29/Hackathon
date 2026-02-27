import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../store/useKioskStore';
import { serviceRequestService } from '../../services/api/serviceRequest.service';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
import { KioskLayout } from '../../components/nextgen-seva/KioskLayout';
import { TouchButton } from '../../components/nextgen-seva/TouchButton';
import { ArrowLeft, MapPin, Home, Droplets, Truck, CheckCircle, Printer, WifiOff, AlertCircle, Database } from 'lucide-react';
import govtLogo from '../../assets/nextgen-seva/Government_of_India_logo.svg';





const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman and Nicobar Islands', 'Lakshadweep', 'Dadra and Nagar Haveli'
];

const CITIES = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kadapa', 'Anantapur'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Bihar Sharif', 'Purnia', 'Arrah'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Giridih'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Davangere', 'Bellary', 'Gulbarga', 'Shimoga'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur', 'Alappuzha'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Ratlam', 'Dewas'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Thane', 'Kolhapur', 'Navi Mumbai'],
  'Manipur': ['Imphal', 'Thoubal', 'Churachandpur', 'Bishnupur'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bharatpur'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Ambassa'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Noida'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling', 'Bardhaman'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
  'Ladakh': ['Leh', 'Kargil'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  'Chandigarh': ['Chandigarh'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Dadra and Nagar Haveli': ['Silvassa', 'Daman', 'Diu'],
  'Lakshadweep': ['Kavaratti']
};

const WATER_TANKER_FACILITIES = [
  { id: 1, name: 'Blue Water Depot', distance: '2.3 km', price: 450 },
  { id: 2, name: 'Crystal Pure Supplies', distance: '3.1 km', price: 480 },
  { id: 3, name: 'Municipal Water Tanker', distance: '1.8 km', price: 350 },
  { id: 4, name: 'Aqua Solutions Ltd', distance: '4.2 km', price: 500 },
  { id: 5, name: 'Fresh Water Services', distance: '2.9 km', price: 420 },
];

export function WaterTankerBooking() {
  const navigate = useNavigate();
  const { user } = useKioskStore();
  const { isOnline } = useNetworkStatus();
  const enqueue = useOfflineStore(s => s.enqueue);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);

  const [formData, setFormData] = useState({
    // Pre-fill from user profile if available
    fullName: user?.name || '',
    mobileNumber: user?.phoneNumber || '',
    emailAddress: user?.email || '',
    houseNumber: '',
    buildingSocietyName: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    propertyType: 'apartment',
    floorLevel: 'ground',
    tankerAccess: 'easy',
    waterQuantity: '2000',
    waterType: 'drinking',
    waterPurpose: 'household',
    deliveryType: 'scheduled',
    deliveryDate: '',
    deliveryTime: '09:00 AM',
    specialInstructions: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1: // Customer Details
        if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
        if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
        if (!/^\d{10}$/.test(formData.mobileNumber)) errors.mobileNumber = 'Mobile number must be 10 digits';
        break;

      case 2: // Delivery Address
        if (!formData.houseNumber.trim()) errors.houseNumber = 'House/Flat number is required';
        if (!formData.buildingSocietyName.trim()) errors.buildingSocietyName = 'Building/Society name is required';
        if (!formData.street.trim()) errors.street = 'Street/Locality is required';
        if (!formData.city) errors.city = 'City is required';
        if (!formData.state) errors.state = 'State is required';
        if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';
        if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Pincode must be 6 digits';
        break;

      case 3: // Property Details
        if (!formData.propertyType) errors.propertyType = 'Property type is required';
        break;

      case 4: // Water Requirement
        if (!formData.waterQuantity) errors.waterQuantity = 'Water quantity is required';
        if (!formData.waterType) errors.waterType = 'Water type is required';
        if (!formData.waterPurpose) errors.waterPurpose = 'Water purpose is required';
        break;

      case 5: // Delivery Scheduling
        if (formData.deliveryType === 'scheduled' && !formData.deliveryDate) {
          errors.deliveryDate = 'Delivery date is required for scheduled deliveries';
        }
        break;
      case 6: // Facility Selection
        if (!selectedFacility) errors.facility = 'Please select a water tanker facility';
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      const payload = {
        serviceType: 'WATER',
        requestType: 'WATER_TANKER',
        details: {
          ...formData,
          facility: WATER_TANKER_FACILITIES.find(f => f.id === selectedFacility)?.name,
          facilityId: selectedFacility,
        },
        // Non-PII link for offline sync attribute
        aadharHash: user?.aadharHash
      };

      if (!isOnline) {
        const tempId = enqueue({
          operationType: 'tanker_booking',
          payload
        });
        setBookingId(`QUEUED-${tempId.substring(0, 6).toUpperCase()}`);
        setBookingSuccess(true);
        return;
      }

      const response = await serviceRequestService.create(payload);

      setBookingId(response.requestId || response.request?.requestId || 'WTB-' + Date.now());
      setBookingSuccess(true);
    } catch (error) {
      console.error('Booking failed:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to book tanker. Please try again.';
      alert(`Booking Failed: ${errorMessage}`);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (bookingSuccess) {
    const selectedFacilityDetails = WATER_TANKER_FACILITIES.find(f => f.id === selectedFacility);
    const bookingDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const bookingTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <KioskLayout>
        {/* Print-only Receipt Format */}
        <div className="print-receipt">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-receipt, .print-receipt * {
                visibility: visible;
              }
              .print-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
              }
              @page {
                size: A4;
                margin: 8mm;
              }
            }
            .print-receipt {
              display: none;
            }
            @media print {
              .print-receipt {
                display: block;
                font-family: 'Arial', sans-serif;
              }
            }
          `}</style>

          <div style={{ maxWidth: '750px', margin: '0 auto', padding: '10px', border: '2px solid #000' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '6px', marginBottom: '8px' }}>
              <div style={{ marginBottom: '4px' }}>
                <img src={govtLogo} alt="Government of India" style={{ height: '45px', margin: '0 auto' }} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 2px 0', color: '#000' }}>NextGen Seva</h1>
              <p style={{ fontSize: '11px', margin: '1px 0', color: '#333', lineHeight: '1.2' }}>Government of India - Water Department</p>
              <p style={{ fontSize: '10px', margin: '0', color: '#666', lineHeight: '1.2' }}>Water Tanker Booking Receipt</p>
            </div>

            {/* Receipt Title */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0891b2', margin: '0' }}>🚰 BOOKING CONFIRMED</h2>
            </div>

            {/* Booking Details Box */}
            <div style={{ border: '2px solid #0891b2', padding: '8px', marginBottom: '8px', backgroundColor: '#f0fdfa' }}>
              <table style={{ width: '100%', fontSize: '11px' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '3px 0', width: '40%' }}>Booking ID:</td>
                    <td style={{ padding: '3px 0', fontSize: '13px', fontWeight: 'bold', color: '#0891b2' }}>{bookingId}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '3px 0' }}>Booking Date:</td>
                    <td style={{ padding: '3px 0' }}>{bookingDate}</td>
                  </tr>
                  {bookingId.startsWith('QUEUED-') && (
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '3px 0', color: '#ea580c' }}>Sync Status:</td>
                      <td style={{ padding: '3px 0', color: '#ea580c', fontStyle: 'italic' }}>Pending (Offline)</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '3px 0' }}>Status:</td>
                    <td style={{ padding: '3px 0', color: '#16a34a', fontWeight: 'bold' }}>{bookingId.startsWith('QUEUED-') ? 'QUEUED' : '✓ CONFIRMED'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Two Column Layout - Customer & Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              {/* Customer Information */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #0891b2', paddingBottom: '2px', marginTop: '0', marginBottom: '5px' }}>
                  Customer Information
                </h3>
                <table style={{ width: '100%', fontSize: '11px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 0', width: '45%', fontWeight: 'bold' }}>Full Name:</td>
                      <td style={{ padding: '3px 0' }}>{formData.fullName}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Mobile:</td>
                      <td style={{ padding: '3px 0' }}>{formData.mobileNumber}</td>
                    </tr>
                    {formData.emailAddress && (
                      <tr>
                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Email:</td>
                        <td style={{ padding: '3px 0', fontSize: '10px' }}>{formData.emailAddress}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #0891b2', paddingBottom: '2px', marginTop: '0', marginBottom: '5px' }}>
                  Delivery Address
                </h3>
                <p style={{ fontSize: '11px', lineHeight: '1.4', margin: '0' }}>
                  <strong>House/Flat:</strong> {formData.houseNumber}<br />
                  <strong>Building:</strong> {formData.buildingSocietyName}<br />
                  <strong>Street:</strong> {formData.street}<br />
                  <strong>City:</strong> {formData.city}, {formData.state}<br />
                  <strong>PIN:</strong> {formData.pincode}
                  {formData.landmark && (
                    <>
                      <br />
                      <strong>Landmark:</strong> {formData.landmark}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Two Column Layout - Property & Water Requirement */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              {/* Property Details */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #0891b2', paddingBottom: '2px', marginTop: '0', marginBottom: '5px' }}>
                  Property Details
                </h3>
                <table style={{ width: '100%', fontSize: '11px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 0', width: '45%', fontWeight: 'bold' }}>Type:</td>
                      <td style={{ padding: '3px 0' }}>{formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Floor:</td>
                      <td style={{ padding: '3px 0' }}>
                        {formData.floorLevel === 'ground' ? 'Ground Floor' :
                          formData.floorLevel === 'first' ? '1st Floor' :
                            formData.floorLevel === 'second' ? '2nd Floor' : 'Above 2nd'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Access:</td>
                      <td style={{ padding: '3px 0' }}>
                        {formData.tankerAccess === 'easy' ? 'Easy Access' :
                          formData.tankerAccess === 'narrow' ? 'Narrow Road' : 'Parking Restricted'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Water Requirement */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #0891b2', paddingBottom: '2px', marginTop: '0', marginBottom: '5px' }}>
                  Water Requirement
                </h3>
                <table style={{ width: '100%', fontSize: '11px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 0', width: '45%', fontWeight: 'bold' }}>Quantity:</td>
                      <td style={{ padding: '3px 0' }}>{formData.waterQuantity} L</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Type:</td>
                      <td style={{ padding: '3px 0' }}>{formData.waterType.charAt(0).toUpperCase() + formData.waterType.slice(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Purpose:</td>
                      <td style={{ padding: '3px 0' }}>{formData.waterPurpose.charAt(0).toUpperCase() + formData.waterPurpose.slice(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Delivery:</td>
                      <td style={{ padding: '3px 0' }}>{formData.deliveryType === 'immediate' ? 'Immediate' : 'Scheduled'}</td>
                    </tr>
                    {formData.deliveryType === 'scheduled' && (
                      <>
                        <tr>
                          <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Date:</td>
                          <td style={{ padding: '3px 0' }}>{formData.deliveryDate}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Time:</td>
                          <td style={{ padding: '3px 0' }}>{formData.deliveryTime}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Facility & Payment */}
            <div style={{ border: '2px solid #0891b2', padding: '8px', marginBottom: '8px', backgroundColor: '#ecfeff' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', marginTop: '0' }}>
                Facility & Payment Details
              </h3>
              <table style={{ width: '100%', fontSize: '11px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px 0', width: '40%', fontWeight: 'bold' }}>Facility Name:</td>
                    <td style={{ padding: '3px 0' }}>{selectedFacilityDetails?.name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Distance:</td>
                    <td style={{ padding: '3px 0' }}>{selectedFacilityDetails?.distance}</td>
                  </tr>
                  <tr style={{ borderTop: '1px dashed #0891b2' }}>
                    <td style={{ padding: '4px 0', fontSize: '12px', fontWeight: 'bold' }}>Total Amount:</td>
                    <td style={{ padding: '4px 0', fontSize: '14px', fontWeight: 'bold', color: '#0891b2' }}>₹{selectedFacilityDetails?.price}</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: '10px', margin: '3px 0 0 0', color: '#666', fontStyle: 'italic' }}>
                * Payment to be made to the tanker driver upon delivery
              </p>
            </div>

            {/* Additional Instructions */}
            {formData.specialInstructions && (
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #0891b2', paddingBottom: '2px', marginTop: '0', marginBottom: '4px' }}>
                  Special Instructions
                </h3>
                <p style={{ fontSize: '11px', lineHeight: '1.4', margin: '0', padding: '5px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  {formData.specialInstructions}
                </p>
              </div>
            )}

            {/* Important Notice */}
            <div style={{ border: '2px solid #dc2626', padding: '6px', marginBottom: '8px', backgroundColor: '#fef2f2' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 3px 0', color: '#dc2626' }}>⚠️ Important Notice</h4>
              <ul style={{ fontSize: '10px', margin: '0', paddingLeft: '16px', lineHeight: '1.4' }}>
                <li>Keep this receipt for your records and future reference</li>
                <li>Payment in cash to tanker driver upon delivery</li>
                <li>Contact facility 2 hours in advance for changes/cancellations</li>
                <li>Ensure someone is available at delivery address</li>
              </ul>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '2px solid #000', textAlign: 'center', fontSize: '10px', color: '#666' }}>
              <p style={{ margin: '1px 0', fontWeight: 'bold' }}>NextGen Seva - Government of India Digital Services Portal</p>
              <p style={{ margin: '1px 0' }}>For queries: 1800-XXX-XXXX | water@NextGen Seva.gov.in</p>
              <p style={{ margin: '1px 0', fontSize: '9px', fontStyle: 'italic' }}>Computer-generated receipt - No signature required</p>
            </div>
          </div>
        </div>

        {/* Screen Display */}
        <div className="h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-cyan-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {bookingId.startsWith('QUEUED-') ? 'Booking Enqueued!' : 'Booking Confirmed!'}
              </h2>
              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  {bookingId.startsWith('QUEUED-') ? 'Temporary Reference ID' : 'Booking ID'}
                </p>
                <p className="text-2xl font-bold text-cyan-600 font-mono">{bookingId}</p>
              </div>

              {bookingId.startsWith('QUEUED-') && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left flex items-start gap-3">
                  <Database className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800 uppercase tracking-tight">Offline Booking Pending</p>
                    <p className="text-xs text-orange-700 leading-relaxed">Your request is saved locally. It will be sent to the department automatically once internet connectivity is restored.</p>
                  </div>
                </div>
              )}

              <p className="text-gray-600 mb-6 font-medium">
                {bookingId.startsWith('QUEUED-')
                  ? 'Your water tanker booking has been enqueued. Please keep this ID for your records.'
                  : 'Your water tanker has been booked successfully. You will receive a confirmation SMS shortly.'}
              </p>

              <div className="space-y-3">
                <TouchButton
                  variant="primary"
                  size="large"
                  icon={<Printer className="w-5 h-5" />}
                  onClick={handlePrintReceipt}
                  className="w-full"
                >
                  Print Receipt
                </TouchButton>

                <TouchButton
                  variant="secondary"
                  size="large"
                  icon={<Home className="w-5 h-5" />}
                  onClick={() => navigate('/nextgen-seva/dashboard')}
                  className="w-full"
                >
                  Back to Dashboard
                </TouchButton>
              </div>
            </div>
          </div>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/nextgen-seva/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Water Tanker Booking</h1>
              <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i + 1}
                className={`flex-1 h-2 rounded-full transition-colors ${i + 1 <= currentStep ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>

          {!isOnline && (
            <div className="mb-6 bg-orange-600 text-white rounded-2xl shadow-lg p-5 flex items-center justify-between overflow-hidden relative border-2 border-orange-500">
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white/20 p-2 rounded-xl">
                  <WifiOff className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-wider text-sm">Offline Mode Active</h3>
                  <p className="text-xs opacity-90 font-medium">Bookings will be enqueued and synced when online.</p>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                <Droplets className="w-24 h-24 text-white" />
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            {/* Step 1: Customer Details */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.fullName && <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleFieldChange('mobileNumber', e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                  {formErrors.mobileNumber && <p className="text-xs text-red-600 mt-1">{formErrors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email ID (Optional)</label>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleFieldChange('emailAddress', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Delivery Address */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">House/Flat/Plot No. *</label>
                    <input
                      type="text"
                      value={formData.houseNumber}
                      onChange={(e) => handleFieldChange('houseNumber', e.target.value)}
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.houseNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="House number"
                    />
                    {formErrors.houseNumber && <p className="text-xs text-red-600 mt-1">{formErrors.houseNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Building/Society Name *</label>
                    <input
                      type="text"
                      value={formData.buildingSocietyName}
                      onChange={(e) => handleFieldChange('buildingSocietyName', e.target.value)}
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.buildingSocietyName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Building or society name"
                    />
                    {formErrors.buildingSocietyName && <p className="text-xs text-red-600 mt-1">{formErrors.buildingSocietyName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street/Locality *</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleFieldChange('street', e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.street ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Street or locality"
                  />
                  {formErrors.street && <p className="text-xs text-red-600 mt-1">{formErrors.street}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({ ...formData, state: e.target.value, city: '' });
                        if (formErrors.state) setFormErrors({ ...formErrors, state: '', city: '' });
                      }}
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {formErrors.state && <p className="text-xs text-red-600 mt-1">{formErrors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                      }}
                      disabled={!formData.state}
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${formErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value="">
                        {formData.state ? 'Select City' : 'Select State First'}
                      </option>
                      {formData.state && CITIES[formData.state] && CITIES[formData.state].length > 0 ? (
                        CITIES[formData.state].map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))
                      ) : null}
                    </select>
                    {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleFieldChange('pincode', e.target.value)}
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.pincode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                    {formErrors.pincode && <p className="text-xs text-red-600 mt-1">{formErrors.pincode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => handleFieldChange('landmark', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Nearby landmark"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Property Details */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Property Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'apartment', label: 'Apartment' },
                      { value: 'house', label: 'Independent House' },
                      { value: 'commercial', label: 'Commercial Building' },
                      { value: 'construction', label: 'Construction Site' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFieldChange('propertyType', option.value)}
                        className={`p-3 rounded-lg border-2 font-semibold transition ${formData.propertyType === option.value
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.propertyType && <p className="text-xs text-red-600 mt-1">{formErrors.propertyType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Floor Level *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'ground', label: 'Ground Floor' },
                      { value: 'first', label: '1st Floor' },
                      { value: 'second', label: '2nd Floor' },
                      { value: 'above', label: 'Above 2nd' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFieldChange('floorLevel', option.value)}
                        className={`p-3 rounded-lg border-2 font-semibold transition ${formData.floorLevel === option.value
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tanker Access *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'easy', label: 'Easy Access' },
                      { value: 'narrow', label: 'Narrow Road' },
                      { value: 'restricted', label: 'Parking Restricted' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFieldChange('tankerAccess', option.value)}
                        className={`p-3 rounded-lg border-2 font-semibold transition ${formData.tankerAccess === option.value
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Water Requirement */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Water Requirement</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Water Quantity (Tank Size) *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: '1000', label: '1,000 L' },
                      { value: '2000', label: '2,000 L' },
                      { value: '3000', label: '3,000 L' },
                      { value: '5001', label: '5,000 L' },
                      { value: '10000', label: '10,000 L' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFieldChange('waterQuantity', option.value)}
                        className={`p-3 rounded-lg border-2 font-semibold transition ${formData.waterQuantity === option.value
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.waterQuantity && <p className="text-xs text-red-600 mt-1">{formErrors.waterQuantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Water Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'drinking', label: 'Drinking (Potable)' },
                      { value: 'utility', label: 'Non-drinking (Utility)' },
                      { value: 'borewell', label: 'Borewell Water' },
                      { value: 'municipal', label: 'Municipal Water' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFieldChange('waterType', option.value)}
                        className={`p-3 rounded-lg border-2 font-semibold transition text-sm ${formData.waterType === option.value
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.waterType && <p className="text-xs text-red-600 mt-1">{formErrors.waterType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Purpose of Water *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'household', label: 'Household Use' },
                      { value: 'drinking', label: 'Drinking Only' },
                      { value: 'construction', label: 'Construction' },
                      { value: 'commercial', label: 'Commercial Use' },
                      { value: 'emergency', label: 'Emergency' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFieldChange('waterPurpose', option.value)}
                        className={`p-3 rounded-lg border-2 font-semibold transition text-sm ${formData.waterPurpose === option.value
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.waterPurpose && <p className="text-xs text-red-600 mt-1">{formErrors.waterPurpose}</p>}
                </div>
              </div>
            )}

            {/* Step 5: Delivery Scheduling */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Scheduling</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'immediate', label: 'Immediate/Emergency' },
                      { value: 'scheduled', label: 'Scheduled' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFieldChange('deliveryType', option.value)}
                        className={`p-3 rounded-lg border-2 font-semibold transition ${formData.deliveryType === option.value
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.deliveryType === 'scheduled' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                      <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {formErrors.deliveryDate && <p className="text-xs text-red-600 mt-1">{formErrors.deliveryDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Time Slot *</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: '06:00 AM', label: 'Morning\n(6-9 AM)' },
                          { value: '01:00 PM', label: 'Afternoon\n(1-4 PM)' },
                          { value: '06:00 PM', label: 'Evening\n(6-9 PM)' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleFieldChange('deliveryTime', option.value)}
                            className={`p-3 rounded-lg border-2 font-semibold transition whitespace-pre-line text-sm ${formData.deliveryTime === option.value
                              ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-300'
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 6: Facility Selection */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Select Water Tanker Facility</h2>
                </div>

                <p className="text-sm text-gray-600 mb-4">Choose from available water tanker facilities near you</p>

                <div className="space-y-3">
                  {WATER_TANKER_FACILITIES.map((facility) => (
                    <button
                      key={facility.id}
                      onClick={() => setSelectedFacility(facility.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition ${selectedFacility === facility.id
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-300 bg-white hover:border-cyan-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{facility.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">📍 {facility.distance} away</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-cyan-600">₹{facility.price}</p>
                          <p className="text-xs text-gray-600">per tanker</p>
                        </div>
                      </div>
                      {selectedFacility === facility.id && (
                        <div className="mt-3 flex items-center gap-2 text-cyan-600 font-semibold">
                          <CheckCircle className="w-4 h-4" /> Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {formErrors.facility && <p className="text-xs text-red-600 mt-2">{formErrors.facility}</p>}
              </div>
            )}

            {/* Step 7: Additional Instructions */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Additional Instructions</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => handleFieldChange('specialInstructions', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="E.g., Entry instructions for security, call before arrival, hose pipe availability, contact person details, etc."
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-2">Maximum 500 characters</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 Booking Summary</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Water Quantity:</strong> {formData.waterQuantity} Liters</p>
                    <p><strong>Water Type:</strong> {formData.waterType.charAt(0).toUpperCase() + formData.waterType.slice(1)}</p>
                    <p><strong>Delivery Date:</strong> {formData.deliveryDate || 'As soon as possible'}</p>
                    <p><strong>Facility:</strong> {WATER_TANKER_FACILITIES.find(f => f.id === selectedFacility)?.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: Review & Confirm */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Review & Confirm</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {formData.fullName}</p>
                      <p><strong>Mobile:</strong> {formData.mobileNumber}</p>
                      <p><strong>Email:</strong> {formData.emailAddress || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                    <div className="space-y-2 text-sm">
                      <p>{formData.houseNumber}, {formData.buildingSocietyName}</p>
                      <p>{formData.street}, {formData.city}</p>
                      <p>{formData.state} - {formData.pincode}</p>
                      {formData.landmark && <p>📍 Landmark: {formData.landmark}</p>}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Water Order Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Quantity:</strong> {formData.waterQuantity} Liters</p>
                      <p><strong>Type:</strong> {formData.waterType.charAt(0).toUpperCase() + formData.waterType.slice(1)}</p>
                      <p><strong>Purpose:</strong> {formData.waterPurpose.charAt(0).toUpperCase() + formData.waterPurpose.slice(1)}</p>
                      <p><strong>Property Type:</strong> {formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Scheduling</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {formData.deliveryType === 'immediate' ? 'Immediate/Emergency' : 'Scheduled'}</p>
                      {formData.deliveryType === 'scheduled' && (
                        <>
                          <p><strong>Date:</strong> {formData.deliveryDate}</p>
                          <p><strong>Time:</strong> {formData.deliveryTime}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">💰 Pricing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Water Tanker ({formData.waterQuantity}L)</span>
                        <span className="font-semibold">₹{WATER_TANKER_FACILITIES.find(f => f.id === selectedFacility)?.price || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Facility</span>
                        <span className="font-semibold">{WATER_TANKER_FACILITIES.find(f => f.id === selectedFacility)?.name}</span>
                      </div>
                      <div className="border-t border-cyan-200 pt-2 mt-2 flex justify-between text-base font-bold">
                        <span>Total Payable</span>
                        <span className="text-cyan-600">₹{WATER_TANKER_FACILITIES.find(f => f.id === selectedFacility)?.price || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 text-center">
                    ✅ By confirming, you agree to our terms and conditions. You will receive a confirmation SMS and email shortly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            <TouchButton
              variant="secondary"
              size="large"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              ← Previous
            </TouchButton>

            {currentStep === totalSteps ? (
              <TouchButton
                variant="primary"
                size="large"
                onClick={handleSubmit}
              >
                ✓ Confirm Booking
              </TouchButton>
            ) : (
              <TouchButton
                variant="primary"
                size="large"
                onClick={handleNext}
              >
                Next →
              </TouchButton>
            )}
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
