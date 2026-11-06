import { Link } from 'react-router-dom';

const LOGO_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] mt-auto border-t border-white/5 text-gray-400">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* CUADRÍCULA PRINCIPAL DE 4 COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* COLUMNA 1: MARCA Y DESCRIPCIÓN */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group w-fit">
              <div className="text-white bg-[#A63A2B] p-1.5 rounded-[8px] group-hover:scale-105 transition-transform">
                {LOGO_SVG}
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Moa Tradecenter
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              El directorio comercial local del municipio de Moa. Conectamos compradores con vendedores y prestadores de servicios de forma directa.
            </p>
            
            {/* REDES SOCIALES */}
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#4A7C59] hover:text-white transition-all" title="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2E6B8A] hover:text-white transition-all" title="Telegram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#A63A2B] hover:text-white transition-all" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: DIRECTORIO */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Directorio</h3>
            <ul className="space-y-3">
              <li><Link to="/productos" className="text-sm transition-colors hover:text-[#A63A2B]">Productos</Link></li>
              <li><Link to="/servicios" className="text-sm transition-colors hover:text-[#A63A2B]">Servicios</Link></li>
              <li><Link to="/prestadores" className="text-sm transition-colors hover:text-[#A63A2B]">Domiciliarios</Link></li>
              <li><Link to="/#buscador" className="text-sm transition-colors hover:text-[#A63A2B]">Buscar Dirección</Link></li>
            </ul>
          </div>

          {/* COLUMNA 3: SOPORTE */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Soporte</h3>
            <ul className="space-y-3">
              <li><Link to="/como-funciona" className="text-sm transition-colors hover:text-[#A63A2B]">Cómo funciona</Link></li>
              <li><Link to="/privacidad" className="text-sm transition-colors hover:text-[#A63A2B]">Políticas de privacidad</Link></li>
              <li><Link to="/contacto" className="text-sm transition-colors hover:text-[#A63A2B]">Contacto</Link></li>
            </ul>
          </div>

          {/* COLUMNA 4: INFORMACIÓN LOCAL */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Comunidad</h3>
            <p className="text-sm leading-relaxed mb-2">
              Hecho por y para los moenses.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full mt-2">
              <span className="text-lg">🇨🇺</span>
              <span className="text-xs font-semibold text-gray-300">Moa, Holguín</span>
            </div>
          </div>

        </div>

        {/* LÍNEA INFERIOR DE COPYRIGHT */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Moa Tradecenter. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 flex items-center gap-1">
            Hecho con <span className="text-[#A63A2B]">❤️</span> en Moa, Cuba
          </p>
        </div>
      </div>
    </footer>
  );
}