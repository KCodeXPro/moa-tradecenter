# 01 — Visión del producto: Moa Tradecenter

> Documento de visión. Define qué es Moa Tradecenter, para quién, qué entra en el
> MVP y qué queda fuera. Es la referencia de alcance del proyecto.

---

## 1. Qué es Moa Tradecenter

Moa Tradecenter es un **directorio comercial local** del municipio de Moa (Cuba).
Permite a cualquier persona encontrar productos y servicios ofrecidos dentro del
municipio, contactar al vendedor y, cuando el producto lo permite, solicitar un
servicio de domicilio.

No es una tienda en línea: **no hay carrito, no hay pagos, no hay checkout**. Es un
punto de encuentro entre quien ofrece y quien busca, dentro de Moa.

---

## 2. Para quién es

- **Público objetivo:** cualquier persona. No hay restricción por edad, ubicación
  ni relación con el municipio.
- **Comprador:** persona que entra al sitio a buscar un producto o servicio y
  quiere contactar al vendedor. No necesita cuenta para navegar. Para enviar un
  mensaje o solicitar domicilio, deja su número de WhatsApp (uso único).
- **Vendedor:** persona o negocio de Moa que ofrece productos (minorista o
  mayorista), servicios, o ambos. Si además ofrece domicilio, es prestador
  (`esPrestador: true`).
- **Prestador de domicilio:** vendedor de servicio de la categoría "Domicilio",
  que cobra una tarifa y se desplaza a recoger y entregar productos. Su WhatsApp
  es el único WhatsApp público del sitio. **No es un rol separado**: es un
  vendedor con `esPrestador: true`.
- **Administrador:** responsable de moderar el sitio, gestionar categorías,
  suspender cuentas, eliminar productos prohibidos y enviar mensajes internos.

---

## 3. Problema que resuelve

Hoy, quien busca un producto o servicio en Moa depende de contactos personales,
grupos de WhatsApp o publicaciones dispersas en redes. No hay un lugar único donde
ver qué se ofrece, a qué precio y cómo contactar al vendedor.

Moa Tradecenter centraliza esa oferta y la hace descubrible, con reglas claras de
privacidad y un flujo de domicilio integrado.

---

## 4. Propuesta de valor

- **Descubrimiento:** filtros por tipo (producto/servicio), precio, minorista/
  mayorista, recientes, más buscados, y buscador dentro de cada elección.
- **Contacto privado:** el comprador deja su WhatsApp solo al vendedor que le
  interesa; el número no se publica. El único WhatsApp público es el del
  prestador de domicilio, porque forma parte del servicio.
- **Domicilio integrado:** si el producto lo permite, el comprador elige un
  prestador de domicilio, ve su nombre, tarifa y WhatsApp, y el sistema envía
  automáticamente los datos del producto y la dirección del vendedor al prestador.
- **Panel del vendedor:** mensajería unificada, administración de productos/
  servicios y métricas básicas.
- **Moderación activa:** el admin puede crear categorías (para productos y
  servicios), reasignar productos/servicios, suspender cuentas y comunicarse con
  los vendedores.

---

## 5. Alcance del MVP

### 5.1 Entra en el MVP

**Navegación pública**
- Home con elección producto/servicio.
- Filtros: precio, tipo de producto (mayorista/minorista), más recientes, más
  buscados.
- Buscador dentro de cada elección.
- Listado y ficha de producto/servicio con: nombre, descripción, precio e imagen
  opcional.
- Botón "Mensaje" en productos y servicios.
- Botón "Domicilio" solo en productos cuyo vendedor tenga dirección registrada
  (`aceptaDomicilio: true`). Si no la tiene, el botón informa que el producto no
  tiene domicilio.

**Registro y acceso**
- Acceso con OAuth **simulado** (Google/Facebook) + checkbox "No soy un robot"
  **obligatorio** y **simulado**.
- Registro de vendedor con: nick, "si desea recibir domicilio" (y dirección si
  lo marca), y tipo de venta (productos / servicios / ambos).
- El tipo de venta **queda fijo** al registrarse.

**Mensajería**
- Comprador deja su WhatsApp para enviar un mensaje.
- Mensaje de uso único: la conversación continúa por WhatsApp fuera del sitio.
- Vendedor con una sola bandeja de mensajes (filtro por producto/servicio si
  vende ambos).
- Límite de 20 mensajes/día por WhatsApp del comprador.
- Mensajes no leídos se borran a los 5 días; los leídos se anonimizan a los 30.

**Domicilio**
- Selector de prestadores con nombre, tarifa y WhatsApp.
- Envío automático al prestador de: datos del producto, dirección del vendedor y
  WhatsApp del comprador.
- El prestador contacta al comprador por WhatsApp para confirmar compra y
  dirección de entrega.
- Estados de la solicitud: `pendiente`, `contactado`, `entregado`, `cancelado`.
- El WhatsApp del prestador de domicilio es el único WhatsApp público del sitio.
  Los WhatsApp de vendedores de productos y de servicios no-domicilio permanecen
  privados.

**Panel del vendedor**
- Bandeja de mensajes.
- Administración de productos/servicios (crear, editar, eliminar).
- Métricas: productos activos, mensajes recibidos (total y últimos 7 días),
  solicitudes de domicilio recibidas, productos más consultados y más buscados.

**Panel del administrador**
- Visitas totales al sitio.
- Listado de vendedores con tipo, categoría, interacciones y estado.
- Contadores de productos/servicios activos y de mensajes generados.
- Suspender cuentas enteras.
- Eliminar productos prohibidos.
- Crear categorías nuevas (tanto para productos como para servicios) y reasignar
  productos/servicios a ellas.
- Enviar mensajes internos a vendedores/prestadores.
- Ver WhatsApp y dirección de un vendedor solo en su ficha individual, con
  registro de auditoría (quién y cuándo).

**Geolocalización del domiciliario (fase 2 del MVP)**
- El prestador de domicilio puede compartir su ubicación en tiempo real.
- No se muestra al comprador; es una herramienta operativa del prestador.
- El modelo de datos contempla el campo `ubicacionActual` desde el inicio, pero
  la UI se construye en fase 2.

### 5.2 Queda FUERA del MVP

- Pagos en línea (todo se coordina por WhatsApp / efectivo).
- Carrito de compras y checkout.
- Reseñas y valoraciones de vendedores.
- Historial de compras del comprador.
- Chat dentro del sitio (solo se envía el mensaje inicial; la conversación sigue
  en WhatsApp).
- Verificación real de identidad (OAuth y captcha simulados).
- Multi-idioma.
- Notificaciones push o email automáticas.
- App móvil nativa (el sitio es mobile-first y debe prepararse para app futura,
  pero no se construye app en el MVP).

---

## 6. Fuera de alcance a largo plazo (por ahora)

- Expansión a otros municipios o provincias.
- Integración con pasarelas de pago.
- Logística propia (Moa Tradecenter no reparte; solo conecta con prestadores).
- Publicidad o planes premium para vendedores.

---

## 7. Métricas de éxito del MVP

- Número de vendedores registrados y activos.
- Número de productos y servicios publicados.
- Número de mensajes enviados por compradores.
- Número de solicitudes de domicilio generadas y completadas.
- Visitas al sitio y búsquedas realizadas.

---

## 8. Principios de diseño del producto

1. **Privacidad primero:** el WhatsApp del comprador solo lo ve el vendedor
   destinatario (o el prestador, en el caso del domicilio); la dirección del
   vendedor solo se comparte con el prestador de domicilio. La única excepción
   deliberada es el WhatsApp del prestador de domicilio, que es público porque
   forma parte del servicio.
2. **Mobile-first:** la mayoría de los usuarios accederán desde el móvil.
3. **Sin fricción para el comprador:** navegar es libre; solo se identifica con su
   WhatsApp cuando quiere contactar.
4. **El vendedor controla su exposición:** decide si da dirección (y por tanto si
   acepta domicilio).
5. **Moderación activa:** el admin mantiene el catálogo limpio y las categorías
   actualizadas.
6. **Preparado para app:** el modelo de datos y la API deben ser independientes
   de la web.

---

## 9. Decisiones resueltas

- ~~Confirmar si el WhatsApp de los prestadores de domicilio es el único dato de
  contacto público del sitio~~ → **Resuelto:** sí, es el único WhatsApp público.
- ~~Confirmar si la geolocalización del domiciliario entra en fase 1 o fase 2~~ →
  **Resuelto:** fase 2 del MVP.
- ~~Definir si el admin puede crear categorías también para servicios~~ →
  **Resuelto:** sí, para productos y servicios.
- ~~Definir si el prestador es un rol separado o un flag~~ → **Resuelto:** es un
  vendedor con `esPrestador: true`.
- ~~Definir el formato del registro de auditoría~~ → **Resuelto:** log técnico en
  base de datos + pestaña "Auditoría" visible en el panel de admin.
- ~~Definir si el admin puede reactivar una cuenta suspendida~~ → **Resuelto:**
  sí.
- ~~Definir si un prestador puede pausar la recepción de solicitudes~~ →
  **Resuelto:** sí, con el campo `disponible`.
- ~~Definir qué pasa con las solicitudes pendientes al suspender un prestador~~ →
  **Resuelto:** se cancelan y se avisa al comprador por WhatsApp.

---

## 10. Stack técnico previsto

- **Frontend:** React + Vite + TypeScript + Tailwind CSS.
- **Backend:** NestJS + TypeScript + Mongoose.
- **Base de datos:** MongoDB (Atlas).
- **Validaciones:** Zod (frontend y backend).
- **Autenticación:** JWT (OAuth simulado en MVP).
- **Despliegue:** Vercel (frontend y backend como dos proyectos del monorepo).
- **Nombre del repositorio:** `moa-tradecenter` (recomendado; alternativas:
  `tradecenter-moa`, `moa-marketplace`, `moa-local-hub`, `moa-directorio`).
- **Nota:** el `mockup.html` actual es una **referencia visual desechable**. La
  app real se construye en React desde cero respetando `.clinerules`.