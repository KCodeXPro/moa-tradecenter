import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './Home';
import Productos from './pages/Productos';
import Servicios from './pages/Servicios';
import LoginModal from './components/LoginModal';
import ModalRegistro from './components/ModalRegistro';
import PanelVendedor from './pages/PanelVendedor';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ComoFunciona from './pages/ComoFunciona';
import Privacidad from './pages/Privacidad';
import Contacto from './pages/Contacto';
import Prestadores from './pages/Prestadores';
import AdminLoginForm from './components/AdminLoginForm';
import UbicacionVendedor from './pages/UbicacionVendedor';
import VentaDivisas from './pages/VentaDivisas';

interface Usuario {
  _id?: string;
  rol: string;
  nick: string;
  whatsapp?: string;
}

function ScrollToTop() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    // 🔥 Si venimos con la intención de ir al buscador, el Home se encarga.
    // No hacemos scroll al top para no interferir.
    if (state && (state as any).scrollToBuscador) {
      return;
    }

    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, state]);

  return null;
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegistroOpen, setIsRegistroOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const saved = localStorage.getItem('moa_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && parsed.nick) {
            setUsuario(parsed);
          } else {
            setUsuario(null);
          }
        } catch (err) {
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('moa_login', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('moa_login', checkUser);
    };
  }, []);

  const handleLogin = (user: Usuario) => {
    if (!user || !user.rol || !user.nick) return;

    const userData = {
      rol: user.rol,
      nick: user.nick,
      _id: user._id,
      whatsapp: user.whatsapp,
    };

    localStorage.setItem('moa_user', JSON.stringify(userData));
    setUsuario(userData);
    
    if (user.rol === 'admin') {
      navigate('/moa/panel');
    } else {
      navigate('/panel');
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('moa_user');
    navigate('/'); 
  };

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegistroOpen(true);
  };

  const rutasSinLimite = ['/', '/productos', '/servicios', '/prestadores', '/divisas'];
  const sinLimite = rutasSinLimite.includes(location.pathname) || location.pathname.startsWith('/ubicacion/');

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2C2C2C] font-sans flex flex-col">
      <ScrollToTop />
      
      <Navbar 
        usuario={usuario} 
        onLogout={handleLogout} 
        onLogin={() => setIsLoginOpen(true)} 
        onRegister={() => setIsRegistroOpen(true)}
      />

      <main className={`flex-grow w-full ${sinLimite ? '' : 'max-w-6xl mx-auto p-4 py-8 pt-32'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos key={location.pathname} />} />
          <Route path="/servicios" element={<Servicios key={location.pathname} />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/prestadores" element={<Prestadores />} />
          <Route path="/moa" element={<AdminLoginForm />} />
          <Route path="/moa/panel" element={<AdminPanel />} />
          <Route path="/panel" element={<PanelVendedor key={location.pathname} />} />
          <Route path="/ubicacion/:nick" element={<UbicacionVendedor />} />
          <Route path="/divisas" element={<VentaDivisas />} />
        </Routes>
      </main>

      <Footer />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onSwitchToRegister={handleSwitchToRegister}
      />
      
      <ModalRegistro
        isOpen={isRegistroOpen}
        onClose={() => setIsRegistroOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}