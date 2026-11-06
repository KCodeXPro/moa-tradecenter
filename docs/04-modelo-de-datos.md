# 04 — Modelo de datos: Moa Tradecenter

> Define las entidades, campos, relaciones y validaciones del sistema. Es la
> referencia para el backend y para el frontend. Cualquier campo nuevo debe
> reflejarse aquí antes de implementarse.

---

## 1. Convenciones generales

- **Base de datos:** MongoDB.
- **IDs:** `ObjectId` de MongoDB para todas las colecciones.
- **Fechas:** se almacenan en formato ISO 8601 (UTC) y se muestran en formato
  local **UTC-5 fijo** (Cuba, sin DST en el MVP) en la UI.
- **Dinero:** se almacena como **entero en centavos** (ej: `1200` = $12.00 CUP).
  No se admiten decimales más pequeños que 1 centavo.
- **Moneda del MVP:** CUP (peso cubano).
- **Nombres de campos:** en español cuando representen conceptos del negocio
  (`vendedor`, `producto`, `precio`, `direccion`), en inglés cuando sean
  técnicos estándar (`id`, `createdAt`, `updatedAt`, `isActive`).
- **Soft delete:** las entidades que no deben borrarse físicamente usan un campo
  `eliminado: Boolean` y `eliminadoEn: Date`.
- **Índices:** se documentan los índices recomendados por colección.

---

## 2. Colecciones

El sistema tiene las siguientes colecciones:

1. `usuarios` — vendedores, prestadores y administradores.
2. `categorias` — categorías de productos y de servicios.
3. `productos` — productos publicados por vendedores.
4. `servicios` — servicios publicados por vendedores.
5. `mensajes` — mensajes de compradores a vendedores.
6. `mensajesAdmin` — mensajes internos entre admin y vendedores.
7. `solicitudesDomicilio` — solicitudes de domicilio.
8. `reportes` — reportes de compradores/visitantes sobre productos o vendedores.
9. `auditoria` — registro de accesos del admin a datos privados.
10. `visitas` — contador de visitas al sitio.

---

## 3. Colección `usuarios`

Representa a vendedores, prestadores de domicilio y administradores.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `nick` | String | ✅ | Nombre visible. **Único** en el sistema. |
| `email` | String | ❌ | Email del usuario (si lo aporta el OAuth). |
| `oauthProvider` | String | ✅ | `google` o `facebook` (simulado en MVP). |
| `oauthId` | String | ✅ | ID del proveedor OAuth. |
| `rol` | String | ✅ | `vendedor`, `admin`. **Ya no existe `prestador` como rol.** |
| `esPrestador` | Boolean | ✅ | `true` si el vendedor de servicios ofrece domicilio. Por defecto `false`. |
| `tipoVenta` | String | ✅ (solo vendedores) | `productos`, `servicios`, `ambos`. **Fijo al registrarse.** |
| `aceptaDomicilio` | Boolean | ✅ (solo vendedores de productos o ambos) | `true` si marcó "Si desea recibir domicilio". Por defecto `false`. |
| `direccion` | String | ❌ | Solo si `aceptaDomicilio = true`. En otro caso, `null`. |
| `whatsapp` | String | ✅ (solo prestadores) | WhatsApp del prestador. **Único WhatsApp público.** |
| `whatsappEsPublico` | Boolean | ✅ | `true` solo para prestadores. `false` para el resto. |
| `tarifaDomicilio` | Integer | ✅ (solo prestadores) | Tarifa en centavos. |
| `disponible` | Boolean | ✅ (solo prestadores) | `true` = aparece en el selector. Por defecto `true`. |
| `estado` | String | ✅ | `activo`, `suspendido`, `eliminado`. Por defecto `activo`. |
| `ubicacionActual` | Object | ❌ | Solo fase 2: `{ lat, lng, actualizadoEn }`. |
| `createdAt` | Date | ✅ | Fecha de creación. |
| `updatedAt` | Date | ✅ | Fecha de última actualización. |
| `eliminadoEn` | Date | ❌ | Fecha de eliminación (soft delete). |

### Reglas

- `nick` debe ser único. Índice único.
- `rol` determina los permisos. Valores: `vendedor`, `admin`.
- Un `prestador` es un usuario con `rol: 'vendedor'` y `esPrestador: true`.
- Un `prestador` **debe** tener `whatsapp`, `tarifaDomicilio` y
  `whatsappEsPublico: true`.
- Un `prestador` **no puede** tener `aceptaDomicilio: true` ni `direccion`.
- Un `vendedor` con `aceptaDomicilio = true` **debe** tener `direccion`.
- Un `vendedor` con `aceptaDomicilio = false` **no puede** tener `direccion`.
- `whatsappEsPublico` es `true` solo para prestadores.
- El `tipoVenta` no puede modificarse después del registro.
- El `estado` `eliminado` es soft delete: no se borra físicamente.
- Si `estado = 'suspendido'`, sus productos/servicios se ocultan del sitio.
- Si `estado = 'eliminado'`, sus productos/servicios también se marcan como
  eliminados.
- Al reactivar una cuenta, `disponible` **se respeta** como estaba antes de la
  suspensión.

### Índices

- `nick`: único.
- `oauthProvider + oauthId`: único compuesto.
- `estado`.
- `rol`.
- `esPrestador`.
- `disponible` (solo prestadores).

## 4. Colección `categorias`

Representa las categorías de productos y de servicios.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `tipo` | String | ✅ | `producto` o `servicio`. |
| `nombre` | String | ✅ | Nombre visible. Único dentro de su `tipo`. |
| `icono` | String | ✅ | **Un solo emoji** (longitud máxima 2 caracteres). |
| `orden` | Integer | ✅ | Entero libre, orden ascendente. Editable por admin. |
| `esSinCategoria` | Boolean | ✅ | `true` solo para la categoría especial "Sin categoría". Por defecto `false`. |
| `createdAt` | Date | ✅ | Fecha de creación. |
| `updatedAt` | Date | ✅ | Fecha de última actualización. |

### Reglas

- `nombre` único dentro de `tipo`.
- `icono` es un solo emoji, longitud máxima 2 caracteres.
- `orden` es un entero libre. Si hay empate, se ordena por `nombre`.
- Existe **una** categoría "Sin categoría" por cada `tipo` (producto y servicio),
  creada por defecto al inicializar el sistema.
- La categoría "Sin categoría" **no puede editarse ni eliminarse**.
- Al eliminar una categoría, sus productos/servicios se **reasignan
  automáticamente** a "Sin categoría" del mismo `tipo`. **No se bloquea la
  eliminación.**
- Una categoría que **no** es "Sin categoría" puede eliminarse en cualquier
  momento.

### Índices

- `tipo + nombre`: único compuesto.
- `orden`.

---

## 5. Colección `productos`

Representa los productos publicados por vendedores.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `vendedorId` | ObjectId | ✅ | Referencia a `usuarios._id`. |
| `nombre` | String | ✅ | Nombre del producto. |
| `descripcion` | String | ❌ | Talla, color, tamaño, etc. |
| `imagen` | String | ❌ | URL externa de la imagen (opcional). Validación de tipo MIME y tamaño máximo 5 MB en el frontend. |
| `precio` | Integer | ✅ (solo minorista) | Precio en centavos. Mayor que 0. |
| `precioMayorista` | Integer | ✅ (solo mayorista) | Precio en centavos. Mayor que 0. |
| `tipoVenta` | String | ✅ | `minorista` o `mayorista`. |
| `categoriaId` | ObjectId | ✅ | Referencia a `categorias._id` (tipo `producto`). |
| `tieneDomicilio` | Boolean | ✅ | `true` si el vendedor tiene `aceptaDomicilio: true`. Derivado. |
| `estado` | String | ✅ | `activo`, `oculto`, `eliminado`. Por defecto `activo`. |
| `createdAt` | Date | ✅ | Fecha de creación. |
| `updatedAt` | Date | ✅ | Fecha de última actualización. |
| `eliminadoEn` | Date | ❌ | Fecha de eliminación (soft delete). |

### Reglas

- `tipoVenta = 'minorista'` → `precio` obligatorio, `precioMayorista` no aplica.
- `tipoVenta = 'mayorista'` → `precioMayorista` obligatorio, `precio` no aplica.
- `precio` y `precioMayorista` deben ser mayores que 0.
- `categoriaId` debe existir y ser de tipo `producto`.
- `tieneDomicilio` se calcula al crear/editar el producto a partir del
  `aceptaDomicilio` del vendedor.
- Si el vendedor cambia `aceptaDomicilio`, se actualiza en cascada
  `tieneDomicilio` en todos sus productos.
- Si el vendedor es suspendido, sus productos pasan a `estado = 'oculto'`.
- Si el vendedor es reactivado, sus productos vuelven a `estado = 'activo'`.
- Si el vendedor es eliminado, sus productos pasan a `estado = 'eliminado'`.
- Si la categoría es eliminada, el producto se reasigna automáticamente a
  "Sin categoría".
- Un producto en "Sin categoría" no se muestra en el listado público.

### Índices

- `vendedorId`.
- `categoriaId`.
- `tipoVenta`.
- `estado`.
- `createdAt` (para "más recientes").
- `nombre` (texto, para buscador).

---

## 6. Colección `servicios`

Representa los servicios publicados por vendedores.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `vendedorId` | ObjectId | ✅ | Referencia a `usuarios._id`. |
| `nombre` | String | ✅ | Nombre del servicio. |
| `descripcion` | String | ❌ | Descripción libre. |
| `imagen` | String | ❌ | URL externa de la imagen (opcional). Validación de tipo MIME y tamaño máximo 5 MB en el frontend. |
| `precio` | Integer | ✅ | Precio en centavos. Mayor que 0. |
| `categoriaId` | ObjectId | ✅ | Referencia a `categorias._id` (tipo `servicio`). |
| `esDomicilio` | Boolean | ✅ | `true` si la categoría es "Domicilio". Derivado. |
| `estado` | String | ✅ | `activo`, `oculto`, `eliminado`. Por defecto `activo`. |
| `createdAt` | Date | ✅ | Fecha de creación. |
| `updatedAt` | Date | ✅ | Fecha de última actualización. |
| `eliminadoEn` | Date | ❌ | Fecha de eliminación (soft delete). |

### Reglas

- `precio` obligatorio y mayor que 0.
- `categoriaId` debe existir y ser de tipo `servicio`.
- `esDomicilio` se calcula a partir de la categoría "Domicilio".
- Si `esDomicilio = true`, el vendedor asociado **debe** tener
  `esPrestador: true`, `whatsapp`, `whatsappEsPublico: true` y
  `tarifaDomicilio`.
- Si el vendedor es suspendido, sus servicios pasan a `estado = 'oculto'`.
- Si el vendedor es reactivado, sus servicios vuelven a `estado = 'activo'`.
- Si el vendedor es eliminado, sus servicios pasan a `estado = 'eliminado'`.
- Si la categoría es eliminada, el servicio se reasigna automáticamente a
  "Sin categoría".
- Un servicio en "Sin categoría" no se muestra en el listado público.

### Índices

- `vendedorId`.
- `categoriaId`.
- `esDomicilio`.
- `estado`.
- `createdAt`.
- `nombre` (texto, para buscador).


## 7. Colección `mensajes`

Representa los mensajes de compradores a vendedores (de uso único).

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `vendedorId` | ObjectId | ✅ | Referencia a `usuarios._id` (destinatario). |
| `productoId` | ObjectId | ❌ | Referencia a `productos._id` (si aplica). |
| `servicioId` | ObjectId | ❌ | Referencia a `servicios._id` (si aplica). |
| `tipo` | String | ✅ | `producto` o `servicio`. Derivado de `productoId` o `servicioId`. |
| `whatsappComprador` | String | ✅ | WhatsApp del comprador. |
| `texto` | String | ❌ | Mensaje libre del comprador. |
| `leido` | Boolean | ✅ | `true` si el vendedor lo abrió en su panel. Por defecto `false`. |
| `createdAt` | Date | ✅ | Fecha de creación. |
| `anonimizadoEn` | Date | ❌ | Fecha de anonimización del WhatsApp (30 días). |

### Reglas

- Un mensaje debe tener al menos `productoId` o `servicioId`, nunca ambos.
- `tipo` se calcula al crear el mensaje: `producto` si tiene `productoId`,
  `servicio` si tiene `servicioId`.
- `whatsappComprador` es obligatorio.
- Los mensajes **no leídos** se **borran físicamente** a los **5 días** con TTL
  index de MongoDB sobre `createdAt` (solo cuando `leido = false`).
- Los mensajes **leídos** conservan su contenido, pero el WhatsApp del comprador
  se **anonimiza a los 30 días** con un job programado (no TTL).
- El vendedor puede marcar el mensaje como `leido` desde su panel.
- El vendedor **no puede responder** desde la página; solo por WhatsApp.
- El WhatsApp del comprador solo lo ve el vendedor destinatario.

### Índices

- `vendedorId`.
- `productoId`.
- `servicioId`.
- `tipo`.
- `createdAt`.
- `leido`.
- TTL index sobre `createdAt` con expiración a 5 días, filtrado por
  `leido: false`.

---

## 8. Colección `mensajesAdmin`

Representa los mensajes internos entre admin y vendedores/prestadores.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `adminId` | ObjectId | ✅ | Referencia a `usuarios._id` (rol admin). |
| `destinatarioId` | ObjectId | ✅ | Referencia a `usuarios._id` (vendedor o prestador). |
| `tipo` | String | ✅ | `admin_a_vendedor` o `vendedor_a_admin`. |
| `texto` | String | ✅ | Contenido del mensaje. |
| `leido` | Boolean | ✅ | Por defecto `false`. |
| `createdAt` | Date | ✅ | Fecha de creación. |

### Reglas

- Solo el admin puede iniciar mensajes (`admin_a_vendedor`).
- El vendedor **solo puede responder** a mensajes del admin
  (`vendedor_a_admin`). **No puede iniciar mensajes.**
- El destinatario solo ve sus propios mensajes.
- Los mensajes internos **no se eliminan automáticamente**.

### Índices

- `adminId`.
- `destinatarioId`.
- `createdAt`.
- `leido`.

---

## 9. Colección `solicitudesDomicilio`

Representa las solicitudes de domicilio de un comprador a un prestador.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `productoId` | ObjectId | ✅ | Referencia a `productos._id`. |
| `vendedorProductoId` | ObjectId | ✅ | Referencia a `usuarios._id` (dueño del producto). |
| `prestadorId` | ObjectId | ✅ | Referencia a `usuarios._id` (prestador elegido, con `esPrestador: true`). |
| `whatsappComprador` | String | ✅ | WhatsApp del comprador. |
| `snapshotProducto` | Object | ✅ | Datos del producto en el momento de la solicitud. |
| `snapshotDireccionVendedor` | String | ✅ | Dirección del vendedor en el momento de la solicitud. |
| `tarifa` | Integer | ✅ | Tarifa del prestador en centavos en ese momento. |
| `estado` | String | ✅ | `pendiente`, `contactado`, `entregado`, `cancelado`. Por defecto `pendiente`. |
| `motivoCancelacion` | String | ❌ | Si `estado = 'cancelado'`. |
| `createdAt` | Date | ✅ | Fecha de creación. |
| `updatedAt` | Date | ✅ | Fecha de última actualización. |

### `snapshotProducto`

```json
{
  "nombre": "Perfume Floral 50ml",
  "descripcion": "Fragancia floral intensa, 50 ml",
  "precio": 1200,
  "tipoVenta": "minorista"
}

### Reglas

- `prestadorId` debe ser un usuario con `esPrestador: true` y
  `disponible: true` en el momento de la creación.
- `snapshotProducto`, `snapshotDireccionVendedor` y `tarifa` se guardan en el
  momento de la solicitud. **El snapshot prevalece sobre las referencias.** Si el
  producto o el vendedor se eliminan, la solicitud conserva el snapshot
  congelado.
- Estados válidos: `pendiente`, `contactado`, `entregado`, `cancelado`.
- Al suspender al prestador, sus solicitudes `pendiente` y `contactado` pasan a
  `cancelado` con `motivoCancelacion = 'prestador_suspendido'`.
- Si el comprador cancela, `motivoCancelacion = 'comprador_cancelo'`.
- Si el producto se elimina, la solicitud conserva su snapshot.

### Índices

- `productoId`.
- `vendedorProductoId`.
- `prestadorId`.
- `estado`.
- `createdAt`.

---

## 10. Colección `reportes`

Representa los reportes de compradores/visitantes sobre productos, servicios o
vendedores.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `productoId` | ObjectId | ❌ | Referencia a `productos._id` (si aplica). |
| `servicioId` | ObjectId | ❌ | Referencia a `servicios._id` (si aplica). |
| `vendedorId` | ObjectId | ❌ | Referencia a `usuarios._id` (si aplica). |
| `motivo` | String | ✅ | `contenido_inapropiado`, `precio_engañoso`, `producto_prohibido`, `otro`. |
| `comentario` | String | ❌ | Comentario libre. |
| `whatsappReportante` | String | ❌ | WhatsApp del reportante (opcional). |
| `estado` | String | ✅ | `pendiente`, `desestimado`, `actuado`. Por defecto `pendiente`. |
| `createdAt` | Date | ✅ | Fecha de creación. |
| `updatedAt` | Date | ✅ | Fecha de última actualización. |

### Reglas

- Un reporte debe tener al menos uno de: `productoId`, `servicioId` o
  `vendedorId`.
- `motivo` obligatorio.
- `whatsappReportante` opcional. Si se aporta, el admin lo ve, pero **no puede
  contactar al reportante desde el panel**. Solo para auditoría.
- El admin puede cambiar el estado a `desestimado` o `actuado`.

### Índices

- `estado`.
- `createdAt`.
- `productoId`.
- `servicioId`.
- `vendedorId`.


## 11. Colección `auditoria`

Registro de accesos del admin a datos privados.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `adminId` | ObjectId | ✅ | Referencia a `usuarios._id` (rol admin). |
| `vendedorId` | ObjectId | ✅ | Referencia a `usuarios._id` (vendedor afectado). |
| `datoConsultado` | String | ✅ | `whatsapp` o `direccion`. |
| `createdAt` | Date | ✅ | Fecha y hora del acceso. |

### Reglas

- Se registra cada vez que el admin consulta el WhatsApp o la dirección de un
  vendedor en su ficha individual.
- No se puede editar ni eliminar desde la UI.
- Es visible en la pestaña "Auditoría" del panel de admin.

### Índices

- `adminId`.
- `vendedorId`.
- `createdAt`.

---

## 12. Colección `visitas`

Contador de visitas al sitio.

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `_id` | ObjectId | ✅ | ID único. |
| `fecha` | Date | ✅ | Fecha (día, en UTC-5) de la visita. |
| `contador` | Integer | ✅ | Número de visitas del día. |

### Reglas

- Una visita se cuenta cada vez que se carga la home con un `sessionId` nuevo
  (cookie de sesión). Si el usuario recarga, no se cuenta otra vez.
- Se agrupa por día (UTC-5) para evitar saturar la base de datos.

### Índices

- `fecha`: único.


## 13. Relaciones entre colecciones

usuarios (vendedor)
  ├── 1:N → productos
  ├── 1:N → servicios
  ├── 1:N → mensajes (como destinatario)
  ├── 1:N → mensajesAdmin (como destinatario o admin)
  ├── 1:N → solicitudesDomicilio (como vendedorProducto o prestador)
  ├── 1:N → reportes (como vendedor reportado)
  └── 1:N → auditoria (como vendedor afectado)

categorias
  ├── 1:N → productos
  └── 1:N → servicios

productos
  ├── N:1 → usuarios (vendedor)
  ├── N:1 → categorias
  ├── 1:N → mensajes
  ├── 1:N → solicitudesDomicilio
  └── 1:N → reportes

servicios
  ├── N:1 → usuarios (vendedor)
  ├── N:1 → categorias
  ├── 1:N → mensajes
  └── 1:N → reportes

mensajes
  ├── N:1 → usuarios (vendedor)
  └── N:1 → productos o servicios (con campo tipo derivado)

solicitudesDomicilio
  ├── N:1 → productos (con snapshot que prevalece)
  ├── N:1 → usuarios (vendedorProducto, con snapshot que prevalece)
  └── N:1 → usuarios (prestador)

reportes
  ├── N:1 → productos, servicios o usuarios
  └── (opcional) whatsappReportante

auditoria
  ├── N:1 → usuarios (admin)
  └── N:1 → usuarios (vendedor)

visitas
  └── (independiente)


---

## 14. Validaciones transversales

1. **Unicidad de nick:** no puede haber dos usuarios con el mismo `nick`.
2. **Unicidad de categoría por tipo:** no puede haber dos categorías con el mismo
   `nombre` y `tipo`.
3. **Precios mayores que 0:** en productos y servicios. Siempre enteros en
   centavos.
4. **Tipo de venta fijo:** no se puede cambiar después del registro.
5. **WhatsApp de prestador obligatorio:** si `esPrestador: true`.
6. **Dirección obligatoria si acepta domicilio:** si `aceptaDomicilio = true`.
7. **Prestador sin `aceptaDomicilio` ni `direccion`:** un prestador no los tiene.
8. **WhatsApp del comprador obligatorio:** en mensajes y solicitudes de
   domicilio.
9. **Estados válidos:** cada colección define sus estados permitidos.
10. **Referencias válidas:** todo `ObjectId` referenciado debe existir.
11. **Soft delete:** las entidades con `eliminado` no se borran físicamente.
12. **WhatsApp público solo si `whatsappEsPublico === true`.**
13. **Snapshot de solicitud prevalece sobre referencias.**
14. **`tipo` derivado en mensajes** según `productoId` o `servicioId`.


---

## 15. Decisiones resueltas

- ~~¿Usamos UUID v4 u ObjectId de MongoDB?~~ → **Resuelto:** ObjectId.
- ~~¿El administrador es un usuario más o una colección separada?~~ → **Resuelto:**
  misma colección `usuarios` con `rol: 'admin'`.
- ~~¿El comprador se guarda como entidad?~~ → **Resuelto:** no, solo su WhatsApp
  dentro del mensaje/solicitud.
- ~~¿Los mensajes se guardan indefinidamente?~~ → **Resuelto:** los no leídos se
  borran físicamente a los 5 días (TTL index); los leídos se conservan, pero el
  WhatsApp se anonimiza a los 30 días (job programado).
- ~~¿Un mensaje puede ser respondido desde el panel?~~ → **Resuelto:** no, solo se
  registra el mensaje inicial.
- ~~¿La solicitud de domicilio guarda snapshot o solo referencia?~~ → **Resuelto:**
  snapshot, y prevalece sobre las referencias.
- ~~¿Las categorías tienen orden configurable?~~ → **Resuelto:** sí, campo `orden`
  entero libre.

- ~~¿La categoría "Sin categoría" es real o virtual?~~ → **Resuelto:** real,
  creada por defecto, no editable ni eliminable.
- ~~¿La auditoría guarda qué admin accedió?~~ → **Resuelto:** sí, con su ID.
- ~~¿Estados del vendedor incluyen `pendiente`?~~ → **Resuelto:** no en MVP, solo
  `activo`, `suspendido`, `eliminado`.
- ~~¿El prestador es un rol separado?~~ → **Resuelto:** no, es un vendedor con
  `esPrestador: true`.
- ~~¿`aceptaDomicilio` y `direccion` son redundantes?~~ → **Resuelto:**
  `aceptaDomicilio` es el checkbox explícito; `direccion` es obligatoria si es
  `true` y `null` si es `false`.
- ~~¿El WhatsApp del prestador se expone con un flag?~~ → **Resuelto:** campo
  `whatsappEsPublico: Boolean`, `true` solo para prestadores.
- ~~¿El vendedor puede iniciar mensajes internos al admin?~~ → **Resuelto:** no,
  solo responder.
- ~~¿El admin puede contactar al reportante?~~ → **Resuelto:** no, solo ver el
  WhatsApp para auditoría.
- ~~¿Los mensajes no leídos se borran físicamente o con soft delete?~~ →
  **Resuelto:** se borran físicamente a los 5 días con TTL index.
- ~~¿El snapshot de la solicitud prevalece sobre las referencias?~~ →
  **Resuelto:** sí, prevalece.
- ~~¿Qué zona horaria se usa?~~ → **Resuelto:** UTC en almacenamiento, UTC-5
  fijo en UI.
- ~~¿Los precios admiten decimales menores a 1 centavo?~~ → **Resuelto:** no,
  siempre enteros en centavos.
- ~~¿El icono de categoría es un emoji o un identificador?~~ → **Resuelto:** un
  solo emoji, longitud máxima 2 caracteres.

