# 02 — Actores y roles: Moa Tradecenter

> Define quién hace qué en el sistema. Es la referencia para permisos, pantallas
> y validaciones. Cualquier rol nuevo o cambio de permisos debe reflejarse aquí
> antes de implementarse.

---

## 1. Roles del sistema

Existen exactamente estos roles. No se fusionan ni se renombran sin autorización.

| Rol | Requiere cuenta | Descripción breve |
|---|---|---|
| **Visitante** | No | Navega el sitio sin identificarse. |
| **Comprador** | No (solo WhatsApp al contactar) | Busca, filtra, envía mensajes y solicita domicilio. |
| **Vendedor** | Sí (OAuth simulado en MVP) | Publica productos, servicios o ambos. Si además ofrece domicilio, tiene el flag `esPrestador`. |
| **Prestador de Domicilio** | Sí (es un Vendedor de Servicios con `esPrestador: true`) | Recibe solicitudes de domicilio y cobra una tarifa. Su WhatsApp es el único público del sitio. |
| **Administrador** | Sí (usuario fijo por configuración en MVP) | Modera, gestiona categorías, suspende cuentas, envía mensajes. |

**Nota de modelo:** el prestador **no es un rol separado**. Es un `usuario` con
`rol: 'vendedor'` y `esPrestador: true`. No tiene `aceptaDomicilio` ni
`direccion`. Tiene `whatsapp` (público), `tarifaDomicilio` y `disponible`.

---

## 2. Visitante

**Quién es:** cualquier persona que entra al sitio sin haber iniciado sesión ni
dejado su WhatsApp.

**Puede:**
- Ver la home y elegir producto o servicio.
- Aplicar filtros: precio, tipo de producto (mayorista/minorista), más recientes,
  más buscados.
- Usar el buscador dentro de cada elección.
- Ver listados y fichas de productos/servicios (nombre, descripción, precio,
  imagen opcional, nombre del vendedor).
- Ver si un producto tiene domicilio (botón "Domicilio" visible pero bloqueado
  hasta identificarse).
- Ver la lista de prestadores de domicilio de un producto (nombre, tarifa y
  **WhatsApp del prestador**, que es el único WhatsApp público del sitio) **solo
  si antes deja su propio WhatsApp**.

**No puede:**
- Enviar mensajes a un vendedor.
- Solicitar domicilio.
- Acceder al panel de vendedor ni al de administrador.

**Reglas de privacidad que le aplican:**
- No ve el WhatsApp de vendedores de productos ni de servicios no-domicilio.
- No ve la dirección de ningún vendedor.

---

## 3. Comprador

**Quién es:** un visitante que decide contactar a un vendedor o solicitar un
domicilio. **No crea cuenta.** Se identifica dejando su número de WhatsApp en el
momento de la acción.

**Puede:**
- Todo lo del Visitante.
- Enviar un **mensaje de uso único** a un vendedor de producto o servicio,
  dejando su WhatsApp para que el vendedor le responda por esa vía.
- Solicitar domicilio de un producto que lo permita:
  - ver la lista de prestadores con nombre, tarifa y WhatsApp,
  - elegir uno,
  - el sistema envía automáticamente al prestador: datos del producto, dirección
    del vendedor del producto y WhatsApp del comprador.
- Ver el WhatsApp del prestador de domicilio elegido (único WhatsApp público).

**No puede:**
- Ver un historial de sus mensajes (cada mensaje es de un solo uso).
- Ver el WhatsApp de vendedores de productos o servicios no-domicilio.
- Ver la dirección del vendedor.
- Acceder al panel de vendedor ni al de administrador.

**Reglas que le aplican:**
- Debe proporcionar su WhatsApp para enviar mensaje o solicitar domicilio.
- El WhatsApp que deja solo lo ve el vendedor destinatario (o el prestador, en
  el caso del domicilio).
- La dirección de entrega no se pide en el sitio: se coordina por WhatsApp entre
  prestador y comprador.
- Límite de 20 mensajes/día por WhatsApp (cambiar de WhatsApp resetea el
  contador en MVP).

---

## 4. Vendedor

**Quién es:** usuario registrado con OAuth (simulado en MVP) y `rol: 'vendedor'`.
Al registrarse elige su tipo de venta: **productos**, **servicios** o **ambos**.
Ese tipo **queda fijo** al registrarse y no se puede cambiar después.

Si el tipo de venta es **servicios** y su categoría principal es **"Domicilio"**,
el sistema marca automáticamente `esPrestador: true` y exige WhatsApp y tarifa.

**Puede:**
- Todo lo del Visitante (navegar sin restricciones).
- Acceder a su panel de vendedor.
- **Si vende productos:**
  - Crear productos indicando: nombre, descripción (talla, color, tamaño, etc.),
    precio, imagen opcional, tipo de venta (minorista o mayorista), categoría.
  - Si el producto es mayorista: indicar precio mayorista (obligatorio).
  - Si el producto es minorista: indicar precio minorista (obligatorio).
  - Editar y eliminar sus productos.
  - Recibir mensajes de compradores y ver el WhatsApp del comprador para
    responderle por WhatsApp.
- **Si vende servicios:**
  - Crear servicios indicando: nombre, descripción, precio, imagen opcional,
    categoría de servicio.
  - Editar y eliminar sus servicios.
  - Recibir mensajes de compradores y ver el WhatsApp del comprador para
    responderle por WhatsApp.
- **Si vende ambos:**
  - Una sola bandeja de mensajes con filtro por `tipo` (`producto`/`servicio`).
- Editar su perfil: nick, dirección, "si desea recibir domicilio". El **tipo de
  venta no aparece** en el formulario de edición.
- Cambiar su nick si el nuevo no existe. Error si ya existe.
- Ver métricas de su panel: productos activos, mensajes recibidos (total y
  últimos 7 días), solicitudes de domicilio recibidas, productos más consultados
  y más buscados.
- Recibir mensajes internos del administrador y **solo responder** (no iniciar).
- **Si es prestador:** pausar temporalmente la recepción de solicitudes mediante
  el campo `disponible` (ver sección 5).

**No puede:**
- Ver el WhatsApp de otros vendedores.
- Ver la dirección de otros vendedores.
- Acceder al panel de administrador.
- Cambiar su tipo de venta después del registro.
- Iniciar mensajes internos al admin (solo responde).

**Reglas de privacidad que le aplican:**
- Su WhatsApp **no es público** (salvo que sea prestador, ver sección 5).
- Su dirección **no es pública**. Solo se comparte con el prestador de domicilio
  cuando un comprador solicita domicilio de uno de sus productos.
- Si no marca "si desea recibir domicilio", no se le puede solicitar domicilio
  y su dirección queda vacía.
- `aceptaDomicilio` es el checkbox explícito. Si es `true`, `direccion` es
  obligatoria. Si es `false`, `direccion` debe ser `null`.

**Cuando el admin lo suspende:**
- Sus productos/servicios **se ocultan del sitio público** pero no se borran de
  la base de datos.
- Si la cuenta se reactiva, sus productos/servicios vuelven a mostrarse
  automáticamente.
- No puede acceder a su panel mientras esté suspendido.
- Si es prestador, sus solicitudes `pendiente` y `contactado` se cancelan y el
  comprador es avisado por WhatsApp.
- Al reactivarse, `disponible` **se respeta** como estaba antes de la
  suspensión.

---

## 5. Prestador de Domicilio

**Quién es:** un Vendedor de Servicios cuya categoría principal es **"Domicilio"**
y que tiene `esPrestador: true`. **No es un rol separado en el modelo**, pero sí
un comportamiento especial.

**Puede:**
- Todo lo del Vendedor de Servicios.
- Recibir solicitudes de domicilio de productos de otros vendedores.
- Ver en cada solicitud: datos del producto, dirección del vendedor del producto
  y WhatsApp del comprador.
- Contactar al comprador por WhatsApp para confirmar compra y dirección de entrega.
- Gestionar el estado de la solicitud: `pendiente`, `contactado`, `entregado`,
  `cancelado`.
- **Pausar temporalmente la recepción de solicitudes** con el campo `disponible`.
  Cuando está en `false`, no aparece en el selector de prestadores, pero su cuenta
  sigue activa y puede seguir atendiendo solicitudes ya aceptadas.
- (Fase 2 del MVP) Compartir su ubicación en tiempo real como herramienta
  operativa.

**No puede:**
- Ver el WhatsApp de otros vendedores.
- Ver la dirección de otros vendedores fuera del contexto de una solicitud de
  domicilio concreta.
- Acceder al panel de administrador.
- Tener `aceptaDomicilio: true` ni `direccion` (no aplica a prestadores).
- Iniciar mensajes internos al admin (solo responde).

**Reglas especiales que le aplican:**
- **Su WhatsApp es público.** Es el **único WhatsApp público del sitio**. Se
  expone solo si `whatsappEsPublico === true` (siempre `true` para prestadores).
  Aparece en la lista de prestadores que ve el comprador al solicitar domicilio,
  junto a su nombre y su tarifa.
- Debe registrarse y proporcionar su WhatsApp para poder recibir solicitudes.
- Debe indicar su tarifa de cobro por el servicio (`tarifaDomicilio`).
- Debe mantener actualizado su estado `disponible` para aparecer o no en el
  selector.

**Cuando el admin lo suspende:**
- Sus solicitudes en estado `pendiente` o `contactado` **se cancelan**.
- El sistema avisa al comprador por WhatsApp de que debe elegir otro prestador.
- Su cuenta queda suspendida y no aparece en el selector, aunque su campo
  `disponible` estuviera en `true`.
- Al reactivarse, `disponible` **se respeta** como estaba antes de la
  suspensión.

---

## 6. Administrador

**Quién es:** usuario con `rol: 'admin'`. En el MVP es un usuario fijo por
configuración (implementado como en el mockup).

**Puede:**
- Acceder al panel de administrador.
- Ver visitas totales al sitio.
- Ver listado de vendedores con tipo, categoría, interacciones y estado.
- Ver contadores de productos/servicios activos y de mensajes generados.
- **Suspender cuentas enteras** de vendedores y prestadores.
- **Reactivar cuentas suspendidas.**
- **Eliminar productos prohibidos.**
- **Crear categorías nuevas** (para productos y para servicios) y **reasignar
  productos/servicios** a ellas.
- **Eliminar categorías**: los productos/servicios se reasignan automáticamente
  a "Sin categoría" del mismo tipo.
- **Enviar mensajes internos** a vendedores y prestadores.
- Ver WhatsApp y dirección de un vendedor **solo en su ficha individual**, con
  registro de auditoría.
- Ver el WhatsApp del reportante en un reporte, pero **no contactarlo
  directamente** desde el panel. Solo para auditoría.
- Consultar la **pestaña de auditoría** del panel de admin, donde se registra
  quién accedió a qué dato privado y cuándo.

**No puede:**
- Actuar como comprador en nombre de otro usuario.
- Ver el WhatsApp de un comprador.
- Modificar el tipo de venta de un vendedor ya registrado.
- Contactar al reportante desde el panel.

**Reglas de privacidad que le aplican:**
- En el listado general **no** ve WhatsApp ni direcciones.
- Solo los ve en la ficha individual del vendedor y con auditoría.
- Cada acceso a un dato privado queda registrado en la auditoría con: admin,
  dato consultado, vendedor afectado y fecha/hora.

---

## 7. Matriz de permisos

| Acción | Visitante | Comprador | Vendedor | Prestador Domicilio | Admin |
|---|---|---|---|---|---|
| Navegar el sitio | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filtrar y buscar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver ficha de producto/servicio | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver WhatsApp del prestador de domicilio | ❌ (solo tras dejar su WhatsApp) | ✅ | ✅ | ✅ | ✅ |
| Enviar mensaje a vendedor | ❌ | ✅ | — | — | — |
| Solicitar domicilio | ❌ | ✅ | — | — | — |
| Recibir mensajes de compradores | — | — | ✅ | ✅ | — |
| Ver WhatsApp de un comprador | — | — | ✅ (solo sus mensajes) | ✅ (solo sus solicitudes) | ❌ |
| Publicar productos/servicios | ❌ | ❌ | ✅ | ✅ | ❌ |
| Editar perfil propio | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ver métricas propias | ❌ | ❌ | ✅ | ✅ | ✅ |
| Pausar recepción de domicilios | — | — | — | ✅ | — |
| Acceder al panel de vendedor | ❌ | ❌ | ✅ | ✅ | ❌ |
| Acceder al panel de admin | ❌ | ❌ | ❌ | ❌ | ✅ |
| Suspender cuentas | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reactivar cuentas | ❌ | ❌ | ❌ | ❌ | ✅ |
| Eliminar productos | ❌ | ❌ | Solo los propios | Solo los propios | ✅ (prohibidos) |
| Crear categorías | ❌ | ❌ | ❌ | ❌ | ✅ |
| Eliminar categorías | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reasignar productos/servicios a categorías | ❌ | ❌ | ❌ | ❌ | ✅ |
| Enviar mensajes internos a vendedores | ❌ | ❌ | ❌ | ❌ | ✅ |
| Responder mensajes internos del admin | ❌ | ❌ | ✅ | ✅ | — |
| Ver WhatsApp/dirección en ficha individual | ❌ | ❌ | — | — | ✅ (con auditoría) |
| Ver WhatsApp del reportante | ❌ | ❌ | ❌ | ❌ | ✅ (solo auditoría) |
| Contactar al reportante | ❌ | ❌ | ❌ | ❌ | ❌ |
| Consultar auditoría | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 8. Reglas transversales de roles

1. **Un usuario no puede tener dos roles incompatibles a la vez.** Un vendedor no
   puede ser administrador. Un administrador no puede ser vendedor.
2. **Un vendedor puede ser de productos, de servicios o de ambos.** Eso no lo
   convierte en dos usuarios distintos.
3. **Un prestador de domicilio es siempre un vendedor de servicios** de la
   categoría "Domicilio", con `esPrestador: true`. No se registra por un canal
   aparte.
4. **El comprador no es un rol persistente.** Es una acción identificada por su
   WhatsApp en el momento del contacto. No hay cuenta de comprador en el MVP.
5. **El tipo de venta del vendedor queda fijo al registrarse.** No se puede
   cambiar a "ambos" después si se registró como "productos", ni viceversa.
   Tampoco aparece en el formulario de edición de perfil.
6. **El admin es el único que puede crear y eliminar categorías, y reasignar
   productos/servicios.** Los vendedores solo eligen entre las categorías
   existentes.
7. **La suspensión de una cuenta oculta todos sus productos/servicios** del sitio
   público, pero no los borra de la base de datos.
8. **La reactivación de una cuenta** vuelve a mostrar sus productos/servicios
   automáticamente y respeta el estado previo de `disponible` si es prestador.
9. **La suspensión de un prestador de domicilio cancela sus solicitudes
   `pendiente` y `contactado`** y avisa al comprador por WhatsApp.
10. **Un prestador de domicilio puede pausar la recepción de solicitudes** con el
    campo `disponible`, sin que eso cuente como suspensión.
11. **El WhatsApp del prestador de domicilio es el único WhatsApp público del
    sitio.** Se expone solo si `whatsappEsPublico === true`. Todos los demás
    WhatsApp son privados.
12. **Cada acceso del admin a un dato privado queda auditado** (quién, qué dato,
    a qué vendedor, cuándo).
13. **El flag `esPrestador` es excluyente con `aceptaDomicilio`.** Un prestador
    no acepta domicilio (lo ofrece); un vendedor de productos sí puede aceptarlo.
14. **El admin no puede contactar al reportante** aunque vea su WhatsApp en el
    reporte. Solo para auditoría.
15. **El vendedor solo puede responder mensajes internos del admin, no
    iniciarlos.**

---

## 9. Decisiones resueltas

- ~~Definir el formato exacto del registro de auditoría del admin~~ → **Resuelto:**
  log técnico en base de datos **y** visible en UI como pestaña "Auditoría" del
  panel de admin.
- ~~Definir si el admin puede reactivar una cuenta suspendida~~ → **Resuelto:** sí,
  con el mismo mecanismo de auditoría.
- ~~Definir si un prestador de domicilio puede pausar temporalmente la recepción
  de solicitudes sin suspender su cuenta~~ → **Resuelto:** sí, con el campo
  `disponible`.
- ~~Definir qué pasa con las solicitudes pendientes de un prestador cuando el
  admin lo suspende~~ → **Resuelto:** se cancelan y el sistema avisa al comprador
  por WhatsApp.
- ~~Definir qué pasa con los productos/servicios de un vendedor suspendido~~ →
  **Resuelto:** se ocultan del sitio público, no se borran; al reactivar la cuenta
  vuelven a mostrarse.
- ~~Definir si el prestador es un rol separado o un flag~~ → **Resuelto:** es un
  vendedor con `esPrestador: true`.
- ~~Definir si `aceptaDomicilio` y `direccion` son redundantes~~ → **Resuelto:**
  `aceptaDomicilio` es el checkbox explícito; `direccion` es obligatoria si es
  `true` y `null` si es `false`.
- ~~Definir si el WhatsApp del prestador se expone con un flag~~ → **Resuelto:**
  campo `whatsappEsPublico: Boolean`, `true` solo para prestadores.
- ~~Definir si el vendedor puede iniciar mensajes internos al admin~~ →
  **Resuelto:** no, solo responder.
- ~~Definir si el admin puede contactar al reportante~~ → **Resuelto:** no, solo
  ver el WhatsApp para auditoría.