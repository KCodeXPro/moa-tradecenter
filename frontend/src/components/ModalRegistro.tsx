import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

interface ModalRegistroProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { rol: string; nick: string; _id?: string; whatsapp?: string; email?: string }) => void;
}

export default function ModalRegistro({ isOpen, onClose, onLogin }: ModalRegistroProps) {
  const [formData, setFormData] = useState({
    nick: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/usuarios/register', formData);
      
      alert('¡Registro exitoso! Bienvenido a Moa Tradecenter.');
      
      onLogin(res.data);
      onClose();
      
      navigate('/panel');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar. Intenta con otro nick.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2C2C2C]/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-[20px] max-w-md w-full shadow-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        <div className="p-6 border-b border-[#D9D4CC] flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-extrabold text-[#2C2C2C]">Crear Cuenta</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F0E8] text-[#2C2C2C] hover:bg-[#E8E2D9]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Nombre de tu Negocio (Nick) *</label>
            <input 
              required 
              name="nick" 
              value={formData.nick} 
              onChange={handleChange} 
              className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 focus:border-[#A63A2B] outline-none" 
              placeholder="Ej. barberia_elcubano" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Contraseña *</label>
            <input 
              required 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 focus:border-[#A63A2B] outline-none" 
              placeholder="••••••••" 
            />
          </div>

          {error && (
            <p className="text-sm text-[#B83A2E] font-medium bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#A63A2B] hover:bg-[#7A2A1F] text-white py-3 rounded-[10px] font-bold text-lg transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-[#D9D4CC]"></div>
            <span className="flex-shrink-0 mx-4 text-[#6B6B6B] text-sm">o</span>
            <div className="flex-grow border-t border-[#D9D4CC]"></div>
          </div>
          
          <p className="text-xs text-[#6B6B6B] text-center mb-3">Regístrate rápido con tu cuenta de Google</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  // Llamamos al endpoint de REGISTRO con Google
                  const res = await axios.post('/api/auth/google/register', {
                    token: credentialResponse.credential,
                  });
                  
                  alert(`¡Bienvenido a Moa Tradecenter, ${res.data.nick}!`);
                  onLogin(res.data);
                  onClose();
                  navigate('/panel');
                } catch (err: any) {
                  alert('Error al registrarse con Google: ' + (err.response?.data?.message || err.message));
                }
              }}
              onError={() => alert('Google login cancelado o fallido.')}
              shape="pill"
              theme="outline"
              size="large"
              width="350"
            />
          </div>
        </div>
      </div>
    </div>
  );
}