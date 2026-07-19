import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function GraduandosPage() {
  const { actoId } = useParams();
  const { api, rol } = useAuth();
  const navigate = useNavigate();
  const [graduandos, setGraduandos] = useState([]);
  const [acto, setActo] = useState(null);
  const [form, setForm] = useState({ cedula: '', nombre: '', apellido: '', carrera: '', correo: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { cargarDatos(); }, [actoId]);

  const cargarDatos = async () => {
    try {
      const resActo = await api.get(`/api/actos`);
      const actoEncontrado = resActo.data.find(a => a.id === parseInt(actoId));
      setActo(actoEncontrado);
      const resGraduandos = await api.get(`/api/graduandos/acto/${actoId}`);
      setGraduandos(resGraduandos.data);
    } catch (err) {
      console.error(err);
    }
  };

  const crearGraduando = async () => {
    try {
      await api.post('/api/graduandos', { ...form, actoId });
      setForm({ cedula: '', nombre: '', apellido: '', carrera: '', correo: '' });
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear graduando');
    }
  };

  const eliminarGraduando = async (id) => {
    if (!window.confirm('¿Eliminar graduando y sus pases?')) return;
    try {
      await api.delete(`/api/graduandos/${id}`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const iniciarEdicion = (g) => {
    setEditandoId(g.id);
    setEditForm({ cedula: g.cedula, nombre: g.nombre, apellido: g.apellido, carrera: g.carrera, correo: g.correo });
  };

  const guardarEdicion = async (id) => {
    try {
      await api.put(`/api/graduandos/${id}`, editForm);
      setEditandoId(null);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Graduandos – {acto?.nombre}</h1>
          {acto && <p className="text-sm text-gray-600">{acto.fecha.split('-').reverse().join('/')} {acto.hora} - {acto.lugar}</p>}
        </div>
        <button onClick={() => navigate('/admin')} className="bg-gray-500 text-white px-4 py-2 rounded">Volver al panel</button>
      </div>

      {/* Formulario solo admin */}
      {rol === 'admin' ? (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">Nuevo graduando</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="border p-2 text-sm" placeholder="Cédula" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} />
            <input className="border p-2 text-sm" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            <input className="border p-2 text-sm" placeholder="Apellido" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
            <input className="border p-2 text-sm" placeholder="Carrera" value={form.carrera} onChange={e => setForm({...form, carrera: e.target.value})} />
            <input className="border p-2 text-sm" type="email" placeholder="Correo" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
          </div>
          <button onClick={crearGraduando} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Agregar graduando</button>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">Solo el administrador puede registrar graduandos.</p>
      )}

      <h2 className="text-xl font-semibold mb-3">Lista de graduandos ({graduandos.length})</h2>
      <div className="space-y-3">
        {graduandos.map(g => (
          <div key={g.id} className="bg-white p-4 rounded shadow">
            {editandoId === g.id ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className="border p-1 text-sm" value={editForm.cedula} onChange={e => setEditForm({...editForm, cedula: e.target.value})} />
                <input className="border p-1 text-sm" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} />
                <input className="border p-1 text-sm" value={editForm.apellido} onChange={e => setEditForm({...editForm, apellido: e.target.value})} />
                <input className="border p-1 text-sm" value={editForm.carrera} onChange={e => setEditForm({...editForm, carrera: e.target.value})} />
                <input className="border p-1 text-sm" value={editForm.correo} onChange={e => setEditForm({...editForm, correo: e.target.value})} />
                <div className="flex gap-2 col-span-full mt-2">
                  <button onClick={() => guardarEdicion(g.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Guardar</button>
                  <button onClick={() => setEditandoId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="font-semibold">{g.nombre} {g.apellido}</p>
                  <p className="text-sm text-gray-700">C.I: {g.cedula} | Carrera: {g.carrera}</p>
                  <p className="text-sm text-gray-600">{g.correo}</p>
                </div>
                {rol === 'admin' ? (
                  <div className="flex gap-2">
                    <button onClick={() => iniciarEdicion(g)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Editar</button>
                    <button onClick={() => eliminarGraduando(g.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Eliminar</button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic">Solo el admin puede modificar</span>
                )}
              </div>
            )}
          </div>
        ))}
        {graduandos.length === 0 && <p className="text-gray-500 text-center">No hay graduandos registrados.</p>}
      </div>
    </div>
  );
}