interface Servicio {
  _id: string;
  vendedorId?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  esDomicilio?: boolean;
  whatsapp?: string;
  telefono?: string;
  direccion?: string;
  horario?: string;
  menu?: { item: string; precio: number }[];
}

interface ServicioCardProps {
  servicio: Servicio;
  onSelect?: (s: Servicio) => void;
}

export default function ServicioCard({ servicio, onSelect }: ServicioCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(servicio);
    }
  };

  const precioFormateado = Math.round(servicio.precio / 100).toString();

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-[20px] border border-[#D9D4CC] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group/card cursor-pointer relative overflow-hidden h-full"
    >
      {/* CINTA DECORATIVA */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#2E6B8A]/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover/card:scale-110 z-10 pointer-events-none"></div>

      {/* CABECERA CON NOMBRE Y ETIQUETA */}
      <div className="p-5 pb-0 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-extrabold text-lg text-[#2C2C2C] line-clamp-1 uppercase max-w-[200px] pt-1 group-hover/card:text-[#2E6B8A] transition-colors">
            {servicio.nombre}
          </h3>
          <span className="bg-[#E0F2FE] text-[#2E6B8A] px-2.5 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wider">
            Servicio
          </span>
        </div>

        <div className="h-32 bg-[#F4F9F5] rounded-[12px] flex items-center justify-center overflow-hidden relative mb-3 mt-2">
          <span className="text-4xl opacity-80">🛠️</span>
          
          {servicio.esDomicilio && (
            <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
              <span className="text-[0.6rem] font-extrabold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#2E6B8A] shadow-sm flex items-center gap-1">
                🛵 Domicilio
              </span>
            </div>
          )}

          {servicio.whatsapp && (
            <div className="absolute bottom-2 right-2 z-20 pointer-events-none">
              <span className="text-[0.6rem] font-extrabold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#2E6B8A] shadow-sm flex items-center gap-1">
                💬 WhatsApp
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-[#6B6B6B] line-clamp-2 min-h-[40px] mb-2">{servicio.descripcion}</p>
      </div>

      {/* PIE CON PRECIO Y BOTÓN */}
      <div className="mt-auto p-5 pt-2 relative z-10">
        <div className="bg-[#FAFAFA] rounded-[12px] p-4 border border-[#E5E7EB] mb-3">
          <p className="text-[0.65rem] text-[#6B6B6B] font-bold uppercase tracking-wider mb-1">Precio</p>
          {/* 🔥 EL PRECIO AHORA ES NEGRO Y CAMBIA A AZUL EN HOVER */}
          <p className="font-extrabold text-2xl text-[#2C2C2C] transition-colors duration-300 group-hover/card:text-[#2E6B8A]">
            ${precioFormateado} <span className="text-xs text-[#6B6B6B] font-bold">CUP</span>
          </p>
        </div>
        <button className="w-full bg-[#2E6B8A] text-white px-4 py-3 rounded-[10px] text-sm font-bold shadow-sm hover:bg-[#1F4B61] transition-colors flex justify-center items-center gap-2">
          Ver detalles
        </button>
      </div>
    </div>
  );
}