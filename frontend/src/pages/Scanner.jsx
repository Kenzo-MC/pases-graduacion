import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Scanner() {
  const { api, logout } = useAuth();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const lastCodeRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        if (lastCodeRef.current === decodedText) return;
        lastCodeRef.current = decodedText;
        try {
          const res = await api.post('/api/validar', { codigoQR: decodedText, puerta: 'Principal' });
          setResultado(res.data);
        } catch (err) {
          setResultado({ valido: false, mensaje: 'Error de conexión' });
        }
      },
      (errorMessage) => console.log(errorMessage)
    ).catch(err => {
      setError('No se pudo acceder a la cámara. Verifica permisos y HTTPS.');
      console.error(err);
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const continuarEscaneo = () => {
    setResultado(null);
    lastCodeRef.current = null;
  };

  return (
    <div className="p-4 max-w-md mx-auto text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h1 className="text-2xl font-bold">Validador de Pases</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin')} className="bg-gray-500 text-white px-4 py-2 rounded text-sm">Volver al panel</button>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Salir</button>
        </div>
      </div>

      {error ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded text-sm">{error}</div>
      ) : (
        <div id="reader" className="w-full mx-auto border rounded overflow-hidden"></div>
      )}

      {resultado && (
        <div className="mt-4">
          <div className={`p-4 text-white text-center rounded ${resultado.valido ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="text-xl font-bold">{resultado.mensaje}</p>
            {resultado.valido && <p className="text-sm">{resultado.graduando} - Invitado #{resultado.invitado}</p>}
          </div>
          <div className="mt-3 flex justify-center">
            <button onClick={continuarEscaneo} className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
              Escanear otro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}