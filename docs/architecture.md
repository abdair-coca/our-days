# Our Days — Arquitectura

Este documento define la arquitectura objetivo de Our Days y el alcance implementado en la Fase 0. La aplicación será un álbum privado para dos personas: visualmente emocional, simple de usar, rápido en móvil y mantenible con bajo costo operativo.

## Camino rápido

1. Ejecutar `npm install`.
2. Ejecutar `npm run dev`.
3. Revisar `/`, `/memories`, `/memories/new`, `/settings` y las rutas de autenticación de demostración.
4. Validar cambios con `npm run lint`, `npm run typecheck` y `npm run build`.

La Fase 0 usa datos locales deterministas. Supabase queda preparado como seam de infraestructura, pero no se activan credenciales ni persistencia real todavía.

## Decisiones principales

| Área | Decisión |
| --- | --- |
| Forma | Monolito modular full-stack en un solo repositorio. |
| UI y servidor | Next.js App Router, React, TypeScript y Server Components por defecto. |
| Estilos | Tailwind CSS 4 y tokens CSS propios para color, espacio, radios y motion. |
| Interacción | Motion solo donde aporta transición; `prefers-reduced-motion` siempre respetado. |
| Formularios | React Hook Form + Zod; validación compartida en `lib/validations`. |
| Backend futuro | Server Actions por defecto; Route Handlers solo cuando hagan falta. |
| Plataforma | Supabase para PostgreSQL, Auth y Storage; Vercel para Next.js. |
| Música | Colección de canciones por recuerdo con enlaces canónicos y embeds oficiales de Spotify/YouTube; sin SDKs ni OAuth. |
| Imágenes | Storage privado; resize, compresión, thumbnails, lazy loading y signed URLs cuando corresponda. |

## Mapa de módulos

```text
Browser
  │
  ▼
Next.js monolith
  ├── app/              rutas, layouts y estados de navegación
  ├── components/      interfaz visual reutilizable
  ├── features/        módulos de dominio: auth, memories, photos, music
  ├── lib/              adapters y utilidades de infraestructura
  ├── hooks/            interacción cliente aislada
  ├── types/            modelos TypeScript compartidos
  └── styles/           tokens y estilos globales
  │
  ▼
Supabase
  ├── PostgreSQL
  ├── Auth
  └── Storage privado
```

### Estructura de carpetas

```text
app/
  (auth)/login/                  autenticación
  (auth)/invite/                 invitación
  (app)/                         shell privado
  (app)/memories/                timeline y creación
  (app)/memories/[id]/           detalle y edición
  (app)/settings/                configuración
components/
  ui/ layout/ navigation/ memory/ gallery/ music/ forms/ motion/
features/
  auth/ memories/ photos/ music/
lib/
  supabase/ validations/ images/ constants/ utils/
hooks/
types/
public/
styles/
docs/
```

## Seams y adaptadores

La interfaz `MemoryCatalog` de `features/memories/catalog.ts` es el seam de lectura de recuerdos:

- `list()` devuelve recuerdos ordenados de más nuevo a más antiguo.
- `getById(id)` devuelve un recuerdo o `null`.
- `years()` devuelve años disponibles en orden descendente.

`localMemoryCatalog` es el adaptador actual para el prototipo. Más adelante, un adaptador Supabase podrá satisfacer la misma interfaz sin filtrar detalles de PostgreSQL hacia las páginas. La interfaz permanece pequeña; ordenamiento, lookup y reglas de datos viven dentro del módulo.

`MemoryRepository` extiende ese seam para las mutaciones de recuerdos y canciones. Las operaciones `addSong`, `updateSong` y `removeSong` están aisladas del formulario: el servidor deriva `added_by` desde la sesión y normaliza la URL antes de persistirla. La pantalla de detalle consume `Memory.songs`, ordenadas por `created_at` ascendente, y mantiene como máximo un reproductor inline activo por recuerdo.

## Modelo de datos futuro

```text
profiles
  id, name, avatar_url, created_at

spaces
  id, name, created_at, created_by

space_members
  id, space_id, user_id, joined_at

memories
  id, space_id, created_by, title, description,
  memory_date, song_title, song_artist, song_url,
  created_at, updated_at

memory_photos
  id, memory_id, storage_path, position, width, height, created_at

memory_songs
  id, memory_id, added_by, title, artist, url,
  created_at, updated_at

memory_views
  memory_id, profile_id, seen_at
```

`memory_songs` es la fuente nueva para la colección musical. Las columnas
`song_title`, `song_artist` y `song_url` de `memories` se conservan durante la
transición para rollback y compatibilidad con datos antiguos; la migración
inicial copia cada canción existente como el primer registro de su recuerdo.
La URL almacenada en `memory_songs` es canónica y única por recuerdo.

Relación principal:

```text
space → space_members → memories → memory_photos
                         └→ memory_songs
                         └→ memory_views ← profile
```

## Privacidad

El producto será privado. Cada usuario podrá acceder únicamente a recuerdos de espacios donde sea miembro.

```text
user → space_members → space → memories
```

La implementación real combina Supabase Auth, Row Level Security, Storage
privado y signed URLs. Las políticas de `memory_songs` reutilizan la
pertenencia al espacio del recuerdo: cualquier miembro puede leer, añadir,
editar o eliminar canciones, pero no obtiene acceso a recuerdos de otro
espacio. La `SUPABASE_SERVICE_ROLE_KEY` será siempre server-only y nunca tendrá
prefijo `NEXT_PUBLIC_`.

En `/settings`, las personas del espacio se cargan mediante funciones SQL
security definer que vuelven a comprobar la pertenencia al espacio. La búsqueda
devuelve únicamente nombre, correo y estado de pertenencia de cuentas
confirmadas. Cualquier miembro puede buscar y añadir otra cuenta; solo el
propietario puede quitar miembros y nunca puede quitarse al propietario. Las
Server Actions vuelven a validar la sesión antes de cada operación.

La presentación narrativa del Home usa `space_members.welcome_seen_at` para
detectar una bienvenida pendiente y `memory_views` para mantener una lectura
independiente por persona. Las membresías existentes y sus recuerdos se
marcan como vistos durante la migración; las nuevas membresías empiezan con la
bienvenida pendiente. Los recuerdos nuevos se consultan al entrar al Home, sin
realtime, y se marcan vistos mediante funciones security definer que derivan
`auth.uid()`.

La ruta `/presentations`, visible como `Historias` en la navegación, construye
una presentación de replay con todos los recuerdos ordenados cronológicamente.
No usa ni altera `memory_views` o `welcome_seen_at`; sirve como acceso
persistente para volver a ver la narrativa en cualquier momento. La canción de
fondo se resuelve una sola vez y el embed permanece montado durante el cambio de
story para conservar la reproducción.

## Flujo de imágenes

```text
seleccionar imagen
  ↓ validar
  ↓ comprimir y redimensionar
  ↓ subir a Storage
  ↓ guardar metadata en PostgreSQL
  ↓ servir responsive con lazy loading
```

Objetivo inicial: lado largo máximo de 2000 px y peso aproximado de 300 KB–1 MB. PostgreSQL guarda metadata, nunca los binarios.

## Navegación del MVP

```text
HOME
  ↓
TIMELINE
  ↓
MEMORY DETAIL
  ↓
CREATE / EDIT
```

Cada módulo visual importante debe contemplar `loading`, `empty`, `success`, `error`, `disabled` y `offline / retry` cuando el estado aplique.

## Responsive, rendimiento y accesibilidad

- Mobile-first; los mismos módulos responden al ancho disponible.
- Server Components por defecto; Client Components solo para interacción.
- Animar preferentemente `opacity` y `transform`, con duraciones de 120–500 ms.
- Usar imágenes responsive, placeholders, lazy loading y caché.
- Mantener landmarks semánticos, foco visible, labels explícitos y controles táctiles grandes.
- Probar móvil, tablet, laptop y red lenta antes de cerrar cada fase.

## Entornos y despliegue

```text
local → feature branch → GitHub → Pull Request → Vercel Preview
      → feedback → main → producción
```

Variables previstas:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

La clave privada no debe enviarse al navegador. El archivo `.env.example` documenta también la clave pública moderna opcional de Supabase.

## Fases de entrega

1. Fundación técnica y configuración.
2. Design system.
3. Prototipo navegable con datos falsos.
4. Animaciones.
5. Base de datos y recuerdos reales.
6. Timeline, detalle y edición persistentes.
7. Auth, invitación, membership y RLS.
8. Fotos reales y optimización.
9. PWA, QA y producción.
10. Mejoras basadas en uso real.

Cada fase debe dejar una versión usable y revisable. Definition of Done mínima: funciona, es responsive, contempla loading/empty/error, es accesible, respeta motion, se prueba en móvil y desktop, y recibe feedback antes de avanzar.

## Fuera del MVP

IA, chat, ubicación, mapas, comentarios, gamificación, notificaciones complejas,
realtime, reproducción completa de Spotify y modo offline completo quedan fuera
hasta que el uso real justifique agregarlos. La presentación usa los embeds
oficiales existentes y no intenta extraer audio de los proveedores.

## Estado actual

La Fase 0 está implementada como prototipo local navegable. La siguiente decisión de producto es validar visualmente el design system antes de conectar base de datos, autenticación o Storage.
