import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const ProtectedRoute = ({ adminOnly = false }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_superuser) return <Navigate to="/403" replace />;
  return <Outlet />;
};

export default ProtectedRoute;