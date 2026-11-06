import { useState, useEffect } from 'react';
import axios from 'axios';

interface ModalCrearServicioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servicioAEditar?: any | null;
}

export default function ModalCrearServicio({ isOpen, onClose, onSuccess, servicioAEditar }: ModalCrearServicioProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    whatsapp: '',
    telefono: '',
    direccion: '',
    horario: '',
    esDomicilio: false,
    esDivisa: false,
  });
  const [menu, setMenu] = useState<{ item: string; precio: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (servicioAEditar) {
        setFormData({
          nombre: servicioAEditar.nombre || '',
          descripcion: servicioAEditar.descripcion || '',
          precio: (servicioAEditar.precio / 100).toString(),
          whatsapp: servicioAEditar.whatsapp || '',
          telefono: servicioAEditar.telefono || '',
          direccion: servicioAEditar.direccion || '',
          horario: servicioAEditar.horario || '',
          esDomicilio: servicioAEditar.esDomicilio || false,
          esDivisa: servicioAEditar.esDivisa || false,
        });
        if (servicioAEditar.menu) {
          setMenu(servicioAEditar.menu.map((m: any) => ({ 
            item: m.item, 
            precio: (m.precio / 100).toString() 
          })));
        } else {
          setMenu([]);
        }
      } else {
        setFormData({
          nombre: '', descripcion: '', precio: '', whatsapp: '',
          telefono: '', direccion: '', horario: '', esDomicilio: false, esDivisa: false,
        });
        setMenu([]);
      }
      setError(null);
    }
  }, [isOpen, servicioAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddMenu = () => {
    setMenu([...menu, { item: '', precio: '' }]);
  };

  const handleMenuChange = (index: number, field: 'item' | 'precio', value: string) => {
    const newMenu = [...menu];
    newMenu[index][field] = value;
    setMenu(newMenu);
  };

  const handleRemoveMenu = (index: number) => {
    setMenu(menu.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim()) {
      setError('El nombre del servicio es obligatorio.');
      return;
    }
    if (!formData.descripcion.trim()) {
      setError('La descripción del servicio es obligatoria.');
      return;
    }
    if (!formData.precio || Number(formData.precio) <= 0) {
      setError('El precio debe ser mayor a 0.');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('moa_user') || '{}');
      
      const payload = {
        ...formData,
        precio: Number(formData.precio) * 100,
        vendedorId: user._id || user.id,
        categoriaId: '65f1234567890abcdef12345', 
        menu: formData.esDivisa ? [] : menu.map(m => ({ item: m.item, precio: Number(m.precio) * 100 })),
      };

      if (servicioAEditar) {
        await axios.put(`/api/servicios/${servicioAEditar._id}`, payload);
      } else {
        await axios.post('/api/servicios', payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2C2C2C]/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-[20px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        <div className="p-6 border-b border-[#D9D4CC] flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-extrabold text-[#2C2C2C]">
            {servicioAEditar ? 'Editar Servicio' : 'Publicar Nuevo Servicio'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F0E8] text-[#2C2C2C] hover:bg-[#E8E2D9]">✕</button>
        </div>

        {/* 🔥 CHECKBOX DE DIVISA (MOVIDO FUERA DEL FORMULARIO CON SCROLL) */}
        <div className="p-4 bg-blue-50 border-b border-blue-200 shrink-0">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              name="esDivisa" 
              checked={formData.esDivisa} 
              onChange={handleChange} 
              className="w-5 h-5 mt-0.5 accent-[#2E6B8A]" 
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#2E6B8A]">💵 Es una venta de divisas (MLC, USD, EUR)</span>
              <span className="text-xs text-[#6B6B6B]">
                Si marcas esto, solo necesitas poner el Nombre (ej. "Venta de 100 USD"), el Precio en CUP y una Descripción. 
                Aparecerá en la sección exclusiva de Divisas.
              </span>
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1">
                {formData.esDivisa ? 'Nombre de la Divisa *' : 'Nombre del Servicio *'}
              </label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" placeholder={formData.esDivisa ? "Ej: Venta de 100 USD" : "Ej. Reparación de lavadoras"} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Descripción *</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" rows={2} placeholder={formData.esDivisa ? "Ej: Billetes en buen estado, cambio en efectivo." : "Describe tu servicio..."} />
            </div>

            <div className={formData.esDivisa ? "md:col-span-2" : ""}>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1">
                {formData.esDivisa ? 'Precio (CUP) *' : 'Precio Base (CUP) *'}
              </label>
              <input type="number" name="precio" value={formData.precio} onChange={handleChange} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" placeholder="0" />
            </div>

            {/* CAMPOS QUE SE OCULTAN SI ES DIVISA */}
            {!formData.esDivisa && (
              <>
                <div>
                  <label className="block text-sm font-bold text-[#2C2C2C] mb-1">¿Ofreces Domicilio?</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" name="esDomicilio" checked={formData.esDomicilio} onChange={handleChange} className="w-4 h-4 accent-[#4A7C59]" />
                    <span className="text-sm text-[#6B6B6B]">Sí, servicio a domicilio</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2C2C2C] mb-1">WhatsApp</label>
                  <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" placeholder="+5350000000" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Teléfono Fijo</label>
                  <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" placeholder="Opcional" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Dirección</label>
                  <input name="direccion" value={formData.direccion} onChange={handleChange} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" placeholder="Calle, número, barrio..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Horario de Atención</label>
                  <input name="horario" value={formData.horario} onChange={handleChange} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2" placeholder="Ej. Lunes a Sábado, 8am a 5pm" />
                </div>
              </>
            )}
          </div>

          {/* MENÚ (SOLO SI NO ES DIVISA) */}
          {!formData.esDivisa && (
            <div className="border-t border-[#D9D4CC] pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#2C2C2C]">Lista de Precios / Menú (Opcional)</h3>
                <button type="button" onClick={handleAddMenu} className="text-sm font-bold text-[#2E6B8A] hover:underline">+ Añadir ítem</button>
              </div>
              {menu.map((m, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <input value={m.item} onChange={(e) => handleMenuChange(idx, 'item', e.target.value)} placeholder="Nombre del ítem" className="flex-1 border border-[#D9D4CC] rounded-[8px] px-3 py-2 text-sm" />
                  <input type="number" value={m.precio} onChange={(e) => handleMenuChange(idx, 'precio', e.target.value)} placeholder="Precio" className="w-24 border border-[#D9D4CC] rounded-[8px] px-3 py-2 text-sm" />
                  <button type="button" onClick={() => handleRemoveMenu(idx)} className="text-red-500 font-bold p-2">✕</button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-[#B83A2E] font-medium p-2 bg-red-50 rounded border border-red-200">{error}</p>}

          <div className="pt-4 border-t border-[#D9D4CC]">
            <button type="submit" disabled={loading} className="w-full bg-[#4A7C59] hover:bg-[#355A40] text-white py-3 rounded-[10px] font-bold text-lg transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : (servicioAEditar ? 'Actualizar Servicio' : 'Publicar Servicio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}