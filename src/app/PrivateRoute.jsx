import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/layout/Loading';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Verificando sua conta" />;
  }

  return currentUser ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

export default PrivateRoute;
