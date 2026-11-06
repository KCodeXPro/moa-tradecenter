import { Link } from 'react-router-dom';

export default function Privacidad() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 bg-[#FAFAFA] min-h-screen">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D9D4CC] text-[#A63A2B] text-xs font-bold mb-4 shadow-sm">
          Política de Privacidad
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2C2C2C] mb-4 tracking-tight">
          Protección de tu identidad
        </h1>
        <p className="text-[#6B6B6B] text-lg max-w-xl mx-auto">
          Cómo protegemos los datos de compradores y vendedores en Moa Tradecenter.
        </p>
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-[20px] border border-[#D9D4CC] p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <span className="text-2xl">🛡️</span> ¿Qué datos protegemos?
          </h2>
          <p className="text-[#6B6B6B] leading-relaxed mb-6">
            En Moa Tradecenter nos tomamos muy en serio tu privacidad. Los datos personales —como tu número de WhatsApp y tu dirección— <strong>nunca son públicos</strong> en el sitio.
          </p>
          <ul className="space-y-4 text-[#6B6B6B] text-sm">
            <li className="flex items-start gap-3">
              <span className="text-[#4A7C59] bg-[#E8F5EC] p-1 rounded-full shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span className="pt-0.5">El WhatsApp del comprador solo lo ve el vendedor destinatario del mensaje.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4A7C59] bg-[#E8F5EC] p-1 rounded-full shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span className="pt-0.5">La dirección del vendedor solo se comparte con el prestador de domicilio cuando se solicita una entrega.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4A7C59] bg-[#E8F5EC] p-1 rounded-full shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span className="pt-0.5">El único WhatsApp público es el del prestador de domicilio, y solo porque forma parte del servicio que ofrece.</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-[20px] border border-[#D9D4CC] p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <span className="text-2xl">🔒</span> Por qué es una medida de seguridad
          </h2>
          <div className="space-y-4 text-[#6B6B6B] leading-relaxed">
            <p>
              No revelamos los datos de los vendedores por defecto como una medida de seguridad. Proteger la identidad de quienes ofrecen productos y servicios es fundamental para que puedan operar con tranquilidad.
            </p>
            <p>
              Cuando tú decides contactar a un vendedor, tú eliges compartir tu WhatsApp con él. La conversación continúa fuera del sitio, por WhatsApp, y el vendedor nunca ve tu dirección a menos que tú se la proporciones directamente.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-[20px] border border-[#D9D4CC] p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <span className="text-2xl">⚖️</span> Tus derechos
          </h2>
          <ul className="space-y-4 text-[#6B6B6B] text-sm">
            <li className="flex items-start gap-3">
              <span className="text-[#2E6B8A] bg-[#E0F2FE] p-1 rounded-full shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span className="pt-0.5">Puedes navegar el sitio sin registrarte ni dar ningún dato personal.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2E6B8A] bg-[#E0F2FE] p-1 rounded-full shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span className="pt-0.5">Solo necesitas dar tu WhatsApp cuando quieras enviar un mensaje o solicitar domicilio.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2E6B8A] bg-[#E0F2FE] p-1 rounded-full shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span className="pt-0.5">Los mensajes no leídos se eliminan automáticamente a los 5 días.</span>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#A63A2B] bg-white border border-[#D9D4CC] px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-50 hover:shadow-md transition-all"
        >
          &larr; Volver al inicio
        </Link>
      </div>
    </div>
  );
}