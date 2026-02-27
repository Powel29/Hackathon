import { useEffect } from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { useNavigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useKioskStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/nextgen-seva/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) return null;
  return children;
}
