import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { AlertTriangle } from 'lucide-react';
import { TouchButton } from './TouchButton';

export function SessionWarning() {
  const { t } = useTranslation();
  const { setShowSessionWarning, resetSession } = useStore();
  
  const handleContinue = () => {
    setShowSessionWarning(false);
  };
  
  const handleLogout = () => {
    resetSession();
    window.location.href = '/';
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#FF9800] bg-opacity-20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-[#FF9800]" />
          </div>
          
          <h2 className="text-xl font-bold text-[#212529] text-center">
            {t('sessionWarning')}
          </h2>
          
          <p className="text-sm text-gray-600 text-center">
            {t('sessionWarningMessage')}
          </p>
          
          <div className="flex gap-3 mt-4 w-full">
            <TouchButton
              variant="secondary"
              size="medium"
              onClick={handleLogout}
              className="flex-1"
            >
              {t('logout')}
            </TouchButton>
            
            <TouchButton
              variant="primary"
              size="medium"
              onClick={handleContinue}
              className="flex-1"
            >
              {t('extendSession')}
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  );
}