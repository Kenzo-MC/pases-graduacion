import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function InvitacionDigital() {
  const [searchParams] = useSearchParams();
  const codigoQR = searchParams.get('pase'); // leer el código del query string ?pase=...
  const [pase, setPase] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!codigoQR) {
      setError('No se especificó un código de pase.');
      setCargando(false);
      return;
    }
    const cargar = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/pases/publico/${codigoQR}`);
        setPase(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar el pase');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [codigoQR]);

  if (cargando) return <div className="text-center mt-10 text-gray-600">Cargando...</div>;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="bg-white p-8 rounded shadow text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Pase no válido</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4 text-center">
          <h1 className="text-xl md:text-2xl font-bold">{pase.acto.nombre}</h1>
        </div>
        <div className="p-6 text-center">
          <img
            src={`${API_URL}/api/pases/${pase.id}/qr`}
            alt="Código QR"
            className="mx-auto w-48 h-48 sm:w-64 sm:h-64 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900">{pase.graduando}</h2>
          <p className="text-gray-600">Invitado #{pase.numeroInvitado}</p>
          {pase.nombreInvitado && <p className="text-gray-800 font-medium">{pase.nombreInvitado}</p>}
          <div className="mt-4 text-sm text-gray-500">
            <p>{pase.acto.fecha.split('-').reverse().join('/')} • {pase.acto.hora}</p>
            <p>{pase.acto.lugar}</p>
          </div>
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            Presenta este código QR en la entrada. Válido para un solo uso.
          </div>
        </div>
      </div>
    </div>
  );
}