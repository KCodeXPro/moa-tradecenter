import BuscadorDirecciones from './components/BuscadorDirecciones';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductoCard from "./components/ProductoCard";
import ServicioCard from "./components/ServicioCard";
import ModalProducto from "./components/ModalProducto";

interface Producto {
  _id: string;
  vendedorId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipoVenta: string;
  tieneDomicilio: boolean;
  imagenes?: string[];
  variantes?: any[];
  createdAt?: string;
}

interface Servicio {
  _id: string;
  vendedorId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  esDomicilio: boolean;
}

export default function Home() {
  const [ultimosProductos, setUltimosProductos] = useState<Producto[]>([]);
  const [ultimosServicios, setUltimosServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [busquedaHero, setBusquedaHero] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 EFECTO PARA DETECTAR SI VENIMOS CON LA INTENCIÓN DE IR AL BUSCADOR
  useEffect(() => {
    if (location.state && (location.state as any).scrollToBuscador) {
      const timer = setTimeout(() => {
        const element = document.getElementById('buscador');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/productos'),
      axios.get('/api/servicios')
    ])
    .then(([resProductos, resServicios]) => {
      const prodData = Array.isArray(resProductos.data) ? resProductos.data : [];
      const servData = Array.isArray(resServicios.data) ? resServicios.data : [];

      const productosOrdenados = [...prodData].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUltimosProductos(productosOrdenados.slice(0, 12));
      
      const serviciosOrdenados = [...servData].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUltimosServicios(serviciosOrdenados.slice(0, 8));
      
      setCargando(false);
    })
    .catch((err) => {
      console.error(err);
      setCargando(false);
    });
  }, []);

  const handleBuscarHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (busquedaHero.trim()) {
      navigate(`/productos?q=${encodeURIComponent(busquedaHero)}`);
    } else {
      navigate('/productos');
    }
  };

  return (
    <div className="space-y-20 pb-20 bg-[#FAFAFA]">
      
      {/* 1. HERO SECTION REDISEÑADO */}
      <section className="relative w-full overflow-hidden bg-[#1A1A1A]">
        <div 
          className="absolute inset-0 opacity-40 blur-[2px] scale-105"
          style={{ 
            backgroundImage: "url('/hero-bg.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/80 to-transparent"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col lg:flex-row items-center gap-12">
          
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-[#F5F0E8] text-sm font-bold tracking-wider mb-6 backdrop-blur-sm">
              🇨🇺 Directorio Local de Moa
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight drop-shadow-lg">
              Todo lo que buscas, <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A63A2B] to-[#D96C5F]">
                cerca de ti.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl mx-auto lg:mx-0">
              Descubre productos, contacta servicios y solicita domicilio en tu municipio. Apoya el comercio local de forma directa por WhatsApp.
            </p>

            <form onSubmit={handleBuscarHero} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto lg:mx-0 bg-white/10 backdrop-blur-md p-2 rounded-[16px] border border-white/20 shadow-2xl">
              <input 
                type="text" 
                placeholder="¿Qué producto buscas hoy?" 
                value={busquedaHero}
                onChange={(e) => setBusquedaHero(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 outline-none w-full"
              />
              <button type="submit" className="bg-[#A63A2B] hover:bg-[#8B3024] text-white px-8 py-3 rounded-[12px] font-bold transition-all shadow-lg whitespace-nowrap">
                Buscar
              </button>
            </form>
            
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-400">
              <span>Popular:</span>
              <Link to="/servicios" className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4">Servicios</Link>
              <Link to="/prestadores" className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4">Domiciliarios</Link>
              <Link to="/productos" className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4">Productos</Link>
            </div>
          </div>

          <div className="hidden lg:block flex-1 relative">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-[#A63A2B] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-[#4A7C59] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 p-4 rounded-[24px] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="h-64 rounded-[16px] overflow-hidden bg-gray-100 relative group">
                 <img src="/hero-bg.webp" alt="Ejemplo local" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#2C2C2C] shadow-sm">
                   ⭐ Destacado
                 </div>
              </div>
              <div className="mt-4 px-2 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-extrabold text-xl text-[#2C2C2C]">Productos Locales</h3>
                    <p className="text-sm text-[#6B6B6B]">Directo del vendedor</p>
                  </div>
                  <div className="bg-[#A63A2B] text-white p-2 rounded-full shadow-md">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                   <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                     <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                     <div className="w-8 h-8 rounded-full bg-[#4A7C59] border-2 border-white flex items-center justify-center text-xs text-white font-bold">+10</div>
                   </div>
                   <span className="text-xs font-medium text-[#6B6B6B]">vendedores activos</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* 2. ÚLTIMOS PRODUCTOS */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b border-[#D9D4CC] pb-4">
            <div>
              <h2 className="text-3xl font-extrabold text-[#2C2C2C]">Novedades en Productos</h2>
              <p className="text-[#6B6B6B] mt-1">Los últimos productos añadidos por los vendedores.</p>
            </div>
            <Link to="/productos" className="text-[#A63A2B] font-bold hover:underline hidden sm:flex items-center gap-1">
              Ver todos <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          
          {cargando ? (
            <div className="text-center py-12 text-[#6B6B6B]">Cargando productos...</div>
          ) : ultimosProductos.length === 0 ? (
            <div className="text-center py-12 text-[#6B6B6B]">Aún no hay productos publicados.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {ultimosProductos.map(prod => (
                <ProductoCard key={prod._id} producto={prod} onSelect={setProductoSeleccionado} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/productos" className="inline-block bg-white text-[#A63A2B] px-6 py-3 rounded-full font-bold border border-[#D9D4CC] hover:bg-gray-50 transition-colors">Ver todos los productos</Link>
          </div>
        </section>

        {/* 3. ÚLTIMOS SERVICIOS */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b border-[#D9D4CC] pb-4">
            <div>
              <h2 className="text-3xl font-extrabold text-[#2C2C2C]">Nuevos Servicios</h2>
              <p className="text-[#6B6B6B] mt-1">Los servicios más recientes ofrecidos en Moa.</p>
            </div>
            <Link to="/servicios" className="text-[#4A7C59] font-bold hover:underline hidden sm:flex items-center gap-1">
              Ver todos <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {cargando ? (
            <div className="text-center py-12 text-[#6B6B6B]">Cargando servicios...</div>
          ) : ultimosServicios.length === 0 ? (
            <div className="text-center py-12 text-[#6B6B6B]">Aún no hay servicios publicados.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {ultimosServicios.map(serv => (
                <ServicioCard key={serv._id} servicio={serv} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/servicios" className="inline-block bg-white text-[#4A7C59] px-6 py-3 rounded-full font-bold border border-[#D9D4CC] hover:bg-gray-50 transition-colors">Ver todos los servicios</Link>
          </div>
        </section>

        {/* 4. SECCIÓN DE MAPA / BUSCADOR */}
        <section id="buscador" className="bg-white rounded-[32px] border border-[#D9D4CC] overflow-hidden shadow-xl shadow-[#D9D4CC]/40 scroll-mt-24">
          <BuscadorDirecciones />
        </section>

        {/* 5. BANNER DE CONTACTO */}
        <section className="bg-[#2C2C2C] rounded-[32px] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[#A63A2B] opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-[#4A7C59] opacity-20 blur-3xl"></div>
          
          <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-[#F5F0E8] text-xs font-bold tracking-wider mb-4">
                Atención al cliente
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                ¿Tienes alguna queja <br className="hidden md:block" /> o sugerencia?
              </h2>
              <p className="text-gray-300 text-lg md:text-xl max-w-xl mx-auto md:mx-0">
                Tu opinión nos ayuda a mejorar. Escríbenos directamente y te responderemos lo antes posible.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link 
                to="/contacto" 
                className="group flex items-center gap-3 bg-[#A63A2B] text-white px-8 py-5 rounded-full font-extrabold text-lg transition-all shadow-[0_8px_30px_rgba(166,58,43,0.4)] hover:shadow-[0_8px_30px_rgba(166,58,43,0.6)] hover:-translate-y-1 hover:bg-[#8B3024]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Escribir al administrador
              </Link>
            </div>
          </div>
        </section>

      </div>

      <ModalProducto 
        producto={productoSeleccionado} 
        onClose={() => setProductoSeleccionado(null)} 
      />

    </div>
  );
}