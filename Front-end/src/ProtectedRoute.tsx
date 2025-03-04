import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  useEffect(() => {
    // If not authenticated and trying to access a protected route, store the attempted path
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectPath', location.pathname);
    }
  }, [isAuthenticated, location]);

  if (!isAuthenticated) {
    // Redirect to login with the current location stored in state
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 