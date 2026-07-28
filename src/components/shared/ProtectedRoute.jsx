import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, roles, allowedUsers }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-mil-black">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedUsers && allowedUsers.includes(user.cpf)) {
    return children;
  }
  
  if (roles && !roles.includes(user.cargo)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
}
