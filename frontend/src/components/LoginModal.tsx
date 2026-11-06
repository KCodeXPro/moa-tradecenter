import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { rol: string; nick: string; _id?: string; whatsapp?: string; email?: string }) => void;
  onSwitchToRegister: () => void; // 🔥 NUEVA PROP
}

export default function LoginModal({ isOpen, onClose, onLogin, onSwitchToRegister }: Props) {
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/usuarios/login', {
        nick,
        password,
      });
      onLogin(res.data);
      onClose();
      setNick('');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2C2C2C]/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.2)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#2C2C2C] font-bold text-xl">✕</button>
        
        <h2 className="text-2xl font-extrabold text-[#2C2C2C] mb-2 text-center">Acceso para Vendedores</h2>
        <p className="text-[#6B6B6B] text-sm text-center mb-6">Si eres comprador, no necesitas cuenta.</p>

        {/* Formulario tradicional */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Nombre de tu Negocio (Nick)</label>
            <input 
              type="text" 
              value={nick} 
              onChange={(e) => setNick(e.target.value)} 
              className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 outline-none focus:border-[#A63A2B]" 
              placeholder="Ej. barberia_elcubano"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#2C2C2C] mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 outline-none focus:border-[#A63A2B]" 
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-[#B83A2E] font-medium text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2C2C2C] hover:bg-black text-white py-3 rounded-[10px] font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Separador */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-[#D9D4CC]"></div>
          <span className="flex-shrink-0 mx-4 text-[#6B6B6B] text-sm">o</span>
          <div className="flex-grow border-t border-[#D9D4CC]"></div>
        </div>

        {/* Botón de Google */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const res = await axios.post('/api/auth/google', {
                  token: credentialResponse.credential,
                });
                onLogin(res.data);
                onClose();
              } catch (err: any) {
                // 🔥 LÓGICA PARA DETECTAR SI NO ESTÁ REGISTRADO
                if (err.response?.status === 401) {
                  alert(err.response?.data?.message || 'Esta cuenta no está registrada. Por favor, regístrate primero.');
                  onClose();
                  onSwitchToRegister(); // Abre el modal de registro
                } else {
                  alert('Error al iniciar sesión con Google: ' + (err.response?.data?.message || err.message));
                }
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
  );
}