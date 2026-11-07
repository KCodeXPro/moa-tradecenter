import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ModalServicio from '../components/ModalServicio';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Prestador {
  _id: string;
  nick: string;
  whatsapp: string;
  tarifaDomicilio: number;
  disponible: boolean;
}

export default function Prestadores() {
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroOrden, setFiltroOrden] = useState('tarifa-asc');
  const [soloDisponibles, setSoloDisponibles] = useState(true);

  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState<any | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/usuarios/prestadores`)
      .then((res) => {
        // 🔥 PARCHE: Aseguramos que sea un array
        const data = Array.isArray(res.data) ? res.data : [];
        setPrestadores(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar los prestadores.');
        setCargando(false);
      });
  }, []);

  const prestadoresFiltrados = useMemo(() => {
    let result = [...prestadores];

    if (busqueda) {
      result = result.filter(p => p.nick.toLowerCase().includes(busqueda.toLowerCase()));
    }

    if (soloDisponibles) {
      result = result.filter(p => p.disponible);
    }

    if (filtroOrden === 'tarifa-asc') {
      result.sort((a, b) => a.tarifaDomicilio - b.tarifaDomicilio);
    } else if (filtroOrden === 'tarifa-desc') {
      result.sort((a, b) => b.tarifaDomicilio - a.tarifaDomicilio);
    } else if (filtroOrden === 'nombre') {
      result.sort((a, b) => a.nick.localeCompare(b.nick));
    }

    return result;
  }, [prestadores, busqueda, filtroOrden, soloDisponibles]);

  if (cargando) return <div className="text-center py-12 text-[#6B6B6B] bg-[#FAFAFA] min-h-screen pt-24">Cargando prestadores...</div>;
  if (error) return <div className="text-center py-12 text-[#B83A2E] bg-[#FAFAFA] min-h-screen pt-24">{error}</div>;

  const abrirModalContacto = (prestador: Prestador) => {
    setPrestadorSeleccionado({
      _id: prestador._id,
      vendedorId: prestador._id,
      nombre: `Envío con ${prestador.nick}`,
      descripcion: 'Servicio de entrega a domicilio',
      precio: prestador.tarifaDomicilio,
      whatsapp: prestador.whatsapp,
      esDomicilio: true,
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 md:grid-cols-[256px_minmax(0,1fr)] gap-8 items-stretch">
          
          <aside className="w-full hidden md:block h-full">
            <div className="sticky top-24 pb-6">
              <div className="max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-4 space-y-6">
                
                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Búsqueda</h3>
                  <input 
                    type="text" 
                    placeholder="Buscar prestador..." 
                    value={busqueda} 
                    onChange={e => setBusqueda(e.target.value)} 
                    className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none transition-all" 
                  />
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Disponibilidad</h3>
                  <label className="flex items-center gap-3 cursor-pointer text-sm text-[#2C2C2C] font-semibold">
                    <input type="checkbox" checked={soloDisponibles} onChange={e => setSoloDisponibles(e.target.checked)} className="w-5 h-5 rounded accent-[#F97316]" />
                    Solo disponibles ahora
                  </label>
                </div>

                <div className="bg-white p-5 rounded-[16px] border border-[#D9D4CC] shadow-sm">
                  <h3 className="font-bold text-[#2C2C2C] mb-4">Ordenar por</h3>
                  <select value={filtroOrden} onChange={e => setFiltroOrden(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] border border-[#D9D4CC] text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none bg-[#F9FAFB]">
                    <option value="tarifa-asc">Tarifa: menor a mayor</option>
                    <option value="tarifa-desc">Tarifa: mayor a menor</option>
                    <option value="nombre">Nombre (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="w-full min-w-0 pb-8">
            <div className="flex flex-col items-center justify-center text-center mb-10">
              <h2 className="text-3xl font-extrabold text-[#2C2C2C] mb-2 tracking-tight">Prestadores de Domicilio</h2>
              <span className="text-sm font-bold text-[#F97316] bg-[#FFEDD5] border border-[#F97316]/20 px-4 py-1.5 rounded-full">
                {prestadoresFiltrados.length} resultados
              </span>
            </div>

            {prestadoresFiltrados.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-[#D9D4CC] p-12 text-center shadow-sm">
                <p className="text-[#6B6B6B] text-lg mb-4">No hay prestadores que coincidan con la búsqueda.</p>
                <button onClick={() => { setBusqueda(''); setSoloDisponibles(true); }} className="bg-[#F97316] text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-[#EA580C] transition-colors">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {prestadoresFiltrados.map(p => (
                  <div key={p._id} className="bg-white rounded-[20px] border border-[#D9D4CC] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#F97316] text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                          {p.nick.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xl text-[#2C2C2C] group-hover:text-[#F97316] transition-colors">{p.nick}</h3>
                          <span className={`inline-flex items-center gap-1 mt-1 text-[0.65rem] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider ${p.disponible ? 'bg-[#E8F5EC] text-[#355A40]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.disponible ? 'bg-[#4A7C59]' : 'bg-[#991B1B]'}`}></span>
                            {p.disponible ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-[#2C2C2C] transition-colors duration-300 group-hover:text-[#F97316]">${(p.tarifaDomicilio / 100).toFixed(2)}</p>
                        <p className="text-xs font-medium text-[#6B6B6B]">CUP / envío</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#F0EBE1] flex justify-between items-center">
                      <div>
                        <p className="text-xs text-[#6B6B6B] mb-0.5">Contacto público:</p>
                        <p className="font-bold text-[#2C2C2C] text-sm">{p.whatsapp}</p>
                      </div>
                      <button 
                        onClick={() => abrirModalContacto(p)}
                        className="inline-flex items-center gap-2 bg-[#F97316] text-white px-4 py-2 rounded-[10px] text-sm font-bold hover:bg-[#EA580C] transition-colors shadow-sm"
                      >
                        Contactar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {prestadorSeleccionado && (
        <ModalServicio 
          servicio={prestadorSeleccionado} 
          onClose={() => setPrestadorSeleccionado(null)} 
          tema="coral" 
        />
      )}
    </div>
  );
}