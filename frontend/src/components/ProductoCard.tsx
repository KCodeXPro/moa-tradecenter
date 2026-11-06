import { useState } from 'react';

interface Producto {
  _id: string;
  vendedorId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipoVenta: string;
  tieneDomicilio: boolean;
  imagenes?: string[];
  variantes?: { color: string; talla: string; cantidad: number }[];
  createdAt?: string;
}

interface ProductoCardProps {
  producto: Producto;
  onSelect?: (p: Producto) => void;
}

export default function ProductoCard({ producto, onSelect }: ProductoCardProps) {
  const [imagenActiva, setImagenActiva] = useState(0);
  
  const totalFotos = producto.imagenes?.length || 0;
  const indiceActual = Math.min(imagenActiva, Math.max(0, totalFotos - 1));
  const stockTotal = producto.variantes?.reduce((acc, v) => acc + v.cantidad, 0) || 0;

  const handleClick = () => {
    if (onSelect) {
      onSelect(producto);
    }
  };

  const cambiarImagen = (e: React.MouseEvent, direccion: number) => {
    e.stopPropagation();
    if (totalFotos <= 1) return;
    setImagenActiva((prev) => (prev + direccion + totalFotos) % totalFotos);
  };

  const precioFormateado = Math.round(producto.precio / 100).toString();

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-[20px] border border-[#D9D4CC] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group/card cursor-pointer relative overflow-hidden h-full"
    >
      {/* CINTA DECORATIVA */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#A63A2B]/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover/card:scale-110 z-10 pointer-events-none"></div>

      {/* CABECERA CON NOMBRE Y ETIQUETA */}
      <div className="p-5 pb-0 relative z-10">
        <div className="flex justify-between items-start mb-2">
          {/* 🔥 TÍTULO CAMBIA A ROJO EN HOVER */}
          <h3 className="font-extrabold text-lg text-[#2C2C2C] line-clamp-1 uppercase max-w-[200px] pt-1 transition-colors duration-300 group-hover/card:text-[#A63A2B]">
            {producto.nombre}
          </h3>
          <span className="bg-[#FEE2E2] text-[#A63A2B] px-2.5 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wider">
            {producto.tipoVenta === 'mayorista' ? 'Mayorista' : 'Minorista'}
          </span>
        </div>

        <div className="h-32 bg-[#F9F9F9] rounded-[12px] flex items-center justify-center overflow-hidden relative mb-3 mt-2">
          {totalFotos > 0 ? (
            <img
              src={producto.imagenes![indiceActual]}
              alt={producto.nombre}
              className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover/card:scale-105"
            />
          ) : (
            <span className="text-4xl opacity-40">📦</span>
          )}
          
          {producto.tieneDomicilio && (
            <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
              <span className="text-[0.6rem] font-extrabold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#A63A2B] shadow-sm flex items-center gap-1">
                🛵 Domicilio
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-[#6B6B6B] line-clamp-2 min-h-[40px] mb-2">{producto.descripcion}</p>

        {producto.variantes && producto.variantes.length > 0 && (
          <div className="text-xs mb-2 flex items-center gap-2">
            <span className="bg-gray-100 text-[#6B6B6B] px-2 py-0.5 rounded-[4px] truncate max-w-[120px]">
              {Array.from(new Set(producto.variantes.map((v) => v.talla))).join(', ')}
            </span>
            <span className="bg-[#FEE2E2] text-[#A63A2B] font-bold px-2 py-0.5 rounded-[4px]">
              {stockTotal} disp.
            </span>
          </div>
        )}
      </div>

      {/* PIE CON PRECIO Y BOTÓN */}
      <div className="mt-auto p-5 pt-2 relative z-10">
        <div className="bg-[#FAFAFA] rounded-[12px] p-4 border border-[#E5E7EB] mb-3">
          <p className="text-[0.65rem] text-[#6B6B6B] font-bold uppercase tracking-wider mb-1">Precio</p>
          <p className="font-extrabold text-2xl text-[#2C2C2C] transition-colors duration-300 group-hover/card:text-[#A63A2B]">
            ${precioFormateado} <span className="text-xs text-[#6B6B6B] font-bold">CUP</span>
          </p>
        </div>
        <button className="w-full bg-[#A63A2B] text-white px-4 py-3 rounded-[10px] text-sm font-bold shadow-sm hover:bg-[#7A2A1F] transition-colors flex justify-center items-center gap-2">
          Ver detalles
        </button>
      </div>
    </div>
  );
}