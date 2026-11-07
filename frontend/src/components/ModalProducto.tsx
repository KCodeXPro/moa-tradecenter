import { useState, useEffect } from 'react';
import axios from 'axios';
import InputWhatsApp from './InputWhatsApp';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const WHATSAPP_REGEX = /^\+53\s?[56]\d{7}$/;

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
  whatsapp?: string; // 🔥 AGREGADO
}

interface Prestador {
  _id: string;
  nick: string;
  whatsapp: string;
  tarifaDomicilio: number;
  disponible: boolean;
}

type ModalVista =
  | null
  | 'mensaje'
  | 'domicilio-whatsapp'
  | 'domicilio-resumen'
  | 'exito';

interface Props {
  producto: Producto | null;
  onClose: () => void;
}

export default function ModalProducto({ producto, onClose }: Props) {
  const [imagenActiva, setImagenActiva] = useState(0);
  const [vista, setVista] = useState<ModalVista>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [textoMensaje, setTextoMensaje] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ultimaAccion, setUltimaAccion] = useState<'mensaje' | 'domicilio' | null>(null);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState<Prestador | null>(null);
  const [prestadoresCargando, setPrestadoresCargando] = useState(false);

  useEffect(() => {
    setImagenActiva(0);
    setVista(null);
    setWhatsapp('');
    setTextoMensaje('');
    setError(null);
    setPrestadorSeleccionado(null);
  }, [producto]);

  if (!producto) return null;

  const tieneImagenes = producto.imagenes && producto.imagenes.length > 0;
  const fotoPrincipal = tieneImagenes ? producto.imagenes![imagenActiva] : null;
  const precioFormateado = (producto.precio / 100).toFixed(2);
  const esWhatsappValido = WHATSAPP_REGEX.test(whatsapp);
  const formatoCentavos = (centavos: number) => (centavos / 100).toFixed(2);

  const abrirMensaje = () => {
    setError(null);
    setVista('mensaje');
  };

  const abrirDomicilio = () => {
    if (!producto.tieneDomicilio) return;
    setError(null);
    setVista('domicilio-whatsapp');
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

  // 🔥 FUNCIÓN MODIFICADA
  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!esWhatsappValido) {
      setError('Ingresa un WhatsApp válido con formato cubano (+53 5XXXXXXX).');
      return;
    }

    // 1. Abrimos WhatsApp PRIMERO (para que el navegador no lo bloquee)
    const textoParaWhatsApp = textoMensaje.trim() 
      ? textoMensaje 
      : `Hola, vi tu producto "${producto.nombre}" en Moa Tradecenter y me interesa.`;
    
    const urlWhatsApp = `https://wa.me/${producto.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(textoParaWhatsApp)}`;
    window.open(urlWhatsApp, '_blank');

    // 2. Guardamos en la base de datos (en segundo plano)
    setEnviando(true);
    try {
      await axios.post(`${API_URL}/mensajes`, {
        vendedorId: producto.vendedorId,
        productoId: producto._id,
        whatsappComprador: whatsapp,
        texto: textoMensaje,
      });
      await axios.post(`${API_URL}/eventos`, {
        productoId: producto._id,
        vendedorId: producto.vendedorId,
        tipo: 'mensaje'
      });
      setUltimaAccion('mensaje');
      setVista('exito');
    } catch (err: any) {
      console.error(err);
      // Aunque falle el guardado en BD, WhatsApp ya se abrió, así que mostramos éxito igual
      setUltimaAccion('mensaje');
      setVista('exito');
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
      setError('Ingresa un WhatsApp válido con formato cubano (+53 5XXXXXXX).');
      return;
    }

    // 1. Abrimos WhatsApp del prestador PRIMERO
    const textoParaWhatsApp = `Hola ${prestadorSeleccionado.nick}, necesito un domicilio para el producto "${producto.nombre}". Mi WhatsApp es ${whatsapp}.`;
    const urlWhatsApp = `https://wa.me/${prestadorSeleccionado.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(textoParaWhatsApp)}`;
    window.open(urlWhatsApp, '_blank');

    // 2. Guardamos en la base de datos
    setEnviando(true);
    try {
      await axios.post(`${API_URL}/solicitudes-domicilio`, {
        prestadorId: prestadorSeleccionado._id,
        productoId: producto._id,
        whatsappComprador: whatsapp,
      });

      await axios.post(`${API_URL}/eventos`, {
        productoId: producto._id,
        vendedorId: producto.vendedorId,
        tipo: 'domicilio'
      });

      setUltimaAccion('domicilio');
      setVista('exito');
    } catch (err: any) {
      console.error(err);
      setUltimaAccion('domicilio');
      setVista('exito');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#2C2C2C]/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] max-w-lg w-full max-h-[90vh] flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER FIJO */}
        <div className="p-6 border-b border-[#D9D4CC] relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#2C2C2C] z-10 hover:bg-[#E8E2D9]"
          >
            ✕
          </button>
          <div className="mb-4">
            <div className="h-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-[14px] flex items-center justify-center overflow-hidden mb-2">
              {fotoPrincipal ? (
                <img src={fotoPrincipal} alt={producto.nombre} className="w-full h-full object-contain" />
              ) : (
                <span className="text-6xl text-[#D9D4CC]">📦</span>
              )}
            </div>
            {tieneImagenes && producto.imagenes!.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {producto.imagenes!.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImagenActiva(idx)}
                    className={`w-12 h-12 rounded-[8px] overflow-hidden border-2 flex-shrink-0 ${imagenActiva === idx ? 'border-[#A63A2B]' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-[#2C2C2C] mb-1 pr-8">{producto.nombre}</h2>
          <p className="text-[#6B6B6B] text-sm mb-3">{producto.descripcion}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-extrabold text-[#A63A2B]">${precioFormateado}</span>
              <span className="text-sm text-[#6B6B6B] ml-2">CUP</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${producto.tipoVenta === 'mayorista' ? 'bg-[#F0E6C8] text-[#8A6D1F]' : 'bg-[#E8D5C4] text-[#7A2A1F]'}`}>
              {producto.tipoVenta === 'mayorista' ? 'Mayorista' : 'Minorista'}
            </span>
          </div>
        </div>

        {/* BODY CON SCROLL */}
        <div className="p-6 overflow-y-auto flex-1">
          {producto.variantes && producto.variantes.length > 0 && vista === null && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[#2C2C2C] mb-2">Variantes disponibles:</h3>
              <div className="flex flex-wrap gap-2">
                {producto.variantes.map((v, i) => (
                  <span key={i} className="bg-white/10 backdrop-blur-md border border-white/20 border border-[#D9D4CC] text-xs px-2 py-1 rounded-[6px] text-[#6B6B6B]">
                    {v.color} - Talla {v.talla} <span className="text-[#4A7C59] font-bold">({v.cantidad} disp.)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {vista === 'exito' && (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-[#4A7C59]/10 flex items-center justify-center mx-auto mb-3 text-[#4A7C59] text-2xl">✓</div>
              <h3 className="font-bold text-[#2C2C2C] mb-2">Operación realizada</h3>
              <p className="text-[#6B6B6B] text-sm mb-4">
                {ultimaAccion === 'mensaje' ? 'Se ha abierto WhatsApp con tu mensaje. Solo presiona "Enviar" allí para contactar al vendedor.' : 'Se ha abierto WhatsApp del prestador. Solo presiona "Enviar" allí para solicitar tu domicilio.'}
              </p>
              <button onClick={onClose} className="bg-[#A63A2B] hover:bg-[#7A2A1F] text-white px-6 py-2 rounded-[10px] font-bold">Cerrar</button>
            </div>
          )}

          {vista === 'mensaje' && (
            <form onSubmit={enviarMensaje} className="space-y-3">
              <h3 className="text-base font-bold text-[#2C2C2C]">💬 Enviar mensaje al vendedor</h3>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">Tu WhatsApp *</label>
              <InputWhatsApp value={whatsapp} onChange={setWhatsapp} />
              {!esWhatsappValido && whatsapp && <p className="text-xs text-[#B83A2E]">Formato inválido. Usa +53 5XXXXXXX.</p>}
              {error && <p className="text-xs text-[#B83A2E]">{error}</p>}
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">Mensaje (opcional)</label>
              <textarea value={textoMensaje} onChange={(e) => setTextoMensaje(e.target.value)} placeholder="Tu consulta..." rows={2} className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 text-[#2C2C2C] focus:outline-none focus:border-[#A63A2B]" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setVista(null)} className="flex-1 border border-[#D9D4CC] rounded-[10px] py-2 text-[#6B6B6B] font-medium">Cancelar</button>
                <button type="submit" disabled={enviando || !esWhatsappValido} className={`flex-1 py-2 rounded-[10px] font-bold text-white transition ${esWhatsappValido && !enviando ? 'bg-[#A63A2B] hover:bg-[#7A2A1F]' : 'bg-[#D9D4CC] text-[#6B6B6B] cursor-not-allowed'}`}>
                  {enviando ? 'Enviando...' : 'Abrir WhatsApp'}
                </button>
              </div>
            </form>
          )}

          {vista === 'domicilio-whatsapp' && (
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
                          <span className="text-xs text-[#6B6B6B]">{p.disponible ? 'Disponible' : 'No disponible'} • Tarifa {formatoCentavos(p.tarifaDomicilio)} CUP</span>
                        </div>
                        <span className="text-xs text-[#F97316] font-medium">{p.whatsapp}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setVista(null)}
                  className="flex-1 border border-[#D9D4CC] rounded-[10px] py-2 text-[#6B6B6B] font-medium"
                >
                  Volver
                </button>
                <button
                  onClick={() => {
                    if (prestadorSeleccionado && esWhatsappValido) {
                      setVista('domicilio-resumen');
                    } else if (!prestadorSeleccionado) {
                      setError('Selecciona un prestador para continuar.');
                    }
                  }}
                  disabled={!prestadorSeleccionado || !esWhatsappValido || enviando}
                  className={`flex-1 py-2 rounded-[10px] font-bold text-white transition ${
                    prestadorSeleccionado && esWhatsappValido && !enviando
                      ? 'bg-[#F97316] hover:bg-[#EA580C]'
                      : 'bg-[#D9D4CC] text-[#6B6B6B] cursor-not-allowed'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {vista === 'domicilio-resumen' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#2C2C2C]">🛵 Confirmar solicitud de domicilio</h3>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[10px] p-3 border border-[#D9D4CC]">
                <p className="text-xs font-bold text-[#2C2C2C] mb-1 uppercase tracking-wider">Producto</p>
                <p className="text-sm text-[#2C2C2C] font-bold">{producto.nombre}</p>
                <p className="text-xs text-[#6B6B6B]">${precioFormateado} CUP</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[10px] p-3 border border-[#D9D4CC]">
                <p className="text-xs font-bold text-[#2C2C2C] mb-1 uppercase tracking-wider">Prestador</p>
                <p className="text-sm text-[#2C2C2C] font-bold">{prestadorSeleccionado?.nick}</p>
                <p className="text-xs text-[#6B6B6B]">Tarifa {formatoCentavos(prestadorSeleccionado!.tarifaDomicilio)} CUP • WhatsApp: <span className="font-bold text-[#F97316]">{prestadorSeleccionado!.whatsapp}</span></p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[10px] p-3 border border-[#D9D4CC]">
                <p className="text-xs font-bold text-[#2C2C2C] mb-1 uppercase tracking-wider">Tu WhatsApp</p>
                <p className="text-sm font-bold text-[#2C2C2C]">{whatsapp}</p>
                <p className="text-xs text-[#6B6B6B]">El prestador te contactará por este número.</p>
              </div>
              {error && <p className="text-xs text-[#B83A2E]">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setVista('domicilio-whatsapp')} className="flex-1 border border-[#D9D4CC] rounded-[10px] py-2 text-[#6B6B6B] font-medium">Volver</button>
                <button onClick={solicitarDomicilio} disabled={enviando} className={`flex-1 py-2 rounded-[10px] font-bold text-white transition ${!enviando ? 'bg-[#F97316] hover:bg-[#EA580C]' : 'bg-[#D9D4CC] text-[#6B6B6B] cursor-not-allowed'}`}>
                  {enviando ? 'Enviando...' : 'Abrir WhatsApp'}
                </button>
              </div>
            </div>
          )}

          {vista === null && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={abrirMensaje} className="bg-[#A63A2B] hover:bg-[#7A2A1F] text-white py-3 rounded-[10px] font-bold">💬 Mensaje</button>
              <button onClick={abrirDomicilio} disabled={!producto.tieneDomicilio} className={`py-3 rounded-[10px] font-bold transition ${producto.tieneDomicilio ? 'bg-[#F97316] hover:bg-[#EA580C] text-white' : 'bg-[#D9D4CC] text-[#6B6B6B] cursor-not-allowed'}`}>
                🛵 Domicilio
              </button>
            </div>
          )}
          {!producto.tieneDomicilio && vista === null && (
            <p className="text-xs text-[#6B6B6B] text-center mt-2">Este producto no dispone de servicio de domicilio. Usa &quot;Mensaje&quot; para contactar al vendedor.</p>
          )}
        </div>
      </div>
    </div>
  );
}