import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 🔥 Añadido
import axios from 'axios';
import { Link } from 'react-router-dom';
import ModalServicio from '../components/ModalServicio';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Divisa {
  _id: string;
  vendedorId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  whatsapp?: string;
}

export default function VentaDivisas() {
  const [divisas, setDivisas] = useState<Divisa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [divisaSeleccionada, setDivisaSeleccionada] = useState<Divisa | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [filtroOrden, setFiltroOrden] = useState('recientes');

  // 🔥 LEER PARÁMETRO DE LA URL
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const vendedorIdFiltro = searchParams.get('vendedorId');

  const cargarDivisas = async (pageNumber: number) => {
    if (pageNumber === 1) setCargando(true);
    else setCargandoMas(true);

    try {
      const url = vendedorIdFiltro
        ? `${API_URL}/servicios/divisas?vendedorId=${vendedorIdFiltro}` // Asumiendo que el backend lo soporta
        : `${API_URL}/servicios/divisas?page=${pageNumber}&limit=10`;
      
      const res = await axios.get(url);
      
      if (vendedorIdFiltro) {
        // Si el backend devuelve un array al filtrar por vendedor
        setDivisas(res.data);
        setHasMore(false);
      } else {
        const { data, totalPages } = res.data;
        if (pageNumber === 1) setDivisas(data);
        else setDivisas(prev => [...prev, ...data]);
        setHasMore(pageNumber < totalPages);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las ofertas de divisas.');
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    cargarDivisas(1);
  }, [vendedorIdFiltro]);

  const divisasFiltradas = useMemo(() => {
    let result = [...divisas];

    if (busqueda) {
      result = result.filter(d => d.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    }

    if (filtroOrden === 'recientes') {
      // Ya vienen ordenadas
    } else if (filtroOrden === 'precio-asc') {
      result.sort((a, b) => a.precio - b.precio);
    } else if (filtroOrden === 'precio-desc') {
      result.sort((a, b) => b.precio - a.precio);
    }

    return result;
  }, [divisas, busqueda, filtroOrden]);

  if (cargando) return <div className="text-center py-24 text-[#6B6B6B]">Cargando ofertas de divisas...</div>;
  if (error) return <div className="text-center py-24 text-[#B83A2E]">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[256px_minmax(0,1fr)] gap-8 items-stretch">
          
          <aside className="w-full hidden md:block h-full">
            <div className="sticky top-24 pb-6">
              <div className="max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-4 space-y-6">
                
                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Búsqueda</h3>
                  <input 
                    type="text" 
                    placeholder="Buscar divisa (ej. USD)..." 
                    value={busqueda} 
                    onChange={e => setBusqueda(e.target.value)} 
                    className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59] outline-none transition-all" 
                  />
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Ordenar por</h3>
                  <select 
                    value={filtroOrden} 
                    onChange={e => setFiltroOrden(e.target.value)} 
                    className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#4A7C59] outline-none bg-[#F9FAFB]"
                  >
                    <option value="recientes">Más recientes</option>
                    <option value="precio-asc">Precio: menor a mayor</option>
                    <option value="precio-desc">Precio: mayor a menor</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="w-full min-w-0 pb-8">
            <div className="text-center mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-[#4A7C59] text-sm font-bold tracking-wider mb-4 shadow-sm">
                💵 Mercado de Divisas
              </span>
              <h1 className="text-4xl font-extrabold text-[#2C2C2C] mb-4">Compra y Venta de Divisas</h1>
              
              {/* 🔥 AVISO DE FILTRO POR VENDEDOR */}
              {vendedorIdFiltro && (
                <div className="bg-[#E8F5EC] border border-[#4A7C59]/20 px-4 py-2 rounded-full mb-4 inline-flex items-center gap-2">
                  <span className="text-sm font-bold text-[#4A7C59]">Mostrando divisas de un negocio específico</span>
                  <button onClick={() => navigate('/divisas')} className="text-xs bg-[#4A7C59] text-white px-2 py-1 rounded-full font-bold hover:bg-[#355A40]">Ver todas</button>
                </div>
              )}

              <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
                Encuentra las mejores ofertas de MLC, USD, EUR y otras monedas en Moa. Contacta directamente con el vendedor por WhatsApp.
              </p>
            </div>

            {divisasFiltradas.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-[#D9D4CC] p-12 text-center shadow-sm">
                <p className="text-[#6B6B6B] text-lg mb-4">No hay ofertas de divisas que coincidan con tu búsqueda.</p>
                <button onClick={() => { setBusqueda(''); setFiltroOrden('recientes'); if (vendedorIdFiltro) navigate('/divisas'); }} className="bg-[#4A7C59] text-white px-6 py-3 rounded-[10px] font-bold hover:bg-[#355A40] transition-colors">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {divisasFiltradas.map((divisa) => (
                  <div 
                    key={divisa._id} 
                    className="bg-white rounded-[20px] border border-[#D9D4CC] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group w-full"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#4A7C59]/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-[#E8F5EC] flex items-center justify-center text-xl">💵</div>
                          <h3 className="font-extrabold text-2xl text-[#2C2C2C] uppercase">{divisa.nombre}</h3>
                        </div>
                        <span className="bg-[#E8F5EC] text-[#4A7C59] px-2.5 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wider">Divisa</span>
                      </div>
                      <p className="text-sm text-[#6B6B6B] mt-2 line-clamp-2 min-h-[40px]">{divisa.descripcion}</p>
                    </div>

                    <div className="mt-auto p-6 pt-0">
                      <div className="bg-[#FAFAFA] rounded-[12px] p-4 border border-[#E5E7EB] mb-4">
                        <p className="text-xs text-[#6B6B6B] font-bold uppercase tracking-wider mb-1">Precio de Venta</p>
                        <p className="font-extrabold text-3xl text-[#A63A2B]">${(divisa.precio / 100).toFixed(2)} <span className="text-sm text-[#6B6B6B] font-bold">CUP</span></p>
                      </div>
                      <button onClick={() => setDivisaSeleccionada(divisa)} className="w-full inline-flex items-center justify-center gap-2 bg-[#4A7C59] text-white px-4 py-3 rounded-[10px] font-bold hover:bg-[#355A40] transition-colors shadow-sm">
                        💬 Enviar mensaje por WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasMore && !vendedorIdFiltro && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => { const nextPage = page + 1; setPage(nextPage); cargarDivisas(nextPage); }}
                  disabled={cargandoMas}
                  className="bg-white text-[#4A7C59] border border-[#D9D4CC] px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {cargandoMas ? 'Cargando más...' : 'Cargar más divisas'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {divisaSeleccionada && (
        <ModalServicio 
          servicio={divisaSeleccionada as any} 
          onClose={() => setDivisaSeleccionada(null)} 
          tema="verde"
          vistaInicial="contacto"
        />
      )}
    </div>
  );
}