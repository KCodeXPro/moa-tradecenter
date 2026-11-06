import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  productoAEditar?: any | null;
}

const COLORES_DISPONIBLES = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Marrón', 'Gris', 'Plateado', 'Rosa', 'Amarillo'];

export default function ModalCrearProducto({ isOpen, onClose, onCreated, productoAEditar }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipoVenta, setTipoVenta] = useState('minorista');
  
  const [categoria, setCategoria] = useState('ropa'); 
  const [categoriaId, setCategoriaId] = useState('6ae6ad64eb41b7bc255827a1'); 
  
  const [publico, setPublico] = useState('mujer'); 
  const [colorSeleccionado, setColorSeleccionado] = useState('Negro');
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [variantes, setVariantes] = useState<{ color: string; talla: string; cantidad: number }[]>([]);

  const [imagenesBase64, setImagenesBase64] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cargando, setCargando] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('moa_user');
      if (saved) setUsuario(JSON.parse(saved));

      if (productoAEditar) {
        setNombre(productoAEditar.nombre || '');
        setDescripcion(productoAEditar.descripcion || '');
        setPrecio((productoAEditar.precio / 100).toString());
        setTipoVenta(productoAEditar.tipoVenta || 'minorista');
        setCategoriaId(productoAEditar.categoriaId || '');
        setVariantes(productoAEditar.variantes || []);
        setImagenesBase64(productoAEditar.imagenes || []);
      } else {
        setNombre(''); setDescripcion(''); setPrecio(''); setTipoVenta('minorista');
        setVariantes([]); setImagenesBase64([]);
      }
    }
  }, [isOpen, productoAEditar]);

  if (!isOpen) return null;

  const getTallas = () => {
    if (categoria === 'calzado') {
      if (publico === 'mujer') return ['35', '36', '37', '38', '39', '40', '41', '42'];
      if (publico === 'hombre') return ['39', '40', '41', '42', '43', '44', '45', '46', '47'];
      if (publico === 'niño') return ['20', '22', '24', '26', '28', '30', '32', '34', '35'];
    }
    
    if (categoria === 'ropa') {
      if (publico === 'mujer') return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6-8', '8-10', '10-12', '12-14', '14-16', '16-18'];
      if (publico === 'hombre') return ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38'];
      if (publico === 'niño') return ['2', '4', '6', '8', '10', '12', '14'];
    }
    return [];
  };

  const handleAddVariante = () => {
    if (!tallaSeleccionada || parseInt(cantidad) <= 0) return;
    setVariantes([...variantes, { color: colorSeleccionado, talla: tallaSeleccionada, cantidad: parseInt(cantidad) }]);
    setTallaSeleccionada('');
    setCantidad('1');
  };

  const removeVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (imagenesBase64.length >= 4) return;
      const reader = new FileReader();
      reader.onloadend = () => setImagenesBase64(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (variantes.length === 0) {
      alert("Debes añadir al menos una variante (color, talla y cantidad).");
      return;
    }
    if (!usuario || !usuario.whatsapp) {
      alert("Por favor, completa tu perfil con tu WhatsApp antes de publicar un producto.");
      return;
    }

    setCargando(true);
    try {
      const vendedorId = usuario._id; 
      const payload = {
        nombre, descripcion, precio: parseInt(precio) * 100, tipoVenta, categoriaId, vendedorId, variantes,
        tieneDomicilio: true, imagenes: imagenesBase64, whatsapp: usuario.whatsapp
      };

      if (productoAEditar) {
        await axios.put(`/api/productos/${productoAEditar._id}`, payload);
      } else {
        await axios.post('/api/productos', payload);
      }
      
      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el producto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2C2C2C]/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      {/* 🔥 CONTENEDOR PRINCIPAL CON FLEX COL Y ALTURA MÁXIMA */}
      <div 
        className="bg-white rounded-[20px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.2)] relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔥 CABECERA FIJA (FUERA DEL SCROLL) */}
        <div className="p-6 border-b border-[#D9D4CC] flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-extrabold text-[#2C2C2C]">
            {productoAEditar ? 'Editar Producto' : 'Añadir Producto'}
          </h2>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#2C2C2C] font-bold text-xl">✕</button>
        </div>
        
        {/* 🔥 FORMULARIO CON SCROLL INTERNO */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#6B6B6B] mb-1">Nombre</label>
              <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-[#D9D4CC] focus:border-[#A63A2B] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#6B6B6B] mb-1">Precio (CUP)</label>
              <input required type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-[#D9D4CC] focus:border-[#A63A2B] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#6B6B6B] mb-1">Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-3 py-2 rounded-[10px] border border-[#D9D4CC] focus:border-[#A63A2B] outline-none h-16 resize-none" />
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-[10px] border border-[#D9D4CC]">
            <h3 className="font-bold text-[#2C2C2C] mb-3">Variantes del producto</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Categoría</label>
                <select value={categoria} onChange={e => {setCategoria(e.target.value); setTallaSeleccionada('');}} className="w-full px-2 py-2 rounded-[8px] border border-[#D9D4CC] text-sm">
                  <option value="ropa">Ropa</option>
                  <option value="calzado">Calzado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Público</label>
                <select value={publico} onChange={e => {setPublico(e.target.value); setTallaSeleccionada('');}} className="w-full px-2 py-2 rounded-[8px] border border-[#D9D4CC] text-sm">
                  <option value="mujer">Mujer</option>
                  <option value="hombre">Hombre</option>
                  <option value="niño">Niño</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Color</label>
                <select value={colorSeleccionado} onChange={e => setColorSeleccionado(e.target.value)} className="w-full px-2 py-2 rounded-[8px] border border-[#D9D4CC] text-sm">
                  {COLORES_DISPONIBLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Talla</label>
                <select value={tallaSeleccionada} onChange={e => setTallaSeleccionada(e.target.value)} className="w-full px-2 py-2 rounded-[8px] border border-[#D9D4CC] text-sm">
                  <option value="">-</option>
                  {getTallas().map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Cant.</label>
                <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} className="w-full px-2 py-2 rounded-[8px] border border-[#D9D4CC] text-sm" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={handleAddVariante} className="w-full bg-[#4A7C59] hover:bg-[#355A40] text-white py-2 rounded-[8px] font-bold transition-colors">+</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {variantes.map((v, i) => (
                <div key={i} className="bg-white border border-[#D9D4CC] px-2 py-1 rounded text-xs flex items-center gap-2">
                  <span>{v.color} - {v.talla} (x{v.cantidad})</span>
                  <button type="button" onClick={() => removeVariante(i)} className="text-[#B83A2E] font-bold">✕</button>
                </div>
              ))}
              {variantes.length === 0 && <span className="text-xs text-[#6B6B6B]">Añade al menos una variante.</span>}
            </div>
          </div>

          <div className="mt-2 border-t border-[#D9D4CC] pt-4">
            <label className="block text-sm font-semibold text-[#2C2C2C] mb-2">Fotos del producto (Máx. 4)</label>
            <div className="flex gap-2 flex-wrap mb-3">
              {imagenesBase64.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-[8px] overflow-hidden border border-[#D9D4CC] group">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImagenesBase64(prev => prev.filter((_, i) => i !== idx))} className="absolute inset-0 bg-black/50 text-white hidden group-hover:flex items-center justify-center font-bold">✕</button>
                </div>
              ))}
              {imagenesBase64.length < 4 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-[8px] border-2 border-dashed border-[#D9D4CC] flex items-center justify-center text-[#6B6B6B] hover:border-[#A63A2B] hover:text-[#A63A2B] transition-colors text-2xl">+</button>
              )}
            </div>
            <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
          
          <button disabled={cargando} type="submit" className="mt-2 bg-[#A63A2B] hover:bg-[#7A2A1F] text-white py-3 rounded-[10px] font-bold transition-colors disabled:opacity-50">
            {cargando ? 'Guardando...' : (productoAEditar ? 'Actualizar Producto' : 'Guardar Producto')}
          </button>
        </form>
      </div>
    </div>
  );
}