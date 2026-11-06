# 05 — Flujos: Moa Tradecenter

> Describe paso a paso los flujos principales del sistema. Es la referencia para
> el frontend y el backend. Cualquier flujo nuevo o cambio debe reflejarse aquí
> antes de implementarse.

---

## 1. Convenciones de los flujos

- Cada flujo tiene: **actor**, **precondiciones**, **pasos**, **resultado** y
  **estados/errores**.
- Los flujos están escritos en presente y en español.
- Las pantallas se referencian por nombre funcional (no por nombre de archivo).
- Los mensajes de error al usuario deben ser claros y en español.
- La zona horaria de la UI es **UTC-5 fijo** (Cuba, sin DST en el MVP).

---

## 2. Flujo: navegación pública

**Actor:** Visitante (sin cuenta).

**Precondiciones:** ninguna.

**Pasos:**
1. El visitante entra a la home.
2. La home muestra: hero con elección "Producto" o "Servicio".
3. El visitante elige uno de los dos.
4. Se muestra el listado con filtros secundarios disponibles: precio, tipo de
   producto (mayorista/minorista), más recientes, más buscados.
5. El visitante aplica filtros y/o usa el buscador.
6. El visitante abre la ficha de un producto o servicio.
7. La ficha muestra: nombre, descripción, precio, imagen (opcional), nombre del
   vendedor, botones "Mensaje" y, si aplica, "Domicilio".

**Resultado:** el visitante navega libremente sin identificarse.

**Estados/errores:**
- Listado vacío: mostrar mensaje "No hay resultados con estos filtros" y botón
  "Limpiar filtros".
- Error de carga: mostrar estado de error con botón "Reintentar".

---

## 3. Flujo: enviar mensaje a un vendedor

**Actor:** Comprador (visitante que decide contactar).

**Precondiciones:** el comprador está viendo la ficha de un producto o servicio.

**Pasos:**
1. El comprador pulsa "Mensaje".
2. Se abre un modal con:
   - campo obligatorio "Tu WhatsApp",
   - campo opcional "Mensaje" (consulta libre),
   - botón "Enviar mensaje".
3. El comprador completa su WhatsApp y, si quiere, un mensaje.
4. Pulsa "Enviar mensaje".
5. El sistema valida:
   - el WhatsApp tiene formato válido (`+53 5XXXXXXX` o similar),
   - el comprador no ha superado el límite de 20 mensajes/día (contados por
     WhatsApp; cambiar de WhatsApp resetea el contador en MVP).
6. Si todo es válido, el sistema:
   - crea un `mensaje` en la base de datos con `tipo` derivado
     (`producto` o `servicio`),
   - asocia el mensaje al vendedor y al producto/servicio,
   - muestra confirmación al comprador: "Mensaje enviado. El vendedor te
     contactará por WhatsApp."
7. El vendedor ve el mensaje en su panel, con el WhatsApp del comprador.
8. El vendedor responde por WhatsApp fuera del sitio.

**Resultado:** el comprador envió un mensaje de uso único; la conversación
continúa por WhatsApp.

**Estados/errores:**
- WhatsApp inválido: mensaje de error en el campo.
- Límite superado: "Has alcanzado el límite de mensajes por hoy. Inténtalo
  mañana."
- Vendedor suspendido: "Este vendedor no está disponible en este momento."
- Producto/servicio eliminado: "Este producto ya no está disponible."

---

## 4. Flujo: solicitar domicilio

**Actor:** Comprador.

**Precondiciones:**
- El producto tiene `tieneDomicilio = true` (el vendedor tiene
  `aceptaDomicilio: true` y dirección registrada).
- El comprador está viendo la ficha del producto.

**Pasos:**
1. El comprador pulsa "Domicilio".
2. Si el producto **no tiene domicilio**, el botón muestra: "Este producto no
   tiene domicilio. Puedes contactar al vendedor por mensaje." y no avanza.
3. Si el producto **sí tiene domicilio**, se abre un modal con:
   - campo obligatorio "Tu WhatsApp",
   - lista de prestadores disponibles (`disponible = true`), cada uno con:
     - nombre,
     - tarifa,
     - WhatsApp (público, porque `whatsappEsPublico: true`),
   - botón "Continuar".
4. El comprador completa su WhatsApp y elige un prestador.
5. Pulsa "Continuar".
6. Se muestra un resumen:
   - producto (nombre, descripción, precio),
   - vendedor del producto,
   - prestador elegido (nombre, tarifa, WhatsApp),
   - dirección del vendedor del producto (a dónde debe ir el prestador),
   - botón "Confirmar solicitud".
7. El comprador pulsa "Confirmar solicitud".
8. El sistema:
   - crea una `solicitudDomicilio` con `estado = 'pendiente'`,
   - guarda snapshot del producto, de la dirección del vendedor y de la tarifa,
   - envía automáticamente un mensaje al prestador con: datos del producto,
     dirección del vendedor y WhatsApp del comprador,
   - muestra confirmación al comprador: "Solicitud enviada. El prestador te
     contactará por WhatsApp para confirmar la entrega."
9. El prestador recibe el mensaje en su panel y contacta al comprador por
   WhatsApp para confirmar compra y dirección de entrega.
10. El prestador actualiza el estado de la solicitud: `contactado` →
    `entregado`.

**Resultado:** el comprador solicitó un domicilio; el prestador coordina por
WhatsApp.

**Estados/errores:**
- No hay prestadores disponibles: "No hay prestadores disponibles en este
   momento. Inténtalo más tarde."
- WhatsApp inválido: mensaje de error en el campo.
- Prestador se suspende entre la selección y la confirmación: "El prestador ya
  no está disponible. Elige otro."
- Producto eliminado entre la selección y la confirmación: "Este producto ya no
  está disponible."

---

## 5. Flujo: registro de vendedor

**Actor:** Visitante que quiere ser vendedor.

**Precondiciones:** ninguna.

**Pasos (2 pasos):**

### Paso 1 — Datos de OAuth (simulado)

1. El visitante pulsa "Login o acceder" en el header.
2. Se abre un panel de acceso con:
   - botón "Continuar con Google" (simulado),
   - botón "Continuar con Facebook" (simulado),
   - checkbox "No soy un robot" (obligatorio, simulado),
   - enlace "¿No tienes cuenta? Regístrate".
3. El visitante marca el checkbox "No soy un robot".
4. Pulsa "Continuar con Google" o "Continuar con Facebook".
5. Se muestra un modal de simulación: "Esto es una simulación. Elige un usuario
   de prueba:" con opciones:
   - Usuario comprador de prueba,
   - Usuario vendedor de prueba,
   - Usuario admin de prueba.
6. El visitante elige "Usuario vendedor de prueba".
7. El sistema simula el login y avanza al paso 2.

### Paso 2 — Datos de negocio

8. Se muestra el formulario de registro de vendedor con:
   - **Nick** (obligatorio, único),
   - **Tipo de venta**: productos / servicios / ambos (obligatorio),
   - **"Si desea recibir domicilio"** (checkbox, solo si el tipo de venta es
     productos o ambos),
   - **Dirección** (obligatoria solo si marcó el checkbox anterior),
   - **WhatsApp** (obligatorio solo si el tipo de venta es servicios y la
     categoría principal es "Domicilio"),
   - **Tarifa** (obligatoria solo si es prestador),
   - botón "Crear cuenta".
9. El vendedor completa los datos.
10. Pulsa "Crear cuenta".
11. El sistema valida:
    - nick no vacío y único,
    - tipo de venta seleccionado,
    - si `aceptaDomicilio = true`, dirección obligatoria,
    - si es prestador, WhatsApp y tarifa obligatorios.
12. Si todo es válido, el sistema:
    - crea el `usuario` con `rol: 'vendedor'` y, si aplica,
      `esPrestador: true`,
    - si es prestador, marca `whatsappEsPublico: true`,
    - crea la sesión,
    - redirige al panel del vendedor.
13. Si el vendedor cancela a mitad de camino, no se crea nada.

**Resultado:** el vendedor tiene cuenta y acceso a su panel.

**Estados/errores:**
- Checkbox anti-bots no marcado: "Debes verificar que no eres un robot."
- Nick ya existe: "Ese nick ya está en uso. Elige otro."
- Tipo de venta no seleccionado: "Selecciona qué vas a vender."
- Dirección vacía con `aceptaDomicilio = true`: "La dirección es obligatoria si
  deseas recibir domicilio."
- WhatsApp vacío siendo prestador: "El WhatsApp es obligatorio para prestadores."
- Tarifa vacía siendo prestador: "La tarifa es obligatoria para prestadores."
- Cancelación: no se crea nada, se vuelve a la home.

---

## 6. Flujo: publicar un producto

**Actor:** Vendedor de productos (o ambos).

**Precondiciones:** el vendedor está logueado y en su panel.

**Pasos:**
1. El vendedor pulsa "Mis productos" → "+ Añadir producto".
2. Se abre un formulario con:
   - **Nombre** (obligatorio),
   - **Descripción** (opcional),
   - **Imagen** (opcional, URL externa, validación de MIME y tamaño máximo 5 MB),
   - **Tipo de venta**: minorista / mayorista (obligatorio),
   - **Precio** (obligatorio si minorista, entero en centavos, > 0),
   - **Precio mayorista** (obligatorio si mayorista, entero en centavos, > 0),
   - **Categoría** (obligatorio, selector de categorías de producto),
   - botón "Guardar producto".
3. El vendedor completa los datos.
4. Pulsa "Guardar producto".
5. El sistema valida:
   - nombre no vacío,
   - tipo de venta seleccionado,
   - precio > 0 (según el tipo),
   - categoría seleccionada.
6. Si todo es válido, el sistema:
   - crea el `producto` con `estado = 'activo'`,
   - calcula `tieneDomicilio` a partir de `usuario.aceptaDomicilio`,
   - muestra confirmación: "Producto publicado."
7. El producto aparece en el listado público si el vendedor está activo y el
   producto tiene categoría válida.

**Resultado:** el producto está publicado.

**Estados/errores:**
- Nombre vacío: "El nombre es obligatorio."
- Precio ≤ 0: "El precio debe ser mayor que 0."
- Categoría no seleccionada: "Selecciona una categoría."
- Imagen inválida: "La imagen no es válida. Usa JPG o PNG, máx. 5 MB."

---

## 7. Flujo: publicar un servicio

**Actor:** Vendedor de servicios (o ambos).

**Precondiciones:** el vendedor está logueado y en su panel.

**Pasos:**
1. El vendedor pulsa "Mis servicios" → "+ Añadir servicio".
2. Se abre un formulario con:
   - **Nombre** (obligatorio),
   - **Descripción** (opcional),
   - **Imagen** (opcional, URL externa),
   - **Precio** (obligatorio, entero en centavos, > 0),
   - **Categoría** (obligatorio, selector de categorías de servicio),
   - botón "Guardar servicio".
3. El vendedor completa los datos.
4. Pulsa "Guardar servicio".
5. El sistema valida:
   - nombre no vacío,
   - precio > 0,
   - categoría seleccionada.
6. Si todo es válido, el sistema:
   - crea el `servicio` con `estado = 'activo'`,
   - calcula `esDomicilio` a partir de la categoría,
   - muestra confirmación: "Servicio publicado."
7. El servicio aparece en el listado público si el vendedor está activo y el
   servicio tiene categoría válida.

**Resultado:** el servicio está publicado.

**Estados/errores:**
- Nombre vacío: "El nombre es obligatorio."
- Precio ≤ 0: "El precio debe ser mayor que 0."
- Categoría no seleccionada: "Selecciona una categoría."

---

## 8. Flujo: vendedor responde un mensaje

**Actor:** Vendedor.

**Precondiciones:** el vendedor tiene mensajes en su bandeja.

**Pasos:**
1. El vendedor entra a su panel → "Mensajes".
2. Ve la lista de mensajes recibidos con:
   - WhatsApp del comprador,
   - producto/servicio consultado,
   - `tipo` (`producto` o `servicio`),
   - texto del mensaje (si lo hay),
   - fecha.
3. Si vende ambos, puede filtrar por `tipo`.
4. Abre un mensaje.
5. El sistema marca el mensaje como `leido`.
6. El vendedor copia el WhatsApp del comprador o pulsa "Abrir en WhatsApp" (abre
   `https://wa.me/<numero>` en una nueva pestaña).
7. El vendedor responde por WhatsApp fuera del sitio.

**Resultado:** el vendedor respondió al comprador.

**Estados/errores:**
- Bandeja vacía: "No tienes mensajes nuevos."
- Mensaje eliminado por TTL: no aparece (se borró físicamente a los 5 días si no
  se leyó).

---

## 9. Flujo: vendedor administra sus productos/servicios

**Actor:** Vendedor.

**Precondiciones:** el vendedor está logueado.

**Pasos:**
1. El vendedor entra a "Mis productos" o "Mis servicios".
2. Ve una tabla con sus productos/servicios publicados.
3. Puede:
   - **Editar** un producto/servicio → abre el formulario con los datos
     precargados → guarda cambios.
   - **Eliminar** un producto/servicio → confirmación → soft delete.
   - **Ver métricas** de un producto (más consultados, más buscados).
4. Los cambios se reflejan en el sitio pública.

**Resultado:** el vendedor gestiona su catálogo.

**Estados/errores:**
- Producto/servicio no encontrado: "Ya no existe."
- Error al guardar: "No se pudo guardar. Inténtalo de nuevo."

---

## 10. Flujo: vendedor edita su perfil

**Actor:** Vendedor.

**Precondiciones:** el vendedor está logueado.

**Pasos:**
1. El vendedor entra a "Perfil".
2. Ve sus datos actuales:
   - nick,
   - **tipo de venta (no editable, no aparece en el formulario)**,
   - "si desea recibir domicilio" (checkbox, solo si no es prestador),
   - dirección (si aplica).
3. Puede editar:
   - nick,
   - "si desea recibir domicilio",
   - dirección.
4. Pulsa "Guardar cambios".
5. El sistema valida:
   - nick no vacío y único (si cambió),
   - si `aceptaDomicilio = true`, dirección obligatoria.
6. Si todo es válido, el sistema:
   - actualiza el usuario,
   - actualiza en cascada `tieneDomicilio` en todos sus productos.
7. Se muestra confirmación.

**Resultado:** el perfil está actualizado.

**Estados/errores:**
- Nick ya existe: "Ese nick ya está en uso."
- Dirección vacía con `aceptaDomicilio = true`: "La dirección es obligatoria si
  deseas recibir domicilio."

---

## 11. Flujo: vendedor elimina su cuenta

**Actor:** Vendedor.

**Precondiciones:** el vendedor está logueado.

**Pasos:**
1. El vendedor entra a "Perfil" → "Eliminar cuenta".
2. Se muestra una advertencia:
   - "Esta acción eliminará todos tus productos y servicios. No se puede
     deshacer."
   - campo de confirmación: "Escribe tu nick para confirmar".
3. El vendedor escribe su nick.
4. Pulsa "Eliminar cuenta definitivamente".
5. El sistema valida que el nick coincida.
6. Si coincide, el sistema:
   - marca el usuario como `eliminado`,
   - marca todos sus productos/servicios como `eliminado`,
   - cancela sus solicitudes de domicilio pendientes,
   - cierra la sesión,
   - redirige a la home.
7. La cuenta no se borra físicamente (soft delete) para preservar auditoría.

**Resultado:** la cuenta está eliminada.

**Estados/errores:**
- Nick no coincide: "El nick no coincide. Inténtalo de nuevo."

---

## 12. Flujo: prestador pausa la recepción de domicilios

**Actor:** Prestador.

**Precondiciones:** el prestador está logueado.

**Pasos:**
1. El prestador entra a su panel → "Mi disponibilidad".
2. Ve un switch "Disponible para recibir domicilios" (por defecto `true`).
3. Lo apaga.
4. El sistema actualiza `disponible = false`.
5. El prestador deja de aparecer en el selector de prestadores.
6. Sus solicitudes ya aceptadas siguen su curso.

**Resultado:** el prestador no recibe nuevas solicitudes hasta que reactive el
switch.

**Estados/errores:**
- Error al guardar: "No se pudo actualizar. Inténtalo de nuevo."

---

## 13. Flujo: admin suspende un vendedor

**Actor:** Administrador.

**Precondiciones:** el admin está logueado.

**Pasos:**
1. El admin entra al panel de admin → "Vendedores".
2. Busca al vendedor y abre su ficha.
3. Pulsa "Suspender cuenta".
4. Se muestra un modal con:
   - campo de motivo (obligatorio),
   - botón "Suspender".
5. El admin completa el motivo y confirma.
6. El sistema:
   - marca el usuario como `suspendido`,
   - oculta todos sus productos/servicios (`estado = 'oculto'`),
   - si es prestador, cancela sus solicitudes `pendiente` y `contactado` con
     `motivoCancelacion = 'prestador_suspendido'` y avisa al comprador por
     WhatsApp,
   - envía un mensaje interno automático al vendedor con el motivo,
   - registra la acción en auditoría.

**Resultado:** el vendedor está suspendido y sus productos ocultos.

**Estados/errores:**
- Motivo vacío: "Indica el motivo de la suspensión."

---

## 14. Flujo: admin reactiva un vendedor

**Actor:** Administrador.

**Precondiciones:** el vendedor está suspendido.

**Pasos:**
1. El admin entra a la ficha del vendedor suspendido.
2. Pulsa "Reactivar cuenta".
3. El sistema:
   - marca el usuario como `activo`,
   - muestra sus productos/servicios (`estado = 'activo'`),
   - si es prestador, **respeta `disponible`** como estaba antes de la
     suspensión,
   - envía un mensaje interno automático al vendedor informando la reactivación,
   - registra la acción en auditoría.

**Resultado:** el vendedor está activo de nuevo.

---

## 15. Flujo: admin elimina un producto prohibido

**Actor:** Administrador.

**Precondiciones:** el admin está logueado.

**Pasos:**
1. El admin entra al panel de admin → "Productos".
2. Busca el producto.
3. Pulsa "Eliminar producto".
4. Se muestra un modal con:
   - campo de motivo (obligatorio),
   - botón "Eliminar".
5. El admin completa el motivo y confirma.
6. El sistema:
   - marca el producto como `eliminado`,
   - envía un mensaje interno automático al vendedor con el motivo,
   - registra la acción en auditoría.

**Resultado:** el producto está eliminado.

**Estados/errores:**
- Motivo vacío: "Indica el motivo de la eliminación."

---

## 16. Flujo: admin crea una categoría

**Actor:** Administrador.

**Precondiciones:** el admin está logueado.

**Pasos:**
1. El admin entra a "Categorías" → "+ Nueva categoría".
2. Se abre un formulario con:
   - **Tipo**: producto / servicio (obligatorio),
   - **Nombre** (obligatorio, único dentro del tipo),
   - **Icono** (obligatorio, un solo emoji, máx. 2 caracteres),
   - **Orden** (opcional, entero, por defecto al final),
   - botón "Guardar".
3. El admin completa los datos.
4. Pulsa "Guardar".
5. El sistema valida:
   - nombre no vacío y único dentro del tipo,
   - icono no vacío y de longitud máxima 2,
   - orden entero.
6. Si todo es válido, el sistema crea la categoría.
7. La categoría aparece disponible para vendedores al publicar.

**Resultado:** la categoría está creada.

**Estados/errores:**
- Nombre duplicado: "Ya existe una categoría con ese nombre en este tipo."
- Icono vacío: "Selecciona un icono."
- Icono muy largo: "El icono debe ser un solo emoji."

---

## 17. Flujo: admin elimina una categoría

**Actor:** Administrador.

**Precondiciones:** el admin está logueado.

**Pasos:**
1. El admin entra a "Categorías".
2. Pulsa "Eliminar" en una categoría que **no** sea "Sin categoría".
3. Si la categoría tiene productos/servicios asignados:
   - se muestra advertencia: "Esta categoría tiene N productos/servicios. Se
     reasignarán automáticamente a 'Sin categoría'."
   - el admin confirma.
4. El sistema:
   - reasigna los productos/servicios a "Sin categoría" del mismo tipo,
   - elimina la categoría,
   - avisa al admin cuántos productos/servicios se movieron.
5. Los productos/servicios en "Sin categoría" no se muestran en el listado
   público hasta que el admin los reubique.

**Resultado:** la categoría está eliminada y sus productos/servicios reasignados.

**Estados/errores:**
- Intentar eliminar "Sin categoría": "Esta categoría no se puede eliminar."

---

## 18. Flujo: admin reasigna un producto a otra categoría

**Actor:** Administrador.

**Precondiciones:** el admin está logueado.

**Pasos:**
1. El admin entra a "Productos" → abre un producto.
2. Pulsa "Cambiar categoría".
3. Selecciona la nueva categoría.
4. Confirma.
5. El sistema actualiza `categoriaId` del producto.
6. El producto aparece en la nueva categoría en el sitio público.

**Resultado:** el producto está reasignado.

---

## 19. Flujo: admin envía un mensaje interno

**Actor:** Administrador.

**Precondiciones:** el admin está logueado.

**Pasos:**
1. El admin entra a "Mensajes internos" → "+ Nuevo mensaje".
2. Elige destinatarios:
   - un vendedor concreto,
   - todos los vendedores,
   - todos los prestadores,
   - un grupo filtrado por tipo.
3. Escribe el mensaje.
4. Pulsa "Enviar".
5. El sistema:
   - crea uno o varios `mensajesAdmin` según los destinatarios,
   - muestra confirmación: "Mensaje enviado a N destinatarios."
6. Los vendedores ven el mensaje en su bandeja de "Mensajes internos" y **solo
   pueden responder** (no iniciar).

**Resultado:** el mensaje interno está enviado.

**Estados/errores:**
- Mensaje vacío: "Escribe un mensaje."
- Sin destinatarios: "Selecciona al menos un destinatario."

---

## 20. Flujo: admin consulta un dato privado (auditoría)

**Actor:** Administrador.

**Precondiciones:** el admin está logueado.

**Pasos:**
1. El admin entra a la ficha de un vendedor.
2. Pulsa "Ver WhatsApp" o "Ver dirección".
3. Se muestra un modal con el dato.
4. El sistema registra en `auditoria`:
   - `adminId`,
   - `vendedorId`,
   - `datoConsultado` (`whatsapp` o `direccion`),
   - `createdAt`.
5. El admin puede consultar la pestaña "Auditoría" para ver el historial.

**Resultado:** el dato está consultado y auditado.

---

## 21. Flujo: comprador reporta un producto/vendedor

**Actor:** Visitante o comprador.

**Precondiciones:** el visitante está viendo una ficha o un vendedor.

**Pasos:**
1. El visitante pulsa "Reportar".
2. Se abre un modal con:
   - **Motivo** (obligatorio, selector: contenido inapropiado, precio engañoso,
     producto prohibido, otro),
   - **Comentario** (opcional),
   - **Tu WhatsApp** (opcional),
   - botón "Enviar reporte".
3. El visitante completa los datos.
4. Pulsa "Enviar reporte".
5. El sistema valida:
   - motivo seleccionado.
6. Si todo es válido, el sistema:
   - crea el `reporte` con `estado = 'pendiente'`,
   - muestra confirmación: "Reporte enviado. Gracias por ayudarnos."
7. El admin ve el reporte en su panel → "Reportes". El admin **puede ver el
   WhatsApp del reportante si lo dejó**, pero **no puede contactarlo desde el
   panel**. Solo para auditoría.
8. El admin puede:
   - **desestimar** el reporte (`estado = 'desestimado'`),
   - **actuar** (suspender, eliminar producto, etc.) y marcar el reporte como
     `actuado`.

**Resultado:** el reporte está registrado y el admin decide.

**Estados/errores:**
- Motivo no seleccionado: "Selecciona un motivo."

---

## 22. Flujo: mensaje no leído se borra a los 5 días

**Actor:** Sistema (automático).

**Precondiciones:** un mensaje creado hace más de 5 días y no leído.

**Pasos:**
1. MongoDB TTL index revisa los mensajes.
2. Si un mensaje tiene `leido = false` y `createdAt` > 5 días:
   - se **borra físicamente** de la base de datos.
3. El vendedor ya no lo ve en su bandeja.

**Resultado:** los mensajes no leídos no saturan la bandeja.

---

## 23. Flujo: WhatsApp del comprador se anonimiza a los 30 días

**Actor:** Sistema (job programado).

**Precondiciones:** un mensaje leído creado hace más de 30 días.

**Pasos:**
1. Un job programado revisa los mensajes leídos.
2. Si un mensaje tiene `leido = true` y `createdAt` > 30 días:
   - se anonimiza `whatsappComprador` (se reemplaza por un hash o se borra),
   - se marca `anonimizadoEn` con la fecha actual.
3. El vendedor ya no puede ver el WhatsApp original.

**Resultado:** los datos personales no se conservan más allá de lo necesario.

---

## 24. Decisiones resueltas

- ~~¿El registro se hace en un solo paso o en varios?~~ → **Resuelto:** 2 pasos
  (OAuth simulado → datos de negocio).
- ~~¿El vendedor puede cancelar el registro a mitad de camino?~~ → **Resuelto:**
  sí, no se crea nada.
- ~~¿El comprador debe marcar el checkbox anti-bots cada vez que envía un
  mensaje?~~ → **Resuelto:** solo al iniciar sesión/registrarse.
- ~~¿El comprador puede enviar varios mensajes al mismo vendedor?~~ →
  **Resuelto:** sí, sujeto al límite de 20/día.
- ~~¿El comprador puede cancelar una solicitud de domicilio?~~ → **Resuelto:**
  sí, por WhatsApp con el prestador, no desde la página.
- ~~¿El prestador puede rechazar una solicitud?~~ → **Resuelto:** no
  explícitamente; si no la atiende, queda `pendiente`.
- ~~¿El comprador debe dejar su WhatsApp al reportar?~~ → **Resuelto:** no, puede
  reportar anónimo. El admin puede ver el WhatsApp si lo dejó, pero no
  contactarlo desde el panel.
- ~~¿El vendedor suspendido recibe un mensaje interno?~~ → **Resuelto:** sí,
  mensaje interno automático con el motivo.
- ~~¿El tipo de venta aparece en el formulario de edición de perfil?~~ →
  **Resuelto:** no aparece, es fijo.
- ~~¿Eliminar una categoría bloquea o reasigna?~~ → **Resuelto:** reasigna
  automáticamente a "Sin categoría", no bloquea.
- ~~¿Los mensajes no leídos se borran físicamente o con soft delete?~~ →
  **Resuelto:** se borran físicamente a los 5 días con TTL index. Los leídos se
  anonimizan a los 30 días con job programado.
- ~~¿El vendedor puede iniciar mensajes internos al admin?~~ → **Resuelto:** no,
  solo responder.
- ~~¿El admin puede contactar al reportante?~~ → **Resuelto:** no, solo ver el
  WhatsApp para auditoría.
- ~~¿Al reactivar a un prestador, `disponible` vuelve a `true`?~~ → **Resuelto:**
  no, se respeta como estaba antes de la suspensión.
