import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalCrearProducto from '../components/ModalCrearProducto';
import ModalCrearServicio from '../components/ModalCrearServicio';
import ModalCompletarPerfil from '../components/ModalCompletarPerfil';
import ModalMiUbicacion from '../components/ModalMiUbicacion';

export default function PanelVendedor() {
  const [productos, setProductos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  
  const [isModalProductoOpen, setIsModalProductoOpen] = useState(false);
  const [isModalServicioOpen, setIsModalServicioOpen] = useState(false);
  const [isModalPerfilOpen, setIsModalPerfilOpen] = useState(false);
  const [isModalUbicacionOpen, setIsModalUbicacionOpen] = useState(false);
  
  const [productoEditando, setProductoEditando] = useState<any>(null);
  const [servicioEditando, setServicioEditando] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'productos' | 'servicios'>('productos');
  
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('moa_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user.rol !== 'vendedor') {
        alert('Acceso denegado. Solo vendedores.');
        navigate('/');
        return;
      }
      setUsuario(user);

      const userId = user._id;

      if (userId) {
        axios.get(`/api/productos?vendedorId=${userId}`)
          .then(res => setProductos(res.data))
          .catch(err => console.error("Error cargando productos", err));

        axios.get(`/api/servicios?vendedorId=${userId}`)
          .then(res => setServicios(res.data))
          .catch(err => console.error("Error cargando servicios", err));
      }
        
    } else {
      navigate('/');
    }
  }, [navigate]);

  const copiarEnlaceUbicacion = () => {
    const url = `${window.location.origin}/ubicacion/${usuario.nick}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Enlace copiado! Compártelo con tus clientes para que vean tu ubicación.');
    }).catch(() => {
      prompt('Copia este enlace:', url);
    });
  };

  const eliminarProducto = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`)) return;
    
    try {
      await axios.delete(`/api/productos/${id}`);
      setProductos(prev => prev.filter(p => p._id !== id));
      alert('Producto eliminado correctamente.');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el producto.');
    }
  };

  const eliminarServicio = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el servicio "${nombre}"? Esta acción no se puede deshacer.`)) return;
    
    try {
      await axios.delete(`/api/servicios/${id}`);
      setServicios(prev => prev.filter(s => s._id !== id));
      alert('Servicio eliminado correctamente.');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el servicio.');
    }
  };

  const abrirModalEditarProducto = (prod: any) => {
    setProductoEditando(prod);
    setIsModalProductoOpen(true);
  };

  const abrirModalEditarServicio = (serv: any) => {
    setServicioEditando(serv);
    setIsModalServicioOpen(true);
  };

  if (!usuario) return null;

  const tieneWhatsapp = !!usuario.whatsapp;

  return (
    <div className="max-w-6xl mx-auto pt-8 px-4">
      
      {/* Cabecera con botones de perfil a la derecha */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C2C2C]">Panel de {usuario.nick}</h1>
          <p className="text-[#6B6B6B]">Gestiona tu catálogo de productos y servicios.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {!tieneWhatsapp && (
            <button 
              className="bg-[#B83A2E] hover:bg-[#991B1B] text-white px-5 py-2.5 rounded-[10px] font-bold transition-colors shadow-sm" 
              onClick={() => setIsModalPerfilOpen(true)}
            >
              ⚠️ Completar Perfil
            </button>
          )}
          <button 
            className="bg-[#2E6B8A] hover:bg-[#1f4a60] text-white px-5 py-2.5 rounded-[10px] font-bold transition-colors shadow-sm" 
            onClick={() => setIsModalUbicacionOpen(true)}
          >
            📍 Mi Ubicación
          </button>
          <button 
            className="bg-[#7A2A1F] hover:bg-[#5C1F16] text-white px-5 py-2.5 rounded-[10px] font-bold transition-colors shadow-sm" 
            onClick={copiarEnlaceUbicacion}
          >
            📤 Compartir Ubicación
          </button>
        </div>
      </div>

      {/* Aviso si no tiene WhatsApp */}
      {!tieneWhatsapp && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-[10px] flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-[#B83A2E]">Completa tu perfil para empezar a vender</h3>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Necesitamos tu número de WhatsApp para que los clientes puedan contactarte. 
              <strong> Tu número NO se mostrará públicamente</strong>, solo se usará para la comunicación entre comprador y vendedor.
            </p>
          </div>
        </div>
      )}

      {/* Pestañas con botón de añadir a la derecha */}
      <div className="flex justify-between items-end border-b border-[#D9D4CC] mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveTab('productos')}
            className={`px-6 py-3 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'productos' 
                ? 'border-[#A63A2B] text-[#A63A2B]' 
                : 'border-transparent text-[#6B6B6B] hover:text-[#2C2C2C]'
            }`}
          >
            Mis Productos ({productos.length})
          </button>
          <button
            onClick={() => setActiveTab('servicios')}
            className={`px-6 py-3 font-bold text-lg transition-colors border-b-2 ${
              activeTab === 'servicios' 
                ? 'border-[#4A7C59] text-[#4A7C59]' 
                : 'border-transparent text-[#6B6B6B] hover:text-[#2C2C2C]'
            }`}
          >
            Mis Servicios ({servicios.length})
          </button>
        </div>

        {/* BOTÓN DE AÑADIR DINÁMICO SEGÚN LA PESTAÑA */}
        <div className="pb-2">
          {activeTab === 'productos' && (
            <button 
              disabled={!tieneWhatsapp}
              className={`px-5 py-2.5 rounded-[10px] font-bold transition-colors shadow-sm ${
                tieneWhatsapp 
                  ? 'bg-[#A63A2B] hover:bg-[#7A2A1F] text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`} 
              onClick={() => { setProductoEditando(null); setIsModalProductoOpen(true); }}
            >
              + Añadir Producto
            </button>
          )}
          {activeTab === 'servicios' && (
            <button 
              disabled={!tieneWhatsapp}
              className={`px-5 py-2.5 rounded-[10px] font-bold transition-colors shadow-sm ${
                tieneWhatsapp 
                  ? 'bg-[#4A7C59] hover:bg-[#355A40] text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`} 
              onClick={() => { setServicioEditando(null); setIsModalServicioOpen(true); }}
            >
              + Añadir Servicio
            </button>
          )}
        </div>
      </div>

      {/* Contenido de Productos */}
      {activeTab === 'productos' && (
        <div className="bg-white rounded-[14px] border border-[#D9D4CC] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-[#6B6B6B] text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-[#D9D4CC]">Producto</th>
                  <th className="p-4 font-bold border-b border-[#D9D4CC]">Tipo</th>
                  <th className="p-4 font-bold border-b border-[#D9D4CC]">Precio</th>
                  <th className="p-4 font-bold border-b border-[#D9D4CC]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod._id} className="border-b border-[#D9D4CC] hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-[#2C2C2C]">{prod.nombre}</td>
                    <td className="p-4">
                      <span className={`text-[0.7rem] font-bold px-2 py-1 rounded-full ${
                        prod.tipoVenta === 'mayorista' ? 'bg-[#F0E6C8] text-[#8A6D1F]' : 'bg-[#E8D5C4] text-[#7A2A1F]'
                      }`}>
                        {prod.tipoVenta === 'mayorista' ? 'Mayorista' : 'Minorista'}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-[#A63A2B]">${Math.round(prod.precio / 100)}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => abrirModalEditarProducto(prod)} 
                        className="text-[#2E6B8A] hover:underline text-sm font-semibold mr-3"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => eliminarProducto(prod._id, prod.nombre)} 
                        className="text-[#B83A2E] hover:underline text-sm font-semibold"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productos.length === 0 && (
            <div className="p-8 text-center text-[#6B6B6B]">No tienes productos aún.</div>
          )}
        </div>
      )}

      {/* Contenido de Servicios */}
      {activeTab === 'servicios' && (
        <div className="bg-white rounded-[14px] border border-[#D9D4CC] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-[#6B6B6B] text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-[#D9D4CC]">Servicio</th>
                  <th className="p-4 font-bold border-b border-[#D9D4CC]">Precio</th>
                  <th className="p-4 font-bold border-b border-[#D9D4CC]">Domicilio</th>
                  <th className="p-4 font-bold border-b border-[#D9D4CC]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((serv) => (
                  <tr key={serv._id} className="border-b border-[#D9D4CC] hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-[#2C2C2C]">{serv.nombre}</td>
                    <td className="p-4 font-extrabold text-[#4A7C59]">${Math.round(serv.precio / 100)}</td>
                    <td className="p-4 text-sm">{serv.esDomicilio ? '✅ Sí' : '❌ No'}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => abrirModalEditarServicio(serv)} 
                        className="text-[#2E6B8A] hover:underline text-sm font-semibold mr-3"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => eliminarServicio(serv._id, serv.nombre)} 
                        className="text-[#B83A2E] hover:underline text-sm font-semibold"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {servicios.length === 0 && (
            <div className="p-8 text-center text-[#6B6B6B]">No tienes servicios publicados aún.</div>
          )}
        </div>
      )}
      
      <ModalCrearProducto 
        isOpen={isModalProductoOpen} 
        onClose={() => { setIsModalProductoOpen(false); setProductoEditando(null); }} 
        onCreated={() => window.location.reload()} 
        productoAEditar={productoEditando}
      />
    
      <ModalCrearServicio 
        isOpen={isModalServicioOpen} 
        onClose={() => { setIsModalServicioOpen(false); setServicioEditando(null); }} 
        onSuccess={() => window.location.reload()} 
        servicioAEditar={servicioEditando}
      />

      <ModalCompletarPerfil
        isOpen={isModalPerfilOpen}
        onClose={() => setIsModalPerfilOpen(false)}
        usuario={usuario}
        onSuccess={() => window.location.reload()}
      />

      <ModalMiUbicacion
        isOpen={isModalUbicacionOpen}
        onClose={() => setIsModalUbicacionOpen(false)}
        usuario={usuario}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}