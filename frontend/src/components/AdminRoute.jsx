import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { token, rol } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (rol !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso denegado</h1>
          <p className="text-gray-700">Solo el administrador puede acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return children;
}