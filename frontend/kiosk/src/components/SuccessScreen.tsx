import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface SuccessScreenProps {
  message: string;
  onComplete?: () => void;
}

export function SuccessScreen({ message, onComplete }: SuccessScreenProps) {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-[#28A745] bg-opacity-20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-[#28A745]" />
        </div>
        <p className="text-lg font-bold text-[#28A745] text-center max-w-md">
          {message}
        </p>
      </div>
    </div>
  );
}
