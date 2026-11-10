import { useState, useEffect } from 'react';
import axios from 'axios';
import InputWhatsApp from './InputWhatsApp';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuario: { _id: string; nick: string; whatsapp?: string; esPrestador?: boolean; tarifaDomicilio?: number };
  onSuccess: () => void;
}

export default function ModalCompletarPerfil({ isOpen, onClose, usuario, onSuccess }: Props) {
  const [whatsapp, setWhatsApp] = useState('');
  const [esRepartidor, setEsRepartidor] = useState(false);
  const [tarifaDomicilio, setTarifaDomicilio] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 🔥 CARGAR DATOS DEL USUARIO AL ABRIR EL MODAL
  useEffect(() => {
    if (isOpen && usuario) {
      setWhatsApp(usuario.whatsapp || '');
      setEsRepartidor(usuario.esPrestador || false);
      setTarifaDomicilio(usuario.tarifaDomicilio ? (usuario.tarifaDomicilio / 100).toString() : '');
      setError(null);
    }
  }, [isOpen, usuario]);

  // Validación del WhatsApp en tiempo real
  const esWhatsappValido = /^\+53\s?[56]\d{7}$/.test(whatsapp);
  const formularioInvalido = !esWhatsappValido || (esRepartidor && (!tarifaDomicilio || Number(tarifaDomicilio) <= 0));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!esWhatsappValido) {
      setError('Ingresa un número de WhatsApp válido (debe empezar con 5 o 6 y tener 8 dígitos).');
      return;
    }

    if (esRepartidor && (!tarifaDomicilio || Number(tarifaDomicilio) <= 0)) {
      setError('Si eres repartidor, debes indicar tu tarifa de domicilio.');
      return;
    }

    setError(null);
    try {
      const payload = {
        whatsapp,
        esPrestador: esRepartidor,
        tarifaDomicilio: esRepartidor ? Number(tarifaDomicilio) * 100 : 0,
      };

      await axios.patch(`/api/usuarios/${usuario._id}/perfil`, payload);

      // 🔥 Llamamos a onSuccess() que recargará el usuario desde el backend
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    }
  };

  // 🔥 Determinar si es la primera vez o una actualización
  const esPrimeraVez = !usuario.whatsapp;

  return (
    <div className="fixed inset-0 bg-[#2C2C2C]/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-[#2C2C2C]">
            {esPrimeraVez ? 'Completar Perfil' : 'Editar Perfil'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F0E8] text-[#2C2C2C] hover:bg-[#E8E2D9]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Número de WhatsApp *</label>
            <InputWhatsApp 
              value={whatsapp} 
              onChange={(val) => {
                setWhatsApp(val);
                setError(null);
              }} 
            />
            {!esWhatsappValido && whatsapp.length > 0 && (
              <p className="text-xs text-[#B83A2E] mt-1">
                Formato inválido. Usa +53 5XXXXXXX o +53 6XXXXXXX.
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input 
                type="checkbox" 
                checked={esRepartidor} 
                onChange={(e) => setEsRepartidor(e.target.checked)} 
                className="w-5 h-5 accent-[#2E6B8A]"
              /> Soy Repartidor / Domiciliario
            </label>
            <p className="text-xs text-[#6B6B6B] ml-7 mt-1">
              Mi trabajo principal es entregar productos a domicilio.
            </p>
          </div>

          {esRepartidor && (
            <div className="bg-blue-50 p-3 rounded-[10px] border border-blue-200">
              <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Tarifa por Envío (CUP) *</label>
              <input 
                type="number" 
                value={tarifaDomicilio} 
                onChange={(e) => setTarifaDomicilio(e.target.value)} 
                placeholder="Ej. 200"
                className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2"
                min="1"
                required={esRepartidor}
              />
              <p className="text-xs text-[#6B6B6B] mt-1">
                Esta es la tarifa que cobras por cada entrega. Los clientes la verán antes de contactarte.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-[#B83A2E] font-medium bg-red-50 p-2 rounded">{error}</p>}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={formularioInvalido} 
              className={`w-full py-3 rounded-[10px] font-bold transition-colors ${
                formularioInvalido 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#A63A2B] hover:bg-[#7A2A1F] text-white'
              }`}
            >
              {esPrimeraVez ? 'Guardar Perfil' : 'Actualizar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}