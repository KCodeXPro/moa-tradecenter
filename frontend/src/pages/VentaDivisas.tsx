import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ModalServicio from '../components/ModalServicio';

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
  const [error, setError] = useState<string | null>(null);
  const [divisaSeleccionada, setDivisaSeleccionada] = useState<Divisa | null>(null);

  useEffect(() => {
    axios.get('/api/servicios/divisas')
      .then(res => {
        setDivisas(res.data);
        setCargando(false);
      })
      .catch(err => {
        console.error(err);
        setError('No se pudieron cargar las ofertas de divisas.');
        setCargando(false);
      });
  }, []);

  if (cargando) return <div className="text-center py-24 text-[#6B6B6B]">Cargando ofertas de divisas...</div>;
  if (error) return <div className="text-center py-24 text-[#B83A2E]">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-[#4A7C59] text-sm font-bold tracking-wider mb-4 shadow-sm">
            💵 Mercado de Divisas
          </span>
          <h1 className="text-4xl font-extrabold text-[#2C2C2C] mb-4">Compra y Venta de Divisas</h1>
          <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
            Encuentra las mejores ofertas de MLC, USD, EUR y otras monedas en Moa. Contacta directamente con el vendedor por WhatsApp.
          </p>
        </div>

        {divisas.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#D9D4CC] p-12 text-center shadow-sm">
            <p className="text-[#6B6B6B] text-lg mb-4">No hay ofertas de divisas en este momento.</p>
            <Link to="/servicios" className="inline-block bg-[#4A7C59] text-white px-6 py-3 rounded-[10px] font-bold hover:bg-[#355A40] transition-colors">
              Ver todos los servicios
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisas.map((divisa) => (
              <div 
                key={divisa._id} 
                className="bg-white rounded-[20px] border border-[#D9D4CC] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#4A7C59]/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#E8F5EC] flex items-center justify-center text-xl">
                        💵
                      </div>
                      <h3 className="font-extrabold text-2xl text-[#2C2C2C] uppercase">{divisa.nombre}</h3>
                    </div>
                    <span className="bg-[#E8F5EC] text-[#4A7C59] px-2.5 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wider">
                      Divisa
                    </span>
                  </div>
                  
                  <p className="text-sm text-[#6B6B6B] mt-2 line-clamp-2 min-h-[40px]">{divisa.descripcion}</p>
                </div>

                <div className="mt-auto p-6 pt-0">
                  <div className="bg-[#FAFAFA] rounded-[12px] p-4 border border-[#E5E7EB] mb-4">
                    <p className="text-xs text-[#6B6B6B] font-bold uppercase tracking-wider mb-1">Precio de Venta</p>
                    <p className="font-extrabold text-3xl text-[#A63A2B]">
                      ${(divisa.precio / 100).toFixed(2)} <span className="text-sm text-[#6B6B6B] font-bold">CUP</span>
                    </p>
                  </div>
                  
                  {/* 🔥 BOTÓN CAMBIADO Y CON LÓGICA DIRECTA AL CONTACTO */}
                  <button 
                    onClick={() => setDivisaSeleccionada(divisa)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#4A7C59] text-white px-4 py-3 rounded-[10px] font-bold hover:bg-[#355A40] transition-colors shadow-sm"
                  >
                    💬 Enviar mensaje por WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 LE PASAMOS vistaInicial="contacto" */}
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