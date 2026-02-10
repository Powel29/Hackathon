import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useStore, ServiceType } from '../store/useStore';
import { KioskLayout } from '../components/KioskLayout';
import { TouchButton } from '../components/TouchButton';
import { ArrowLeft, FileText, Upload, Zap, Flame, Droplets, Building2 } from 'lucide-react';

interface UploadedFile {
  file: File;
  id: string;
}

interface FileError {
  filename: string;
  error: string;
}

export function RegisterComplaint() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addComplaint, selectedService } = useStore();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
  const [errors, setErrors] = useState<{ description?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  const MAX_FILES = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];

  // Redirect if no service selected
  useEffect(() => {
    if (!selectedService) {
      navigate('/service-selection');
    }
  }, [selectedService, navigate]);

  // Department-specific complaint types
  const complaintTypesByDepartment = {
    electricity: [
      'Frequent power cuts',
      'Low voltage issue',
      'Meter not working',
      'Incorrect billing',
      'Wire damage/hanging wires',
      'Street light not working',
      'Transformer issue',
      'New meter installation required'
    ],
    gas: [
      'Gas leak detected',
      'No gas supply',
      'Cylinder not delivered',
      'Meter problem',
      'Incorrect billing',
      'Pipeline damage',
      'Regulator malfunction',
      'Safety inspection required'
    ],
    water: [
      'No water supply',
      'Low water pressure',
      'Contaminated/dirty water',
      'Pipeline leakage',
      'Meter not working',
      'Irregular supply timing',
      'Sewage overflow',
      'Water tanker request'
    ],
    municipal: [
      'Garbage not collected',
      'Street light not working',
      'Road damage/potholes',
      'Drainage blockage',
      'Illegal dumping',
      'Park maintenance issue',
      'Stray animal problem',
      'Property tax query'
    ]
  };

  // Get department info for UI
  const getDepartmentInfo = () => {
    switch (selectedService) {
      case 'electricity':
        return {
          name: 'Electricity Department',
          icon: <Zap className="w-6 h-6 text-yellow-600" />,
          color: 'from-yellow-50 to-yellow-100',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'gas':
        return {
          name: 'Gas Department',
          icon: <Flame className="w-6 h-6 text-orange-600" />,
          color: 'from-orange-50 to-orange-100',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600'
        };
      case 'water':
        return {
          name: 'Water Department',
          icon: <Droplets className="w-6 h-6 text-blue-600" />,
          color: 'from-blue-50 to-blue-100',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'municipal':
        return {
          name: 'Municipal Services',
          icon: <Building2 className="w-6 h-6 text-green-600" />,
          color: 'from-green-50 to-green-100',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      default:
        return {
          name: 'Department',
          icon: <FileText className="w-6 h-6 text-gray-600" />,
          color: 'from-gray-50 to-gray-100',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
    }
  };

  const deptInfo = getDepartmentInfo();
  const complaintTypes = selectedService ? complaintTypesByDepartment[selectedService] : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newErrors: FileError[] = [];
      const newFiles: UploadedFile[] = [...files];

      Array.from(e.target.files).forEach((selectedFile) => {
        // Check file count
        if (newFiles.length >= MAX_FILES) {
          newErrors.push({
            filename: selectedFile.name,
            error: `Maximum ${MAX_FILES} files allowed`
          });
          return;
        }

        // Check file size
        if (selectedFile.size > MAX_FILE_SIZE) {
          const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
          newErrors.push({
            filename: selectedFile.name,
            error: `File size must be under ${sizeMB}MB (Current: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)`
          });
          return;
        }

        // Check file extension
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
          newErrors.push({
            filename: selectedFile.name,
            error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`
          });
          return;
        }

        // All validations passed
        newFiles.push({
          file: selectedFile,
          id: Date.now().toString() + Math.random()
        });
      });

      setFiles(newFiles);
      setFileErrors(newErrors);
    }

    // Reset input
    e.target.value = '';
  };
  
  const validate = () => {
    const newErrors: { description?: string } = {};
    
    if (description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validate() || !selectedService) return;
    
    const newComplaintId = 'CMP-2026-' + Math.floor(10000 + Math.random() * 90000);
    
    const newComplaint = {
      id: Date.now().toString(),
      complaintId: newComplaintId,
      serviceType: selectedService as ServiceType,
      description,
      status: 'open' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'open',
          timestamp: new Date().toISOString(),
          note: 'Complaint registered'
        }
      ]
    };
    
    addComplaint(newComplaint);
    setComplaintId(newComplaintId);
    setShowSuccess(true);
  };
  
  if (showSuccess) {
    return (
      <KioskLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-[#28A745] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-[#28A745] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">✓</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#212529] mb-2">
              Complaint Registered Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your complaint has been registered and will be addressed soon.
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#212529] mb-4">
                Your Complaint ID
              </h3>
              <div className="bg-gray-50 border-2 border-[#0066CC] rounded-lg p-6">
                <p className="text-2xl font-mono font-bold text-[#0066CC]">
                  {complaintId}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Please save this Complaint ID for tracking your complaint status
            </p>
            
            <div className="flex gap-3">
              <TouchButton
                variant="secondary"
                size="medium"
                onClick={() => navigate('/track-complaint')}
                className="flex-1"
              >
                Track Complaint
              </TouchButton>
              
              <TouchButton
                variant="primary"
                size="medium"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </TouchButton>
            </div>
          </div>
        </div>
      </KioskLayout>
    );
  }

  if (!selectedService) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <KioskLayout>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Department Header */}
          <div className={`bg-gradient-to-r ${deptInfo.color} border border-gray-200 rounded-xl p-4 mb-6`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${deptInfo.iconBg} rounded-lg flex items-center justify-center`}>
                {deptInfo.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#212529]">
                  Register Complaint - {deptInfo.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Report issues related to {deptInfo.name.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Common Issues - Quick Select */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Common Issue or Describe Your Problem:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {complaintTypes.map((issue) => (
                <button
                  key={issue}
                  onClick={() => setDescription(issue)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all text-left ${
                    description === issue
                      ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Detailed Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: undefined });
              }}
              placeholder="Describe your complaint in detail. Include location, timing, and any other relevant information..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-600">
                Minimum 20 characters • {description.length} / 500
              </span>
              {errors.description && (
                <span className="text-xs text-[#DC3545]">{errors.description}</span>
              )}
            </div>
          </div>
          
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Upload Supporting Documents (Optional)
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Maximum {MAX_FILES} files • Maximum 5MB per file • Allowed: JPG, PNG, PDF
            </p>
            
            <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">
                  {files.length === 0 ? 'Click to upload files' : `${files.length}/${MAX_FILES} files selected`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You can select multiple files at once
                </p>
              </div>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* File Errors */}
            {fileErrors.length > 0 && (
              <div className="mt-3 space-y-2">
                {fileErrors.map((error, index) => (
                  <div
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <p className="text-sm text-gray-700">
                      <strong className="text-red-600">{error.filename}:</strong>
                      <span className="text-red-600 ml-1">{error.error}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((uploadedFile) => (
                  <div
                    key={uploadedFile.id}
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-xs text-green-700 font-bold">
                          {uploadedFile.file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 font-medium">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)}MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFiles(files.filter(f => f.id !== uploadedFile.id));
                        setFileErrors(fileErrors.filter(e => e.filename !== uploadedFile.file.name));
                      }}
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>ℹ️ Note:</strong> Your complaint will be registered immediately and assigned a unique ID. 
              You will receive updates via SMS and can track the status using your complaint ID.
            </p>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-3">
            <TouchButton
              variant="secondary"
              size="medium"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              {t('cancel')}
            </TouchButton>
            
            <TouchButton
              variant="primary"
              size="medium"
              onClick={handleSubmit}
              className="flex-1"
            >
              Submit Complaint
            </TouchButton>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
