import { XCircle } from 'lucide-react';
import { TouchButton } from './TouchButton';
import { useTranslation } from 'react-i18next';

interface ErrorScreenProps {
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export function ErrorScreen({ message, onRetry, onGoBack }: ErrorScreenProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="w-16 h-16 bg-[#DC3545] bg-opacity-20 rounded-full flex items-center justify-center">
        <XCircle className="w-12 h-12 text-[#DC3545]" />
      </div>
      
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-[#DC3545] mb-2">{t('error')}</h2>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      
      <div className="flex gap-3">
        {onGoBack && (
          <TouchButton variant="secondary" size="medium" onClick={onGoBack}>
            {t('goBack')}
          </TouchButton>
        )}
        {onRetry && (
          <TouchButton variant="primary" size="medium" onClick={onRetry}>
            {t('retry')}
          </TouchButton>
        )}
      </div>
    </div>
  );
}
