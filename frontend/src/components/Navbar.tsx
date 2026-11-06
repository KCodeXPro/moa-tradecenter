import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const DIRECTORY_LINKS = [
  { path: '/productos', label: 'Productos' },
  { path: '/servicios', label: 'Servicios' },
  { path: '/divisas', label: 'Venta de Divisas' },
  { path: '/prestadores', label: 'Domiciliarios' },
];

const OTHER_LINKS = [
  { path: '/como-funciona', label: 'Cómo funciona' },
  { path: '/privacidad', label: 'Privacidad' },
  { path: '/contacto', label: 'Contacto' },
];

const LOGO_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform duration-300 group-hover:scale-110">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const HAMBURGER_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CLOSE_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CHEVRON_DOWN_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 inline-block">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

interface NavbarProps {
  usuario: { rol: string; nick: string } | null;
  onLogout: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export default function Navbar({ usuario, onLogout, onLogin, onRegister }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileDirOpen, setIsMobileDirOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  
  const isHome = location.pathname === '/';
  const isActive = (path: string) => location.pathname === path;
  const isDirectoryActive = DIRECTORY_LINKS.some(link => isActive(link.path));
  
  const isInVendorPanel = location.pathname === '/panel';
  const isInAdminPanel = location.pathname === '/moa/panel';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);

    if (isHome) {
      const element = document.getElementById('buscador');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollToBuscador: true } });
    }
  };

  const isTransparent = isHome && !scrolled;

  const navBg = isTransparent
    ? 'bg-[#1A1A1A]/40 backdrop-blur-md shadow-lg py-3 mt-4 lg:mt-6'
    : 'bg-[#1A1A1A]/95 backdrop-blur-xl shadow-2xl py-2 mt-2 lg:mt-4 border border-white/10';
    
  const linkColor = isTransparent ? 'text-white/90' : 'text-gray-200';
  const linkHover = 'hover:text-white hover:bg-white/10 hover:border-[#A63A2B]';
  const linkActive = 'bg-white/20 text-white shadow-sm';
  
  const mobileMenuBg = 'bg-[#1A1A1A]/95 backdrop-blur-xl border border-gray-700 rounded-[24px]';
  const mobileLinkColor = 'text-gray-200';
  const mobileLinkHover = 'hover:text-white hover:bg-white/10';
  const mobileLinkActive = 'bg-white/20 text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out mx-auto w-[calc(100%-2rem)] max-w-5xl rounded-[24px] lg:rounded-full ${navBg}`}>
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="text-white bg-[#A63A2B] p-1.5 rounded-[10px] shadow-md group-hover:scale-105 transition-transform">
              {LOGO_SVG}
            </div>
            <span className="font-extrabold tracking-tight text-lg text-white drop-shadow-sm">
              Moa <span className="text-gray-300 font-medium">Tradecenter</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive('/') ? linkActive : `${linkColor} ${linkHover}`}`}>
              Inicio
            </Link>

            <div className="relative group">
              <button className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isDirectoryActive ? linkActive : `${linkColor} ${linkHover}`}`}>
                Directorio
                <span className="ml-1 transition-transform duration-200 group-hover:rotate-180">
                  {CHEVRON_DOWN_SVG}
                </span>
              </button>
              
              <div className="absolute left-0 mt-3 w-48 bg-[#1A1A1A]/95 backdrop-blur-xl border border-gray-700 rounded-[16px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <div className="py-1.5">
                  {DIRECTORY_LINKS.map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className={`block px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors ${isActive(link.path) ? 'bg-white/10 text-white' : ''}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleNavClick}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${linkColor} ${linkHover}`}
            >
              Buscar Dirección
            </button>

            {OTHER_LINKS.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive(link.path) ? linkActive : `${linkColor} ${linkHover}`}`}
              >
                {link.label}
              </Link>
            ))}
            
            {usuario ? (
              <div className="relative ml-2" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-[#A63A2B] flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-transparent hover:ring-white/30 transition-all">
                    {usuario.nick.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-56 bg-[#1A1A1A]/95 backdrop-blur-xl border border-gray-700 rounded-[16px] shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700 bg-white/5">
                      <p className="text-sm font-bold text-white truncate">{usuario.nick}</p>
                      <p className="text-xs text-gray-400 capitalize">{usuario.rol}</p>
                    </div>
                    
                    <div className="py-1.5">
                      {usuario.rol === 'vendedor' && !isInVendorPanel && (
                        <Link 
                          to="/panel" 
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Mi Panel
                        </Link>
                      )}
                      
                      {usuario.rol === 'admin' && !isInAdminPanel && (
                        <Link 
                          to="/moa/panel" 
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Panel de Administración
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border-t border-gray-700/50 mt-1"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <button onClick={onRegister} className="px-3 py-2 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                  Registrarse
                </button>
                <button onClick={onLogin} className="px-4 py-2 rounded-full bg-[#A63A2B] text-white text-sm font-semibold hover:bg-[#7A2A1F] transition-all duration-200 shadow-md">
                  Entrar
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors">
            {isOpen ? CLOSE_SVG : HAMBURGER_SVG}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={`md:hidden absolute top-full left-0 w-full mt-3 ${mobileMenuBg} shadow-2xl overflow-hidden`}>
          <div className="px-4 py-4">
            <div className="space-y-1">
              <Link to="/" onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-[12px] text-base font-medium transition-all duration-200 ${isActive('/') ? mobileLinkActive : `${mobileLinkColor} ${mobileLinkHover}`}`}>
                Inicio
              </Link>

              <div>
                <button 
                  onClick={() => setIsMobileDirOpen(!isMobileDirOpen)} 
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-[12px] text-base font-medium transition-all duration-200 ${isDirectoryActive ? mobileLinkActive : `${mobileLinkColor} ${mobileLinkHover}`}`}
                >
                  Directorio
                  <span className={`transition-transform duration-200 ${isMobileDirOpen ? 'rotate-180' : ''}`}>
                    {CHEVRON_DOWN_SVG}
                  </span>
                </button>
                
                {isMobileDirOpen && (
                  <div className="pl-4 pr-2 py-1 space-y-1">
                    {DIRECTORY_LINKS.map((link) => (
                      <Link 
                        key={link.path} 
                        to={link.path} 
                        onClick={() => setIsOpen(false)} 
                        className={`block px-4 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${isActive(link.path) ? mobileLinkActive : `${mobileLinkColor} ${mobileLinkHover}`}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleNavClick}
                className={`block w-full text-left px-4 py-3 rounded-[12px] text-base font-medium transition-all duration-200 ${mobileLinkColor} ${mobileLinkHover}`}
              >
                Buscar Dirección
              </button>

              {OTHER_LINKS.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)} 
                  className={`block px-4 py-3 rounded-[12px] text-base font-medium transition-all duration-200 ${isActive(link.path) ? mobileLinkActive : `${mobileLinkColor} ${mobileLinkHover}`}`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-white/10 mt-3 pt-3 space-y-2">
                {usuario ? (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-gray-400">Hola, {usuario.nick}</div>
                    
                    {usuario.rol === 'vendedor' && !isInVendorPanel && (
                      <Link to="/panel" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-[10px] text-base font-medium text-white hover:bg-white/10">Mi Panel</Link>
                    )}

                    {usuario.rol === 'admin' && !isInAdminPanel && (
                      <Link to="/moa/panel" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-[10px] text-base font-medium text-white hover:bg-white/10">Panel de Administración</Link>
                    )}

                    <button onClick={onLogout} className="block px-4 py-3 rounded-[10px] text-base font-semibold bg-[#A63A2B] text-white hover:bg-[#7A2A1F] transition-all w-full text-center mt-2">
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <button onClick={() => { setIsOpen(false); onRegister(); }} className="block w-full px-4 py-3 rounded-[10px] border border-white/20 text-white text-base font-semibold text-center hover:bg-white/10 transition-colors">
                      Registrarse
                    </button>
                    <button onClick={() => { setIsOpen(false); onLogin(); }} className="block w-full px-4 py-3 rounded-[10px] bg-[#A63A2B] text-white text-base font-semibold text-center hover:bg-[#7A2A1F] transition-all">
                      Iniciar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}