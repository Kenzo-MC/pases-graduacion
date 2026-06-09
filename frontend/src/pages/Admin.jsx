import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';   // ← Importante

export default function Admin() {
  const { api, logout } = useAuth();
  const navigate = useNavigate();                  // ← Agregado
  const [actos, setActos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    fecha: '',
    hora: '',
    lugar: '',
    aforoMaximo: '',
    invitadosPorGraduando: ''
  });
  const [selectedActo, setSelectedActo] = useState('');
  const [file, setFile] = useState(null);

  const cargarActos = async () => {
    const res = await api.get('/api/actos');
    setActos(res.data);
  };

  useEffect(() => {
    cargarActos();
  }, []);

  const crearActo = async () => {
    try {
      await api.post('/api/actos', form);
      cargarActos();
      alert('Acto creado con éxito');
    } catch (error) {
      console.error(error);
      alert('Error al crear acto: ' + (error.response?.data?.error || error.message));
    }
  };

  const subirCSV = async () => {
    if (!file || !selectedActo) return alert('Selecciona acto y archivo');
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post(`/api/graduandos/upload/${selectedActo}`, fd);
      alert('Graduandos cargados');
      setFile(null);
    } catch (error) {
      alert('Error al subir CSV: ' + (error.response?.data?.error || error.message));
    }
  };

  const generarPases = async () => {
    if (!selectedActo) return;
    const res = await api.post(`/api/pases/generar/${selectedActo}`);
    alert(res.data.message);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Panel Administrador</h1>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Salir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crear Acto */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Crear Acto</h2>
          <input className="w-full border p-2 mb-2 text-gray-900" placeholder="Nombre" onChange={e => setForm({ ...form, nombre: e.target.value })} />
          <input className="w-full border p-2 mb-2 text-gray-900" type="date" onChange={e => setForm({ ...form, fecha: e.target.value })} />
          <input className="w-full border p-2 mb-2 text-gray-900" type="time" onChange={e => setForm({ ...form, hora: e.target.value })} />
          <input className="w-full border p-2 mb-2 text-gray-900" placeholder="Lugar" onChange={e => setForm({ ...form, lugar: e.target.value })} />
          <input className="w-full border p-2 mb-2 text-gray-900" type="number" placeholder="Aforo máximo" onChange={e => setForm({ ...form, aforoMaximo: e.target.value })} />
          <input className="w-full border p-2 mb-2 text-gray-900" type="number" placeholder="Invitados por graduando" onChange={e => setForm({ ...form, invitadosPorGraduando: e.target.value })} />
          <button onClick={crearActo} className="bg-blue-600 text-white px-4 py-2 rounded">
            Crear Acto
          </button>
        </div>

        {/* Acciones sobre Acto */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Acciones sobre Acto</h2>
          <select
            className="w-full border p-2 mb-3 text-gray-900"
            value={selectedActo}
            onChange={e => setSelectedActo(e.target.value)}
          >
            <option value="">Selecciona un acto</option>
            {actos.map(a => (
              <option key={a.id} value={a.id}>
                {a.nombre} - {new Date(a.fecha).toLocaleDateString()}
              </option>
            ))}
          </select>
          <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="mb-3" />
          <div className="flex flex-wrap gap-2">
            <button onClick={subirCSV} className="bg-green-600 text-white px-4 py-2 rounded">
              Subir CSV
            </button>
            <button onClick={generarPases} className="bg-purple-600 text-white px-4 py-2 rounded">
              Generar Pases
            </button>
            <button
              onClick={() => {
                if (selectedActo) navigate(`/admin/pases/${selectedActo}`);
                else alert('Selecciona un acto primero');
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Ver Pases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}