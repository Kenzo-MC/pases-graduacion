import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Usuarios() {
  const { api, rol } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: 'validador' });

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/api/auth/usuarios');
      setUsuarios(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (rol === 'admin') cargarUsuarios(); }, []);

  const crearUsuario = async () => {
  const { nombre, correo, password, rol } = form;
  if (!nombre || !correo || !password || !rol) {
    alert('Todos los campos son obligatorios (nombre, correo, contraseña, rol).');
    return;
  }
  try {
    await api.post('/api/auth/register', form);
    alert('Usuario creado');
    setForm({ nombre: '', correo: '', password: '', rol: 'validador' });
    cargarUsuarios();
  } catch (err) {
    alert('Error: ' + (err.response?.data?.error || err.message));
  }
};
const eliminarUsuario = async (id) => {
  if (!window.confirm('¿Eliminar este usuario?')) return;
  try {
    await api.delete(`/api/auth/usuarios/${id}`);
    cargarUsuarios();
    alert('Usuario eliminado');
  } catch (err) {
    alert(err.response?.data?.error || 'Error al eliminar');
  }
};

  if (rol !== 'admin') return (
    <div className="p-6 text-center text-red-600">
      Acceso restringido al administrador.
      <br />
      <button onClick={() => navigate('/admin')} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Volver al panel</button>
    </div>
  );
  
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Gestión de Usuarios</h1>
        <button onClick={() => navigate('/admin')} className="bg-gray-500 text-white px-4 py-2 rounded text-sm">Volver al panel</button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Nuevo usuario</h2>
        <div className="space-y-3">
          <input className="w-full border p-2 text-sm md:text-base" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          <input className="w-full border p-2 text-sm md:text-base" type="email" placeholder="Correo" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
          <input className="w-full border p-2 text-sm md:text-base" type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <select className="w-full border p-2 text-sm md:text-base" value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}>
            <option value="validador">Validador</option>
            <option value="admin">Administrador</option>
          </select>
          <button onClick={crearUsuario} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full sm:w-auto">Crear Usuario</button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Usuarios registrados</h2>
      <div className="space-y-2">
        {usuarios.map(u => (
  <div key={u.id} className="bg-white p-3 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
    <div>
      <p className="font-semibold text-sm md:text-base">{u.nombre}</p>
      <p className="text-xs md:text-sm text-gray-600">{u.correo}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{u.rol}</span>
      {u.correo !== 'admin@test.com' && (
        <button onClick={() => eliminarUsuario(u.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">
          Eliminar
        </button>
      )}
    </div>
  </div>
))}
      </div>
    </div>
  );
}