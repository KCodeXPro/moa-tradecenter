import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

interface UbicacionPublica {
  nick: string;
  ubicacion: {
    calle?: string;
    numero?: string;
    edificio?: string;
    reparto?: string;
    lat?: number;
    lon?: number;
  };
}

export default function UbicacionVendedor() {
  const { nick } = useParams<{ nick: string }>(); // <-- AHORA SE LLAMA "nick"
  const [data, setData] = useState<UbicacionPublica | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nick) return;

    axios.get(`/api/usuarios/ubicacion-publica/${nick}`) // <-- NUEVA URL
      .then((res) => {
        setData(res.data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo encontrar la ubicación de este vendedor. Es posible que aún no haya registrado su dirección.');
        setCargando(false);
      });
  }, [nick]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <p className="text-[#6B6B6B]">Cargando ubicación...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF] p-4">
        <div className="bg-red-50 border border-red-200 text-[#B83A2E] p-6 rounded-[14px] max-w-md text-center">
          <p className="text-lg font-bold mb-2">Ubicación no disponible</p>
          <p className="text-sm">{error}</p>
        </div>
        <Link to="/" className="mt-6 text-[#A63A2B] font-bold hover:underline">← Volver al inicio</Link>
      </div>
    );
  }

  const { nick: nickUsuario, ubicacion } = data;
  const tieneCoordenadas = ubicacion.lat && ubicacion.lon;

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#2C2C2C] mb-2">📍 Ubicación de {nickUsuario}</h1>
          <p className="text-[#6B6B6B]">Esta es la ubicación registrada por el vendedor.</p>
        </div>

        <div className="bg-white rounded-[20px] border border-[#D9D4CC] overflow-hidden shadow-lg">
          {/* Datos de la dirección */}
          <div className="p-6 border-b border-[#D9D4CC]">
            <h2 className="font-bold text-[#2C2C2C] mb-2">Dirección registrada:</h2>
            <p className="text-[#6B6B6B]">
              {ubicacion.calle || 'Sin calle'} 
              {ubicacion.numero && ` #${ubicacion.numero}`}
              {ubicacion.edificio && `, Edificio ${ubicacion.edificio}`}
              {ubicacion.reparto && `, Reparto ${ubicacion.reparto}`}
            </p>
          </div>

          {/* Mapa */}
          {tieneCoordenadas ? (
            <MapContainer
              center={[ubicacion.lat!, ubicacion.lon!]}
              zoom={17}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              />
              <Marker position={[ubicacion.lat!, ubicacion.lon!]}>
                <Popup>
                  <strong>{nickUsuario}</strong>
                  <p>{ubicacion.calle} {ubicacion.numero ? `#${ubicacion.numero}` : ''}</p>
                  {ubicacion.edificio && <p>Edificio: {ubicacion.edificio}</p>}
                  {ubicacion.reparto && <p>Reparto: {ubicacion.reparto}</p>}
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="p-8 text-center text-[#6B6B6B]">
              Este vendedor no ha marcado sus coordenadas en el mapa.
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-[#A63A2B] font-bold hover:underline">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}