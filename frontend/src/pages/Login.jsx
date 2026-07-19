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
      alert('Error de inicio de sesión');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl md:text-3xl mb-6 text-center font-bold text-gray-900">Iniciar Sesión</h2>
        <input
          className="w-full border p-3 mb-3 text-sm md:text-base text-gray-900"
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
        />
        <input
          className="w-full border p-3 mb-4 text-sm md:text-base text-gray-900"
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200">
          Ingresar
        </button>
      </form>
    </div>
  );
}