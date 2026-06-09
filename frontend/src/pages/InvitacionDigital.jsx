import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function InvitacionDigital() {
  const { codigoQR } = useParams();
  const [pase, setPase] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get(`/api/pases/publico/${codigoQR}`);
        setPase(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar el pase');
      }
    };
    cargar();
  }, [codigoQR]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Pase no válido</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!pase) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-600">Cargando pase digital...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4 text-gray-900">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">{pase.acto.nombre}</h1>
        </div>
        <div className="p-6 text-center">
          <img
            src={`/api/pases/${pase.id}/qr`}
            alt="Código QR"
            className="mx-auto w-64 h-64 mb-4"
          />
          <h2 className="text-xl font-semibold">{pase.graduando}</h2>
          <p className="text-gray-600">Invitado #{pase.numeroInvitado}</p>
          {pase.nombreInvitado && (
            <p className="text-gray-800 font-medium">{pase.nombreInvitado}</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <p>
              {new Date(pase.acto.fecha).toLocaleDateString()} • {pase.acto.hora}
            </p>
            <p>{pase.acto.lugar}</p>
          </div>
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            Presenta este código QR en la entrada. Este pase es digital y solo
            puede usarse una vez.
          </div>
        </div>
      </div>
    </div>
  );
}