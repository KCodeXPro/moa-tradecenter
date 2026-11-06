# 00 — Índice de documentación: Moa Tradecenter

> Este índice lista todos los documentos del proyecto y el orden en que deben
> leerse. Cline debe leer primero `.clinerules` y luego los documentos relevantes
> a la tarea.

---

## 1. Orden de lectura

| # | Documento | Propósito |
|---|---|---|
| 0 | `.clinerules` | Reglas obligatorias del proyecto. **Leer siempre primero.** |
| 1 | `/docs/00-indice.md` | Este archivo. Mapa de la documentación. |
| 2 | `/docs/01-vision.md` | Qué es Moa Tradecenter, para quién, alcance y qué queda fuera del MVP. |
| 3 | `/docs/02-actores-y-roles.md` | Quién hace qué. Permisos, matriz de roles y reglas de suspensión. |
| 4 | `/docs/03-reglas-de-negocio.md` | Reglas obligatorias de negocio (productos, servicios, domicilio, mensajería, categorías, privacidad, etc.). |
| 5 | `/docs/04-modelo-de-datos.md` | Entidades, campos, relaciones, validaciones e índices de MongoDB. |
| 6 | `/docs/05-flujos.md` | Flujos paso a paso (navegación, mensaje, domicilio, registro, paneles, etc.). |
| 7 | `/docs/06-arquitectura-tecnica.md` | Stack, estructura del monorepo, API REST, despliegue en Vercel. |
| 8 | `/docs/07-roadmap-mvp.md` | Fases de construcción del MVP y criterios de terminado. |
| 9 | `/docs/08-seeds-iniciales.md` | Datos de ejemplo reproducibles para desarrollo y demos. |

---

## 2. Prioridad en caso de conflicto

1. `.clinerules`
2. `/docs/03-reglas-de-negocio.md`
3. `/docs/04-modelo-de-datos.md`
4. `/docs/05-flujos.md`
5. Resto de documentos

Si algo no está documentado, Cline debe **preguntar antes de asumir**.

---

## 3. Documentos pendientes de crear

- `/docs/09-api-reference.md` (opcional, se puede generar a partir de NestJS con
  Swagger en la Fase 2).
- `/docs/10-testing.md` (opcional, cuando se defina la estrategia de tests).
- `/docs/11-deployment.md` (opcional, si se detalla más el despliegue en Vercel).

---

## 4. Convenciones de la documentación

- Todos los documentos están en español.
- Los documentos usan Markdown.
- Cada documento tiene un encabezado con su número y nombre.
- Cada documento termina con una sección de "Decisiones resueltas" cuando aplica.
- Los cambios en `/docs` deben indicarse en el resumen final de la tarea.

---

## 5. Versiones de los documentos

| Documento | Versión | Última actualización |
|---|---|---|
| `.clinerules` | v4 | Cierre de coherencia documental (decisiones 1-20). |
| `/docs/00-indice.md` | v2 | Actualizado tras cierre de coherencia. |
| `/docs/01-vision.md` | v1 | Sin cambios desde su creación. |
| `/docs/02-actores-y-roles.md` | v1 | Pendiente de actualizar (rol prestador, `esPrestador`, `whatsappEsPublico`). |
| `/docs/03-reglas-de-negocio.md` | v1 | Pendiente de actualizar (categorías, mensajes, prestador). |
| `/docs/04-modelo-de-datos.md` | v1 | Pendiente de actualizar (campos `esPrestador`, `whatsappEsPublico`, TTL, snapshot). |
| `/docs/05-flujos.md` | v1 | Pendiente de actualizar (edición de perfil, categorías, mensajes admin). |
| `/docs/06-arquitectura-tecnica.md` | v1 | Pendiente de actualizar (zona horaria). |
| `/docs/07-roadmap-mvp.md` | v1 | Sin cambios. |
| `/docs/08-seeds-iniciales.md` | v1 | Pendiente de actualizar (JSONs con `esPrestador` y `whatsappEsPublico`). |