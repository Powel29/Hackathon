import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useStore } from '../store/useStore';
import { KioskLayout } from '../components/KioskLayout';
import { TouchButton } from '../components/TouchButton';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Phone
} from 'lucide-react';

export function TrackComplaint() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { complaints } = useStore();
  const [complaintId, setComplaintId] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<typeof complaints[0] | null>(null);
  const [error, setError] = useState('');
  
  const handleSearch = () => {
    const found = complaints.find(c => c.complaintId === complaintId.toUpperCase());
    
    if (found) {
      setSelectedComplaint(found);
      setError('');
    } else {
      setSelectedComplaint(null);
      setError('Complaint not found. Please check the Complaint ID.');
    }
  };
  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && complaintId.trim()) {
        e.preventDefault();
        handleSearch();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [complaintId, navigate]);  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-[#FF9800]" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-[#0066CC]" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-[#28A745]" />;
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-[#FF9800]';
      case 'in_progress':
        return 'bg-[#0066CC]';
      case 'resolved':
        return 'bg-[#28A745]';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  return (
    <KioskLayout>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF9800] bg-opacity-10 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-[#FF9800]" />
            </div>
            <h2 className="text-2xl font-bold text-[#212529]">
              {t('trackComplaint')}
            </h2>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => {
                setComplaintId(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder={t('enterComplaintId')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-base font-mono focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              maxLength={20}
            />
            <TouchButton
              variant="primary"
              size="medium"
              icon={<Search className="w-4 h-4" />}
              onClick={handleSearch}
              disabled={!complaintId}
            >
              {t('searchComplaint')}
            </TouchButton>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-[#DC3545] text-center font-semibold">
                {error}
              </p>
            </div>
          )}
        </div>
        
        {selectedComplaint && (
          <div className="grid grid-cols-3 gap-6">
            {/* Complaint Details */}
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-[#212529] mb-4">
                  {t('complaintDetails')}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('complaintId')}:</span>
                    <span className="text-sm font-bold text-[#0066CC] font-mono">
                      {selectedComplaint.complaintId}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('complaintType')}:</span>
                    <span className="text-sm font-bold text-[#212529] capitalize">
                      {t(selectedComplaint.serviceType)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('complaintStatus')}:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedComplaint.status)}
                      <span className={`${getStatusColor(selectedComplaint.status)} text-white px-3 py-1 rounded-lg text-sm font-bold capitalize`}>
                        {t(selectedComplaint.status.replace('_', ''))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700 block mb-2">{t('description')}:</span>
                    <p className="text-sm text-[#212529] bg-gray-50 p-3 rounded-lg">
                      {selectedComplaint.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{t('createdOn')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t('lastUpdated')}:</span>
                    <span className="text-sm font-bold text-[#212529]">
                      {new Date(selectedComplaint.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Technician Info */}
              {selectedComplaint.technician && (
                <div className="bg-gradient-to-r from-[#0066CC] to-[#004080] rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    {t('assignedTechnician')}
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white mb-1">
                        {selectedComplaint.technician.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-white opacity-90">
                        <Phone className="w-4 h-4" />
                        <span>{selectedComplaint.technician.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#212529] mb-4">
                {t('timeline')}
              </h3>
              
              <div className="relative">
                {selectedComplaint.timeline.map((event, index) => (
                  <div key={index} className="relative pb-6 last:pb-0">
                    {index !== selectedComplaint.timeline.length - 1 && (
                      <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    
                    <div className="flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(event.status)}`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#212529] capitalize mb-1">
                          {t(event.status.replace('_', ''))}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          {event.note}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!selectedComplaint && !error && (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Enter your Complaint ID to track status
            </p>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
