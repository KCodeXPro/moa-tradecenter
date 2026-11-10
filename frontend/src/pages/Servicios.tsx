import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 🔥 Añadido
import axios from 'axios';
import ServicioCard from '../components/ServicioCard';
import ModalServicio from '../components/ModalServicio';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Servicio {
  _id: string;
  vendedorId?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId?: string;
  createdAt?: string;
  whatsapp?: string;
  telefono?: string;
  direccion?: string;
  horario?: string;
  esDomicilio?: boolean;
  menu?: { item: string; precio: number }[];
  esDivisa?: boolean;
}

interface Categoria {
  _id: string;
  nombre: string;
  tipo: string;
  icono: string;
}

interface VendedorMap {
  [id: string]: string;
}

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [vendedores, setVendedores] = useState<VendedorMap>({});
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [busquedaVendedor, setBusquedaVendedor] = useState('');
  const [filtroOrden, setFiltroOrden] = useState('recientes');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // 🔥 LEER PARÁMETRO DE LA URL
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const vendedorIdFiltro = searchParams.get('vendedorId');

  const cargarServicios = async (pageNumber: number) => {
    if (pageNumber === 1) setCargando(true);
    else setCargandoMas(true);

    try {
      const url = vendedorIdFiltro 
        ? `${API_URL}/servicios?vendedorId=${vendedorIdFiltro}` 
        : `${API_URL}/servicios?page=${pageNumber}&limit=10`;
      
      const resServ = await axios.get(url);

      if (vendedorIdFiltro) {
        setServicios(resServ.data);
        setHasMore(false);
      } else {
        const { data, totalPages } = resServ.data;
        if (pageNumber === 1) {
          setServicios(data);
        } else {
          setServicios(prev => [...prev, ...data]);
        }
        setHasMore(pageNumber < totalPages);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los servicios.');
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/categorias?tipo=servicio`),
      axios.get(`${API_URL}/usuarios`)
    ]).then(([resCat, resUsu]) => {
      const catData = Array.isArray(resCat.data) ? resCat.data : [];
      setCategorias([...catData].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')));

      const usuData = Array.isArray(resUsu.data) ? resUsu.data : [];
      const vendedoresMap: VendedorMap = {};
      usuData.forEach((u: any) => { if (u._id && u.nick) vendedoresMap[u._id] = u.nick; });
      setVendedores(vendedoresMap);

      cargarServicios(1);
    }).catch((err) => {
      console.error(err);
      setError('No se pudieron cargar los datos.');
      setCargando(false);
    });
  }, [vendedorIdFiltro]);

  const serviciosFiltrados = useMemo(() => {
    let result = [...servicios];
    result = result.filter(s => !s.esDivisa);

    if (busqueda) result = result.filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    if (busquedaVendedor) {
      const termino = busquedaVendedor.toLowerCase();
      result = result.filter(s => {
        const nickVendedor = vendedores[s.vendedorId || ''] || '';
        return nickVendedor.toLowerCase().includes(termino);
      });
    }
    if (filtroCategoria !== 'todas') result = result.filter(s => s.categoriaId === filtroCategoria);

    if (filtroOrden === 'recientes') result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    else if (filtroOrden === 'precio-asc') result.sort((a, b) => a.precio - b.precio);
    else if (filtroOrden === 'precio-desc') result.sort((a, b) => b.precio - a.precio);

    return result;
  }, [servicios, busqueda, busquedaVendedor, vendedores, filtroOrden, filtroCategoria]);

  if (cargando) return <div className="text-center py-12 text-[#6B6B6B]">Cargando servicios...</div>;
  if (error) return <div className="text-center py-12 text-[#B83A2E]">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pt-24">
      <style>{`
        .scroll-azul::-webkit-scrollbar { width: 6px; }
        .scroll-azul::-webkit-scrollbar-track { background: transparent; }
        .scroll-azul::-webkit-scrollbar-thumb { background-color: rgba(46, 107, 138, 0.3); border-radius: 10px; }
        .scroll-azul::-webkit-scrollbar-thumb:hover { background-color: rgba(46, 107, 138, 0.8); }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[256px_minmax(0,1fr)] gap-8 items-stretch">
          
          <aside className="w-full hidden md:block h-full">
            <div className="sticky top-24 pb-6">
              <div className="max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-4 space-y-6 scroll-azul">
              
              <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                <h3 className="font-bold text-[#2C2C2C] mb-4">Búsqueda</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Buscar servicio..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] focus:ring-1 focus:ring-[#2E6B8A] outline-none transition-all" />
                  <input type="text" placeholder="Filtrar por vendedor (nick)..." value={busquedaVendedor} onChange={e => setBusquedaVendedor(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] focus:ring-1 focus:ring-[#2E6B8A] outline-none transition-all" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                <h3 className="font-bold text-[#2C2C2C] mb-4">Categorías</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scroll-azul">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#6B6B6B]">
                    <input type="radio" name="catServ" value="todas" checked={filtroCategoria === 'todas'} onChange={() => setFiltroCategoria('todas')} className="accent-[#2E6B8A]" />
                    Todas
                  </label>
                  {categorias
                    .filter(cat => !cat.nombre.toLowerCase().includes('domicilio'))
                    .map(cat => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer text-sm text-[#6B6B6B]">
                      <input type="radio" name="catServ" value={cat._id} checked={filtroCategoria === cat._id} onChange={() => setFiltroCategoria(cat._id)} className="accent-[#2E6B8A]" />
                      {cat.icono} {cat.nombre}
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                <h3 className="font-bold text-[#2C2C2C] mb-4">Ordenar por</h3>
                <select value={filtroOrden} onChange={e => setFiltroOrden(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] outline-none bg-[#F9FAFB]">
                  <option value="recientes">Más recientes</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                </select>
              </div>
              </div>
            </div>
          </aside>

          <div className="w-full min-w-0 pb-8">
            <div className="flex flex-col items-center justify-center text-center mb-10">
              <h2 className="text-3xl font-extrabold text-[#2C2C2C] mb-2 tracking-tight">Servicios en Moa</h2>
              
              {/* 🔥 AVISO DE FILTRO POR VENDEDOR */}
              {vendedorIdFiltro && (
                <div className="bg-[#E0F2FE] border border-[#2E6B8A]/20 px-4 py-2 rounded-full mb-4 flex items-center gap-2">
                  <span className="text-sm font-bold text-[#2E6B8A]">Mostrando servicios de un negocio específico</span>
                  <button onClick={() => navigate('/servicios')} className="text-xs bg-[#2E6B8A] text-white px-2 py-1 rounded-full font-bold hover:bg-[#1F4B61]">Ver todos</button>
                </div>
              )}

              <span className="text-sm font-bold text-[#2E6B8A] bg-[#E0F2FE] border border-[#2E6B8A]/20 px-4 py-1.5 rounded-full">
                {serviciosFiltrados.length} resultados
              </span>
            </div>

            {serviciosFiltrados.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-[#D9D4CC] p-12 text-center w-full min-h-[60vh] shadow-sm">
                <p className="text-[#6B6B6B] text-lg mb-4">No se encontraron servicios con estos filtros.</p>
                <button onClick={() => { setBusqueda(''); setBusquedaVendedor(''); setFiltroCategoria('todas'); if (vendedorIdFiltro) navigate('/servicios'); }} className="bg-[#2E6B8A] text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-[#1F4B61] transition-colors">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {serviciosFiltrados.map(serv => (
                  <ServicioCard key={serv._id} servicio={serv} onSelect={(s) => setServicioSeleccionado(s)} />
                ))}
              </div>
            )}

            {hasMore && !vendedorIdFiltro && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    cargarServicios(nextPage);
                  }}
                  disabled={cargandoMas}
                  className="bg-white text-[#2E6B8A] border border-[#D9D4CC] px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {cargandoMas ? 'Cargando más...' : 'Cargar más servicios'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ModalServicio 
        servicio={servicioSeleccionado} 
        onClose={() => setServicioSeleccionado(null)} 
        vistaInicial="contacto"
      />
    </div>
  );
}