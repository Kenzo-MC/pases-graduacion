import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function PasesList() {
  const { actoId } = useParams();
  const { api, rol } = useAuth();   // ← obtenemos el rol
  const navigate = useNavigate();
  const [pases, setPases] = useState([]);
  const [acto, setActo] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [actoId]);

  const cargarDatos = async () => {
    try {
      const resActo = await api.get('/api/actos');
      const actoEncontrado = resActo.data.find(a => a.id === parseInt(actoId));
      setActo(actoEncontrado);

      const resPases = await api.get(`/api/pases/acto/${actoId}`);
      setPases(resPases.data);
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarPase = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este pase?')) return;
    try {
      await api.delete(`/api/pases/${id}`);
      setPases(pases.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar el pase');
    }
  };

  const iniciarEdicion = (pase) => {
    setEditandoId(pase.id);
    setNuevoNombre(pase.nombreInvitado || '');
  };

  const guardarEdicion = async (id) => {
    try {
      const res = await api.put(`/api/pases/${id}`, { nombreInvitado: nuevoNombre });
      setPases(pases.map(p => p.id === id ? res.data : p));
      setEditandoId(null);
      setNuevoNombre('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar el pase');
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevoNombre('');
  };

  const imprimir = () => window.print();

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pases – {acto?.nombre}</h1>
          {acto && (
            <p className="text-gray-600 text-sm md:text-base">
              {acto.fecha.split('-').reverse().join('/')} • {acto.hora} • {acto.lugar}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/admin')} className="bg-gray-500 text-white px-4 py-2 rounded text-sm">Volver</button>
          <button onClick={imprimir} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Imprimir</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pases.map(pase => (
          <div key={pase.id} className="border rounded-lg p-4 text-center bg-white shadow">
            <img
              src={`${API_URL}/api/pases/${pase.id}/qr`}
              alt={`QR Pase #${pase.numeroInvitado}`}
              className="mx-auto w-32 h-32 md:w-48 md:h-48"
            />
            <p className="font-semibold mt-2 text-sm md:text-base">{pase.graduando.nombre}</p>
            <p className="text-xs md:text-sm text-gray-600">Invitado #{pase.numeroInvitado}</p>

            {/* Edición del nombre (solo admin) */}
            {rol === 'admin' && editandoId === pase.id ? (
              <div className="mt-2">
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Nombre del invitado"
                  className="border p-1 rounded text-sm w-full mb-1"
                />
                <div className="flex justify-center space-x-2">
                  <button onClick={() => guardarEdicion(pase.id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Guardar</button>
                  <button onClick={cancelarEdicion} className="bg-gray-400 text-white px-2 py-1 rounded text-xs">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                {pase.nombreInvitado ? (
                  <p className="text-sm text-gray-800 font-medium">{pase.nombreInvitado}</p>
                ) : (
                  <p className="text-xs text-gray-400">Sin nombre</p>
                )}
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {/* Compartir (todos los roles) */}
                  <button
                    onClick={() => {
                      const enlace = `${window.location.origin}/#/?pase=${pase.codigoQR}`;
                      if (navigator.share) {
                        navigator.share({ title: 'Pase', url: enlace }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(enlace).then(() => alert('Enlace copiado'));
                      }
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Compartir
                  </button>

                  {/* Editar y Eliminar (solo admin) */}
                  {rol === 'admin' ? (
                    <>
                      <button onClick={() => iniciarEdicion(pase)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Editar</button>
                      <button onClick={() => eliminarPase(pase.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Eliminar</button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic self-center">Solo admin puede modificar</span>
                  )}
                </div>
              </>
            )}
            <p className="text-xs text-gray-500 mt-1">ID: {pase.codigoQR.slice(0, 8)}...</p>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          .no-print { display: none; }
          body { margin: 0; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5cm; }
          .border { border: 1px solid #000; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}