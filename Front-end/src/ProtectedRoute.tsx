import { Navigate, useLocation } from 'react-router-dom';
import { ReactElement } from 'react';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const isHistoryAuthenticated = localStorage.getItem('isHistoryAuthenticated') === 'true';
  const isHistoryPage = location.pathname === '/history';

  if (isHistoryPage) {
    // For history page, require history authentication
    if (!isHistoryAuthenticated) {
      return <Navigate to="/login/history" replace state={{ from: location }} />;
    }
  } else {
    // For other protected pages, require main authentication
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  return children;
};

export default ProtectedRoute; 