import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';

const ROLE_HOME = {
  user: '/user/dashboard',
  therapist: '/therapist/dashboard',
  admin: '/admin/dashboard',
};

/**
 * Protects routes by role.
 * - If loading: shows spinner
 * - If not authenticated: redirect to login
 * - If authenticated but wrong role: redirect to own dashboard
 * @param {{ allowedRole: string, children: React.ReactNode }} props
 */
export default function ProtectedRoute({ allowedRole, children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    const loginPath = allowedRole === 'therapist'
      ? '/therapist/login'
      : allowedRole === 'admin'
        ? '/admin/login'
        : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (user?.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[user?.role] || '/'} replace />;
  }

  return children;
}
