# 09 — Design System: Moa Tradecenter

> Define la identidad visual, los componentes base y las reglas de UI. Es la
> referencia para que el frontend sea consistente en todas las pantallas.
> Cualquier componente nuevo debe seguir estas reglas.
>
> **Concepto:** "Tierra Roja, Metal y Mar". Inspirado en la identidad geológica
> e industrial del municipio de Moa: la tierra laterítica rica en hierro, las
> fábricas de níquel, la vegetación que resiste y el mar Caribe.

---

## 1. Paleta de colores

La paleta abandona los colores genéricos de marketplace y se sumerge en el
paisaje de Moa. Los colores primarios evocan la tierra y la industria; los
secundarios, la naturaleza y el mar.

| Rol | Nombre | Hex | Uso e inspiración |
|---|---|---|---|
| Primario | Rojo Laterita | `#A63A2B` | Botones principales, enlaces, acentos de marca. Color de la tierra de Moa. |
| Primario oscuro | Rojo Profundo | `#7A2A1F` | Hover de botones primarios, textos sobre fondos claros. |
| Secundario | Verde Níquel | `#4A7C59` | Botones de acción secundaria, badges de éxito. Vegetación que rodea las minas. |
| Secundario oscuro | Verde Bosque | `#355A40` | Hover de botones secundarios. |
| Acento | Azul Caribe | `#2E6B8A` | Enlaces secundarios, acentos. El mar de la costa norte. |
| Fondo general | Arena Mineral | `#F5F0E8` | Fondo de la página. Un blanco cálido, como el polvo de las minas secas. |
| Superficie | Blanco Puro | `#FFFFFF` | Tarjetas, modales, inputs. |
| Texto principal | Gris Hierro | `#2C2C2C` | Títulos y textos principales. Como el metal pulido. |
| Texto secundario | Gris Ceniza | `#6B6B6B` | Descripciones, placeholders, textos de ayuda. |
| Bordes | Gris Piedra | `#D9D4CC` | Bordes de tarjetas, inputs, separadores. Un gris cálido. |
| Éxito | Verde Éxito | `#3D8B5E` | Mensajes de éxito, badges "Activo". |
| Advertencia | Ocre Mineral | `#C98A2E` | Badges "Pendiente", avisos. |
| Peligro | Rojo Peligro | `#B83A2E` | Errores, botones de eliminar. |

### 1.1 Colores específicos de estado (Badges)

- **Badge mayorista:** fondo `#F0E6C8` (amarillo mineral), texto `#8A6D1F`.
- **Badge minorista:** fondo `#E8D5C4` (arena oscura), texto `#7A2A1F`.
- **Badge domicilio:** fondo `#D4E6D9` (verde claro), texto `#355A40`.
- **Badge "Sin categoría":** fondo `#E8E4DE` (gris piedra claro), texto `#6B6B6B`.

---

## 2. Tipografía

- **Familia:** Inter (Google Fonts) o Manrope.
- **¿Por qué?** Inter es una fuente sans-serif geométrica y moderna, diseñada
  para pantallas. Evoca precisión técnica y tiene una legibilidad excelente,
  encajando con la identidad industrial de Moa.
- **Alternativa:** Sora (un poco más distintiva, aire "tech").
- **No usar fuentes decorativas.** La identidad de Moa es directa, no artesanal.

**Escala tipográfica:**

| Elemento | Tamaño | Peso |
|---|---|---|
| h1 | 1.75rem (28px) | 800 (ExtraBold) |
| h2 | 1.35rem (21.6px) | 700 (Bold) |
| h3 | 1.1rem (17.6px) | 600 (SemiBold) |
| body | 0.95rem (15.2px) | 400 (Regular) |
| small | 0.8rem (12.8px) | 500 (Medium) |
| precio | 1.2rem (19.2px) | 800 (ExtraBold) |

---

## 3. Espaciado y bordes

- **Sistema de espaciado:** múltiplos de 4px (4, 8, 12, 16, 20, 24, 32, 40).
- **Radio de bordes (border-radius):**
  - Botones, inputs: `10px` (ligeramente más anguloso que el estándar).
  - Tarjetas: `14px`.
  - Modales: `20px` (desktop) y `20px 20px 0 0` (móvil, bottom-sheet).
  - Badges: `20px` (pastilla).
- **Sombras:** sutiles, con un tinte cálido (no negro puro).
  - Tarjetas en reposo: `0 2px 8px rgba(122, 42, 31, 0.04)`.
  - Tarjetas en hover: `0 6px 24px rgba(122, 42, 31, 0.1)`.
  - Modales: `0 10px 40px rgba(0, 0, 0, 0.2)`.

---

## 4. Componentes base

### 4.1 Botón (`Boton`)

- **Variantes:**
  - `primario`: fondo rojo laterita, texto blanco.
  - `secundario`: fondo verde níquel, texto blanco.
  - `ghost`: fondo blanco, borde gris piedra, texto gris hierro.
  - `peligro`: fondo rojo peligro, texto blanco.
- **Tamaños:** `sm` (padding 6px 12px), `md` (10px 18px), `lg` (14px 24px).
- **Estados:** `default`, `hover` (oscurece fondo), `active` (escala 0.98),
  `disabled` (opacidad 0.5, cursor not-allowed), `loading` (spinner + texto).
- **Radio:** `10px`.

### 4.2 Tarjeta (`Tarjeta`)

- **Fondo:** blanco puro.
- **Borde:** `1px solid var(--gris-piedra)`.
- **Radio:** `14px`.
- **Sombra:** `0 2px 8px rgba(122, 42, 31, 0.04)`.
- **Hover:** sombra más grande + `transform: translateY(-3px)`.
- **Estructura interna:** imagen arriba (opcional), contenido abajo con padding 16px.

### 4.3 Badge (`Badge`)

- **Forma:** pastilla (`border-radius: 20px`).
- **Padding:** `3px 9px`.
- **Fuente:** 0.7rem, peso 700.
- **Colores:** según la sección 1.1.

### 4.4 Input (`Input`)

- **Fondo:** blanco.
- **Borde:** `1.5px solid var(--gris-piedra)`.
- **Radio:** `10px`.
- **Padding:** `12px 14px`.
- **Focus:** borde rojo laterita, con `box-shadow` suave de `0 0 0 3px rgba(166, 58, 43, 0.15)`.
- **Error:** borde rojo peligro, mensaje de error debajo en rojo y 0.8rem.

### 4.5 Modal (`Modal`)

- **Overlay:** `rgba(44, 44, 44, 0.6)`.
- **Contenedor:** blanco puro, `max-width: 560px`, `max-height: 92vh`, `overflow-y: auto`.
- **En móvil:** se ancla abajo (`border-radius: 20px 20px 0 0`), tipo bottom-sheet.
- **En desktop:** centrado, `border-radius: 20px`.
- **Cierre:** botón "✕" en la esquina superior derecha, cierre por `Esc` y clic fuera.
- **Animación de entrada:** `translateY(40px)` a `0` + opacidad, en 300ms.

### 4.6 Tabla (`Tabla`)

- **Cabecera:** texto gris ceniza, 0.78rem, mayúsculas, peso 600, padding 12px 10px.
- **Filas:** borde inferior `1px solid var(--gris-piedra)`.
- **Hover en fila:** fondo `var(--arena-mineral)`.
- **Acciones:** botones pequeños a la derecha.

### 4.7 Estados vacíos (`EstadoVacio`)

- **Icono grande** (emoji o SVG), opacidad 0.5.
- **Texto principal** en gris ceniza.
- **Botón de acción** opcional (ej. "Limpiar filtros").
- **Centrado** vertical y horizontalmente.

### 4.8 Estados de carga (`EstadoCarga`)

- **Skeleton** (fondo gris piedra animado) para listados.
- **Spinner** centrado para acciones puntuales.

---

## 5. Iconografía

- **Librería:** Lucide React para iconos lineales.
- **Tamaño base:** 20px en línea, 24px en botones destacados.
- **Color:** hereda el color del texto o el color del botón.
- **Detalle:** los iconos de categorías de productos/servicios pueden llevar un
  trazo en rojo laterita cuando estén activos (seleccionados).
- **Uso:** nunca usar imágenes rasterizadas para iconos de interfaz.

---

## 6. Reglas de layout

- **Mobile-first:** todo se diseña primero para 375px de ancho y luego escala.
- **Contenedor máximo:** `1100px` centrado en desktop.
- **Grid de tarjetas:** `repeat(auto-fill, minmax(220px, 1fr))` con gap 18px.
- **Header:** sticky, fondo blanco, borde inferior, padding 12px 20px.
- **Padding general de página:** 24px en móvil, 32px en desktop.

---

## 7. Reglas de accesibilidad

- **Contraste mínimo:** AA (4.5:1 para texto normal, 3:1 para texto grande).
- **Tamaño táctil mínimo:** 44x44px en móvil.
- **Foco visible:** todo elemento interactivo debe tener un estado de foco claro.
- **Labels:** todo input debe tener un `<label>` asociado.
- **Navegación por teclado:** modales cerrables con `Esc`, focus trap dentro del modal.
- **Textos alternativos:** toda imagen debe tener `alt` descriptivo o vacío si es decorativa.

---

## 8. Prohibiciones visuales

- No usar más de **2 familias tipográficas**.
- No usar sombras duras (negras) ni degradados llamativos.
- No usar más de **3 colores principales** en una misma pantalla.
- No usar animaciones de más de **300ms**.
- No usar iconos rasterizados en la interfaz.
- No usar fuentes externas que no sean Inter o Manrope.
- No usar emojis como iconos de interfaz (excepto en categorías y badges, donde ya están definidos).

---

## 9. Ejemplos de referencia rápida

- **Botón primario:** `bg-[#A63A2B] hover:bg-[#7A2A1F] text-white px-4 py-2.5 rounded-[10px] font-semibold transition-colors`
- **Tarjeta:** `bg-white rounded-[14px] border border-[#D9D4CC] hover:shadow-[0_6px_24px_rgba(122,42,31,0.1)] hover:-translate-y-1 transition`
- **Input:** `w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-[#D9D4CC] focus:border-[#A63A2B] outline-none bg-white text-[#2C2C2C]`
- **Badge domicilio:** `bg-[#D4E6D9] text-[#355A40] text-[0.7rem] font-bold px-2.5 py-1 rounded-full`
