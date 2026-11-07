import { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size: 28px; line-height: 1; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3)); transform: translateY(-10px);">${emoji}</div>`,
    className: 'custom-emoji-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

interface Direccion {
  _id: string;
  calle: string;
  numero: string;
  entre: string;
  edificio: string;
  reparto: string;
  lat: number;
  lon: number;
  nick?: string;
  categoriaId?: string;
  icono?: string;
}

interface NegocioPublico {
  nick: string;
  icono?: string;
  ubicacion: {
    calle?: string;
    numero?: string;
    edificio?: string;
    reparto?: string;
    lat?: number;
    lon?: number;
    categoriaId?: string;
  };
}

interface Categoria {
  _id: string;
  nombre: string;
  icono: string;
}

export default function BuscadorDirecciones() {
  const location = useLocation();

  const [busquedaEnlace, setBusquedaEnlace] = useState('');
  const [busquedaNombre, setBusquedaNombre] = useState('');
  
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [entre, setEntre] = useState('');
  const [edificio, setEdificio] = useState('');
  const [reparto, setReparto] = useState('');
  
  const [resultados, setResultados] = useState<Direccion[]>([]);
  const [negociosPublicos, setNegociosPublicos] = useState<NegocioPublico[]>([]);
  const [direccionesAdmin, setDireccionesAdmin] = useState<Direccion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/ubicacion/')) {
      setBusquedaEnlace(path.replace('/ubicacion/', ''));
    }
  }, [location]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/usuarios/negocios-publicos`),
      axios.get(`${API_URL}/direcciones`),
      axios.get(`${API_URL}/categorias`)
    ]).then(([resNeg, resDir, resCat]) => {
      const catData = Array.isArray(resCat.data) ? resCat.data : [];
      setCategorias(catData);

      const catMap: Record<string, string> = {};
      catData.forEach((c: Categoria) => { catMap[c._id] = c.icono; });

      const dirData = Array.isArray(resDir.data) ? resDir.data : [];
      const dirsConIcono = dirData.map((d: any) => {
        // Lógica: Si tiene categoría, usa su icono. Si no, pero tiene nick, usa tienda. Si no tiene nick, usa casa.
        let iconoAsignado = '🏠'; // Por defecto: casa
        if (d.categoriaId) {
          iconoAsignado = catMap[d.categoriaId] || '🏪';
        } else if (d.nick) {
          iconoAsignado = '🏪';
        }
        
        return {
          ...d,
          icono: iconoAsignado
        };
      });
      const validas = dirsConIcono.filter((d: any) => d.lat != null && d.lon != null);
      setDireccionesAdmin(validas);

      const negData = Array.isArray(resNeg.data) ? resNeg.data : [];
      const negociosConIcono = negData.map((n: any) => ({
        ...n,
        icono: n.ubicacion?.categoriaId ? (catMap[n.ubicacion.categoriaId] || '👤') : '👤'
      }));
      setNegociosPublicos(negociosConIcono);

    }).catch((err) => console.error('Error cargando datos del mapa:', err));
  }, []);

  const handleNumeroChange = (val: string) => {
    setNumero(val);
    if (val.trim().length > 0) setEdificio('');
  };

  const handleEdificioChange = (val: string) => {
    setEdificio(val);
    if (val.trim().length > 0) setNumero('');
  };

  // 🔥 FORMULARIO 1: Buscar por enlace/nick (Modificado para buscar en negocios)
  const buscarPorEnlace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultados([]);

    if (!busquedaEnlace.trim()) {
      setError('Escribe el nombre de usuario (nick) o pega el enlace.');
      return;
    }

    let nickABuscar = busquedaEnlace.trim();
    if (nickABuscar.includes('/ubicacion/')) {
      nickABuscar = nickABuscar.split('/ubicacion/')[1];
    }

    setCargando(true);
    try {
      const negocio = negociosPublicos.find((n: any) => n.nick.toLowerCase() === nickABuscar.toLowerCase());

      if (negocio && negocio.ubicacion?.lat && negocio.ubicacion?.lon) {
        setResultados([{
          _id: negocio.nick,
          calle: negocio.ubicacion.calle || '',
          numero: negocio.ubicacion.numero || '',
          entre: '',
          edificio: negocio.ubicacion.edificio || '',
          reparto: negocio.ubicacion.reparto || '',
          lat: negocio.ubicacion.lat,
          lon: negocio.ubicacion.lon,
          nick: negocio.nick,
          icono: '👤'
        }]);
      } else {
        setError('No se encontró la ubicación pública de este vendedor.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al buscar el vendedor.');
    } finally {
      setCargando(false);
    }
  };

  // 🔥 FORMULARIO 2: Buscar por Nombre de Negocio (CORREGIDO)
  const buscarPorNombre = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultados([]);

    if (!busquedaNombre.trim()) {
      setError('Escribe el nombre del negocio.');
      return;
    }

    setCargando(true);
    try {
      // Buscamos en las direcciones admin
      const filtradosAdmin = direccionesAdmin.filter((d: any) => 
        d.nick && d.nick.toLowerCase().includes(busquedaNombre.toLowerCase())
      );

      // También buscamos en los negocios públicos (vendedores)
      const filtradosVendedores = negociosPublicos
        .filter((n: any) => n.nick.toLowerCase().includes(busquedaNombre.toLowerCase()) && n.ubicacion?.lat)
        .map((n: any) => ({
          _id: n.nick,
          calle: n.ubicacion.calle || '',
          numero: n.ubicacion.numero || '',
          entre: '',
          edificio: n.ubicacion.edificio || '',
          reparto: n.ubicacion.reparto || '',
          lat: n.ubicacion.lat,
          lon: n.ubicacion.lon,
          nick: n.nick,
          icono: n.icono || '👤'
        }));

      const todosLosResultados = [...filtradosAdmin, ...filtradosVendedores];

      if (todosLosResultados.length === 0) {
        setError('No se encontró ningún negocio con ese nombre.');
      } else {
        setResultados(todosLosResultados);
      }
    } catch (err) {
      console.error(err);
      setError('Error al buscar el negocio.');
    } finally {
      setCargando(false);
    }
  };

  // 🔥 FORMULARIO 3: Buscar por Dirección (Se mantiene igual)
  const handleBuscarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultados([]);

    const tieneCalle = calle.trim().length > 0;
    const tieneReparto = reparto.trim().length > 0;
    const tieneNumero = numero.trim().length > 0;
    const tieneEdificio = edificio.trim().length > 0;

    if (!tieneCalle) {
      setError('Debes indicar la Calle.');
      return;
    }
    if (!tieneReparto) {
      setError('Debes indicar el Reparto.');
      return;
    }
    if (!tieneNumero && !tieneEdificio) {
      setError('Debes indicar el Número/Casa o el Edificio.');
      return;
    }

    setCargando(true);

    try {
      // Buscamos en las direcciones admin localmente en lugar de hacer otra petición
      const filtrados = direccionesAdmin.filter((d: any) => {
        const matchCalle = d.calle?.toLowerCase().includes(calle.toLowerCase());
        const matchReparto = d.reparto?.toLowerCase().includes(reparto.toLowerCase());
        const matchNumero = tieneNumero ? d.numero?.includes(numero) : true;
        const matchEdificio = tieneEdificio ? d.edificio?.toLowerCase().includes(edificio.toLowerCase()) : true;
        return matchCalle && matchReparto && matchNumero && matchEdificio;
      });
      
      if (filtrados.length === 0) {
        setError('No se encontró ninguna dirección con esos datos.');
      } else {
        setResultados(filtrados);
      }
    } catch (err) {
      console.error(err);
      setError('Error al buscar la dirección.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#2C2C2C] mb-2 flex items-center gap-2">
          <span className="text-[#2E6B8A]">📍</span> Buscar Dirección o Negocio en Moa
        </h2>
        <p className="text-[#6B6B6B]">Encuentra cualquier edificio, casa o negocio del municipio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        <div className="space-y-6">
          
          {/* 🔥 FORMULARIO 1: ENLACE/NICK */}
          <form onSubmit={buscarPorEnlace} className="bg-white p-5 rounded-[16px] border border-[#E5E7EB] shadow-sm">
            <h3 className="text-sm font-bold text-[#2E6B8A] mb-2 flex items-center gap-2">
              🔗 Buscar por enlace compartido
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={busquedaEnlace} 
                onChange={(e) => setBusquedaEnlace(e.target.value)} 
                className="flex-1 px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] outline-none bg-[#F9FAFB]" 
                placeholder="Pega el enlace o escribe el nick" 
              />
              <button type="submit" className="bg-[#2E6B8A] text-white px-4 py-2 rounded-[8px] font-bold text-sm hover:bg-[#1F4B61] transition-colors whitespace-nowrap">
                Ubicar
              </button>
            </div>
          </form>

          {/* 🔥 FORMULARIO 2: NOMBRE DE NEGOCIO */}
          <form onSubmit={buscarPorNombre} className="bg-white p-5 rounded-[16px] border border-[#E5E7EB] shadow-sm">
            <h3 className="text-sm font-bold text-[#2E6B8A] mb-2 flex items-center gap-2">
              🏪 Buscar por nombre de negocio
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={busquedaNombre} 
                onChange={(e) => setBusquedaNombre(e.target.value)} 
                className="flex-1 px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] outline-none bg-[#F9FAFB]" 
                placeholder="Ej: Agro Mercado" 
              />
              <button type="submit" className="bg-[#2E6B8A] text-white px-4 py-2 rounded-[8px] font-bold text-sm hover:bg-[#1F4B61] transition-colors whitespace-nowrap">
                Buscar
              </button>
            </div>
          </form>

          {/* 🔥 FORMULARIO 3: DIRECCIÓN EXACTA */}
          <form onSubmit={handleBuscarDireccion} className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 border-b border-gray-100 pb-2 mb-1">
              <h3 className="text-sm font-bold text-[#2E6B8A] flex items-center gap-2">
                📍 Buscar dirección exacta
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1.5">Calle</label>
              <input type="text" value={calle} onChange={(e) => setCalle(e.target.value)} className="w-full px-3 py-2.5 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] outline-none bg-[#F9FAFB]" placeholder="Ej: Martí" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1.5">Número / Casa</label>
              <input 
                type="text" 
                value={numero} 
                onChange={(e) => handleNumeroChange(e.target.value)} 
                disabled={edificio.trim().length > 0}
                className={`w-full px-3 py-2.5 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] outline-none ${edificio.trim().length > 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-[#F9FAFB]'}`} 
                placeholder="Ej: 47" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1.5">Entre</label>
              <input type="text" value={entre} onChange={(e) => setEntre(e.target.value)} className="w-full px-3 py-2.5 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] outline-none bg-[#F9FAFB]" placeholder="Ej: entre 4ta y 5to" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1.5">Edificio</label>
              <input 
                type="text" 
                value={edificio} 
                onChange={(e) => handleEdificioChange(e.target.value)} 
                disabled={numero.trim().length > 0}
                className={`w-full px-3 py-2.5 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] outline-none ${numero.trim().length > 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-[#F9FAFB]'}`} 
                placeholder="Ej: 22" 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1.5">Reparto</label>
              <input type="text" value={reparto} onChange={(e) => setReparto(e.target.value)} className="w-full px-3 py-2.5 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#2E6B8A] outline-none bg-[#F9FAFB]" placeholder="Ej: Atlántico" />
            </div>
            <div className="sm:col-span-2 mt-2">
              <button type="submit" disabled={cargando} className="w-full bg-[#2E6B8A] text-white px-4 py-3 rounded-[10px] font-bold hover:bg-[#1F4B61] transition-colors disabled:opacity-50">
                {cargando ? 'Buscando...' : 'Buscar Dirección'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-[#B83A2E] p-4 rounded-[10px] flex items-start gap-2 text-sm">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {resultados.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-bold text-[#2C2C2C] text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2E6B8A]"></span>
                Resultados encontrados ({resultados.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {resultados.map((dir: any) => (
                  <div key={dir._id} className="bg-white border-l-4 border-l-[#2E6B8A] border-y border-r border-[#E5E7EB] rounded-[8px] p-4 shadow-sm hover:shadow-md transition-shadow">
                    {dir.nick && <p className="font-bold text-[#A63A2B] mb-1 text-sm">{dir.icono || '🏪'} {dir.nick}</p>}
                    <p className="font-bold text-[#2C2C2C] mb-1">{dir.calle} {dir.numero ? `#${dir.numero}` : ''}</p>
                    {dir.edificio && <p className="text-xs text-[#6B6B6B] mb-0.5"><span className="font-semibold">Edificio:</span> {dir.edificio}</p>}
                    {dir.reparto && <p className="text-xs text-[#6B6B6B]"><span className="font-semibold">Reparto:</span> {dir.reparto}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-[400px] lg:h-auto min-h-[400px] rounded-[16px] overflow-hidden border border-[#D9D4CC] shadow-sm relative bg-[#F5F0E8]">
          <MapContainer
            key={resultados.length > 0 ? resultados[0]._id : 'default'}
            center={resultados.length > 0 ? [resultados[0].lat, resultados[0].lon] : [20.65, -74.94]}
            zoom={resultados.length > 0 ? 16 : 14}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors' />

            {direccionesAdmin.map((dir: any) => (
              <Marker key={dir._id} position={[dir.lat, dir.lon]} icon={createEmojiIcon(dir.icono)}>
                <Popup>
                  <strong>{dir.icono} {dir.nick || 'Negocio'}</strong>
                  <p>{dir.calle} {dir.numero ? `#${dir.numero}` : ''}</p>
                  {dir.edificio && <p>Edificio: {dir.edificio}</p>}
                  {dir.reparto && <p>Reparto: {dir.reparto}</p>}
                </Popup>
              </Marker>
            ))}

            {negociosPublicos.map((negocio: any) => (
              negocio.ubicacion?.lat && negocio.ubicacion?.lon && (
                <Marker key={negocio.nick} position={[negocio.ubicacion.lat, negocio.ubicacion.lon]} icon={createEmojiIcon(negocio.icono)}>
                  <Popup>
                    <strong>{negocio.icono} {negocio.nick}</strong>
                    <p>{negocio.ubicacion.calle} {negocio.ubicacion.numero ? `#${negocio.ubicacion.numero}` : ''}</p>
                    {negocio.ubicacion.reparto && <p>Reparto: {negocio.ubicacion.reparto}</p>}
                    <Link to={`/ubicacion/${negocio.nick}`} className="text-[#2E6B8A] font-bold underline text-sm mt-1 inline-block">Ver mi ubicación</Link>
                  </Popup>
                </Marker>
              )
            ))}

            {resultados.map((dir: any) => (
              <Marker key={`res-${dir._id}`} position={[dir.lat, dir.lon]} icon={createEmojiIcon(dir.icono || '📍')}>
                <Popup>
                  <strong>{dir.icono} {dir.nick ? dir.nick : `${dir.calle} ${dir.numero ? `#${dir.numero}` : ''}`}</strong>
                  <p>{dir.calle} {dir.numero ? `#${dir.numero}` : ''}</p>
                  {dir.reparto && <p>Reparto: {dir.reparto}</p>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}