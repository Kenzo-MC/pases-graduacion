import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';

export default function Scanner() {
  const { api, logout } = useAuth();
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 });
    scanner.render(onScanSuccess, () => {});
    return () => scanner.clear();
  }, []);

  const onScanSuccess = async (decodedText) => {
    try {
      const res = await api.post('/api/validar', { codigoQR: decodedText, puerta: 'Principal' });
      setResultado(res.data);
    } catch {
      setResultado({ valido: false, mensaje: 'Error de conexión' });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto text-gray-900">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl">Validador de Pases</h1>
        <button onClick={logout} className="bg-red-500 text-white px-3 rounded">Salir</button>
      </div>
      <div id="reader" className="w-full"></div>
      {resultado && (
        <div className={`mt-4 p-4 text-white text-center rounded ${resultado.valido ? 'bg-green-600' : 'bg-red-600'}`}>
          <p className="text-xl font-bold">{resultado.mensaje}</p>
          {resultado.valido && <p>{resultado.graduando} - Invitado #{resultado.invitado}</p>}
        </div>
      )}
    </div>
  );
}