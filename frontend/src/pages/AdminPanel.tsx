import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GestorDirecciones from '../components/GestorDirecciones';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface DashboardData {
  totalUsuarios: number;
  totalProductos: number;
  totalServicios: number;
  totalDomicilios: number;
}

interface Vendedor {
  _id: string;
  nick: string;
  rol: string;
  tipoVenta: string;
  estado: string;
  whatsapp?: string;
}

interface Categoria {
  _id: string;
  tipo: string;
  nombre: string;
  icono: string;
  orden: number;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [topConsultados, setTopConsultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [nuevoTipo, setNuevoTipo] = useState('producto');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoIcono, setNuevoIcono] = useState('📦');
  const [nuevoOrden, setNuevoOrden] = useState('1');
  const [creandoCat, setCreandoCat] = useState(false);

  const headers = { 'x-admin-role': 'admin', 'x-admin-token': 'moa' };

  useEffect(() => {
    const saved = localStorage.getItem('moa_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user.rol !== 'admin') {
        alert('Acceso denegado. Solo administradores.');
        navigate('/moa');
        return;
      }
      // 🔥 AVISAMOS A APP.TSX QUE EL USUARIO ESTÁ LOGUEADO
      window.dispatchEvent(new Event('moa_login'));
    } else {
      navigate('/moa');
      return;
    }
    cargarDatos();
  }, [navigate]);

      const cargarDatos = () => {
    Promise.all([
      axios.get(`${API_URL}/admin/dashboard`, { headers }),
      axios.get(`${API_URL}/admin/vendedores`, { headers }),
      axios.get(`${API_URL}/categorias`),
      axios.get(`${API_URL}/eventos/mas-consultados`, { headers })
    ])
    .then(([resDashboard, resVendedores, resCategorias, resTopConsultados]) => {
      setStats(resDashboard.data);
      // Parche para evitar que falle si no es un array
      setVendedores(Array.isArray(resVendedores.data) ? resVendedores.data : []);
      setCategorias(Array.isArray(resCategorias.data) ? resCategorias.data : []);
      setTopConsultados(Array.isArray(resTopConsultados.data) ? resTopConsultados.data : []);
      setCargando(false);
    })
    .catch((err) => {
      console.error("Error cargando datos:", err);
      setError('Error al cargar los datos del panel. Revisa la consola (F12).');
      setCargando(false);
    });
  };

  const toggleSuspension = async (id: string, estadoActual: string) => {
    try {
      const endpoint = estadoActual === 'activo' ? 'suspender' : 'reactivar';
      await axios.patch(`${API_URL}/admin/vendedores/${id}/${endpoint}`, {}, { headers });
      setVendedores(prev => prev.map(v => 
        v._id === id ? { ...v, estado: estadoActual === 'activo' ? 'suspendido' : 'activo' } : v
      ));
    } catch (err) {
      console.error(err);
      alert('Error al cambiar el estado del vendedor.');
    }
  };

  const eliminarVendedor = async (id: string, nick: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar permanentemente a "${nick}"? Esta acción no se puede deshacer.`)) return;
    
    try {
      await axios.delete(`${API_URL}/usuarios/${id}`, { headers });
      setVendedores(prev => prev.filter(v => v._id !== id));
      alert('Usuario eliminado correctamente.');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el usuario.');
    }
  };

  const crearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreandoCat(true);
    try {
      await axios.post(`${API_URL}/categorias`, {
        tipo: nuevoTipo,
        nombre: nuevoNombre,
        icono: nuevoIcono,
        orden: parseInt(nuevoOrden)
      }, { headers });
      
      const res = await axios.get(`${API_URL}/categorias`);
      setCategorias(res.data);
      
      setNuevoNombre('');
      setNuevoIcono('📦');
      setNuevoOrden('1');
      alert('Categoría creada correctamente.');
    } catch (err) {
      console.error(err);
      alert('Error al crear la categoría. Verifica que el nombre no esté duplicado.');
    } finally {
      setCreandoCat(false);
    }
  };

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados pasarán a "Sin categoría".')) return;
    try {
      await axios.delete(`${API_URL}/categorias/${id}`, { headers });
      setCategorias(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la categoría.');
    }
  };

  if (cargando) return <div className="text-center py-12 text-[#6B6B6B]">Cargando panel...</div>;
  if (error) return <div className="text-center py-12 text-[#B83A2E]">{error}</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C2C2C]">Panel de Administración</h1>
          <p className="text-[#6B6B6B]">Control total de Moa Tradecenter.</p>
        </div>
        {/* EL BOTÓN DE CERRAR SESIÓN HA SIDO ELIMINADO */}
      </div>

      {/* Métricas */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[14px] border border-[#D9D4CC] shadow-sm">
            <p className="text-sm text-[#6B6B6B] font-semibold mb-1">Usuarios</p>
            <p className="text-3xl font-extrabold text-[#2C2C2C]">{stats.totalUsuarios}</p>
          </div>
          <div className="bg-white p-5 rounded-[14px] border border-[#D9D4CC] shadow-sm">
            <p className="text-sm text-[#6B6B6B] font-semibold mb-1">Productos</p>
            <p className="text-3xl font-extrabold text-[#A63A2B]">{stats.totalProductos}</p>
          </div>
          <div className="bg-white p-5 rounded-[14px] border border-[#D9D4CC] shadow-sm">
            <p className="text-sm text-[#6B6B6B] font-semibold mb-1">Servicios</p>
            <p className="text-3xl font-extrabold text-[#4A7C59]">{stats.totalServicios}</p>
          </div>
          <div className="bg-white p-5 rounded-[14px] border border-[#D9D4CC] shadow-sm">
            <p className="text-sm text-[#6B6B6B] font-semibold mb-1">Domicilios</p>
            <p className="text-3xl font-extrabold text-[#2E6B8A]">{stats.totalDomicilios}</p>
          </div>
        </div>
      )}

      {/* Top Productos más consultados */}
      <div className="bg-white rounded-[14px] border border-[#D9D4CC] shadow-sm overflow-hidden mt-8">
        <div className="p-4 border-b border-[#D9D4CC] bg-gray-50">
          <h2 className="font-bold text-[#2C2C2C]">Productos más consultados (Top 5)</h2>
        </div>
        <div className="p-4">
          {topConsultados.length === 0 ? (
            <p className="text-sm text-[#6B6B6B]">Aún no hay datos de consultas.</p>
          ) : (
            <ul className="space-y-3">
              {topConsultados.map((item, index) => (
                <li key={index} className="flex justify-between items-center border-b border-[#D9D4CC] pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-[#A63A2B]">#{index + 1}</span>
                    <span className="text-sm font-medium text-[#2C2C2C]">Producto: {item.nombre ?? "Producto eliminado"}</span>
                  </div>
                  <span className="text-sm font-bold text-[#4A7C59]">{item.total} clics</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Gestión de Vendedores */}
      <div className="bg-white rounded-[14px] border border-[#D9D4CC] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#D9D4CC] bg-gray-50">
          <h2 className="font-bold text-[#2C2C2C]">Gestión de Vendedores</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white text-[#6B6B6B] text-sm uppercase tracking-wider border-b border-[#D9D4CC]">
                <th className="p-4 font-bold">Nick</th>
                <th className="p-4 font-bold">Tipo</th>
                <th className="p-4 font-bold">WhatsApp</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((v) => (
                <tr key={v._id} className="border-b border-[#D9D4CC] hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-[#2C2C2C]">{v.nick}</td>
                  <td className="p-4 text-sm font-medium text-[#6B6B6B]">
                    {v.tipoVenta === 'ambos' ? 'Vendedor' : 
                     v.tipoVenta === 'productos' ? 'Productos' : 
                     v.tipoVenta === 'servicios' ? 'Servicios' : (v.tipoVenta || '-')}
                  </td>
                  <td className="p-4 text-sm font-medium text-[#2E6B8A]">
                    {v.whatsapp ? (
                      <a href={`https://wa.me/${v.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {v.whatsapp}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="p-4">
                    <span className={`text-[0.7rem] font-bold px-2 py-1 rounded-full ${v.estado === 'activo' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                      {v.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleSuspension(v._id, v.estado)} className={`text-sm font-bold hover:underline ${v.estado === 'activo' ? 'text-[#B83A2E]' : 'text-[#4A7C59]'}`}>
                        {v.estado === 'activo' ? 'Suspender' : 'Reactivar'}
                      </button>
                      <button onClick={() => eliminarVendedor(v._id, v.nick)} className="text-sm font-bold text-red-600 hover:text-red-800 hover:underline">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gestión de Categorías */}
      <div className="bg-white rounded-[14px] border border-[#D9D4CC] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#D9D4CC] bg-gray-50">
          <h2 className="font-bold text-[#2C2C2C]">Gestión de Categorías</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="font-bold text-[#2C2C2C] mb-4">Nueva Categoría</h3>
            <form onSubmit={crearCategoria} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Tipo</label>
                <select value={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm outline-none focus:border-[#A63A2B]">
                  <option value="producto">Producto</option>
                  <option value="servicio">Servicio</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Nombre</label>
                <input required type="text" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Ej: Ropa" className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm outline-none focus:border-[#A63A2B]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Icono</label>
                  <input required type="text" value={nuevoIcono} onChange={e => setNuevoIcono(e.target.value)} placeholder="👕" className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm outline-none focus:border-[#A63A2B]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Orden</label>
                  <input required type="number" value={nuevoOrden} onChange={e => setNuevoOrden(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm outline-none focus:border-[#A63A2B]" />
                </div>
              </div>
              <button disabled={creandoCat} type="submit" className="w-full bg-[#A63A2B] hover:bg-[#7A2A1F] text-white py-2.5 rounded-[8px] font-bold text-sm transition-colors disabled:opacity-50 mt-2">
                {creandoCat ? 'Creando...' : 'Crear Categoría'}
              </button>
            </form>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-bold text-[#2C2C2C] mb-4">Categorías Existentes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categorias.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between bg-white border border-[#D9D4CC] rounded-[8px] p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icono}</span>
                    <div>
                      <p className="font-bold text-sm text-[#2C2C2C]">{cat.nombre}</p>
                      <p className="text-xs text-[#6B6B6B] capitalize">{cat.tipo}</p>
                    </div>
                  </div>
                  <button onClick={() => eliminarCategoria(cat._id)} className="text-[#B83A2E] hover:bg-red-50 hover:text-red-700 text-sm font-bold p-2 rounded-full transition-colors">
                    ✕
                  </button>
                </div>
              ))}
              {categorias.length === 0 && <p className="text-sm text-[#6B6B6B]">No hay categorías creadas.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de Direcciones */}
      <GestorDirecciones />
    </div>
  );
}