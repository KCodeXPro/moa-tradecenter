import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Iconos base de Leaflet
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

interface Categoria {
  _id: string;
  nombre: string;
  icono: string;
}

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
  esDeVendedor?: boolean;
}

export default function GestorDirecciones() {
  const [nick, setNick] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [entre, setEntre] = useState('');
  const [edificio, setEdificio] = useState('');
  const [reparto, setReparto] = useState('');
  const [categoriaId, setCategoriaId] = useState(''); 
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]); 
  const [cargando, setCargando] = useState(true);

  const mapRef = useRef<L.Map | null>(null);
  
  const [direccionEnfocada, setDireccionEnfocada] = useState<string | null>(null);

  const cargarTodo = () => {
    setCargando(true);
    Promise.all([
      axios.get(`${API_URL}/direcciones`),
      axios.get(`${API_URL}/usuarios`),
      axios.get(`${API_URL}/categorias`) 
    ])
      .then(([resDir, resUsu, resCat]) => {
        // PARCHE: Aseguramos que siempre sean arrays
        const dirData = Array.isArray(resDir.data) ? resDir.data : [];
        const usuData = Array.isArray(resUsu.data) ? resUsu.data : [];
        const catData = Array.isArray(resCat.data) ? resCat.data : [];

        setCategorias(catData);

        const catMap: Record<string, string> = {};
        catData.forEach((c: Categoria) => { catMap[c._id] = c.icono; });

        const dirsAdmin: Direccion[] = dirData.map((d: any) => {
          // Lógica: Si tiene categoría, usa su icono. Si no, pero tiene nick, usa tienda. Si no tiene nick, usa casa.
          let iconoAsignado = '🏠'; // Por defecto: casa (sin nombre ni categoría)
          if (d.categoriaId) {
            iconoAsignado = catMap[d.categoriaId] || '🏪';
          } else if (d.nick) {
            iconoAsignado = '🏪'; // Tiene nombre pero no categoría -> tienda
          }
          
          return { 
            ...d, 
            esDeVendedor: false,
            icono: iconoAsignado
          };
        });

        const dirsVendedores: Direccion[] = [];
        usuData.forEach((u: any) => {
          if (u.ubicacion && u.ubicacion.lat && u.ubicacion.lon) {
            dirsVendedores.push({
              _id: u._id,
              nick: u.nick,
              calle: u.ubicacion.calle || '',
              numero: u.ubicacion.numero || '',
              entre: '', 
              edificio: u.ubicacion.edificio || '',
              reparto: u.ubicacion.reparto || '',
              lat: u.ubicacion.lat,
              lon: u.ubicacion.lon,
              esDeVendedor: true,
              icono: '👤'
            });
          }
        });

        setDirecciones([...dirsAdmin, ...dirsVendedores]);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error cargando datos:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    setLat(e.latlng.lat);
    setLon(e.latlng.lng);
    setDireccionEnfocada(null);
  };

  const enfocarDireccion = (dir: Direccion) => {
    setDireccionEnfocada(dir._id);
    if (mapRef.current) {
      mapRef.current.flyTo([dir.lat, dir.lon], 17, { duration: 1.5 });
    }
  };

  const handleSave = () => {
    if (!lat || !lon) {
      alert('Selecciona una ubicación en el mapa primero.');
      return;
    }
    if (!calle.trim() || !reparto.trim()) {
      alert('La Calle y el Reparto son obligatorios.');
      return;
    }
    if (!numero.trim() && !edificio.trim()) {
      alert('Debes indicar el Número/Casa o el Edificio.');
      return;
    }

    const catSeleccionada = categorias.find(c => c._id === categoriaId);
    const iconoSeleccionado = catSeleccionada ? catSeleccionada.icono : '🏠';

    axios.post(`${API_URL}/direcciones`, {
      nick, calle, numero, entre, edificio, reparto, lat, lon, 
      categoriaId, icono: iconoSeleccionado
    })
      .then(() => {
        alert('Dirección guardada correctamente.');
        setNick(''); setCalle(''); setNumero(''); setEntre(''); setEdificio(''); setReparto(''); setCategoriaId(''); setLat(null); setLon(null);
        cargarTodo();
      })
      .catch((err) => {
        alert('Error al guardar: ' + (err.response?.data?.message || err.message));
      });
  };

  const handleDelete = (dir: Direccion) => {
    if (!confirm(`¿Estás seguro de eliminar ${dir.esDeVendedor ? 'la ubicación del vendedor' : 'esta dirección'}?`)) return;
    const idLimpio = String(dir._id).trim();

    if (dir.esDeVendedor) {
      axios.delete(`${API_URL}/usuarios/${idLimpio}`)
        .then(() => { alert('Vendedor eliminado.'); cargarTodo(); })
        .catch((err) => { alert('Error: ' + (err.response?.data?.message || err.message)); });
    } else {
      axios.delete(`${API_URL}/direcciones/${idLimpio}`)
        .then(() => { alert('Dirección eliminada.'); cargarTodo(); })
        .catch((err) => { alert('Error: ' + (err.response?.data?.message || err.message)); });
    }
  };

  if (cargando) return <div className="text-center py-12 text-[#6B6B6B]">Cargando mapa...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[14px] border border-[#D9D4CC] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Nueva Dirección / Negocio</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Nombre del Negocio (opcional)</label>
            <input type="text" value={nick} onChange={(e) => setNick(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] outline-none" placeholder="Ej: Agro Mercado" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Categoría del Negocio</label>
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] outline-none bg-white">
              <option value="">-- Sin categoría (Tienda por defecto) --</option>
              {categorias.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.icono} {cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 border-t border-gray-100 my-2"></div>

          <div><label className="block text-sm font-medium text-[#6B6B6B] mb-1">Calle *</label><input type="text" value={calle} onChange={(e) => setCalle(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] outline-none" placeholder="Nombre de la calle" /></div>
          <div><label className="block text-sm font-medium text-[#6B6B6B] mb-1">Número / Casa (opcional)</label><input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] outline-none" placeholder="Ej: 47 (o 0 si no tiene)" /></div>
        </div>
        
        <div className="mt-4"><label className="block text-sm font-medium text-[#6B6B6B] mb-1">Entre (opcional)</label><input type="text" value={entre} onChange={(e) => setEntre(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] outline-none" placeholder="Ej: entre 4ta y 5to" /></div>
        <div className="mt-4"><label className="block text-sm font-medium text-[#6B6B6B] mb-1">Edificio (opcional)</label><input type="text" value={edificio} onChange={(e) => setEdificio(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] outline-none" placeholder="Ej: Edificio A" /></div>
        <div className="mt-4"><label className="block text-sm font-medium text-[#6B6B6B] mb-1">Reparto *</label><input type="text" value={reparto} onChange={(e) => setReparto(e.target.value)} className="w-full px-3 py-2 rounded-[8px] border border-[#D9D4CC] text-sm focus:border-[#A63A2B] outline-none" placeholder="Ej: Reparto 1" /></div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Ubicación en el mapa *</label>
          <div className="bg-[#F5F0E8] rounded-[12px] p-4 border border-[#D9D4CC] relative">
            <MapContainer 
              center={[20.65, -74.94]} zoom={14} style={{ height: '300px', width: '100%', borderRadius: '8px' }} className="cursor-crosshair" 
              ref={mapRef} whenReady={(map) => { mapRef.current = map.target; map.target.on('click', handleMapClick); }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors' />
              
              {direcciones.map((dir) => (
                <Marker 
                  key={`map-${dir._id}`} 
                  position={[dir.lat, dir.lon]} 
                  icon={createEmojiIcon(dir.icono || '🏪')} 
                  zIndexOffset={direccionEnfocada === dir._id ? 1000 : 0}
                >
                  <Popup>
                    <strong>{dir.icono} {dir.nick || 'Negocio'}</strong>
                    <p>{dir.calle} {dir.numero ? `#${dir.numero}` : ''}</p>
                  </Popup>
                </Marker>
              ))}

              {lat && lon && <Marker position={[lat, lon]}><Popup>Ubicación seleccionada</Popup></Marker>}
            </MapContainer>
          </div>
        </div>

        <div className="flex gap-3 mt-4"><button onClick={handleSave} className="bg-[#A63A2B] text-white px-4 py-2 rounded-[8px] font-bold text-sm hover:bg-[#7A2A1F] transition-colors">Guardar Dirección</button></div>
      </div>

      <div className="bg-white rounded-[14px] border border-[#D9D4CC] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Todas las Ubicaciones</h2>
        <div className="space-y-3">
          {direcciones.map((dir) => (
            <div 
              key={`list-${dir._id}`} onClick={() => enfocarDireccion(dir)}
              className={`rounded-[12px] p-4 border flex justify-between items-center cursor-pointer transition-all ${direccionEnfocada === dir._id ? 'ring-2 ring-[#A63A2B] bg-white shadow-md' : 'bg-[#F5F0E8] border-[#D9D4CC] hover:bg-[#EBE5DA]'}`}
            >
              <div>
                <p className="font-bold mb-1 flex items-center gap-2 text-[#2C2C2C]">
                  <span className="text-lg">{dir.icono}</span> {dir.nick || 'Negocio sin nombre'}
                </p>
                <p className="text-sm text-[#6B6B6B]">{dir.calle} {dir.numero ? `#${dir.numero}` : ''}, {dir.reparto}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(dir); }} className="text-[#B83A2E] hover:text-[#7A2A1F] font-bold text-sm bg-white px-3 py-1.5 rounded-md border border-red-200">Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}