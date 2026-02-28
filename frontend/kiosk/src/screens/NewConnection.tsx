import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useStore, ServiceType } from '../store/useStore';
import { KioskLayout } from '../components/KioskLayout';
import { TouchButton } from '../components/TouchButton';
import { SuccessScreen } from '../components/SuccessScreen';
import { ArrowLeft, CheckCircle, Upload, Edit3, Zap, Flame, Droplets, Building2 } from 'lucide-react';
<<<<<<< Updated upstream:frontend/kiosk/src/screens/NewConnection.tsx
import govtLogo from '../assets/Government_of_India_logo.svg';
=======
import govtLogo from '../../assets/nextgen-seva/Government_of_India_logo.svg';
import nextgenSevaLogo from '../../assets/logo2.png';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { MapPin } from 'lucide-react';
import MapAddressPicker from '../../components/MapAddressPicker';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
>>>>>>> Stashed changes:frontend/src/pages/nextgen-seva/NewConnection.jsx

interface FormData {
  // Common fields
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  connectionType: 'residential' | 'commercial' | 'industrial' | '';

  // Electricity-specific
  purposeOfSupply: 'domestic' | 'commercial' | 'temporary' | '';
  phaseRequired: 'single' | 'three' | '';
  connectedLoad: string;
  meterLocation: 'indoor' | 'outdoor' | '';
  wiringCertificateFile: File | null;
  ownershipProofFile: File | null;
  buildingCertificateFile: File | null;

  // Gas-specific
  gasType: 'PNG' | 'LPG' | '';
  kitchenType: 'domestic' | 'commercial' | '';
  numberOfBurners: string;
  pipelineAvailability: 'yes' | 'no' | '';
  existingGasConnection: 'yes' | 'no' | '';
  ownerNOCFile: File | null;
  kitchenLayoutFile: File | null;
  safetyDeclarationFile: File | null;

  // Water-specific
  waterPurpose: 'domestic' | 'commercial' | 'construction' | '';
  waterCapacity: string;
  sourceType: 'municipal' | 'borewell' | '';
  existingWaterConnection: 'yes' | 'no' | '';
  plumbingCertificateFile: File | null;
  propertyTaxReceiptFile: File | null;
  approvedBuildingPlanFile: File | null;

  // Municipal-specific
  municipalServiceType: 'house_number' | 'sewer' | 'waste_collection' | 'property_registration' | '';
  propertyType: 'apartment' | 'independent' | 'shop' | '';
  numberOfFloors: string;
  propertyPID: string;
  completionCertificateFile: File | null;
  builderHandoverFile: File | null;
  propertyTaxProofFile: File | null;

  // Common documents
  aadhaarFile: File | null;
  addressProofFile: File | null;
  photoFile: File | null;
  signatureType: 'photo' | 'digital' | '';
  signaturePhotoFile: File | null;
  signature: string;
}

interface FormErrors {
  [key: string]: string;
}

interface NewConnection {
  id: string;
  applicationId: string;
  serviceType: ServiceType;
  applicantName: string;
  mobileNumber: string;
  email: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  createdAt: string;
  updatedAt: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
  'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep'
];

const CITIES: { [key: string]: string[] } = {
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
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  'Lakshadweep': ['Kavaratti']
};

export function NewConnection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedService } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalSteps = 5;
  const stepTitles = ['Applicant Info', 'Address', 'Details', 'Documents', 'Review'];

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    connectionType: '',

    purposeOfSupply: '',
    phaseRequired: '',
    connectedLoad: '',
    meterLocation: '',
    wiringCertificateFile: null,
    ownershipProofFile: null,
    buildingCertificateFile: null,

    gasType: '',
    kitchenType: '',
    numberOfBurners: '',
    pipelineAvailability: '',
    existingGasConnection: '',
    ownerNOCFile: null,
    kitchenLayoutFile: null,
    safetyDeclarationFile: null,

    waterPurpose: '',
    waterCapacity: '',
    sourceType: '',
    existingWaterConnection: '',
    plumbingCertificateFile: null,
    propertyTaxReceiptFile: null,
    approvedBuildingPlanFile: null,

    municipalServiceType: '',
    propertyType: '',
    numberOfFloors: '',
    propertyPID: '',
    completionCertificateFile: null,
    builderHandoverFile: null,
    propertyTaxProofFile: null,

    aadhaarFile: null,
    addressProofFile: null,
    photoFile: null,
    signatureType: '',
    signaturePhotoFile: null,
    signature: ''
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setFormErrors({ ...formErrors, [field]: '' });
  };

  const validateStep = (step: number) => {
    const errors: FormErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
      if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
      if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
        errors.mobileNumber = 'Valid 10-digit mobile number is required';
      }
      if (!formData.emailAddress.trim()) errors.emailAddress = 'Email address is required';
      if (formData.emailAddress && !/^\S+@\S+\.\S+$/.test(formData.emailAddress)) {
        errors.emailAddress = 'Valid email address is required';
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) errors.address = 'Address is required';
      if (!formData.state) errors.state = 'State is required';
      if (!formData.city) errors.city = 'City is required';
      if (!formData.pincode.trim()) errors.pincode = 'PIN code is required';
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
        errors.pincode = 'Valid 6-digit PIN code is required';
      }
    }

    if (step === 3) {
      if (!formData.connectionType) errors.connectionType = 'Connection type is required';

      if (selectedService === 'electricity') {
        if (!formData.purposeOfSupply) errors.purposeOfSupply = 'Purpose of supply is required';
        if (!formData.phaseRequired) errors.phaseRequired = 'Phase required is required';
        if (!formData.connectedLoad.trim()) errors.connectedLoad = 'Connected load is required';
        if (formData.connectedLoad && !/^\d+(\.\d+)?$/.test(formData.connectedLoad)) {
          errors.connectedLoad = 'Connected load must be a number';
        }
        if (!formData.meterLocation) errors.meterLocation = 'Meter location is required';
      }

      if (selectedService === 'gas') {
        if (!formData.gasType) errors.gasType = 'Gas type is required';
        if (!formData.kitchenType) errors.kitchenType = 'Kitchen type is required';
        if (!formData.numberOfBurners.trim()) errors.numberOfBurners = 'Number of burners is required';
        if (formData.numberOfBurners && !/^\d+$/.test(formData.numberOfBurners)) {
          errors.numberOfBurners = 'Must be a number';
        }
        if (!formData.pipelineAvailability) errors.pipelineAvailability = 'Pipeline availability is required';
        if (!formData.existingGasConnection) errors.existingGasConnection = 'Existing gas connection status is required';
      }

      if (selectedService === 'water') {
        if (!formData.waterPurpose) errors.waterPurpose = 'Water purpose is required';
        if (!formData.waterCapacity.trim()) errors.waterCapacity = 'Water capacity is required';
        if (formData.waterCapacity && !/^\d+(\.\d+)?$/.test(formData.waterCapacity)) {
          errors.waterCapacity = 'Water capacity must be a number';
        }
        if (!formData.sourceType) errors.sourceType = 'Source type is required';
        if (!formData.existingWaterConnection) errors.existingWaterConnection = 'Existing water connection status is required';
      }

      if (selectedService === 'municipal') {
        if (!formData.municipalServiceType) errors.municipalServiceType = 'Municipal service type is required';
        if (!formData.propertyType) errors.propertyType = 'Property type is required';
        if (!formData.numberOfFloors.trim()) errors.numberOfFloors = 'Number of floors is required';
        if (formData.numberOfFloors && !/^\d+$/.test(formData.numberOfFloors)) {
          errors.numberOfFloors = 'Must be a number';
        }
      }
    }

    if (step === 4) {
      if (!formData.aadhaarFile) errors.aadhaarFile = 'Aadhaar document is required';
      if (!formData.addressProofFile) errors.addressProofFile = 'Address proof is required';
      if (!formData.photoFile) errors.photoFile = 'Photo is required';
      if (!formData.signatureType) errors.signatureType = 'Signature is required';
      if (formData.signatureType === 'photo' && !formData.signaturePhotoFile) {
        errors.signaturePhotoFile = 'Signature photo is required';
      }
      if (formData.signatureType === 'digital' && !formData.signature) {
        errors.signature = 'Digital signature is required';
      }

      if (selectedService === 'electricity') {
        if (!formData.wiringCertificateFile) errors.wiringCertificateFile = 'Wiring completion certificate is required';
        if (!formData.ownershipProofFile) errors.ownershipProofFile = 'Ownership proof / Owner NOC is required';
        if (!formData.buildingCertificateFile) errors.buildingCertificateFile = 'Building completion certificate is required';
      }

      if (selectedService === 'gas') {
        if (!formData.ownerNOCFile) errors.ownerNOCFile = 'Owner / Society NOC is required';
        if (!formData.kitchenLayoutFile) errors.kitchenLayoutFile = 'Kitchen layout / Installation photo is required';
        if (!formData.safetyDeclarationFile) errors.safetyDeclarationFile = 'Safety compliance declaration is required';
      }

      if (selectedService === 'water') {
        if (!formData.plumbingCertificateFile) errors.plumbingCertificateFile = 'Plumbing completion certificate is required';
        if (!formData.propertyTaxReceiptFile) errors.propertyTaxReceiptFile = 'Property tax receipt is required';
        if (!formData.approvedBuildingPlanFile) errors.approvedBuildingPlanFile = 'Approved building plan is required';
      }

      if (selectedService === 'municipal') {
        if (!formData.completionCertificateFile) errors.completionCertificateFile = 'Completion / Occupancy certificate is required';
        if (!formData.builderHandoverFile) errors.builderHandoverFile = 'Builder handover letter is required';
        if (!formData.propertyTaxProofFile) errors.propertyTaxProofFile = 'Property tax registration proof is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = (field: keyof FormData, file: File | null) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    if (file && file.size > MAX_FILE_SIZE) {
      setFormErrors({ 
        ...formErrors, 
        [field]: `File size exceeds 5MB limit. Please upload a file smaller than 5MB.` 
      });
      setFormData({ ...formData, [field]: null });
    } else {
      setFormData({ ...formData, [field]: file });
      if (file) {
        setFormErrors({ ...formErrors, [field]: '' });
      }
    }
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
  
  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;
    
    const newApplicationId = 'APP-2026-' + Math.floor(10000 + Math.random() * 90000);
    
    // Store new connection application
    const newConnectionApp: NewConnection = {
      id: Date.now().toString(),
      applicationId: newApplicationId,
      serviceType: selectedService as ServiceType,
      applicantName: formData.fullName,
      mobileNumber: formData.mobileNumber,
      email: formData.emailAddress,
      city: formData.city,
      state: formData.state,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in localStorage for tracking
    const existingApps = JSON.parse(localStorage.getItem('newConnections') || '[]');
    existingApps.push(newConnectionApp);
    localStorage.setItem('newConnections', JSON.stringify(existingApps));
    
    setApplicationId(newApplicationId);
    setShowSuccess(true);
  };
  
  // Canvas drawing functions
  const startDrawing = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ('touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left) * scaleX;
    const y = ('touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };
  
  const draw = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ('touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left) * scaleX;
    const y = ('touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#212529';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setFormData({ ...formData, signature: canvas.toDataURL() });
    }
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFormData({ ...formData, signature: '' });
      }
    }
  };

  // Keyboard support for form navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA' ||
          (e.target as HTMLElement).tagName === 'SELECT') {
        return;
      }

      if (e.key === 'Enter' && !showSuccess) {
        e.preventDefault();
        if (currentStep < totalSteps) {
          handleNext();
        } else {
          handleSubmit();
        }
      } else if (e.key === 'Escape' && !showSuccess) {
        e.preventDefault();
        if (currentStep > 1) {
          handlePrevious();
        } else {
          navigate('/dashboard');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, showSuccess, navigate]);
  
  // Print application function
  const handlePrintApplication = () => {
    // Get signature data
    let signatureData = '';
    if (formData.signatureType === 'digital' && formData.signature) {
      signatureData = formData.signature;
    } else if (formData.signatureType === 'photo' && formData.signaturePhotoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          generatePrintDocument(e.target.result as string);
        }
      };
      reader.readAsDataURL(formData.signaturePhotoFile);
      return;
    }
    
    generatePrintDocument(signatureData);
  };
  
  const generatePrintDocument = (signatureData: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const serviceName = selectedService.charAt(0).toUpperCase() + selectedService.slice(1);
    
    let departmentFields = '';
    
    // Electricity-specific fields
    if (selectedService === 'electricity') {
      departmentFields = `
        <tr><td class="label">Purpose of Supply:</td><td class="value">${formData.purposeOfSupply.toUpperCase()}</td></tr>
        <tr><td class="label">Phase Required:</td><td class="value">${formData.phaseRequired === 'single' ? 'Single Phase' : 'Three Phase'}</td></tr>
        <tr><td class="label">Connected Load:</td><td class="value">${formData.connectedLoad} kW</td></tr>
        <tr><td class="label">Meter Location:</td><td class="value">${formData.meterLocation.charAt(0).toUpperCase() + formData.meterLocation.slice(1)}</td></tr>
      `;
    }
    
    // Gas-specific fields
    if (selectedService === 'gas') {
      departmentFields = `
        <tr><td class="label">Gas Type:</td><td class="value">${formData.gasType}</td></tr>
        <tr><td class="label">Kitchen Type:</td><td class="value">${formData.kitchenType.charAt(0).toUpperCase() + formData.kitchenType.slice(1)}</td></tr>
        <tr><td class="label">Number of Burners:</td><td class="value">${formData.numberOfBurners}</td></tr>
        <tr><td class="label">Pipeline Availability:</td><td class="value">${formData.pipelineAvailability.toUpperCase()}</td></tr>
        <tr><td class="label">Existing Gas Connection:</td><td class="value">${formData.existingGasConnection.toUpperCase()}</td></tr>
      `;
    }
    
    // Water-specific fields
    if (selectedService === 'water') {
      departmentFields = `
        <tr><td class="label">Water Purpose:</td><td class="value">${formData.waterPurpose.charAt(0).toUpperCase() + formData.waterPurpose.slice(1)}</td></tr>
        <tr><td class="label">Water Capacity:</td><td class="value">${formData.waterCapacity} Litres Per Day</td></tr>
        <tr><td class="label">Source Type:</td><td class="value">${formData.sourceType.charAt(0).toUpperCase() + formData.sourceType.slice(1)}</td></tr>
        <tr><td class="label">Existing Water Connection:</td><td class="value">${formData.existingWaterConnection.toUpperCase()}</td></tr>
      `;
    }
    
    // Municipal-specific fields
    if (selectedService === 'municipal') {
      departmentFields = `
        <tr><td class="label">Service Type:</td><td class="value">${formData.municipalServiceType?.replace(/_/g, ' ').toUpperCase()}</td></tr>
        <tr><td class="label">Property Type:</td><td class="value">${formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1)}</td></tr>
        <tr><td class="label">Number of Floors:</td><td class="value">${formData.numberOfFloors}</td></tr>
        ${formData.propertyPID ? `<tr><td class="label">Property PID:</td><td class="value">${formData.propertyPID}</td></tr>` : ''}
      `;
    }
    
    let departmentDocuments = '';
    
    // Electricity documents
    if (selectedService === 'electricity') {
      departmentDocuments = `
        <li>✓ Wiring Completion Certificate</li>
        <li>✓ Ownership Proof / Owner NOC</li>
        <li>✓ Building Completion Certificate</li>
      `;
    }
    
    // Gas documents
    if (selectedService === 'gas') {
      departmentDocuments = `
        <li>✓ Owner / Society NOC</li>
        <li>✓ Kitchen Layout / Installation Photo</li>
        <li>✓ Safety Compliance Declaration</li>
      `;
    }
    
    // Water documents
    if (selectedService === 'water') {
      departmentDocuments = `
        <li>✓ Plumbing Completion Certificate</li>
        <li>✓ Property Tax Receipt</li>
        <li>✓ Approved Building Plan</li>
      `;
    }
    
    // Municipal documents
    if (selectedService === 'municipal') {
      departmentDocuments = `
        <li>✓ Completion / Occupancy Certificate</li>
        <li>✓ Builder Handover Letter</li>
        <li>✓ Property Tax Registration Proof</li>
      `;
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>New Connection Application - ${applicationId}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Times New Roman', Times, serif;
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 8mm;
              background: #fff;
              color: #000;
              font-size: 11pt;
              line-height: 1.45;
            }

            .page-container {
              width: 100%;
              height: auto;
            }

            .content-area {
              height: auto;
            }

            .govt-header {
              text-align: center;
              border: 3px double #000;
              padding: 12px;
              margin-bottom: 14px;
              background: linear-gradient(to bottom, #f8f9fa 0%, #fff 100%);
            }

            .govt-emblem {
              font-size: 40px;
              margin-bottom: 6px;
            }

            .govt-header h1 {
              font-size: 18pt;
              font-weight: bold;
              color: #000;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              margin: 4px 0;
            }

            .govt-header .dept-name {
              font-size: 13pt;
              font-weight: bold;
              color: #1a5490;
              margin: 2px 0;
              text-transform: uppercase;
            }

            .govt-header .form-title {
              font-size: 12pt;
              font-weight: bold;
              margin-top: 6px;
              text-decoration: underline;
            }

            .reference-box {
              display: flex;
              justify-content: space-between;
              border: 2px solid #000;
              padding: 8px 12px;
              margin: 12px 0;
              background: #f8f9fa;
              font-size: 10pt;
            }

            .app-number {
              font-size: 13pt;
              font-weight: bold;
              font-family: 'Courier New', monospace;
              color: #1a5490;
            }

            .two-column {
              display: grid;
              grid-template-columns: 1fr;
              gap: 14px;
              margin: 12px 0;
            }

            .section {
              margin: 0;
              page-break-inside: avoid;
            }

            .section-title {
              background: #1a5490;
              color: #fff;
              padding: 8px 12px;
              font-size: 11pt;
              font-weight: bold;
              border: 2px solid #000;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }

            .section-content {
              border: 2px solid #000;
              border-top: none;
              padding: 12px;
              background: #fff;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            table td {
              padding: 7px 10px;
              font-size: 11pt;
            }

            table td.label {
              width: 40%;
              font-weight: bold;
              color: #333;
            }

            table td.value {
              width: 60%;
              color: #000;
              border-bottom: 1px dotted #999;
            }

            table tr:last-child td.value {
              border-bottom: none;
            }

            ul {
              list-style: none;
              padding: 0;
              font-size: 11pt;
              display: grid;
              grid-template-columns: 1fr;
              gap: 6px;
            }

            ul li {
              padding: 3px 0 3px 16px;
              color: #000;
            }

            .declaration-box {
              border: 2px solid #000;
              padding: 12px;
              margin: 14px 0;
              background: #fffef7;
            }

            .declaration-box h3 {
              font-size: 11pt;
              text-align: center;
              margin-bottom: 8px;
              text-decoration: underline;
            }

            .declaration-box p {
              text-align: justify;
              line-height: 1.45;
              margin-bottom: 12px;
              font-size: 10pt;
            }

            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 14px;
              padding: 0 14px;
            }

            .signature-box {
              text-align: center;
              font-size: 10pt;
            }

            .signature-image {
              height: 60px;
              margin-bottom: 8px;
              border-bottom: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .signature-image img {
              max-height: 56px;
              max-width: 180px;
            }

            .signature-label {
              font-weight: bold;
              margin-top: 6px;
            }

            .date-place {
              margin-top: 10px;
            }

            .date-place p {
              margin: 5px 0;
            }

            .footer {
              margin-top: 14px;
              padding-top: 10px;
              border-top: 2px solid #000;
              text-align: center;
              font-size: 9pt;
            }

            .footer p {
              margin: 3px 0;
            }

            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120pt;
              color: rgba(0, 0, 0, 0.03);
              z-index: -1;
              font-weight: bold;
              pointer-events: none;
            }

            @media print {
              html, body {
                width: 210mm;
                min-height: 297mm;
              }
              body {
                padding: 8mm;
              }
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
          <div class="watermark">SUVIDHA</div>
          
          <div class="govt-header">
            <img src="${govtLogo}" alt="Government of India" style="height: 60px; margin-bottom: 6px;" />
            <h1>Government of India</h1>
            <div class="dept-name">${serviceName} Department</div>
            <div class="form-title">Application for New Connection</div>
          </div>
          
          <div class="reference-box">
            <div class="left">
              <strong>Application No.:</strong> <span class="app-number">${applicationId}</span>
            </div>
            <div class="right">
              <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | 
              <strong>Time:</strong> ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div class="content-area">
          <div class="two-column">
            <div class="section">
              <div class="section-title">Applicant Information</div>
              <div class="section-content">
                <table>
                  <tr>
                    <td class="label">Full Name:</td>
                    <td class="value">${formData.fullName.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td class="label">Mobile:</td>
                    <td class="value">${formData.mobileNumber}</td>
                  </tr>
                  <tr>
                    <td class="label">Email:</td>
                    <td class="value">${formData.emailAddress}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Address Details</div>
              <div class="section-content">
                <table>
                  <tr>
                    <td class="label">Address:</td>
                    <td class="value">${formData.address}</td>
                  </tr>
                  <tr>
                    <td class="label">City:</td>
                    <td class="value">${formData.city}</td>
                  </tr>
                  <tr>
                    <td class="label">State:</td>
                    <td class="value">${formData.state}</td>
                  </tr>
                  <tr>
                    <td class="label">PIN:</td>
                    <td class="value">${formData.pincode}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          
          <div class="two-column">
            <div class="section">
              <div class="section-title">Connection Details</div>
              <div class="section-content">
                <table>
                  <tr>
                    <td class="label">Connection Type:</td>
                    <td class="value">${formData.connectionType.toUpperCase()}</td>
                  </tr>
                  ${departmentFields}
                </table>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Documents Submitted</div>
              <div class="section-content">
                <ul>
                  <li>✓ Aadhaar Card</li>
                  <li>✓ Address Proof</li>
                  <li>✓ Photograph</li>
                  ${departmentDocuments}
                  <li>✓ Signature</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="declaration-box">
            <h3>DECLARATION</h3>
            <p>
              I, <strong>${formData.fullName}</strong>, hereby declare that all information provided is true and correct. I understand that any false statement may result in rejection of this application. I agree to abide by all rules prescribed by the ${serviceName} Department.
            </p>
            
            <div class="signature-section">
              <div class="signature-box">
                <div class="date-place">
                  <p><strong>Place:</strong> ${formData.city}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
              </div>
              
              <div class="signature-box">
                <div class="signature-image">
                  ${signatureData ? `<img src="${signatureData}" alt="Signature" />` : '<span style="color: #999;">Signature</span>'}
                </div>
                <div class="signature-label">Applicant's Signature</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>SUVIDHA - Unified Services Portal</strong> | Government of India</p>
            <p style="font-size: 6pt;">Form Ref: SUVIDHA/${serviceName.toUpperCase()}/NC/2026 | This is a computer-generated form</p>
          </div>
          </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-print after a small delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  if (showSuccess) {
    return (
      <KioskLayout mainBottomOffsetDesktop="0rem">
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-[#28A745] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-[#28A745] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">✓</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#212529] mb-2">
              Application Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your new connection application has been received and is under review.
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#212529] mb-4">
                Your Application ID
              </h3>
              <div className="bg-gray-50 border-2 border-[#28A745] rounded-lg p-6">
                <p className="text-2xl font-mono font-bold text-[#28A745]">
                  {applicationId}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              You will receive updates on your registered mobile number and email address
            </p>
            
            <div className="space-y-3">
              <TouchButton
                variant="primary"
                size="medium"
                onClick={handlePrintApplication}
                className="w-full"
              >
                🖨️ Print Application
              </TouchButton>
              
              <TouchButton
                variant="secondary"
                size="medium"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </TouchButton>
            </div>
          </div>
        </div>
      </KioskLayout>
    );
  }
  
  return (
    <KioskLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#212529] mb-6">
            {t('newConnectionApplication')}
          </h2>
          
          {/* Stepper */}
          <div className="flex items-center justify-between mb-4">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    index + 1 < currentStep
                      ? 'bg-[#28A745] text-white'
                      : index + 1 === currentStep
                      ? 'bg-[#0066CC] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1 < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <p className={`text-xs mt-2 text-center ${
                    index + 1 === currentStep ? 'font-semibold text-[#0066CC]' : 'text-gray-600'
                  }`}>
                    {stepTitles[index]}
                  </p>
                </div>
                {index < totalSteps - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded ${
                    index + 1 < currentStep ? 'bg-[#28A745]' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-sm text-center text-gray-600">
            {t('step')} {currentStep} {t('of')} {totalSteps}
          </p>
        </div>
        
        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* Step 1: Applicant Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                    formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.fullName && <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('mobileNumber')} * (10 digits)
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                    formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.mobileNumber && <p className="text-xs text-red-600 mt-1">{formErrors.mobileNumber}</p>}
                <p className="text-xs text-gray-600 mt-1">Must start with 6-9</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('emailAddress')} *
                </label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                    formErrors.emailAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.emailAddress && <p className="text-xs text-red-600 mt-1">{formErrors.emailAddress}</p>}
              </div>
            </div>
          )}
          
          {/* Step 2: Address Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('address')} *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full h-24 px-4 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.address && <p className="text-xs text-red-600 mt-1">{formErrors.address}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('state')} *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value, city: '' });
                      if (formErrors.state) setFormErrors({ ...formErrors, state: '', city: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                      formErrors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {formErrors.state && <p className="text-xs text-red-600 mt-1">{formErrors.state}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('city')} *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                    }}
                    disabled={!formData.state}
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      formErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">
                      {formData.state ? 'Select City' : 'Select State First'}
                    </option>
                    {formData.state && CITIES[formData.state] && CITIES[formData.state].length > 0 ? (
                      CITIES[formData.state].map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))
                    ) : null}
                  </select>
                  {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pincode')} * (6 digits)
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  placeholder="e.g., 400001"
                  className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                    formErrors.pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.pincode && <p className="text-xs text-red-600 mt-1">{formErrors.pincode}</p>}
              </div>
            </div>
          )}
          
          {/* Step 3: Connection Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('connectionType')} *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(selectedService === 'electricity' 
                    ? ['residential', 'commercial', 'industrial'] 
                    : ['residential', 'commercial']
                  ).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleInputChange('connectionType', type)}
                      className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                        formData.connectionType === type
                          ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                {formErrors.connectionType && <p className="text-xs text-red-600 mt-1">{formErrors.connectionType}</p>}
              </div>
              
              {/* ELECTRICITY-SPECIFIC FIELDS */}
              {selectedService === 'electricity' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Purpose of Supply *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['domestic', 'commercial', 'temporary'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('purposeOfSupply', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.purposeOfSupply === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {formErrors.purposeOfSupply && <p className="text-xs text-red-600 mt-1">{formErrors.purposeOfSupply}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Phase Required *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['single', 'three'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('phaseRequired', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.phaseRequired === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type === 'single' ? 'Single Phase' : 'Three Phase'}
                        </button>
                      ))}
                    </div>
                    {formErrors.phaseRequired && <p className="text-xs text-red-600 mt-1">{formErrors.phaseRequired}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connected Load (kW) *
                    </label>
                    <input
                      type="text"
                      value={formData.connectedLoad}
                      onChange={(e) => handleInputChange('connectedLoad', e.target.value)}
                      placeholder="e.g., 5.5"
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                        formErrors.connectedLoad ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.connectedLoad && <p className="text-xs text-red-600 mt-1">{formErrors.connectedLoad}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Meter Location *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['indoor', 'outdoor'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('meterLocation', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.meterLocation === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {formErrors.meterLocation && <p className="text-xs text-red-600 mt-1">{formErrors.meterLocation}</p>}
                  </div>
                </>
              )}
              
              {/* GAS-SPECIFIC FIELDS */}
              {selectedService === 'gas' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Gas Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['PNG', 'LPG'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('gasType', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.gasType === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {formErrors.gasType && <p className="text-xs text-red-600 mt-1">{formErrors.gasType}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Kitchen Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['domestic', 'commercial'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('kitchenType', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.kitchenType === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {formErrors.kitchenType && <p className="text-xs text-red-600 mt-1">{formErrors.kitchenType}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Burners *
                    </label>
                    <input
                      type="text"
                      value={formData.numberOfBurners}
                      onChange={(e) => handleInputChange('numberOfBurners', e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g., 2"
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                        formErrors.numberOfBurners ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.numberOfBurners && <p className="text-xs text-red-600 mt-1">{formErrors.numberOfBurners}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Pipeline Availability *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['yes', 'no'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('pipelineAvailability', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.pipelineAvailability === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    {formErrors.pipelineAvailability && <p className="text-xs text-red-600 mt-1">{formErrors.pipelineAvailability}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Existing Gas Connection *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['yes', 'no'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('existingGasConnection', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.existingGasConnection === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    {formErrors.existingGasConnection && <p className="text-xs text-red-600 mt-1">{formErrors.existingGasConnection}</p>}
                  </div>
                </>
              )}
              
              {/* WATER-SPECIFIC FIELDS */}
              {selectedService === 'water' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Water Purpose *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['domestic', 'commercial', 'construction'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('waterPurpose', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.waterPurpose === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {formErrors.waterPurpose && <p className="text-xs text-red-600 mt-1">{formErrors.waterPurpose}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Water Capacity (LPD) *
                    </label>
                    <input
                      type="text"
                      value={formData.waterCapacity}
                      onChange={(e) => handleInputChange('waterCapacity', e.target.value)}
                      placeholder="e.g., 500"
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                        formErrors.waterCapacity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Litres Per Day</p>
                    {formErrors.waterCapacity && <p className="text-xs text-red-600 mt-1">{formErrors.waterCapacity}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Source Type (Info Only) *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['municipal', 'borewell'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('sourceType', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.sourceType === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {formErrors.sourceType && <p className="text-xs text-red-600 mt-1">{formErrors.sourceType}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Existing Water Connection *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['yes', 'no'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('existingWaterConnection', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.existingWaterConnection === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    {formErrors.existingWaterConnection && <p className="text-xs text-red-600 mt-1">{formErrors.existingWaterConnection}</p>}
                  </div>
                </>
              )}
              
              {/* MUNICIPAL-SPECIFIC FIELDS */}
              {selectedService === 'municipal' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Municipal Service Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: 'house_number', label: 'House Number Allocation' },
                        { value: 'sewer', label: 'Sewer Connection' },
                        { value: 'waste_collection', label: 'Waste Collection' },
                        { value: 'property_registration', label: 'Property Registration' }
                      ] as const).map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleInputChange('municipalServiceType', type.value)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.municipalServiceType === type.value
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                    {formErrors.municipalServiceType && <p className="text-xs text-red-600 mt-1">{formErrors.municipalServiceType}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Property Type *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['apartment', 'independent', 'shop'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInputChange('propertyType', type)}
                          className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.propertyType === type
                              ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    {formErrors.propertyType && <p className="text-xs text-red-600 mt-1">{formErrors.propertyType}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Floors *
                    </label>
                    <input
                      type="text"
                      value={formData.numberOfFloors}
                      onChange={(e) => handleInputChange('numberOfFloors', e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g., 2"
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent ${
                        formErrors.numberOfFloors ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.numberOfFloors && <p className="text-xs text-red-600 mt-1">{formErrors.numberOfFloors}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Assessment / PID Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.propertyPID}
                      onChange={(e) => handleInputChange('propertyPID', e.target.value)}
                      placeholder="If exists"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Step 4: Document Upload */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {/* Common Documents */}
              <h4 className="text-base font-semibold text-gray-700 border-b pb-2">Common Documents</h4>
              {(['aadhaarFile', 'addressProofFile', 'photoFile'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field === 'aadhaarFile' ? 'Aadhaar Card' : field === 'addressProofFile' ? 'Address Proof' : 'Passport Photo'} *
                  </label>
                  <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    formErrors[field] ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        {formData[field] ? formData[field]!.name : 'Click to upload'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG or PDF (Max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {formErrors[field] && <p className="text-xs text-red-600 mt-1">{formErrors[field]}</p>}
                </div>
              ))}
              
              {/* Electricity-Specific Documents */}
              {selectedService === 'electricity' && (
                <>
                  <h4 className="text-base font-semibold text-gray-700 border-b pb-2 mt-6">Electricity-Specific Documents</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wiring Completion Certificate *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.wiringCertificateFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.wiringCertificateFile ? formData.wiringCertificateFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('wiringCertificateFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.wiringCertificateFile && <p className="text-xs text-red-600 mt-1">{formErrors.wiringCertificateFile}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ownership Proof / Owner NOC *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.ownershipProofFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.ownershipProofFile ? formData.ownershipProofFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('ownershipProofFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.ownershipProofFile && <p className="text-xs text-red-600 mt-1">{formErrors.ownershipProofFile}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building Completion / Occupancy Certificate *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.buildingCertificateFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.buildingCertificateFile ? formData.buildingCertificateFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('buildingCertificateFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.buildingCertificateFile && <p className="text-xs text-red-600 mt-1">{formErrors.buildingCertificateFile}</p>}
                  </div>
                </>
              )}
              
              {/* Gas-Specific Documents */}
              {selectedService === 'gas' && (
                <>
                  <h4 className="text-base font-semibold text-gray-700 border-b pb-2 mt-6">Gas-Specific Documents</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner / Society NOC *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.ownerNOCFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.ownerNOCFile ? formData.ownerNOCFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('ownerNOCFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.ownerNOCFile && <p className="text-xs text-red-600 mt-1">{formErrors.ownerNOCFile}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kitchen Layout / Installation Photo *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.kitchenLayoutFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.kitchenLayoutFile ? formData.kitchenLayoutFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('kitchenLayoutFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.kitchenLayoutFile && <p className="text-xs text-red-600 mt-1">{formErrors.kitchenLayoutFile}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Safety Compliance Declaration *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.safetyDeclarationFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.safetyDeclarationFile ? formData.safetyDeclarationFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('safetyDeclarationFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.safetyDeclarationFile && <p className="text-xs text-red-600 mt-1">{formErrors.safetyDeclarationFile}</p>}
                  </div>
                </>
              )}
              
              {/* Water-Specific Documents */}
              {selectedService === 'water' && (
                <>
                  <h4 className="text-base font-semibold text-gray-700 border-b pb-2 mt-6">Water-Specific Documents</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plumbing Completion Certificate *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.plumbingCertificateFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.plumbingCertificateFile ? formData.plumbingCertificateFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('plumbingCertificateFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.plumbingCertificateFile && <p className="text-xs text-red-600 mt-1">{formErrors.plumbingCertificateFile}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Tax Receipt *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.propertyTaxReceiptFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.propertyTaxReceiptFile ? formData.propertyTaxReceiptFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('propertyTaxReceiptFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.propertyTaxReceiptFile && <p className="text-xs text-red-600 mt-1">{formErrors.propertyTaxReceiptFile}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approved Building Plan *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.approvedBuildingPlanFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.approvedBuildingPlanFile ? formData.approvedBuildingPlanFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('approvedBuildingPlanFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.approvedBuildingPlanFile && <p className="text-xs text-red-600 mt-1">{formErrors.approvedBuildingPlanFile}</p>}
                  </div>
                </>
              )}
              
              {/* Municipal-Specific Documents */}
              {selectedService === 'municipal' && (
                <>
                  <h4 className="text-base font-semibold text-gray-700 border-b pb-2 mt-6">Municipal-Specific Documents</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion / Occupancy Certificate *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.completionCertificateFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.completionCertificateFile ? formData.completionCertificateFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('completionCertificateFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.completionCertificateFile && <p className="text-xs text-red-600 mt-1">{formErrors.completionCertificateFile}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Builder Handover Letter *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.builderHandoverFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.builderHandoverFile ? formData.builderHandoverFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('builderHandoverFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.builderHandoverFile && <p className="text-xs text-red-600 mt-1">{formErrors.builderHandoverFile}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Tax Registration Proof *
                    </label>
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formErrors.propertyTaxProofFile ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          {formData.propertyTaxProofFile ? formData.propertyTaxProofFile.name : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload('propertyTaxProofFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {formErrors.propertyTaxProofFile && <p className="text-xs text-red-600 mt-1">{formErrors.propertyTaxProofFile}</p>}
                  </div>
                </>
              )}
              
              {/* Common Signature Section */}
              <h4 className="text-base font-semibold text-gray-700 border-b pb-2 mt-6">Signature</h4>
              
              {/* Signature Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Signature Type *
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {(['photo', 'digital'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleInputChange('signatureType', type)}
                      className={`p-3 border-2 rounded-lg text-sm font-semibold transition-all ${
                        formData.signatureType === type
                          ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {type === 'photo' ? '📷 Signature Photo' : '✍️ Digital Signature'}
                    </button>
                  ))}
                </div>
                {formErrors.signatureType && <p className="text-xs text-red-600 mt-1">{formErrors.signatureType}</p>}
              </div>
              
              {/* Signature Photo Upload */}
              {formData.signatureType === 'photo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Signature Photo *
                  </label>
                  <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    formErrors.signaturePhotoFile ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        {formData.signaturePhotoFile ? formData.signaturePhotoFile.name : 'Click to upload'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG or PNG (Max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => handleFileUpload('signaturePhotoFile', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {formErrors.signaturePhotoFile && <p className="text-xs text-red-600 mt-1">{formErrors.signaturePhotoFile}</p>}
                </div>
              )}
              
              {/* Digital Signature Canvas */}
              {formData.signatureType === 'digital' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Draw Your Signature *
                  </label>
                  <div className={`border rounded-lg p-4 ${formErrors.signature ? 'border-red-500' : 'border-gray-300'}`}>
                    <p className="text-sm text-gray-600 mb-2 text-center">Sign in the box below</p>
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={150}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="border border-dashed border-gray-300 rounded-lg w-full bg-white"
                      style={{ cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><line x1=\"16\" y1=\"0\" x2=\"16\" y2=\"32\" stroke=\"black\" stroke-width=\"2\"/><line x1=\"0\" y1=\"16\" x2=\"32\" y2=\"16\" stroke=\"black\" stroke-width=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"4\" fill=\"none\" stroke=\"black\" stroke-width=\"1\"/></svg>') 16 16, crosshair" }}
                    />
                    <div className="mt-3 flex justify-end">
                      <TouchButton
                        variant="secondary"
                        size="small"
                        icon={<Edit3 className="w-4 h-4" />}
                        onClick={clearSignature}
                      >
                        {t('clear')}
                      </TouchButton>
                    </div>
                  </div>
                  {formErrors.signature && <p className="text-xs text-red-600 mt-1">{formErrors.signature}</p>}
                </div>
              )}
            </div>
          )}
          
          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#212529] mb-4">
                Please review your application
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('applicantDetails')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Name:</span> <strong>{formData.fullName}</strong></p>
                    <p><span className="text-gray-600">Mobile:</span> <strong>{formData.mobileNumber}</strong></p>
                    <p><span className="text-gray-600">Email:</span> <strong>{formData.emailAddress}</strong></p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('addressDetails')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Address:</span> <strong>{formData.address}</strong></p>
                    <p><span className="text-gray-600">City:</span> <strong>{formData.city}</strong></p>
                    <p><span className="text-gray-600">State:</span> <strong>{formData.state}</strong></p>
                    <p><span className="text-gray-600">PIN:</span> <strong>{formData.pincode}</strong></p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('connectionDetails')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Type:</span> <strong className="capitalize">{formData.connectionType}</strong></p>
                    
                    {/* Electricity-Specific Fields */}
                    {selectedService === 'electricity' && (
                      <>
                        <p><span className="text-gray-600">Purpose of Supply:</span> <strong className="capitalize">{formData.purposeOfSupply}</strong></p>
                        <p><span className="text-gray-600">Phase Required:</span> <strong>{formData.phaseRequired}</strong></p>
                        <p><span className="text-gray-600">Connected Load:</span> <strong>{formData.connectedLoad} kW</strong></p>
                        <p><span className="text-gray-600">Meter Location:</span> <strong className="capitalize">{formData.meterLocation}</strong></p>
                      </>
                    )}
                    
                    {/* Gas-Specific Fields */}
                    {selectedService === 'gas' && (
                      <>
                        <p><span className="text-gray-600">Gas Type:</span> <strong>{formData.gasType}</strong></p>
                        <p><span className="text-gray-600">Kitchen Type:</span> <strong className="capitalize">{formData.kitchenType}</strong></p>
                        <p><span className="text-gray-600">Number of Burners:</span> <strong>{formData.numberOfBurners}</strong></p>
                        <p><span className="text-gray-600">Pipeline Availability:</span> <strong className="capitalize">{formData.pipelineAvailability}</strong></p>
                        <p><span className="text-gray-600">Existing Gas Connection:</span> <strong className="capitalize">{formData.existingGasConnection}</strong></p>
                      </>
                    )}
                    
                    {/* Water-Specific Fields */}
                    {selectedService === 'water' && (
                      <>
                        <p><span className="text-gray-600">Water Purpose:</span> <strong className="capitalize">{formData.waterPurpose}</strong></p>
                        <p><span className="text-gray-600">Water Capacity:</span> <strong>{formData.waterCapacity} LPD</strong></p>
                        <p><span className="text-gray-600">Source Type:</span> <strong className="capitalize">{formData.sourceType}</strong></p>
                        <p><span className="text-gray-600">Existing Water Connection:</span> <strong className="capitalize">{formData.existingWaterConnection}</strong></p>
                      </>
                    )}
                    
                    {/* Municipal-Specific Fields */}
                    {selectedService === 'municipal' && (
                      <>
                        <p><span className="text-gray-600">Service Type:</span> <strong className="capitalize">{formData.municipalServiceType?.replace('-', ' ')}</strong></p>
                        <p><span className="text-gray-600">Property Type:</span> <strong className="capitalize">{formData.propertyType}</strong></p>
                        <p><span className="text-gray-600">Number of Floors:</span> <strong>{formData.numberOfFloors}</strong></p>
                        {formData.propertyPID && (
                          <p><span className="text-gray-600">Property PID:</span> <strong>{formData.propertyPID}</strong></p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Documents Uploaded
                  </h4>
                  <div className="space-y-2 text-sm">
                    {/* Common Documents */}
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#28A745]" />
                      <span>Aadhaar Card</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#28A745]" />
                      <span>Address Proof</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#28A745]" />
                      <span>Photograph</span>
                    </p>
                    
                    {/* Electricity-Specific Documents */}
                    {selectedService === 'electricity' && (
                      <>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Wiring Certificate</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Ownership Proof</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Building Certificate</span>
                        </p>
                      </>
                    )}
                    
                    {/* Gas-Specific Documents */}
                    {selectedService === 'gas' && (
                      <>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Owner NOC</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Kitchen Layout</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Safety Declaration</span>
                        </p>
                      </>
                    )}
                    
                    {/* Water-Specific Documents */}
                    {selectedService === 'water' && (
                      <>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Plumbing Certificate</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Property Tax Receipt</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Building Plan</span>
                        </p>
                      </>
                    )}
                    
                    {/* Municipal-Specific Documents */}
                    {selectedService === 'municipal' && (
                      <>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Completion Certificate</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Handover Letter</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#28A745]" />
                          <span>Property Tax Proof</span>
                        </p>
                      </>
                    )}
                    
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#28A745]" />
                      <span>Signature ({formData.signatureType === 'photo' ? 'Photo' : 'Digital'})</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-center text-gray-700">
                  ⓘ I declare that all information provided is true and accurate
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <TouchButton
              variant="secondary"
              size="medium"
              onClick={handlePrevious}
              className="flex-1"
            >
              {t('previous')}
            </TouchButton>
          )}
          
          <TouchButton
            variant="secondary"
            size="medium"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            {t('cancel')}
          </TouchButton>
          
          {currentStep < totalSteps ? (
            <TouchButton
              variant="primary"
              size="medium"
              onClick={handleNext}
              className="flex-1"
            >
              {t('next')}
            </TouchButton>
          ) : (
            <TouchButton
              variant="success"
              size="medium"
              onClick={handleSubmit}
              className="flex-1"
            >
              {t('submit')}
            </TouchButton>
          )}
        </div>
      </div>
<<<<<<< Updated upstream:frontend/kiosk/src/screens/NewConnection.tsx
=======

      {/* Hidden application rendering block for html2canvas generation */}
      <div ref={printContainerRef} style={{ display: 'none', position: 'absolute', left: '-9999px', top: 0, width: '210mm', minHeight: '297mm', padding: '8mm', background: '#fff', color: '#000', fontFamily: 'serif', fontSize: '11pt', zIndex: -1 }}>
        <div style={{ textAlign: 'center', border: '3px double #000', padding: '12px', marginBottom: '14px' }}>
          <img src={govtLogo} alt="Gov Logo" style={{ height: '60px', marginBottom: '6px' }} />
          <img src={nextgenSevaLogo} alt="NextGen Seva Logo" style={{ height: '42px', marginBottom: '6px' }} />
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '4px 0' }}>Government of India</h1>
          <p style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{selectedService?.charAt(0).toUpperCase() + selectedService?.slice(1)} Department</p>
          <p style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline' }}>Application for New Connection</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', border: '2px solid #000', padding: '8px 12px', marginBottom: '12px' }}>
          <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
          <p><strong>Application No:</strong> <span style={{ fontSize: '13pt', fontWeight: 'bold' }}>{applicationId || 'PENDING'}</span></p>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ background: '#000', color: '#fff', padding: '8px 12px', fontSize: '11pt', fontWeight: 'bold' }}>1. Applicant Details</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
            <tbody>
              <tr><td style={{ width: '40%', fontWeight: 'bold', padding: '7px 10px', borderBottom: '1px solid #ccc' }}>Full Name:</td><td style={{ padding: '7px 10px', borderBottom: '1px solid #ccc' }}>{formData.fullName}</td></tr>
              <tr><td style={{ fontWeight: 'bold', padding: '7px 10px', borderBottom: '1px solid #ccc' }}>Mobile Number:</td><td style={{ padding: '7px 10px', borderBottom: '1px solid #ccc' }}>{formData.mobileNumber}</td></tr>
              <tr><td style={{ fontWeight: 'bold', padding: '7px 10px', borderBottom: '1px solid #ccc' }}>Email Address:</td><td style={{ padding: '7px 10px', borderBottom: '1px solid #ccc' }}>{formData.emailAddress}</td></tr>
              <tr><td style={{ fontWeight: 'bold', padding: '7px 10px' }}>Address:</td><td style={{ padding: '7px 10px' }}>{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>Declaration</h3>
          <p style={{ textAlign: 'justify', fontSize: '10pt', marginBottom: '12px' }}>I hereby declare that the information provided above is true and correct. I understand that any false statement or omission of material facts may result in the rejection of this application.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
            <div><p>Date: {new Date().toLocaleDateString('en-IN')}</p><p>Place: {formData.city}</p></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '60px', borderBottom: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(formData.signatureType === 'digital' && formData.signature) ?
                  <img src={formData.signature} alt="Signature" style={{ maxHeight: '56px', maxWidth: '180px' }} />
                  : <span style={{ color: '#999', fontStyle: 'italic' }}>Signature Image Uploaded</span>}
              </div>
              <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Applicant Signature</div>
            </div>
          </div>
        </div>
      </div>
>>>>>>> Stashed changes:frontend/src/pages/nextgen-seva/NewConnection.jsx
    </KioskLayout>
  );
}