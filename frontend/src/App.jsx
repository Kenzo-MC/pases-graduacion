import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Scanner from './pages/Scanner';
import PasesList from './pages/PasesList';
import InvitacionDigital from './pages/InvitacionDigital';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/invitacion/:codigoQR" element={<InvitacionDigital />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/admin/pases/:actoId" element={<PrivateRoute><PasesList /></PrivateRoute>} />
          <Route path="/validar" element={<PrivateRoute><Scanner /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}