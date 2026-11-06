# 08 — Seeds iniciales: Moa Tradecenter

> Datos de ejemplo reproducibles para desarrollo, demos y pruebas. Estos datos
> NO deben usarse en producción. Deben cargarse con un script de seed
> idempotente que pueda ejecutarse varias veces sin duplicar.

---

## 1. Convenciones de las seeds

- Se cargan con un script `npm run seed` en `backend/`.
- Son **idempotentes**: si ya existen, no se duplican.
- Se marcan con un campo `seed: true` en cada documento para poder eliminarlos
  fácilmente.
- Las imágenes son URLs de placeholder (ej. `https://placehold.co/400x400`).
- Los precios están en **centavos** (ej. `1200` = $12.00 CUP).
- Los WhatsApps son ficticios pero con formato cubano válido.
- Los `_id` son ObjectId generados por MongoDB; el script busca por `nick` o
  por `tipo + nombre` antes de crear.

---

## 2. Categorías de productos

Se crean las siguientes categorías de producto (`esSinCategoria: false`):

| Nombre | Icono | Orden |
|---|---|---|
| Alimentos | 🍎 | 1 |
| Ropa y Calzado | 👕 | 2 |
| Joyería | 💍 | 3 |
| Vehículos | 🚗 | 4 |
| Viviendas | 🏠 | 5 |
| Ferretería | 🔧 | 6 |
| Electrodomésticos | 📺 | 7 |
| Perfumería | 💄 | 8 |
| Aseo | 🧴 | 9 |
| Muebles | 🛋️ | 10 |
| Materiales | 🧱 | 11 |
| Sin categoría | ❓ | 99 |

---

## 3. Categorías de servicios

| Nombre | Icono | Orden |
|---|---|---|
| Paladares | 🍽️ | 1 |
| Cafeterías | ☕ | 2 |
| Manicuristas | 💅 | 3 |
| Peluqueras | 💇 | 4 |
| Relojeros | ⌚ | 5 |
| Barberías | ✂️ | 6 |
| Transporte Interno | 🚌 | 7 |
| Transporte Prov/Nac | 🚐 | 8 |
| Domicilio | 🛵 | 9 |
| Téc. Refrigeración | ❄️ | 10 |
| Téc. Lavadoras | 🧺 | 11 |
| Téc. Celulares | 📱 | 12 |
| Reparador Colchones | 🛏️ | 13 |
| Sin categoría | ❓ | 99 |

---

## 4. Vendedores de productos

### 4.1 Perfumería La Estrella

```json
{
  "seed": true,
  "nick": "perfumeria_estrella",
  "email": "estrella@moa.cu",
  "oauthProvider": "google",
  "oauthId": "seed-google-estrella",
  "rol": "vendedor",
  "esPrestador": false,
  "tipoVenta": "productos",
  "aceptaDomicilio": true,
  "direccion": "Calle Martí #45, Reparto Centro, Moa",
  "whatsappEsPublico": false,
  "estado": "activo"
}
```

Productos:
- **Perfume Floral 50ml** — Fragancia floral intensa, 50 ml. Colores: rosa,
  lila. — $12.00 — Minorista — Perfumería — `tieneDomicilio: true`.
- **Crema corporal hidratante** — Crema 200 ml, aroma vainilla. — $8.50 —
  Minorista — Perfumería — `tieneDomicilio: true`.
- **Set de maquillaje** — Incluye sombras, labial y rubor. — $25.00 —
  Minorista — Perfumería — `tieneDomicilio: true`.

### 4.2 Ferretería Central Moa

```json
{
  "seed": true,
  "nick": "ferreteria_central",
  "email": "central@moa.cu",
  "oauthProvider": "facebook",
  "oauthId": "seed-facebook-central",
  "rol": "vendedor",
  "esPrestador": false,
  "tipoVenta": "productos",
  "aceptaDomicilio": false,
  "direccion": null,
  "whatsappEsPublico": false,
  "estado": "activo"
}
```

Productos:
- **Martillo profesional** — Mango de fibra, cabeza de acero. — $15.00 —
  Minorista — Ferretería — `tieneDomicilio: false`.
- **Cemento gris 50kg** — Saco de 50 kg, uso general. — $9.00 — Mayorista
  (`precioMayorista: 8500`) — Materiales — `tieneDomicilio: false`.
- **Juego de destornilladores** — Set de 6 piezas, varias medidas. — $18.00 —
  Minorista — Ferretería — `tieneDomicilio: false`.

### 4.3 Bodega El Progreso

```json
{
  "seed": true,
  "nick": "bodega_progreso",
  "email": "progreso@moa.cu",
  "oauthProvider": "google",
  "oauthId": "seed-google-progreso",
  "rol": "vendedor",
  "esPrestador": false,
  "tipoVenta": "productos",
  "aceptaDomicilio": true,
  "direccion": "Ave. 1ro de Mayo #120, Moa",
  "whatsappEsPublico": false,
  "estado": "activo"
}
```

Productos:
- **Arroz grano largo 1kg** — Bolsa de 1 kg, calidad premium. — $2.50 —
  Minorista — Alimentos — `tieneDomicilio: true`.
- **Aceite vegetal 1L** — Botella de 1 litro. — $4.00 — Minorista — Alimentos
  — `tieneDomicilio: true`.
- **Lote de arroz x10** — 10 bolsas de 1 kg para revendedores. — $22.00 —
  Mayorista (`precioMayorista: 2200`) — Alimentos — `tieneDomicilio: true`.

---

## 5. Vendedores de servicios

### 5.1 Barbería El Cubano

```json
{
  "seed": true,
  "nick": "barberia_elcubano",
  "email": "barbero@moa.cu",
  "oauthProvider": "facebook",
  "oauthId": "seed-facebook-barbero",
  "rol": "vendedor",
  "esPrestador": false,
  "tipoVenta": "servicios",
  "aceptaDomicilio": false,
  "direccion": null,
  "whatsappEsPublico": false,
  "estado": "activo"
}
```

Servicios:
- **Corte de cabello** — Corte clásico o moderno. Incluye lavado. — $3.00 —
  Barberías.
- **Afeitado con navaja** — Afeitado tradicional con toalla caliente. — $2.50 —
  Barberías.

### 5.2 Domicilios Rápidos Moa

```json
{
  "seed": true,
  "nick": "domicilios_rapidos",
  "email": "domicilios@moa.cu",
  "oauthProvider": "google",
  "oauthId": "seed-google-domicilios",
  "rol": "vendedor",
  "esPrestador": true,
  "tipoVenta": "servicios",
  "whatsapp": "+5355553333",
  "whatsappEsPublico": true,
  "tarifaDomicilio": 200,
  "disponible": true,
  "estado": "activo"
}
```

Servicios:
- **Domicilio dentro de Moa** — Entrega de productos en el municipio. 30–45 min.
  — $2.00 — Domicilio (`esDomicilio: true`).
- **Domicilio express** — Entrega prioritaria en menos de 30 min. — $3.50 —
  Domicilio (`esDomicilio: true`).

### 5.3 Técnico Refrigeración Frank

```json
{
  "seed": true,
  "nick": "tecnico_frank",
  "email": "frank@moa.cu",
  "oauthProvider": "facebook",
  "oauthId": "seed-facebook-frank",
  "rol": "vendedor",
  "esPrestador": false,
  "tipoVenta": "servicios",
  "aceptaDomicilio": false,
  "direccion": null,
  "whatsappEsPublico": false,
  "estado": "activo"
}
```

Servicios:
- **Reparación de refrigerador** — Diagnóstico y reparación a domicilio. —
  $15.00 — Téc. Refrigeración.
- **Mantenimiento de lavadora** — Limpieza y revisión general. — $12.00 —
  Téc. Lavadoras.

---

## 6. Administrador

```json
{
  "seed": true,
  "nick": "admin",
  "email": "admin@moatradecenter.cu",
  "oauthProvider": "google",
  "oauthId": "seed-google-admin",
  "rol": "admin",
  "estado": "activo"
}
```

---

## 7. Categoría "Sin categoría"

Se crea automáticamente al inicializar el sistema, una por tipo:

```json
{
  "seed": false,
  "tipo": "producto",
  "nombre": "Sin categoría",
  "icono": "❓",
  "orden": 99,
  "esSinCategoria": true
}
```

```json
{
  "seed": false,
  "tipo": "servicio",
  "nombre": "Sin categoría",
  "icono": "❓",
  "orden": 99,
  "esSinCategoria": true
}
```

No se pueden editar ni eliminar.

---

## 8. Script de seed

El script de seed debe:

1. Conectar a MongoDB.
2. Crear las categorías "Sin categoría" si no existen.
3. Crear las categorías de producto y servicio si no existen (buscar por
   `tipo + nombre`).
4. Crear los usuarios de ejemplo si no existen (buscar por `nick`).
5. Crear los productos y servicios de ejemplo si no existen (buscar por
   `vendedorId + nombre`).
6. Imprimir un resumen: cuántos documentos se crearon y cuántos ya existían.
7. Desconectar de MongoDB.

Comando:
```bash
cd backend
npm run seed
```

Resultado esperado (primera ejecución):
```
✅ Categorías "Sin categoría": 2 creadas
✅ Categorías de producto: 11 creadas
✅ Categorías de servicio: 13 creadas
✅ Usuarios: 7 creados (6 vendedores + 1 admin)
✅ Productos: 9 creados
✅ Servicios: 6 creados
Total: 48 documentos creados
```

Resultado esperado (segunda ejecución):
```
✅ Categorías "Sin categoría": 2 ya existían
✅ Categorías de producto: 11 ya existían
✅ Categorías de servicio: 13 ya existían
✅ Usuarios: 7 ya existían
✅ Productos: 9 ya existían
✅ Servicios: 6 ya existían
Total: 0 documentos creados, 48 ya existían
```

---

## 9. Limpieza de seeds

Para eliminar todos los datos de ejemplo:

```bash
cd backend
npm run seed:clean
```

El script elimina todos los documentos con `seed: true` en `usuarios`,
`productos` y `servicios`. **No elimina** las categorías "Sin categoría" ni las
categorías de producto/servicio (esas son parte del sistema, no del seed).

---

## 10. Datos que NO se incluyen en las seeds

Para mantener las seeds pequeñas y enfocadas en el catálogo, **no se incluyen**:

- Mensajes de ejemplo.
- Solicitudes de domicilio de ejemplo.
- Reportes de ejemplo.
- Auditoría de ejemplo.
- Visitas de ejemplo.

Estos datos se generan durante las pruebas manuales o con scripts específicos
cuando se necesiten.
