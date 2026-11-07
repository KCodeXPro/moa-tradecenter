import { useState, useEffect } from 'react';
import axios from 'axios';
import InputWhatsApp from './InputWhatsApp';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Prestador {
  _id: string;
  nick: string;
  whatsapp: string;
  tarifaDomicilio: number;
  disponible: boolean;
}

interface Props {
  servicio: any | null;
  onClose: () => void;
  tema?: 'azul' | 'coral' | 'verde';
  vistaInicial?: 'detalle' | 'contacto' | 'domicilio';
}

export default function ModalServicio({ servicio, onClose, tema = 'azul', vistaInicial = 'detalle' }: Props) {
  const [vista, setVista] = useState<'detalle' | 'contacto' | 'domicilio'>(vistaInicial);
  const [whatsapp, setWhatsapp] = useState('');
  const [textoMensaje, setTextoMensaje] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  
  // Estados para el flujo de domicilio
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState<Prestador | null>(null);
  const [prestadoresCargando, setPrestadoresCargando] = useState(false);

  useEffect(() => {
    if (servicio) {
      setVista(vistaInicial);
      setWhatsapp('');
      setTextoMensaje('');
      setError(null);
      setPrestadorSeleccionado(null);
    }
  }, [servicio, vistaInicial]);

  if (!servicio) return null;

  const esWhatsappValido = /^\+53\s?[56]\d{7}$/.test(whatsapp);
  const precioFormateado = Math.round(servicio.precio / 100).toString();

  const themeColors = tema === 'coral' 
    ? {
        accent: 'text-[#F97316]',
        accentBg: 'bg-[#FFEDD5]',
        accentBorder: 'border-[#F97316]/30',
        button: 'bg-[#F97316] hover:bg-[#EA580C]',
        inputFocus: 'focus:border-[#F97316] focus:ring-[#F97316]',
        disabled: 'bg-[#FFEDD5] text-[#F97316]'
      }
    : tema === 'verde'
    ? {
        accent: 'text-[#4A7C59]',
        accentBg: 'bg-[#E8F5EC]',
        accentBorder: 'border-[#4A7C59]/30',
        button: 'bg-[#4A7C59] hover:bg-[#355A40]',
        inputFocus: 'focus:border-[#4A7C59] focus:ring-[#4A7C59]',
        disabled: 'bg-[#E8F5EC] text-[#4A7C59]'
      }
    : {
        accent: 'text-[#2E6B8A]',
        accentBg: 'bg-[#E0F2FE]',
        accentBorder: 'border-[#2E6B8A]/30',
        button: 'bg-[#2E6B8A] hover:bg-[#1F4B61]',
        inputFocus: 'focus:border-[#2E6B8A] focus:ring-[#2E6B8A]',
        disabled: 'bg-[#E0F2FE] text-[#2E6B8A]'
      };

  const abrirContacto = () => {
    setError(null);
    setVista('contacto');
  };

  const abrirDomicilio = () => {
    setError(null);
    setVista('domicilio');
    cargarPrestadores();
  };

  const cargarPrestadores = async () => {
    setPrestadoresCargando(true);
    setPrestadores([]);
    try {
      const res = await axios.get(`${API_URL}/usuarios/prestadores`);
      setPrestadores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la lista de prestadores de domicilio.');
    } finally {
      setPrestadoresCargando(false);
    }
  };

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!esWhatsappValido) {
      setError('Ingresa un WhatsApp válido con formato cubano (+53 5XXXXXXX o +53 6XXXXXXX).');
      return;
    }

    if (!servicio.whatsapp) {
      setError('El vendedor no tiene un WhatsApp registrado en este servicio.');
      return;
    }

    const textoParaWhatsApp = textoMensaje.trim() 
      ? textoMensaje 
      : `Hola, vi tu servicio "${servicio.nombre}" en Moa Tradecenter y me interesa.`;
      
    const urlWhatsApp = `https://wa.me/${servicio.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(textoParaWhatsApp)}`;
    window.open(urlWhatsApp, '_blank');

    setEnviando(true);
    try {
      await axios.post(`${API_URL}/mensajes`, {
        vendedorId: servicio.vendedorId,
        servicioId: servicio._id,
        whatsappComprador: whatsapp,
        texto: textoMensaje,
      });
      
      await axios.post(`${API_URL}/eventos`, {
        productoId: servicio._id,
        vendedorId: servicio.vendedorId,
        tipo: 'servicio',
      });

      onClose();
    } catch (err) {
      console.error(err);
      onClose(); 
    } finally {
      setEnviando(false);
    }
  };

  const seleccionarPrestador = (p: Prestador) => {
    setPrestadorSeleccionado(p);
    setError(null);
  };

  const solicitarDomicilio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!prestadorSeleccionado) {
      setError('Selecciona un prestador de domicilio.');
      return;
    }
    if (!esWhatsappValido) {
      setError('Ingresa un WhatsApp válido con formato cubano (+53 5XXXXXXX o +53 6XXXXXXX).');
      return;
    }

    const textoParaWhatsApp = `Hola ${prestadorSeleccionado.nick}, necesito un domicilio para el servicio "${servicio.nombre}". Mi WhatsApp es ${whatsapp}.`;
    const urlWhatsApp = `https://wa.me/${prestadorSeleccionado.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(textoParaWhatsApp)}`;
    window.open(urlWhatsApp, '_blank');

    setEnviando(true);
    try {
      await axios.post(`${API_URL}/solicitudes-domicilio`, {
        prestadorId: prestadorSeleccionado._id,
        servicioId: servicio._id,
        whatsappComprador: whatsapp,
      });

      await axios.post(`${API_URL}/eventos`, {
        productoId: servicio._id,
        vendedorId: servicio.vendedorId,
        tipo: 'domicilio'
      });

      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2C2C2C]/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-[20px] max-w-lg w-full max-h-[calc(100vh-4rem)] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>

        {/* Cabecera fija */}
        <div className="p-6 border-b border-[#D9D4CC] relative flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F0E8] text-[#2C2C2C] hover:bg-[#E8E2D9]">✕</button>
          <h2 className="text-2xl font-extrabold text-[#2C2C2C] mb-2 pr-8">{servicio.nombre}</h2>
          <p className="text-[#6B6B6B] text-sm mb-4">{servicio.descripcion}</p>
          <div className="flex items-baseline">
            <span className={`text-3xl font-extrabold ${themeColors.accent}`}>${precioFormateado}</span>
            <span className="text-sm text-[#6B6B6B] ml-2">CUP</span>
          </div>
        </div>

        {/* Cuerpo con scroll */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {servicio.direccion && (
            <div className="bg-gray-50 rounded-[10px] p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-[#2C2C2C] mb-1 uppercase tracking-wider">📍 Ubicación</h3>
              <p className="text-sm text-[#6B6B6B]">{servicio.direccion}</p>
            </div>
          )}

          {servicio.horario && (
            <div className="bg-gray-50 rounded-[10px] p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-[#2C2C2C] mb-1 uppercase tracking-wider">🕒 Horario</h3>
              <p className="text-sm text-[#6B6B6B]">{servicio.horario}</p>
            </div>
          )}

          {servicio.menu && servicio.menu.length > 0 && (
            <div className="bg-gray-50 rounded-[10px] p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-[#2C2C2C] mb-3 uppercase tracking-wider">📋 Menú / Lista de precios</h3>
              <ul className="space-y-2">
                {servicio.menu.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-sm border-b border-gray-200 pb-1 last:border-0">
                    <span className="text-[#6B6B6B]">{item.item}</span>
                    <span className="font-bold text-[#2C2C2C]">${Math.round(item.precio / 100)} CUP</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {servicio.esDomicilio && vista !== 'domicilio' && (
            <div className={`rounded-[10px] p-4 border mt-2 ${themeColors.accentBg} ${themeColors.accentBorder}`}>
              <p className={`text-sm font-bold flex items-center gap-2 ${themeColors.accent}`}>
                🛵 Este servicio ofrece atención a domicilio
              </p>
              <p className={`text-xs mt-1 opacity-80 ${themeColors.accent}`}>
                Puedes solicitar un prestador para que te lleve el servicio a tu casa.
              </p>
            </div>
          )}

          {/* FLUJO DE DOMICILIO DENTRO DEL MODAL */}
          {vista === 'domicilio' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#2C2C2C]">🛵 Solicitar domicilio</h3>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">Tu WhatsApp *</label>
              <InputWhatsApp value={whatsapp} onChange={(val) => { setWhatsapp(val); setError(null); }} />
              {!esWhatsappValido && whatsapp && <p className="text-xs text-[#B83A2E]">Formato inválido. Usa +53 5XXXXXXX.</p>}
              {error && <p className="text-xs text-[#B83A2E]">{error}</p>}
              
              <div className="border border-[#D9D4CC] rounded-[10px] p-3 bg-white/10 backdrop-blur-md border border-white/20/50">
                <p className="text-xs font-bold text-[#2C2C2C] mb-2 uppercase tracking-wider">Elige un prestador de domicilio</p>
                {prestadoresCargando ? (
                  <p className="text-sm text-[#6B6B6B]">Cargando prestadores...</p>
                ) : prestadores.length === 0 ? (
                  <p className="text-sm text-[#6B6B6B]">No hay prestadores disponibles en este momento.</p>
                ) : (
                  <div className="space-y-2">
                    {prestadores.map((p) => (
                      <button key={p._id} onClick={() => seleccionarPrestador(p)} disabled={!p.disponible} className={`w-full flex items-center justify-between p-2.5 rounded-[8px] border text-left transition ${prestadorSeleccionado?._id === p._id ? 'bg-[#FFEDD5] border-[#F97316]' : 'bg-white border-[#D9D4CC] hover:bg-white/10 backdrop-blur-md border border-white/20'}`}>
                        <div>
                          <span className="text-sm font-bold text-[#2C2C2C] block">{p.nick}</span>
                          <span className="text-xs text-[#6B6B6B]">{p.disponible ? 'Disponible' : 'No disponible'} • Tarifa ${(p.tarifaDomicilio / 100).toFixed(2)} CUP</span>
                        </div>
                        <span className="text-xs text-[#F97316] font-medium">{p.whatsapp}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setVista('detalle')}
                  className="flex-1 border border-[#D9D4CC] rounded-[10px] py-2 text-[#6B6B6B] font-medium"
                >
                  Volver
                </button>
                <button
                  onClick={solicitarDomicilio}
                  disabled={!prestadorSeleccionado || !esWhatsappValido || enviando}
                  className={`flex-1 py-2 rounded-[10px] font-bold text-white transition ${
                    prestadorSeleccionado && esWhatsappValido && !enviando
                      ? 'bg-[#F97316] hover:bg-[#EA580C]'
                      : 'bg-[#D9D4CC] text-[#6B6B6B] cursor-not-allowed'
                  }`}
                >
                  {enviando ? 'Abriendo...' : 'Abrir WhatsApp'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer fijo (Botones de Contacto) */}
        <div className="p-6 border-t border-[#D9D4CC] flex-shrink-0 bg-white rounded-b-[20px]">
          {vista === 'detalle' && (
            <div className={`grid ${tema !== 'coral' && servicio.esDomicilio ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              <button
                onClick={abrirContacto}
                className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-[10px] font-bold transition-colors ${themeColors.button}`}
              >
                💬 Mensaje
              </button>
              
              {/* 🔥 Solo mostramos Domicilio si NO es coral (prestadores) y si el servicio lo ofrece */}
              {tema !== 'coral' && servicio.esDomicilio && (
                <button
                  onClick={abrirDomicilio}
                  className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white py-3 rounded-[10px] font-bold transition-colors"
                >
                  🛵 Domicilio
                </button>
              )}
            </div>
          )}

          {vista === 'contacto' && (
            <form onSubmit={enviarMensaje} className="space-y-3">
              <InputWhatsApp
                onChange={(val) => setWhatsapp(val)}
                value={whatsapp}
              />
              <textarea
                value={textoMensaje}
                onChange={(e) => setTextoMensaje(e.target.value)}
                placeholder="Escribe tu consulta o mensaje..."
                className={`w-full px-3 py-2 rounded-[10px] border border-[#D9D4CC] outline-none resize-y ${themeColors.inputFocus}`}
                rows={2}
              />
              {error && <p className="text-sm text-[#B83A2E]">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVista('detalle')}
                  className="flex-1 border border-[#D9D4CC] rounded-[10px] py-2 text-[#6B6B6B] font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !esWhatsappValido}
                  className={`flex-1 py-2 rounded-[10px] font-bold text-white text-sm transition ${
                    enviando || !esWhatsappValido 
                      ? 'bg-[#D9D4CC] text-[#6B6B6B] cursor-not-allowed' 
                      : themeColors.button
                  }`}
                >
                  {enviando ? 'Abriendo...' : 'Abrir WhatsApp'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}