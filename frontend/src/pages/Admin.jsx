import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { api, logout, rol } = useAuth();
  const navigate = useNavigate();
  const [actos, setActos] = useState([]);
  const [form, setForm] = useState({
    nombre: '', fecha: '', hora: '', lugar: '', aforoMaximo: '', invitadosPorGraduando: ''
  });
  const [selectedActo, setSelectedActo] = useState('');
  const [file, setFile] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const cargarActos = async () => {
    const res = await api.get('/api/actos');
    setActos(res.data);
  };

  useEffect(() => { cargarActos(); }, []);

  const crearActo = async () => {
    try {
      await api.post('/api/actos', form);
      cargarActos();
      alert('Acto creado');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear acto');
    }
  };

  const eliminarActo = async (id) => {
    if (!window.confirm('¿Eliminar acto y todos sus pases?')) return;
    try {
      await api.delete(`/api/actos/${id}`);
      cargarActos();
      if (selectedActo == id) setSelectedActo('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const iniciarEdicion = (acto) => {
    setEditandoId(acto.id);
    setEditForm({
      nombre: acto.nombre,
      fecha: acto.fecha,
      hora: acto.hora,
      lugar: acto.lugar,
      aforoMaximo: acto.aforoMaximo,
      invitadosPorGraduando: acto.invitadosPorGraduando
    });
  };

  const guardarEdicion = async (id) => {
    try {
      await api.put(`/api/actos/${id}`, editForm);
      setEditandoId(null);
      cargarActos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const subirCSV = async () => {
  if (!file || !selectedActo) return alert('Selecciona acto y archivo');
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await api.post(`/api/graduandos/upload/${selectedActo}`, fd);
    alert(res.data.message); 
    setFile(null);
  } catch (err) {
    alert(err.response?.data?.error || 'Error al subir CSV');
  }
};

  const generarPases = async () => {
    if (!selectedActo) return;
    const res = await api.post(`/api/pases/generar/${selectedActo}`);
    alert(res.data.message);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto text-gray-900">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Panel Administrador</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/validar')} className="bg-blue-500 text-white px-4 py-2 rounded text-sm md:text-base">
            Scanner
          </button>
          {rol === 'admin' && (
            <button onClick={() => navigate('/usuarios')} className="bg-gray-500 text-white px-4 py-2 rounded text-sm md:text-base">
              Usuarios
            </button>
          )}
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded text-sm md:text-base">
            Salir
          </button>
        </div>
      </div>

      {/* Formularios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Crear acto (solo admin) */}
        {rol === 'admin' ? (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Crear Acto</h2>
            <input className="w-full border p-2 mb-2 text-sm md:text-base" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            <input className="w-full border p-2 mb-2 text-sm md:text-base" type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
            <input className="w-full border p-2 mb-2 text-sm md:text-base" type="time" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} />
            <input className="w-full border p-2 mb-2 text-sm md:text-base" placeholder="Lugar" value={form.lugar} onChange={e => setForm({...form, lugar: e.target.value})} />
            <input className="w-full border p-2 mb-2 text-sm md:text-base" type="number" placeholder="Aforo máximo" value={form.aforoMaximo} onChange={e => setForm({...form, aforoMaximo: e.target.value})} />
            <input className="w-full border p-2 mb-2 text-sm md:text-base" type="number" placeholder="Invitados por graduando" value={form.invitadosPorGraduando} onChange={e => setForm({...form, invitadosPorGraduando: e.target.value})} />
            <button onClick={crearActo} className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">Crear Acto</button>
          </div>
        ) : (
          <div className="bg-white p-4 rounded shadow flex items-center justify-center text-gray-500">
            Solo el administrador puede crear actos.
          </div>
        )}

        {/* Acciones */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Acciones sobre Acto</h2>
          <select className="w-full border p-2 mb-3 text-sm md:text-base" value={selectedActo} onChange={e => setSelectedActo(e.target.value)}>
            <option value="">Selecciona un acto</option>
            {actos.map(a => <option key={a.id} value={a.id}>{a.nombre} - {a.fecha.split('-').reverse().join('/')}</option>)}
          </select>
          <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="mb-3 text-sm" />
          <div className="flex flex-wrap gap-2">
            <button onClick={subirCSV} className="bg-green-600 text-white px-4 py-2 rounded text-sm md:text-base flex-1 sm:flex-none">Subir CSV</button>
            <button onClick={generarPases} className="bg-purple-600 text-white px-4 py-2 rounded text-sm md:text-base flex-1 sm:flex-none">Generar Pases</button>
            <button onClick={() => selectedActo ? navigate(`/admin/pases/${selectedActo}`) : alert('Selecciona acto')} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm md:text-base flex-1 sm:flex-none">Ver Pases</button>
            <button onClick={() => selectedActo ? navigate(`/admin/graduandos/${selectedActo}`) : alert('Selecciona acto')} className="bg-teal-600 text-white px-4 py-2 rounded text-sm md:text-base flex-1 sm:flex-none">Graduandos</button>
          </div>
        </div>
      </div>

      {/* Lista de actos */}
      <h2 className="text-2xl font-bold mb-4">Actos Existentes</h2>
      <div className="space-y-4">
        {actos.map(acto => (
          <div key={acto.id} className="bg-white p-4 rounded shadow">
            {editandoId === acto.id ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                <input className="border p-1 text-sm" placeholder="Nombre" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} />
                <input className="border p-1 text-sm" type="date" value={editForm.fecha} onChange={e => setEditForm({...editForm, fecha: e.target.value})} />
                <input className="border p-1 text-sm" type="time" value={editForm.hora} onChange={e => setEditForm({...editForm, hora: e.target.value})} />
                <input className="border p-1 text-sm" placeholder="Lugar" value={editForm.lugar} onChange={e => setEditForm({...editForm, lugar: e.target.value})} />
                <input className="border p-1 text-sm" type="number" placeholder="Aforo" value={editForm.aforoMaximo} onChange={e => setEditForm({...editForm, aforoMaximo: e.target.value})} />
                <input className="border p-1 text-sm" type="number" placeholder="Invitados" value={editForm.invitadosPorGraduando} onChange={e => setEditForm({...editForm, invitadosPorGraduando: e.target.value})} />
                <div className="flex gap-2 col-span-full mt-2">
                  <button onClick={() => guardarEdicion(acto.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Guardar</button>
                  <button onClick={() => setEditandoId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="font-semibold text-base md:text-lg">{acto.nombre}</p>
                  <p className="text-sm text-gray-600">{acto.fecha.split('-').reverse().join('/')} {acto.hora} - {acto.lugar}</p>
                  <p className="text-xs text-gray-500">Aforo: {acto.aforoMaximo} | Invitados: {acto.invitadosPorGraduando}</p>
                </div>
                {rol === 'admin' ? (
                  <div className="flex gap-2">
                    <button onClick={() => iniciarEdicion(acto)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Editar</button>
                    <button onClick={() => eliminarActo(acto.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Eliminar</button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Solo el admin puede editar/eliminar</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}