# 07 — Roadmap del MVP: Moa Tradecenter

> Define el orden de construcción del MVP. Cada fase tiene un objetivo, un
> alcance concreto y un criterio de "terminado". No se avanza a la siguiente
> fase sin cerrar la anterior.

---

## 1. Principios del roadmap

- **Construir en vertical, no en horizontal:** cada fase entrega una funcionalidad
  completa (frontend + backend + base de datos + despliegue).
- **Fase 0 primero:** sin base técnica no se empieza a construir producto.
- **Nada de funcionalidades futuras en fases tempranas:** si algo es de fase 5,
  no se implementa antes.
- **Cada fase se despliega en Vercel** y se prueba en móvil y desktop.
- **Cada fase actualiza `/docs`** si introdujo o cambió una regla.

---

## 2. Fase 0 — Base técnica

**Objetivo:** tener el monorepo, el stack y el despliegue funcionando con un
"hola mundo" en frontend y backend.

**Alcance:**
- Crear el monorepo `moa-tradecenter/` con `frontend/` y `backend/`.
- Configurar React + Vite + TypeScript + Tailwind en `frontend/`.
- Configurar NestJS + TypeScript + Mongoose en `backend/`.
- Conectar a MongoDB Atlas.
- Configurar Zod en ambos lados.
- Configurar React Router, React Query y estructura por features.
- Desplegar frontend y backend en Vercel (dos proyectos, monorepo).
- Variables de entorno configuradas.
- CORS, Helmet y `@nestjs/throttler` configurados.

**Criterio de terminado:**
- El frontend muestra "Moa Tradecenter" y hace una llamada a `GET /api/v1/health`.
- El backend responde `{ status: 'ok' }`.
- Ambos están desplegados en Vercel con preview y producción.
- La base de datos responde desde Vercel.

**No entra:**
- Ninguna pantalla de producto.
- Ningún modelo de datos definitivo (solo la conexión).

---

## 3. Fase 1 — Navegación pública

**Objetivo:** que cualquier visitante pueda navegar, filtrar, buscar y ver fichas
de productos y servicios, sin login.

**Alcance:**
- Modelo de datos base: `usuarios`, `categorias`, `productos`, `servicios`.
- Seed inicial con 3 vendedores de productos y 3 de servicios (los del mockup).
- Home con elección producto/servicio.
- Listado con filtros: precio, tipo (mayorista/minorista), más recientes, más
  buscados.
- Buscador dentro de la elección.
- Ficha de producto/servicio: nombre, descripción, precio, imagen opcional,
  nombre del vendedor.
- Botones "Mensaje" y "Domicilio" **visibles pero bloqueados** (sin login aún).
- Estados `loading`, `empty`, `error` en cada pantalla.

**Criterio de terminado:**
- El visitante puede navegar de home a ficha sin registrarse.
- Los filtros funcionan y se combinan.
- El buscador devuelve resultados coherentes.
- La app se ve bien en móvil y desktop.
- Desplegado en Vercel.

**No entra:**
- Login.
- Publicar productos.
- Mensajería real.
- Domicilio real.

---

## 4. Fase 2 — Auth simulada y panel del vendedor

**Objetivo:** que un vendedor pueda registrarse (con OAuth simulado + anti-bots
simulado) y publicar, editar y eliminar sus productos/servicios.

**Alcance:**
- `AuthModule` con login simulado y JWT.
- Modal de login con Google/Facebook fake + checkbox anti-bots obligatorio.
- Modal de simulación de usuario de prueba (comprador / vendedor / admin).
- Registro de vendedor en 2 pasos:
  - Paso 1: OAuth simulado + anti-bots.
  - Paso 2: nick, tipo de venta, "si desea recibir domicilio", dirección.
- Validación de nick único.
- Panel del vendedor:
  - Sidebar: Inicio, Mis productos, Mis servicios (según tipo de venta),
    Mensajes, Perfil, Disponibilidad (si es prestador).
  - Publicar producto (con tipo minorista/mayorista y precio condicional).
  - Publicar servicio (con precio fijo y categoría).
  - Editar y eliminar productos/servicios.
  - Editar perfil (nick, dirección, "si desea recibir domicilio").
  - Eliminar cuenta (con confirmación por nick).
- Guards de rol en el backend.

**Criterio de terminado:**
- Un vendedor de prueba puede registrarse y publicar un producto minorista y uno
  mayorista.
- Un vendedor de prueba puede publicar un servicio.
- Los productos/servicios publicados aparecen en el listado público.
- El vendedor puede editar y eliminar sus productos/servicios.
- El vendedor puede eliminar su cuenta.
- Un usuario no logueado no puede acceder al panel del vendedor.

**No entra:**
- Mensajería.
- Domicilio.
- Panel del admin.

---

## 5. Fase 3 — Mensajería y domicilio

**Objetivo:** que un comprador pueda enviar un mensaje a un vendedor y solicitar
domicilio de un producto que lo permita.

**Alcance:**
- `MensajesModule`:
  - Enviar mensaje con WhatsApp del comprador (validación de formato).
  - Límite de 20 mensajes/día por WhatsApp.
  - Bandeja del vendedor con filtro por tipo (producto/servicio) si vende ambos.
  - Marcar mensaje como leído.
  - TTL de 5 días para mensajes no leídos.
  - Anonimización de WhatsApp a los 30 días.
- `DomicilioModule`:
  - Selector de prestadores disponibles (nombre, tarifa, WhatsApp).
  - Solicitud con snapshot de producto y dirección del vendedor.
  - Envío automático de mensaje al prestador.
  - Estados: `pendiente`, `contactado`, `entregado`, `cancelado`.
  - Switch de disponibilidad del prestador.
- `ReportesModule`:
  - Botón "Reportar" en fichas de producto/servicio.
  - Reporte anónimo o con WhatsApp opcional.
- Frontend:
  - Modal "Mensaje" con campo WhatsApp.
  - Modal "Domicilio" con selector de prestadores.
  - Modal "Reportar".

**Criterio de terminado:**
- Un comprador puede enviar un mensaje a un vendedor y el vendedor lo ve en su
  bandeja con el WhatsApp del comprador.
- Un comprador puede solicitar domicilio y el prestador recibe el mensaje con
  los datos del producto, la dirección del vendedor y el WhatsApp del comprador.
- El prestador puede cambiar el estado de la solicitud.
- El prestador puede pausar la recepción de domicilios.
- Un comprador puede reportar un producto.
- Los mensajes no leídos se eliminan a los 5 días (verificado con un test).
- El WhatsApp del comprador se anonimiza a los 30 días (verificado con un test).

**No entra:**
- Panel del admin.
- Geolocalización del domiciliario.

---

## 6. Fase 4 — Panel del admin

**Objetivo:** que el admin pueda moderar el sitio, gestionar categorías, ver
auditoría y comunicarse con los vendedores.

**Alcance:**
- `AdminModule`:
  - Dashboard con visitas totales, vendedores, productos activos, mensajes
    generados.
  - Listado de vendedores con tipo, categoría, interacciones, estado.
  - Suspender cuenta (con motivo).
  - Reactivar cuenta.
  - Eliminar producto prohibido (con motivo).
  - Crear categorías (producto/servicio).
  - Eliminar categorías (reasignando a "Sin categoría").
  - Reasignar productos/servicios a otra categoría.
  - Enviar mensajes internos (a uno, a todos, o a un grupo filtrado).
  - Pestaña "Auditoría" con registro de accesos a datos privados.
  - Ver WhatsApp y dirección de un vendedor en su ficha individual (con
    auditoría).
- `MensajesAdminModule`: mensajería interna admin ↔ vendedor.
- `AuditoriaModule`: registro de cada acceso.
- `VisitasModule`: contador de visitas por día.

**Criterio de terminado:**
- El admin ve el dashboard con métricas reales.
- El admin puede suspender y reactivar un vendedor, y los productos de ese
  vendedor se ocultan y reaparecen.
- El admin puede crear y eliminar categorías.
- El admin puede enviar un mensaje interno a un vendedor y el vendedor lo ve en
  su panel.
- El admin puede ver el WhatsApp de un vendedor y la acción queda registrada en
  la pestaña "Auditoría".
- El admin puede eliminar un producto prohibido con motivo.

**No entra:**
- Geolocalización del domiciliario.

---

## 7. Fase 5 — Geolocalización del domiciliario (fase 2 del MVP)

**Objetivo:** que el prestador de domicilio pueda compartir su ubicación en tiempo
real como herramienta operativa.

**Alcance:**
- Campo `ubicacionActual` en `usuarios` (prestador).
- Frontend del prestador: botón "Compartir ubicación" y "Detener".
- Actualización periódica de la posición mientras esté activo.
- Mapa operativo en el panel del prestador (no visible para el comprador).
- Manejo de permisos del navegador y errores de geolocalización.

**Criterio de terminado:**
- El prestador puede activar y desactivar el compartir ubicación.
- Su posición se actualiza en el panel.
- No se muestra al comprador.
- Funciona en móvil.

**Notas:**
- Esta fase se pospone al final del MVP porque requiere permisos del navegador,
  actualización periódica y un mapa operativo. El modelo de datos ya la
  contempla desde la Fase 0.

---

## 8. Orden de fases y dependencias

```
Fase 0 (Base)
   ↓
Fase 1 (Navegación pública)
   ↓
Fase 2 (Auth simulada + panel vendedor)
   ↓
Fase 3 (Mensajería + domicilio + reportes)
   ↓
Fase 4 (Panel admin)
   ↓
Fase 5 (Geolocalización del domiciliario)
```

Cada fase depende de la anterior. No se puede empezar la Fase 3 sin la Fase 2, ni
la Fase 4 sin la Fase 3.

---

## 9. Criterios de "terminado" por fase

Una fase se considera terminada solo si:

- Cumple el criterio de terminado específico de la fase.
- Está desplegada en Vercel (preview y producción).
- Funciona en móvil y desktop.
- Tiene estados `loading`, `empty` y `error` donde aplique.
- Respeta las reglas de privacidad de `.clinerules` y `/docs/03`.
- Actualiza `/docs` si introdujo o cambió una regla.
- No introduce datos falsos fuera de seeds/mocks.

---

## 10. Fuera del roadmap del MVP

Estas funcionalidades no entran en ninguna fase del MVP y se posponen a una
versión posterior:

- Pagos en línea.
- Carrito y checkout.
- Reseñas y valoraciones.
- Historial de compras del comprador.
- Chat dentro del sitio.
- Verificación real de identidad (OAuth y captcha reales).
- Multi-idioma.
- Notificaciones push o email.
- App móvil nativa.
- Expansión a otros municipios.
- Logística propia.
- Planes premium para vendedores.

---

## 11. Próximos pasos después del MVP

- Migrar OAuth simulado a OAuth real de Google/Facebook.
- Migrar captcha simulado a reCAPTCHA o hCaptcha.
- Evaluar migración del backend a un runtime con soporte para websockets si se
  necesita chat en tiempo real.
- Añadir notificaciones push o email.
- Añadir reseñas y valoraciones.
- Evaluar app móvil nativa (React Native o similar).
- Evaluar expansión geográfica.
