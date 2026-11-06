import { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Solucionar los iconos de marcadores de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Categoria {
  _id: string;
  nombre: string;
  icono: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuario: any;
  onSuccess: () => void;
}

export default function ModalMiUbicacion({ isOpen, onClose, usuario, onSuccess }: Props) {
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [edificio, setEdificio] = useState('');
  const [reparto, setReparto] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [esPublica, setEsPublica] = useState(false);
  
  // 🔥 NUEVOS ESTADOS
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar los datos si el usuario ya tiene una ubicación guardada
  useEffect(() => {
    if (isOpen) {
      // Cargar categorías
      axios.get('/api/categorias')
        .then(res => setCategorias(res.data))
        .catch(err => console.error('Error cargando categorías:', err));
    }

    if (isOpen && usuario?.ubicacion) {
      setCalle(usuario.ubicacion.calle || '');
      setNumero(usuario.ubicacion.numero || '');
      setEdificio(usuario.ubicacion.edificio || '');
      setReparto(usuario.ubicacion.reparto || '');
      setLat(usuario.ubicacion.lat || null);
      setLon(usuario.ubicacion.lon || null);
      setEsPublica(usuario.ubicacion.esPublica || false);
      setCategoriaId(usuario.ubicacion.categoriaId || ''); // Cargar categoría guardada
    } else if (isOpen) {
      // Limpiar si es nuevo
      setCalle(''); setNumero(''); setEdificio(''); setReparto('');
      setLat(null); setLon(null);
      setEsPublica(false);
      setCategoriaId('');
    }
    setError(null);
  }, [isOpen, usuario]);

  if (!isOpen) return null;

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    setLat(e.latlng.lat);
    setLon(e.latlng.lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!lat || !lon) {
      setError('Haz clic en el mapa para seleccionar tu ubicación.');
      return;
    }
    if (!calle.trim() || !reparto.trim()) {
      setError('La Calle y el Reparto son obligatorios.');
      return;
    }

    setCargando(true);
    try {
      await axios.patch(`/api/usuarios/${usuario._id}/ubicacion`, {
        calle,
        numero,
        edificio,
        reparto,
        lat,
        lon,
        esPublica,
        categoriaId, // 🔥 ENVIAMOS LA CATEGORÍA
      });

      // Actualizamos el localStorage con la nueva ubicación
      const usuarioActualizado = { 
        ...usuario, 
        ubicacion: { calle, numero, edificio, reparto, lat, lon, esPublica, categoriaId } 
      };
      localStorage.setItem('moa_user', JSON.stringify(usuarioActualizado));

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la ubicación.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2C2C2C]/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        <div className="p-6 border-b border-[#D9D4CC] flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-[#2C2C2C]">📍 Mi Ubicación</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F0E8] text-[#2C2C2C] hover:bg-[#E8E2D9]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Calle *</label>
              <input type="text" value={calle} onChange={(e) => setCalle(e.target.value)} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" placeholder="Ej: Martí" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Número / Casa</label>
              <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={edificio.trim().length > 0} className={`w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 ${edificio.trim().length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="Ej: 47" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Edificio</label>
              <input type="text" value={edificio} onChange={(e) => setEdificio(e.target.value)} disabled={numero.trim().length > 0} className={`w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 ${numero.trim().length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="Ej: 22" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Reparto *</label>
              <input type="text" value={reparto} onChange={(e) => setReparto(e.target.value)} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" placeholder="Ej: Atlántico" />
            </div>
          </div>

          {/* 🔥 SELECTOR DE CATEGORÍA PARA EL ICONO DEL MAPA */}
          <div className="bg-blue-50 p-4 rounded-[10px] border border-blue-200">
            <label className="block text-sm font-bold text-[#2E6B8A] mb-2">
              ¿Qué categoría representa mejor a tu negocio? (Para el icono del mapa)
            </label>
            <select 
              value={categoriaId} 
              onChange={(e) => setCategoriaId(e.target.value)} 
              className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 text-sm focus:border-[#2E6B8A] outline-none bg-white"
            >
              <option value="">-- Sin categoría (👤 Por defecto) --</option>
              {categorias.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.icono} {cat.nombre}</option>
              ))}
            </select>
          </div>

          {/* CHECKBOX: MOSTRAR NEGOCIO EN EL MAPA PÚBLICO */}
          <div className="bg-green-50 p-4 rounded-[10px] border border-green-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={esPublica} 
                onChange={(e) => setEsPublica(e.target.checked)} 
                className="w-5 h-5 mt-0.5 accent-[#4A7C59]" 
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#2C2C2C]">Mostrar mi negocio en el mapa público de la Home</span>
                <span className="text-xs text-[#6B6B6B]">
                  Si lo marcas, los clientes verán un marcador con el nombre de tu negocio en el mapa de búsqueda de direcciones. 
                  Sino siempre puedes compartir el enlace de tu ubicacion por Whatsapp con el botón "Compartir Ubicación".
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Haz clic en el mapa para marcar tu ubicación *</label>
            <div className="bg-[#F5F0E8] rounded-[12px] p-4 border border-[#D9D4CC]">
              <MapContainer
                center={lat && lon ? [lat, lon] : [20.65, -74.94]}
                zoom={15}
                style={{ height: '300px', width: '100%', borderRadius: '8px' }}
                className="cursor-crosshair"
                whenReady={(map) => {
                  map.target.on('click', handleMapClick);
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                />
                {lat && lon && (
                  <Marker position={[lat, lon]}>
                    <Popup>Tu ubicación</Popup>
                  </Marker>
                )}
              </MapContainer>
              {lat && lon ? (
                <p className="text-xs text-[#6B6B6B] mt-2">Lat: {lat.toFixed(6)}, Lon: {lon.toFixed(6)}</p>
              ) : (
                <p className="text-xs text-[#6B6B6B] mt-2">Haz clic en el mapa para seleccionar tu ubicación.</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-[#B83A2E] font-medium bg-red-50 p-2 rounded">{error}</p>}

          <button type="submit" disabled={cargando} className="w-full bg-[#A63A2B] hover:bg-[#7A2A1F] text-white py-3 rounded-[10px] font-bold text-lg transition-colors disabled:opacity-50">
            {cargando ? 'Guardando...' : 'Guardar Ubicación'}
          </button>
        </form>
      </div>
    </div>
  );
}