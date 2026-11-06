# 03 — Reglas de negocio: Moa Tradecenter

> Reglas obligatorias del negocio. Cline NO debe inventar reglas no documentadas
> aquí. Si algo no está cubierto, debe preguntar antes de asumir. Este documento
> tiene prioridad sobre cualquier suposición del código.

---

## 1. Reglas generales

1. Moa Tradecenter es un **directorio**, no una tienda. No hay carrito, ni pagos,
   ni checkout.
2. Todo el contacto comercial ocurre **fuera del sitio**, por WhatsApp, una vez
   que el comprador deja su número.
3. La navegación es **libre y pública**. Solo se exige identificación (WhatsApp)
   para enviar mensaje o solicitar domicilio.
4. El **único WhatsApp público** del sitio es el del prestador de domicilio.
   Todos los demás WhatsApp son privados.
5. La **dirección del vendedor** nunca es pública. Solo se comparte con el
   prestador de domicilio cuando el comprador solicita domicilio.
6. El sistema **no aloja chat**. La página solo envía el mensaje inicial y
   muestra el WhatsApp del comprador al vendedor para que continúe la
   conversación fuera del sitio.
7. Toda regla de privacidad de este documento es **crítica** y no puede
   relajarse sin autorización explícita.
8. La zona horaria de almacenamiento es **UTC**. La UI muestra **UTC-5 fijo**
   (Cuba, sin DST en el MVP).

---

## 2. Reglas de productos

1. Todo producto pertenece a **una sola categoría** de producto. Solo el admin
   puede reasignarlo a otra categoría.
2. Todo producto pertenece a **un solo tipo de venta**: `minorista` o
   `mayorista`. No puede ser ambos a la vez en el MVP.
3. Si el producto es **minorista**:
   - el campo `precio` es obligatorio y debe ser **mayor que 0**,
   - no se muestra precio por cantidad.
4. Si el producto es **mayorista**:
   - el campo `precioMayorista` es obligatorio y debe ser **mayor que 0**,
   - no se muestra precio minorista.
5. La **imagen es opcional**. Se acepta una URL externa. Validación de tipo MIME
   y tamaño máximo 5 MB en el frontend. Storage propio en fase 2.
6. La **descripción** es opcional, pero se recomienda incluir talla, color,
   tamaño o medidas cuando aplique.
7. **No hay límite** de productos por vendedor en el MVP.
8. **`aceptaDomicilio` es el checkbox explícito.** Si es `true`, `direccion` es
   obligatoria. Si es `false`, `direccion` debe ser `null`.
9. **Tener dirección = aceptar domicilio.** Un producto solo muestra el botón
   "Domicilio" activo si su vendedor tiene `aceptaDomicilio: true` y dirección
   registrada.
10. Si el producto no tiene domicilio, el botón "Domicilio" debe estar presente
    pero **informar claramente** que ese producto no tiene domicilio, y ofrecer
    el botón "Mensaje" como alternativa.
11. Un producto **no puede publicarse** sin nombre, sin precio (> 0) y sin
    categoría.
12. Un producto **no puede tener `precio` y `precioMayorista` a la vez**. Solo
    uno según su `tipoVenta`.
13. **Precios siempre en centavos enteros.** No se admiten decimales más
    pequeños que 1 centavo.
14. Si el vendedor es suspendido, sus productos **se ocultan del sitio público**
    pero no se borran. Al reactivar la cuenta, vuelven a mostrarse.

---

## 3. Reglas de servicios

1. Todo servicio pertenece a **una sola categoría** de servicio. Solo el admin
   puede reasignarlo a otra categoría.
2. Los servicios **no tienen minorista/mayorista**.
3. Los servicios **tienen precio fijo obligatorio** en el MVP (mayor que 0).
4. La **imagen es opcional**. Se acepta una URL externa. Validación de tipo MIME
   y tamaño máximo 5 MB en el frontend.
5. La **descripción** es opcional.
6. **No hay límite** de servicios por vendedor en el MVP.
7. Los servicios **no tienen botón "Domicilio"**. Solo tienen botón "Mensaje".
8. Un servicio **no puede publicarse** sin nombre, sin precio (> 0) y sin
   categoría.
9. Si el vendedor es suspendido, sus servicios **se ocultan del sitio público**
   pero no se borran. Al reactivar la cuenta, vuelven a mostrarse.
10. Si el servicio pertenece a la categoría **"Domicilio"**, el vendedor asociado
    **debe** tener `esPrestador: true`, `whatsapp`, `whatsappEsPublico: true` y
    `tarifaDomicilio`.

---

## 4. Reglas de domicilio

1. Solo los vendedores de servicios con categoría **"Domicilio"** y
   `esPrestador: true` pueden recibir solicitudes de domicilio.
2. Un prestador **debe registrarse** y proporcionar su WhatsApp para poder
   recibir solicitudes.
3. Un prestador **debe indicar su tarifa de cobro** por el servicio.
4. La tarifa del prestador es **fija por prestador** en el MVP. No varía según el
   producto.
5. Puede haber **varios prestadores** disponibles para un mismo producto. El
   comprador elige entre los que estén en estado `disponible = true`.
6. El flujo de solicitud de domicilio tiene exactamente **2 pasos**:
   1. Elegir prestador de la lista (con nombre, tarifa y WhatsApp).
   2. Confirmar. Al confirmar, el sistema **envía automáticamente un mensaje**
      al prestador con:
      - datos del producto (nombre, descripción, precio),
      - **dirección del vendedor del producto** (a dónde debe ir a recogerlo),
      - **número de WhatsApp del comprador** (para que el prestador lo contacte).
7. El prestador **contacta al comprador por WhatsApp** para confirmar la compra
   y la dirección de entrega. La dirección de entrega **no se pide en el sitio**.
8. Estados de una solicitud de domicilio:
   - `pendiente`: creada, el prestador aún no ha contactado al comprador.
   - `contactado`: el prestador ya contactó al comprador por WhatsApp.
   - `entregado`: el domicilio se completó.
   - `cancelado`: la solicitud se canceló (por el comprador, el prestador o el
     admin).
9. Un prestador puede **pausar la recepción de solicitudes** con el campo
   `disponible = false`. Cuando está pausado, no aparece en el selector, pero su
   cuenta sigue activa y puede seguir atendiendo solicitudes ya aceptadas.
10. Si el admin **suspende** a un prestador:
    - sus solicitudes en estado `pendiente` o `contactado` **se cancelan**,
    - el sistema **avisa al comprador por WhatsApp** de que debe elegir otro
      prestador,
    - el prestador deja de aparecer en el selector aunque su campo `disponible`
      estuviera en `true`.
11. Al **reactivar** a un prestador, `disponible` **se respeta** como estaba
    antes de la suspensión.
12. **El snapshot prevalece.** La solicitud guarda `snapshotProducto`,
    `snapshotDireccionVendedor` y `tarifa` en el momento de la creación. Si el
    producto o el vendedor se eliminan, la solicitud conserva el snapshot
    congelado.
13. **La dirección del vendedor del producto solo se comparte con el prestador
    elegido** en el contexto de una solicitud concreta.
14. El comprador **no ve el WhatsApp del vendedor del producto**. Solo ve el
    WhatsApp del prestador de domicilio.

---

## 5. Reglas de mensajería

1. El comprador **debe proporcionar su WhatsApp** para enviar un mensaje a un
   vendedor.
2. El mensaje es de **uso único**: la conversación continúa por WhatsApp fuera
   del sitio.
3. El WhatsApp del comprador **solo lo ve el vendedor destinatario** del mensaje.
4. El vendedor **no puede responder desde la página**. Solo puede responder por
   WhatsApp al número que dejó el comprador.
5. **Límite de mensajes por comprador/día:** máximo **20 mensajes por WhatsApp
   por día** para evitar spam. El límite es configurable. **Cambiar de WhatsApp
   resetea el contador** (aceptado en MVP).
6. Si el comprador supera el límite, el sistema le informa que debe esperar al
   día siguiente.
7. El WhatsApp del comprador **no se almacena más allá de lo necesario**. Una
   vez enviado el mensaje, el vendedor lo ve en su bandeja y el sistema no lo
   expone en ningún otro lugar.
8. El vendedor con tipo **"ambos"** tiene **una sola bandeja** de mensajes, con
   filtro por `tipo` (`producto`/`servicio`). El campo `tipo` se deriva al crear
   el mensaje.
9. Los mensajes **no leídos** se **borran físicamente** a los **5 días** con TTL
   index de MongoDB.
10. Los mensajes **leídos** conservan su contenido, pero el WhatsApp del
    comprador se **anonimiza a los 30 días** con un job programado (no TTL).

---

## 6. Reglas de registro de vendedor

1. Para registrarse, el usuario debe aportar:
   - **Nick** (obligatorio, **único** en el sistema),
   - **Dirección** — solo si marca "Si desea recibir domicilio". En ese caso, la
     dirección pasa a ser **obligatoria**.
   - **Tipo de venta**: productos, servicios o ambos (obligatorio).
   - Si el tipo de venta es **servicios** y la categoría principal es
     **"Domicilio"**, el sistema marca automáticamente `esPrestador: true` y
     exige **WhatsApp** y **tarifa**.
2. El tipo de venta **queda fijo** al registrarse y **no se puede cambiar**
   después. **No aparece** en el formulario de edición de perfil.
3. El registro se hace con OAuth simulado (Google/Facebook) + checkbox
   "No soy un robot" **obligatorio** y **simulado** en MVP.
4. **No existe contraseña**, por lo tanto **no existe "cambiar contraseña"**.
5. El vendedor **puede editar** después: nick, dirección, "si desea recibir
   domicilio". No puede editar el tipo de venta.
6. El cambio de nick **se permite** si el nuevo nick no existe. Error si ya
   existe.
7. **Un prestador no puede marcar "Si desea recibir domicilio".** Su dirección
   no se guarda. Su WhatsApp es público y su tarifa es obligatoria.
8. **El vendedor puede eliminar su propia cuenta**. Al hacerlo:
   - se eliminan **todos sus productos y servicios**,
   - se eliminan sus mensajes recibidos,
   - sus solicitudes de domicilio pendientes se cancelan,
   - la cuenta queda marcada como `eliminada` (no se borra físicamente del todo,
     para mantener integridad referencial e histórico de auditoría).
9. El registro crea el vendedor en estado `activo` en MVP (no hay moderación
   previa; el admin puede suspender después).

---

## 7. Reglas de categorías

1. Las categorías existen **para productos y para servicios** por separado.
2. **Solo el admin** puede crear, editar o eliminar categorías.
3. Cada categoría tiene **nombre e icono**. El nombre es único dentro de su tipo.
4. El **icono es un solo emoji** validado con longitud máxima de 2 caracteres.
5. El campo `orden` es un **entero libre**, orden ascendente. Si hay empate, se
   ordena por `nombre`.
6. Existe **una** categoría "Sin categoría" por tipo, creada por defecto, **no
   editable ni eliminable**.
7. Al eliminar una categoría, sus productos/servicios se **reasignan
   automáticamente** a "Sin categoría" del mismo tipo. **No se bloquea la
   eliminación.** Se avisa al admin cuántos productos/servicios se movieron.
8. Los productos/servicios en "Sin categoría" **no se muestran en el listado
   público** hasta que el admin los reubique.
9. El admin puede **reasignar** un producto o servicio a otra categoría en
   cualquier momento.

---

## 8. Reglas de mensajes internos del admin

1. El admin puede enviar **mensajes internos** a vendedores y prestadores.
2. Los destinatarios posibles son:
   - **un vendedor concreto**,
   - **todos los vendedores**,
   - **todos los prestadores de domicilio**,
   - **un grupo filtrado por tipo** (productos, servicios, ambos).
3. Los mensajes internos del admin **no son públicos**. Solo los ve el
   destinatario en su panel.
4. Los mensajes internos del admin **no usan WhatsApp**. Se muestran en la
   bandeja del vendedor dentro del panel.
5. El vendedor **solo puede responder** al admin desde su panel (mensajería
   interna bidireccional admin ↔ vendedor, pero **el vendedor no puede
   iniciar**). Esto es independiente de la mensajería comprador ↔ vendedor.

---

## 9. Reglas de reportes

1. Cualquier visitante o comprador puede **reportar** un producto, servicio o
   vendedor sin necesidad de cuenta.
2. El reporte llega al panel del admin con:
   - motivo (categorías predefinidas: contenido inapropiado, precio engañoso,
     producto prohibido, otro),
   - comentario libre opcional,
   - producto/servicio/vendedor reportado,
   - WhatsApp del reportante (opcional).
3. El admin puede **desestimar** o **actuar** sobre el reporte (suspender,
   eliminar producto, etc.).
4. El reporte **no es anónimo para el admin** si el comprador dejó su WhatsApp al
   reportar, pero el admin **no expone** ese WhatsApp a terceros y **no puede
   contactar al reportante desde el panel**. Solo para auditoría.
5. No hay límite de reportes por usuario en el MVP, pero el admin puede ignorar
   reportes duplicados.

---

## 10. Reglas de privacidad (críticas)

1. **El WhatsApp del comprador NUNCA es visible públicamente.** Solo lo ve el
   vendedor destinatario del mensaje (o el prestador, en el caso del domicilio).
2. **El WhatsApp del vendedor de productos o servicios no-domicilio NUNCA se
   expone en el sitio.** Solo el WhatsApp del prestador de domicilio es público.
3. **El WhatsApp del prestador es público por diseño.** Se expone solo si
   `whatsappEsPublico === true`. El backend nunca devuelve WhatsApp de otros
   usuarios en endpoints públicos.
4. **La dirección del vendedor NUNCA es visible por defecto.** Solo se comparte
   con el prestador de domicilio cuando el comprador solicita domicilio.
5. **La dirección es opcional** para el vendedor de productos. Si no la aporta,
   se entiende que no acepta domicilio y el botón "Domicilio" debe informarlo
   claramente.
6. **`aceptaDomicilio` es el checkbox explícito.** Si es `true`, `direccion` es
   obligatoria. Si es `false`, `direccion` debe ser `null`.
7. **Un prestador no acepta domicilio (lo ofrece).** No tiene
   `aceptaDomicilio` ni `direccion`. Tiene `esPrestador: true`, `whatsapp`
   (público), `tarifaDomicilio` y `disponible`.
8. Ningún endpoint público debe devolver WhatsApp ni direcciones en crudo, salvo
   el WhatsApp del prestador de domicilio (que sí es público por diseño).
9. Cada acceso del admin a un dato privado **queda auditado** (quién, qué dato,
   a qué vendedor, cuándo) y es visible en la pestaña "Auditoría".

---

## 11. Reglas de suspensión y eliminación

1. El admin puede **suspender** una cuenta de vendedor o prestador.
2. Al suspender:
   - sus productos/servicios **se ocultan** del sitio público,
   - no puede acceder a su panel,
   - si es prestador, sus solicitudes `pendiente` y `contactado` se cancelan y
     el comprador es avisado por WhatsApp.
3. El admin puede **reactivar** una cuenta suspendida:
   - sus productos/servicios vuelven a mostrarse automáticamente,
   - puede acceder de nuevo a su panel,
   - si es prestador, `disponible` **se respeta** como estaba antes de la
     suspensión.
4. El vendedor puede **eliminar su propia cuenta**:
   - se eliminan todos sus productos y servicios,
   - se eliminan sus mensajes recibidos,
   - sus solicitudes pendientes se cancelan,
   - la cuenta queda marcada como `eliminada` pero no se borra físicamente.
5. El admin puede **eliminar productos prohibidos** sin eliminar la cuenta del
   vendedor.

---

## 12. Reglas de precios y moneda

1. La moneda del MVP es **CUP** (peso cubano).
2. Los precios se almacenan como **enteros en centavos** para evitar errores de
   coma flotante. **No se admiten decimales más pequeños que 1 centavo.**
3. Los precios **deben ser mayores que 0**. No se admiten precios negativos ni 0.
4. Los precios se muestran en formato `$XX.XX CUP` en la UI.
5. No hay descuentos, cupones ni promociones en el MVP.

---

## 13. Reglas de filtros y búsqueda

1. El comprador filtra primero por **producto o servicio**.
2. Dentro de esa elección puede aplicar **filtros secundarios**:
   - precio (rango),
   - tipo de producto (mayorista o minorista),
   - más recientes,
   - más buscados.
3. El **buscador** funciona dentro de la elección actual (producto o servicio).
4. Los productos/servicios en estado **"Sin categoría"** no aparecen en el
   listado público hasta que el admin los reubique.
5. Los productos/servicios de vendedores **suspendidos** no aparecen en el
   listado público.

---

## 14. Reglas de auditoría

1. Cada vez que el admin accede al WhatsApp o dirección de un vendedor en su
   ficha individual, se registra:
   - **quién** (admin),
   - **qué dato** consultó (WhatsApp o dirección),
   - **a qué vendedor** afecta,
   - **cuándo** (fecha y hora).
2. La auditoría es **visible en UI** como pestaña "Auditoría" del panel de admin.
3. La auditoría **no se puede editar ni eliminar** desde la UI.
4. La auditoría se guarda también en base de datos como log técnico.

---

## 15. Reglas de límites y cuotas

1. **Mensajes por comprador/día:** máximo 20 (configurable), contados por
   **número de WhatsApp del comprador**. Cambiar de WhatsApp resetea el contador
   (aceptado en MVP).
2. **Productos por vendedor:** sin límite en el MVP.
3. **Servicios por vendedor:** sin límite en el MVP.
4. **Reportes por usuario:** sin límite en el MVP, pero el admin puede ignorar
   duplicados.
5. **Solicitudes de domicilio por comprador/día:** sin límite explícito en el
   MVP, pero sujeto al límite general de mensajes (20/día), ya que cada
   solicitud de domicilio genera un mensaje al prestador.

---

## 16. Reglas de integridad

1. Un producto **no puede existir sin vendedor**.
2. Un servicio **no puede existir sin vendedor**.
3. Un mensaje **no puede existir sin comprador (WhatsApp) y sin destinatario**.
4. Una solicitud de domicilio **no puede existir sin producto, sin vendedor del
   producto, sin prestador y sin comprador (WhatsApp)**. El snapshot prevalece
   sobre las referencias si alguna se elimina.
5. Un vendedor **no puede eliminarse físicamente** de la base de datos si tiene
   auditoría asociada. Se marca como `eliminado`.
6. Un producto/servicio de un vendedor eliminado **se elimina también**.
7. Las categorías **no pueden eliminarse** si son "Sin categoría". El resto se
   puede eliminar y sus productos/servicios se reasignan automáticamente a
   "Sin categoría".

---

## 17. Decisiones resueltas

- ~~¿Un producto puede estar en más de una categoría?~~ → **Resuelto:** solo una,
  salvo que el admin lo reasigne.
- ~~¿Hay límite de productos por vendedor?~~ → **Resuelto:** sin límite en MVP.
- ~~¿El precio puede ser 0?~~ → **Resuelto:** debe ser mayor que 0.
- ~~¿Un servicio tiene precio fijo o "a convenir"?~~ → **Resuelto:** precio fijo
  obligatorio en MVP.
- ~~¿La tarifa del prestador es fija o varía por producto?~~ → **Resuelto:** fija
  por prestador en MVP.
- ~~¿Puede haber varios prestadores para un mismo producto?~~ → **Resuelto:** sí,
  el comprador elige entre los disponibles.
- ~~¿Hay límite de mensajes por comprador/día?~~ → **Resuelto:** sí, 20/día
  configurable, contados por WhatsApp.
- ~~¿El vendedor puede responder desde la página?~~ → **Resuelto:** no, solo por
  WhatsApp.
- ~~¿El nick debe ser único?~~ → **Resuelto:** sí.
- ~~¿El vendedor puede eliminar su cuenta?~~ → **Resuelto:** sí, con todos sus
  productos.
- ~~¿El admin puede crear/eliminar categorías?~~ → **Resuelto:** sí. Al eliminar,
  los productos/servicios pasan a "Sin categoría" automáticamente (no se
  bloquea).
- ~~¿El admin puede enviar mensajes internos a quién?~~ → **Resuelto:** a un
  vendedor, a todos, o a un grupo filtrado por tipo.
- ~~¿El comprador puede reportar?~~ → **Resuelto:** sí, sin cuenta, con motivo y
  comentario opcional.
- ~~¿El admin puede contactar al reportante?~~ → **Resuelto:** no, solo ver el
  WhatsApp para auditoría.
- ~~¿El vendedor puede iniciar mensajes internos al admin?~~ → **Resuelto:** no,
  solo responder.
- ~~¿Los mensajes no leídos se borran físicamente o con soft delete?~~ →
  **Resuelto:** se borran físicamente a los 5 días con TTL index. Los leídos se
  anonimizan a los 30 días con job programado.
- ~~¿El snapshot de la solicitud prevalece sobre las referencias?~~ →
  **Resuelto:** sí, prevalece.
- ~~¿Qué zona horaria se usa?~~ → **Resuelto:** UTC en almacenamiento, UTC-5
  fijo en UI.
- ~~¿Los precios admiten decimales menores a 1 centavo?~~ → **Resuelto:** no,
  siempre enteros en centavos.