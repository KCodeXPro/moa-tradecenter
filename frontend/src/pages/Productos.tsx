import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ProductoCard from '../components/ProductoCard';
import ModalProducto from '../components/ModalProducto';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Producto {
  _id: string;
  vendedorId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipoVenta: string;
  tieneDomicilio: boolean;
  imagenes?: string[];
  variantes?: any[];
  categoriaId?: string;
  createdAt?: string;
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

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [vendedores, setVendedores] = useState<VendedorMap>({});
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // 🔥 Estados de paginación
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [busquedaVendedor, setBusquedaVendedor] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroOrden, setFiltroOrden] = useState('recientes');
  const [filtroDomicilio, setFiltroDomicilio] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // 🔥 Función para cargar productos (con paginación)
  const cargarProductos = async (pageNumber: number) => {
    if (pageNumber === 1) setCargando(true);
    else setCargandoMas(true);

    try {
      const resProd = await axios.get(`${API_URL}/productos?page=${pageNumber}&limit=10`);
      
      // El backend ahora devuelve un objeto { data, total, page, totalPages }
      const { data, totalPages } = resProd.data;

      if (pageNumber === 1) {
        setProductos(data);
      } else {
        setProductos(prev => [...prev, ...data]);
      }

      setHasMore(pageNumber < totalPages);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    // Cargamos los datos iniciales (categorías y vendedores)
    Promise.all([
      axios.get(`${API_URL}/categorias?tipo=producto`),
      axios.get(`${API_URL}/usuarios`)
    ]).then(([resCat, resUsu]) => {
      const catData = Array.isArray(resCat.data) ? resCat.data : [];
      setCategorias([...catData].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')));
      
      const usuData = Array.isArray(resUsu.data) ? resUsu.data : [];
      const vendedoresMap: VendedorMap = {};
      usuData.forEach((u: any) => { if (u._id && u.nick) vendedoresMap[u._id] = u.nick; });
      setVendedores(vendedoresMap);

      // Cargamos la primera página de productos
      cargarProductos(1);
    }).catch((err) => {
      console.error(err);
      setError('No se pudieron cargar los datos.');
      setCargando(false);
    });
  }, []);

  // 🔥 Filtros aplicados solo a los productos cargados (los que se ven)
  const productosFiltrados = useMemo(() => {
    let result = [...productos];
    if (busqueda) result = result.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    if (busquedaVendedor) {
      const termino = busquedaVendedor.toLowerCase();
      result = result.filter(p => {
        const nickVendedor = vendedores[p.vendedorId] || '';
        return nickVendedor.toLowerCase().includes(termino);
      });
    }
    if (filtroTipo !== 'todos') result = result.filter(p => p.tipoVenta === filtroTipo);
    if (filtroDomicilio) result = result.filter(p => p.tieneDomicilio);
    if (filtroCategoria !== 'todas') result = result.filter(p => p.categoriaId === filtroCategoria);

    if (filtroOrden === 'recientes') result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    else if (filtroOrden === 'precio-asc') result.sort((a, b) => a.precio - b.precio);
    else if (filtroOrden === 'precio-desc') result.sort((a, b) => b.precio - a.precio);

    return result;
  }, [productos, busqueda, busquedaVendedor, vendedores, filtroTipo, filtroOrden, filtroDomicilio, filtroCategoria]);

  if (cargando) return <div className="text-center py-12 text-[#6B6B6B]">Cargando productos...</div>;
  if (error) return <div className="text-center py-12 text-[#B83A2E]">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 md:grid-cols-[256px_minmax(0,1fr)] gap-8 items-stretch">
          
          <aside className="w-full hidden md:block h-full">
            <div className="sticky top-24 pb-6">
              <div className="max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-4 space-y-6">
                
                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Búsqueda</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] focus:ring-1 focus:ring-[#A63A2B] outline-none transition-all" />
                    <input type="text" placeholder="Filtrar por vendedor (nick)..." value={busquedaVendedor} onChange={e => setBusquedaVendedor(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] focus:ring-1 focus:ring-[#A63A2B] outline-none transition-all" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Categorías</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-[#6B6B6B]">
                      <input type="radio" name="cat" value="todas" checked={filtroCategoria === 'todas'} onChange={() => setFiltroCategoria('todas')} className="accent-[#A63A2B]" />
                      Todas
                    </label>
                    {categorias.map(cat => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer text-sm text-[#6B6B6B]">
                        <input type="radio" name="cat" value={cat._id} checked={filtroCategoria === cat._id} onChange={() => setFiltroCategoria(cat._id)} className="accent-[#A63A2B]" />
                        {cat.icono} {cat.nombre}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Tipo de Venta</h3>
                  <div className="space-y-2">
                    {['todos', 'minorista', 'mayorista'].map(tipo => (
                      <label key={tipo} className="flex items-center gap-2 cursor-pointer text-sm text-[#6B6B6B] capitalize">
                        <input type="radio" name="tipo" value={tipo} checked={filtroTipo === tipo} onChange={() => setFiltroTipo(tipo)} className="accent-[#A63A2B]" />
                        {tipo}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Ordenar por</h3>
                  <select value={filtroOrden} onChange={e => setFiltroOrden(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] outline-none bg-[#F9FAFB]">
                    <option value="recientes">Más recientes</option>
                    <option value="precio-asc">Precio: menor a mayor</option>
                    <option value="precio-desc">Precio: mayor a menor</option>
                  </select>
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer text-sm text-[#2C2C2C] font-semibold">
                    <input type="checkbox" checked={filtroDomicilio} onChange={e => setFiltroDomicilio(e.target.checked)} className="w-5 h-5 rounded accent-[#A63A2B]" />
                    Solo con domicilio
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <div className="w-full min-w-0 pb-8">
            <div className="flex flex-col items-center justify-center text-center mb-10">
              <h2 className="text-3xl font-extrabold text-[#2C2C2C] mb-2 tracking-tight">Productos en Moa</h2>
              <span className="text-sm font-bold text-[#A63A2B] bg-[#FEE2E2] border border-[#A63A2B]/20 px-4 py-1.5 rounded-full">
                {productosFiltrados.length} resultados
              </span>
            </div>
            
            {productosFiltrados.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-[#D9D4CC] p-12 text-center w-full min-h-[60vh] shadow-sm">
                <p className="text-[#6B6B6B] text-lg mb-4">No se encontraron productos con estos filtros.</p>
                <button onClick={() => { setBusqueda(''); setBusquedaVendedor(''); setFiltroTipo('todos'); setFiltroDomicilio(false); setFiltroCategoria('todas'); }} className="bg-[#A63A2B] text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-[#7A2A1F] transition-colors">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              // 🔥 CAMBIO: Una sola columna con espacio vertical
              <div className="space-y-4">
                {productosFiltrados.map(prod => (
                  <ProductoCard key={prod._id} producto={prod} onSelect={setProductoSeleccionado} />
                ))}
              </div>
            )}

            {/* 🔥 BOTÓN CARGAR MÁS */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    cargarProductos(nextPage);
                  }}
                  disabled={cargandoMas}
                  className="bg-white text-[#A63A2B] border border-[#D9D4CC] px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {cargandoMas ? 'Cargando más...' : 'Cargar más productos'}
                </button>
              </div>
            )}
          </div>
        </div>

        <ModalProducto producto={productoSeleccionado} onClose={() => setProductoSeleccionado(null)} />
      </div>
    </div>
  );
}