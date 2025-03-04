import { Navigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    // Save the attempted location
    sessionStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 