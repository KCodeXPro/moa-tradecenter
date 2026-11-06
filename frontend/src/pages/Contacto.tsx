import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputWhatsApp from '../components/InputWhatsApp';

// ⚠️ CAMBIA ESTO POR TU NÚMERO REAL DE WHATSAPP (Código de país + número, sin el símbolo +)
const ADMIN_WHATSAPP = "5355555555"; 

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', whatsapp: '', mensaje: '' });
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (campo: string, valor: string) => {
    setForm({ ...form, [campo]: valor });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim()) {
      setError('Por favor, ingresa tu nombre.');
      return;
    }
    
    const soloNumeros = form.whatsapp.replace(/\D/g, '');
    if (soloNumeros.length < 10) {
      setError('Por favor, ingresa un número de WhatsApp válido.');
      return;
    }

    if (!form.mensaje.trim()) {
      setError('Por favor, escribe tu mensaje o consulta.');
      return;
    }

    const texto = `Hola, soy *${form.nombre}*.\nMi número es: ${form.whatsapp}\n\n*Mensaje:*\n${form.mensaje}`;
    const textoCodificado = encodeURIComponent(texto);
    
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${textoCodificado}`, '_blank');

    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center min-h-screen">
        <div className="w-20 h-20 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-6 text-[#355A40] text-4xl shadow-sm">
          ✓
        </div>
        <h2 className="text-3xl font-extrabold text-[#2C2C2C] mb-4">
          Redirigiendo a WhatsApp
        </h2>
        <p className="text-[#6B6B6B] mb-8 text-lg">
          Se ha abierto WhatsApp para que envíes tu mensaje al administrador. Si no se abrió automáticamente, revisa las ventanas emergentes de tu navegador.
        </p>
        <button
          onClick={() => {
            setEnviado(false);
            setForm({ nombre: '', whatsapp: '', mensaje: '' });
          }}
          className="px-8 py-3.5 rounded-[12px] bg-[#A63A2B] text-white font-bold hover:bg-[#7A2A1F] transition-all shadow-md hover:-translate-y-0.5"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 bg-[#FAFAFA] min-h-screen">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D9D4CC] text-[#A63A2B] text-xs font-bold mb-4 shadow-sm">
          💬 Contáctanos
        </div>
        <h1 className="text-3xl font-extrabold text-[#2C2C2C] mb-4 tracking-tight">
          ¿Tienes dudas o sugerencias?
        </h1>
        <p className="text-[#6B6B6B] text-lg">
          Escríbenos y te responderemos lo antes posible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-[#D9D4CC] p-8 shadow-xl shadow-[#D9D4CC]/20 space-y-6">
        
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#2C2C2C]">
            Nombre
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-3 rounded-[12px] border border-[#D9D4CC] text-[#2C2C2C] focus:border-[#A63A2B] focus:ring-1 focus:ring-[#A63A2B] outline-none bg-[#F9FAFB] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#2C2C2C]">
            Número de WhatsApp
          </label>
          <InputWhatsApp 
            value={form.whatsapp} 
            onChange={(val) => handleChange('whatsapp', val)} 
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#2C2C2C]">
            Mensaje
          </label>
          <textarea
            value={form.mensaje}
            onChange={(e) => handleChange('mensaje', e.target.value)}
            placeholder="Escribe tu queja, sugerencia o consulta..."
            rows={4}
            className="w-full px-4 py-3 rounded-[12px] border border-[#D9D4CC] text-[#2C2C2C] focus:border-[#A63A2B] focus:ring-1 focus:ring-[#A63A2B] outline-none bg-[#F9FAFB] transition-all resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-[#B83A2E] bg-[#FEE2E2] px-4 py-3 rounded-[10px] font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-4 rounded-[12px] bg-[#A63A2B] text-white font-bold text-lg hover:bg-[#7A2A1F] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex justify-center items-center gap-2"
        >
          Enviar mensaje por WhatsApp
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="text-[#6B6B6B] text-sm font-medium hover:text-[#A63A2B] transition-colors"
        >
          &larr; Volver al inicio
        </Link>
      </div>
    </div>
  );
}