import { useEffect, useState, useMemo } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [busquedaVendedor, setBusquedaVendedor] = useState('');
  const [filtroOrden, setFiltroOrden] = useState('recientes');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/servicios`),
      axios.get(`${API_URL}/categorias?tipo=servicio`),
      axios.get(`${API_URL}/usuarios`)
    ])
      .then(([resServ, resCat, resUsu]) => {
        // 🔥 PARCHE: Aseguramos que todo sean arrays
        const servData = Array.isArray(resServ.data) ? resServ.data : [];
        const catData = Array.isArray(resCat.data) ? resCat.data : [];
        const usuData = Array.isArray(resUsu.data) ? resUsu.data : [];

        setServicios(servData);

        const categoriasOrdenadas = [...catData].sort((a: Categoria, b: Categoria) => 
          (a.nombre || '').localeCompare(b.nombre || '')
        );
        setCategorias(categoriasOrdenadas);

        const vendedoresMap: VendedorMap = {};
        usuData.forEach((u: any) => {
          if (u._id && u.nick) {
            vendedoresMap[u._id] = u.nick;
          }
        });
        setVendedores(vendedoresMap);

        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar los datos.');
        setCargando(false);
      });
  }, []);

  const serviciosFiltrados = useMemo(() => {
    let result = [...servicios];

    // Filtro reforzado para excluir divisas y domicilios
    const categoriaDomicilio = categorias.find(c => 
      c.nombre.toLowerCase().includes('domicilio')
    );

    result = result.filter(s => {
      if (s.esDivisa) return false;
      if (s.esDomicilio) return false;
      const nombreOdesc = (s.nombre + ' ' + s.descripcion).toLowerCase();
      if (nombreOdesc.includes('domicilio')) return false;
      if (categoriaDomicilio && s.categoriaId === categoriaDomicilio._id) return false;
      return true;
    });

    if (busqueda) {
      result = result.filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    }

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
  }, [servicios, categorias, busqueda, busquedaVendedor, vendedores, filtroOrden, filtroCategoria]);

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
              <span className="text-sm font-bold text-[#2E6B8A] bg-[#E0F2FE] border border-[#2E6B8A]/20 px-4 py-1.5 rounded-full">
                {serviciosFiltrados.length} resultados
              </span>
            </div>

            {serviciosFiltrados.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-[#D9D4CC] p-12 text-center w-full min-h-[60vh] shadow-sm">
                <p className="text-[#6B6B6B] text-lg mb-4">No se encontraron servicios con estos filtros.</p>
                <button onClick={() => { setBusqueda(''); setBusquedaVendedor(''); setFiltroCategoria('todas'); }} className="bg-[#2E6B8A] text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-[#1F4B61] transition-colors">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviciosFiltrados.map(serv => (
                  <ServicioCard key={serv._id} servicio={serv} onSelect={(s) => setServicioSeleccionado(s)} />
                ))}
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