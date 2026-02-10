import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-[#0066CC] animate-spin" />
        <p className="text-lg font-semibold text-[#212529]">
          {message || t('pleaseWait')}
        </p>
      </div>
    </div>
  );
}