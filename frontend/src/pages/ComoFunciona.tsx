import { useState } from 'react';
import { Link } from 'react-router-dom';

type Tab = 'comprador' | 'vendedor' | 'domiciliario';

export default function ComoFunciona() {
  const [tabActiva, setTabActiva] = useState<Tab>('comprador');

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 bg-[#FAFAFA] min-h-screen">
      
      {/* CABECERA */}
      <div className="text-center mb-12">
        <span className="inline-block py-1 px-3 rounded-full bg-white border border-[#D9D4CC] text-[#A63A2B] text-xs font-bold tracking-wider mb-4 shadow-sm">
          Guía de uso
        </span>
        <h1 className="text-4xl font-extrabold text-[#2C2C2C] mb-4 tracking-tight">¿Cómo funciona Moa Tradecenter?</h1>
        <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
          Somos el puente que conecta a los compradores con los vendedores y domiciliarios de nuestro municipio. 
          Elige tu rol para ver cómo puedes participar.
        </p>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex justify-center mb-10">
        <div className="bg-white border border-[#D9D4CC] p-2 rounded-[20px] inline-flex flex-col sm:flex-row gap-2 shadow-sm">
          <button
            onClick={() => setTabActiva('comprador')}
            className={`px-6 py-3 rounded-[12px] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              tabActiva === 'comprador' 
                ? 'bg-[#A63A2B] text-white shadow-md shadow-[#A63A2B]/30 scale-105' 
                : 'text-[#6B6B6B] hover:bg-gray-50'
            }`}
          >
            🛒 Comprador
          </button>
          <button
            onClick={() => setTabActiva('vendedor')}
            className={`px-6 py-3 rounded-[12px] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              tabActiva === 'vendedor' 
                ? 'bg-[#4A7C59] text-white shadow-md shadow-[#4A7C59]/30 scale-105' 
                : 'text-[#6B6B6B] hover:bg-gray-50'
            }`}
          >
            🏪 Vendedor / Prestador
          </button>
          <button
            onClick={() => setTabActiva('domiciliario')}
            className={`px-6 py-3 rounded-[12px] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              tabActiva === 'domiciliario' 
                ? 'bg-[#2E6B8A] text-white shadow-md shadow-[#2E6B8A]/30 scale-105' 
                : 'text-[#6B6B6B] hover:bg-gray-50'
            }`}
          >
            🛵 Domiciliario
          </button>
        </div>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div className="bg-white rounded-[24px] border border-[#D9D4CC] p-8 md:p-12 shadow-xl shadow-[#D9D4CC]/30 min-h-[400px]">
        
        {/* COMPRADOR */}
        {tabActiva === 'comprador' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-extrabold text-[#A63A2B] mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#A63A2B] rounded-full"></span>
              Encuentra lo que necesitas en 3 pasos
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] flex items-center justify-center text-xl font-extrabold text-[#A63A2B] shrink-0">1</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Explora el catálogo o busca una dirección</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Navega por los productos y servicios disponibles. También puedes usar nuestro <strong>Buscador de Direcciones</strong> para encontrar cualquier calle, edificio o reparto en Moa y ver los negocios cercanos.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] flex items-center justify-center text-xl font-extrabold text-[#A63A2B] shrink-0">2</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Contacta al vendedor</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">¿Te gustó algo? Haz clic en el producto o servicio y deja tu número de WhatsApp en el formulario de mensaje. El vendedor te contactará directamente para coordinar la compra o el servicio.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] flex items-center justify-center text-xl font-extrabold text-[#A63A2B] shrink-0">3</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Solicita el domicilio</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Si el producto lo permite, ve a la sección de <strong>Domiciliarios</strong>, elige a un prestador disponible y contáctalo por WhatsApp para acordar la entrega de tu compra.</p>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-[#F0EBE1]">
              <Link to="/productos" className="inline-flex items-center gap-2 bg-[#A63A2B] hover:bg-[#7A2A1F] text-white px-8 py-3.5 rounded-[12px] font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Empezar a explorar <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* VENDEDOR / PRESTADOR */}
        {tabActiva === 'vendedor' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-extrabold text-[#4A7C59] mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#4A7C59] rounded-full"></span>
              Vende productos o servicios en 4 pasos
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5EC] flex items-center justify-center text-xl font-extrabold text-[#4A7C59] shrink-0">1</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Regístrate y completa tu perfil</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Crea tu cuenta y añade tu número de WhatsApp. Es obligatorio completar el perfil para poder publicar. También puedes marcar tu ubicación en el mapa y decidir si quieres que tu negocio aparezca públicamente en el buscador de direcciones.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5EC] flex items-center justify-center text-xl font-extrabold text-[#4A7C59] shrink-0">2</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Publica lo que ofreces</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Desde tu panel puedes publicar <strong>Productos</strong> (con fotos, precio y variantes) o <strong>Servicios</strong> (con descripción, horario, menú o aviso de domicilio). Todo en un mismo lugar.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5EC] flex items-center justify-center text-xl font-extrabold text-[#4A7C59] shrink-0">3</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Recibe clientes por WhatsApp</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Cuando un comprador esté interesado en tu producto o servicio, te llegará un mensaje directo a tu WhatsApp con su nombre y consulta. Podrás responderle inmediatamente para cerrar la venta.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5EC] flex items-center justify-center text-xl font-extrabold text-[#4A7C59] shrink-0">4</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Gestiona tu catálogo</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Desde tu panel puedes editar o eliminar tanto productos como servicios. Mantén tu catálogo al día, actualiza precios y comparte tu ubicación para atraer más clientes.</p>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-[#F0EBE1]">
              <Link to="/panel" className="inline-flex items-center gap-2 bg-[#4A7C59] hover:bg-[#355A40] text-white px-8 py-3.5 rounded-[12px] font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Ir a mi panel <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* DOMICILIARIO */}
        {tabActiva === 'domiciliario' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-extrabold text-[#2E6B8A] mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#2E6B8A] rounded-full"></span>
              Conviértete en prestador de domicilio
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] flex items-center justify-center text-xl font-extrabold text-[#2E6B8A] shrink-0">1</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Regístrate como prestador de servicios</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Crea tu cuenta y selecciona "Servicios" como tu tipo de venta. Asegúrate de elegir la categoría "Domicilio" y de completar tu perfil.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] flex items-center justify-center text-xl font-extrabold text-[#2E6B8A] shrink-0">2</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Proporciona tus datos</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Añade tu número de WhatsApp (que será público en la sección de Domiciliarios) y establece tu tarifa de envío. Esto permitirá que los compradores te encuentren fácilmente.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] flex items-center justify-center text-xl font-extrabold text-[#2E6B8A] shrink-0">3</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Recibe solicitudes directas</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Los compradores verán tu tarjeta en el directorio y podrán contactarte directamente por WhatsApp para solicitar el servicio de entrega.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] flex items-center justify-center text-xl font-extrabold text-[#2E6B8A] shrink-0">4</div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Gestiona tu disponibilidad</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">Si no puedes hacer envíos en un momento determinado, puedes marcar tu perfil como "No disponible" desde tu panel. Así no recibirás solicitudes hasta que estés listo.</p>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-[#F0EBE1]">
              <Link to="/prestadores" className="inline-flex items-center gap-2 bg-[#2E6B8A] hover:bg-[#1f4a60] text-white px-8 py-3.5 rounded-[12px] font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Ver prestadores actuales <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}