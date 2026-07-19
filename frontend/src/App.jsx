import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Scanner from './pages/Scanner';
import PasesList from './pages/PasesList';
import InvitacionDigital from './pages/InvitacionDigital';
import Usuarios from './pages/Usuarios';
import AdminRoute from './components/AdminRoute';
import GraduandosPage from './pages/GraduandosPage';

// Componente para la raíz: si tiene ?pase=..., muestra la invitación; si no, redirige al login
function Home() {
  const [searchParams] = useSearchParams();
  const pase = searchParams.get('pase');
  if (pase) {
    return <InvitacionDigital />;
  }
  return <Navigate to="/login" />;
}

// Componente para rutas privadas (cualquier usuario autenticado)
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />   {/* RAÍZ: muestra invitación o redirige */}
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/admin/pases/:actoId" element={<PrivateRoute><PasesList /></PrivateRoute>} />
          <Route path="/admin/graduandos/:actoId" element={<PrivateRoute><GraduandosPage /></PrivateRoute>} />
          <Route path="/validar" element={<PrivateRoute><Scanner /></PrivateRoute>} />
          <Route path="/usuarios" element={<AdminRoute><Usuarios /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}