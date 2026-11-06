import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // CREDENCIALES SECRETAS (Cámbialas si quieres)
  const SECRET_USER = 'admin_moa';
  const SECRET_PASS = 'moa_super_secret_2026';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username === SECRET_USER && password === SECRET_PASS) {
      // Guardar sesión de admin
      localStorage.setItem('moa_user', JSON.stringify({ rol: 'admin', nick: 'admin_moa' }));
      // Redirigir al panel
      navigate('/moa/panel');
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white p-8 rounded-[20px] shadow-lg border border-[#D9D4CC] max-w-sm w-full">
        <h2 className="text-2xl font-extrabold text-[#2C2C2C] mb-6 text-center">Acceso Restringido</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Usuario</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 outline-none focus:border-[#A63A2B]" 
              placeholder="Usuario"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-[#D9D4CC] rounded-[8px] px-3 py-2 outline-none focus:border-[#A63A2B]" 
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-[#B83A2E] font-medium text-center">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-[#2C2C2C] hover:bg-black text-white py-3 rounded-[10px] font-bold transition-colors mt-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}