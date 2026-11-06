# 06 — Arquitectura técnica: Moa Tradecenter

> Define el stack, la estructura del proyecto, las decisiones técnicas y el
> despliegue. Es la referencia para el desarrollo. Cualquier cambio de stack o de
> infraestructura debe reflejarse aquí antes de implementarse.

---

## 1. Stack técnico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | React + Vite + TypeScript | Ecosistema maduro, tipado fuerte, rápido en desarrollo. |
| **Estilos** | Tailwind CSS + componentes propios | Mantiene la identidad visual del mockup sin arrastrar librerías pesadas. |
| **Rutas** | React Router | Estándar de facto en React. |
| **Data fetching** | React Query (TanStack Query) | Caché, reintentos, estados de carga/error listos para usar. |
| **Backend** | NestJS (Node.js + TypeScript) | Arquitectura modular, inyección de dependencias, preparado para escalar. |
| **Base de datos** | MongoDB + Mongoose | Modelo flexible, encaja con las entidades del proyecto. |
| **Validaciones** | Zod (frontend y backend) | Un solo esquema para validar en ambos lados. |
| **Autenticación** | JWT (simulado en MVP) | Preparado para OAuth real de Google/Facebook en fase 2. |
| **Despliegue** | Vercel (frontend + backend) | Zero-config para NestJS, Fluid compute, preview deployments. |

---

## 2. Estructura del repositorio

Monorepo con dos workspaces principales:

```
moa-tradecenter/
├── frontend/                  # React + Vite + TypeScript
│   ├── src/
│   │   ├── features/          # Por dominio: auth, productos, servicios, domicilio, admin
│   │   ├── components/        # Componentes reutilizables (tarjeta, badge, modal, input)
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── lib/               # Utilidades, cliente API, validaciones Zod
│   │   ├── pages/             # Vistas (home, listado, ficha, panel vendedor, panel admin)
│   │   ├── routes/            # Configuración de React Router
│   │   └── styles/            # Tailwind config y estilos globales
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                   # NestJS + TypeScript
│   ├── src/
│   │   ├── modules/           # Por dominio: auth, usuarios, productos, servicios, domicilio, admin
│   │   │   ├── auth/
│   │   │   ├── usuarios/
│   │   │   ├── categorias/
│   │   │   ├── productos/
│   │   │   ├── servicios/
│   │   │   ├── mensajes/
│   │   │   ├── solicitudes-domicilio/
│   │   │   ├── reportes/
│   │   │   └── auditoria/
│   │   ├── common/            # Guards, interceptors, filters, decorators
│   │   ├── config/            # Configuración (env, mongoose)
│   │   ├── app.module.ts
│   │   └── main.ts            # Entry point reconocido por Vercel
│   ├── nest-cli.json
│   └── package.json
│
├── docs/                      # Documentación del proyecto
├── .clinerules
└── package.json               # Root del monorepo
```

---

## 3. Backend con NestJS

### 3.1 Módulos principales

| Módulo | Responsabilidad |
|---|---|
| `AuthModule` | Login/registro simulado, JWT, guards de roles. |
| `UsuariosModule` | CRUD de usuarios, perfiles, suspensión/reactivación. |
| `CategoriasModule` | CRUD de categorías (producto/servicio), reasignación. |
| `ProductosModule` | CRUD de productos, filtros, búsqueda. |
| `ServiciosModule` | CRUD de servicios, filtros, búsqueda. |
| `MensajesModule` | Mensajes de compradores, TTL, anonimización. |
| `MensajesAdminModule` | Mensajería interna admin ↔ vendedor. |
| `DomicilioModule` | Solicitudes de domicilio, snapshots, estados. |
| `ReportesModule` | Reportes de compradores. |
| `AuditoriaModule` | Registro de accesos del admin a datos privados. |

### 3.2 Punto de entrada para Vercel

Vercel detecta automáticamente NestJS si el entry point se llama `main.ts` dentro de `src/` . El `bootstrap()` estándar de NestJS es suficiente:

```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Vercel convierte toda la app NestJS en una sola Vercel Function que usa Fluid compute y escala automáticamente según el tráfico .

### 3.3 Consideraciones específicas de Vercel

- Tamaño del bundle: el límite por defecto es 250 MB sin comprimir. Para el MVP es más que suficiente .
- Duración máxima: 300 s por defecto en Hobby/Pro. Los flujos del MVP no deberían acercarse .
- Una sola Function: NestJS se despliega como una única función, no como múltiples funciones separadas. Esto simplifica el despliegue pero implica que todas las rutas comparten el mismo runtime .
- MongoDB Atlas: usar la conexión desde Vercel. Configurar la IP de Vercel en el allowlist de Atlas (o usar 0.0.0.0/0 con usuario/contraseña fuertes en MVP).

---

## 4. Frontend con React + Vite

### 4.1 Estructura por features

Cada feature agrupa sus componentes, hooks y páginas:

```
features/
├── auth/
│   ├── components/       # LoginModal, OAuthSimulation, AntiBotCheckbox
│   ├── hooks/            # useAuth
│   └── pages/            # LoginPage, RegistroVendedorPage
├── productos/
│   ├── components/       # ProductoCard, ProductoFiltros, ProductoDetalle
│   ├── hooks/            # useProductos, useProducto
│   └── pages/            # ProductosListadoPage
├── servicios/
│   └── ...
├── domicilio/
│   ├── components/       # PrestadorSelector, DomicilioConfirm
│   └── ...
├── vendedor/
│   ├── components/       # PanelSidebar, ProductoForm, MensajeList
│   └── pages/            # PanelVendedorPage
└── admin/
    ├── components/       # VendedorTable, CategoriaForm, AuditoriaTable
    └── pages/            # PanelAdminPage
```

### 4.2 Componentes reutilizables mínimos

- Tarjeta (producto/servicio)
- Badge (minorista/mayorista/domicilio)
- Boton (variantes: primario, coral, ghost, peligro)
- Modal (con cierre por Esc y clic fuera)
- InputConLabelYError
- Tabla (para paneles)
- EstadoVacio y EstadoCarga

### 4.3 Estados obligatorios

Cada componente interactivo debe tener: default, hover, focus, active, disabled, loading, empty, error.

---

## 5. API REST

### 5.1 Convenciones

- Prefijo: /api/v1
- Formato: JSON
- Autenticación: Authorization: Bearer <JWT> (simulado en MVP)
- Errores: { error: string, message: string, statusCode: number }
- Fechas: ISO 8601

### 5.2 Endpoints principales (MVP)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Login simulado (elige usuario de prueba). |
| `POST` | `/auth/registro` | Registro de vendedor. |
| `GET` | `/categorias?tipo=producto` | Listar categorías. |
| `GET` | `/productos` | Listar productos con filtros. |
| `GET` | `/productos/:id` | Detalle de producto. |
| `POST` | `/productos` | Crear producto (vendedor). |
| `PATCH` | `/productos/:id` | Editar producto (vendedor). |
| `DELETE` | `/productos/:id` | Eliminar producto (vendedor). |
| `GET` | `/servicios` | Listar servicios con filtros. |
| `GET` | `/servicios/:id` | Detalle de servicio. |
| `POST` | `/servicios` | Crear servicio (vendedor). |
| `POST` | `/mensajes` | Enviar mensaje a vendedor. |
| `GET` | `/mensajes` | Bandeja del vendedor. |
| `PATCH` | `/mensajes/:id/leido` | Marcar mensaje como leído. |
| `POST` | `/solicitudes-domicilio` | Crear solicitud. |
| `GET` | `/solicitudes-domicilio` | Listar solicitudes (prestador). |
| `PATCH` | `/solicitudes-domicilio/:id/estado` | Actualizar estado. |
| `POST` | `/reportes` | Crear reporte. |
| `GET` | `/admin/vendedores` | Listar vendedores (admin). |
| `PATCH` | `/admin/vendedores/:id/suspender` | Suspender. |
| `PATCH` | `/admin/vendedores/:id/reactivar` | Reactivar. |
| `POST` | `/admin/categorias` | Crear categoría. |
| `DELETE` | `/admin/categorias/:id` | Eliminar categoría. |
| `POST` | `/admin/mensajes` | Enviar mensaje interno. |
| `GET` | `/admin/auditoria` | Consultar auditoría. |

---

## 6. Autenticación simulada

- El backend expone `POST /auth/login` que recibe un `usuarioPrueba` (`comprador`, `vendedor`, `admin`) y devuelve un JWT firmado con un secreto de desarrollo.
- El frontend muestra el modal de simulación al pulsar Google/Facebook.
- El checkbox "No soy un robot" es obligatorio y se valida en el frontend antes de mostrar el modal de simulación.
- En fase 2 se reemplaza por OAuth real de Google/Facebook y captcha real (reCAPTCHA o hCaptcha).

---

## 7. Despliegue en Vercel

### 7.1 Configuración del monorepo

Vercel permite importar un monorepo y asignar un Root Directory a cada proyecto . Se crean dos proyectos en Vercel:

| Proyecto Vercel | Root Directory | Framework |
|---|---|---|
| `moa-tradecenter-frontend` | `frontend/` | Vite (auto-detectado) |
| `moa-tradecenter-backend` | `backend/` | NestJS (auto-detectado) |

Cada push al repositorio genera deployments independientes para cada proyecto. Vercel puede saltarse builds de proyectos que no cambiaron si se configura la opción de monorepo .

### 7.2 Variables de entorno

**Backend:**
- `MONGODB_URI` (conexión a MongoDB Atlas)
- `JWT_SECRET`
- `NODE_ENV=production`

**Frontend:**
- `VITE_API_URL` (URL del backend en Vercel)

### 7.3 Consideraciones

- El backend en Vercel corre como una sola función. Las conexiones a MongoDB deben manejarse con un pool y cerrarse correctamente para evitar fugas entre invocaciones.
- Para el MVP en Hobby, el límite de 250 MB de bundle es suficiente.
- Si en el futuro se necesita más control (cron jobs, workers, websockets), se puede migrar el backend a Render/Railway o a un VPS, manteniendo el frontend en Vercel.

---

## 8. Seguridad

- **CORS**: configurar en NestJS para permitir solo el dominio del frontend.
- **Helmet**: habilitar cabeceras de seguridad en producción.
- **Rate limiting**: implementar en NestJS con `@nestjs/throttler` para los endpoints de mensajes y reportes.
- **Validación**: Zod en frontend y backend; nunca confiar solo en el frontend.
- **Datos privados**: el backend nunca devuelve WhatsApp ni direcciones en endpoints públicos, salvo el WhatsApp del prestador de domicilio.
- **Auditoría**: registrar cada acceso del admin a datos privados.

---

## 9. Decisiones resueltas

- ~~¿React + Vite con JavaScript o TypeScript?~~ → **Resuelto:** TypeScript.
- ~~¿Librería de UI o CSS propio?~~ → **Resuelto:** Tailwind CSS + componentes propios.
- ~~¿React Router?~~ → **Resuelto:** sí.
- ~~¿React Query o SWR?~~ → **Resuelto:** React Query.
- ~~¿Express puro o NestJS?~~ → **Resuelto:** NestJS.
- ~~¿Mongoose?~~ → **Resuelto:** sí.
- ~~¿JWT o sesiones?~~ → **Resuelto:** JWT.
- ~~¿Zod o Joi?~~ → **Resuelto:** Zod.
- ~~¿Dónde se despliega?~~ → **Resuelto:** Vercel (frontend y backend).
- ~~¿Docker desde el inicio?~~ → **Resuelto:** no, para después del MVP.
- ~~¿Monorepo o repos separados?~~ → **Resuelto:** monorepo.
- ~~¿Estructura de carpetas?~~ → **Resuelto:** por features.
