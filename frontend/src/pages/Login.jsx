import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(correo, pass);
      navigate('/admin');
    } catch {
      alert('Error al iniciar sesión');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">Login Administración</h2>
        <input className="w-full border p-2 mb-3 text-gray-900" type="email" placeholder="Correo" value={correo} onChange={e => setCorreo(e.target.value)} />
        <input className="w-full border p-2 mb-3 text-gray-900" type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Ingresar</button>
      </form>
    </div>
  );
}