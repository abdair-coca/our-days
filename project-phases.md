# Our Days — Plan de Fases del Proyecto

## 1. Objetivo de este documento

Este documento define las fases de desarrollo de **Our Days**.

La intención no es construir todo el MVP de una sola vez, sino avanzar en bloques pequeños, revisables y acumulativos.

Cada fase debe cumplir cuatro cosas:

1. producir algo visible o funcional;
2. integrarse con lo construido anteriormente;
3. permitir feedback antes de continuar;
4. terminar con criterios claros de aprobación.

El flujo general será:

```text
Fase anterior
    ↓
Integración
    ↓
Nueva funcionalidad
    ↓
Pruebas
    ↓
Evaluación
    ↓
Feedback
    ↓
Ajustes
    ↓
Aprobación
    ↓
Siguiente fase
```

---

# 2. Regla principal

No se avanza a la siguiente fase si la fase actual deja problemas importantes en:

- experiencia;
- diseño;
- responsive;
- arquitectura;
- seguridad;
- rendimiento;
- flujo de usuario.

Cada fase debe fortalecer la anterior, no reemplazarla ni romperla.

---

# 3. Resumen de fases

```text
Fase 0  → Fundación técnica
Fase 1  → Design System
Fase 2  → Shell y navegación responsive
Fase 3  → Home
Fase 4  → Timeline
Fase 5  → Memory Detail
Fase 6  → Create / Edit Memory
Fase 7  → Sistema de animaciones
Fase 8  → Base de datos y persistencia
Fase 9  → Fotos reales y optimización
Fase 10 → Auth, invitación y privacidad
Fase 11 → Integración completa del flujo
Fase 12 → PWA y experiencia instalada
Fase 13 → Performance, resiliencia y QA
Fase 14 → Deploy de producción
Fase 15 → Uso real y mejoras post-MVP
```

---

# Fase 0 — Fundación técnica

## Objetivo

Crear la base estable del proyecto sobre la cual se desarrollará todo lo demás.

## Se logrará

- proyecto Next.js;
- TypeScript;
- Tailwind CSS;
- Motion;
- configuración de lint;
- variables de entorno;
- estructura de carpetas;
- configuración inicial de Supabase;
- repositorio GitHub;
- deploy vacío en Vercel.

## Integración con la fase anterior

No existe una fase anterior.

Esta fase define la base que todas las demás utilizarán.

## Entregables

```text
/
├── app/
├── components/
├── features/
├── lib/
├── hooks/
├── types/
└── public/
```

Además:

```text
localhost funcionando
GitHub conectado
Vercel conectado
Supabase conectado
```

## Se evaluará

- claridad de la estructura;
- naming;
- facilidad para escalar;
- ausencia de dependencias innecesarias;
- deploy correcto;
- configuración segura de variables.

## Criterio de aprobación

```text
✓ proyecto compila
✓ deploy funciona
✓ estructura aprobada
✓ Supabase responde
✓ sin errores de configuración
```

---

# Fase 1 — Design System

## Objetivo

Convertir la propuesta visual elegida en un sistema reutilizable.

## Se logrará

Definir:

- paleta;
- tipografías;
- spacing;
- radios;
- sombras;
- iconografía;
- botones;
- inputs;
- cards;
- estados;
- motion tokens;
- estilos de fotografía;
- reglas responsive.

## Integración con la fase anterior

Se construirá directamente sobre la estructura de la Fase 0.

Los componentes vivirán dentro de:

```text
components/ui/
components/motion/
styles/
```

## Entregables

Página interna:

```text
/design-system
```

Con:

- botones;
- cards;
- inputs;
- modal;
- navegación;
- photo cards;
- song card;
- badges;
- empty states;
- loading states;
- ejemplos mobile/desktop.

## Se evaluará

- si el diseño representa la identidad deseada;
- legibilidad;
- consistencia;
- contraste;
- facilidad de uso;
- calidad visual;
- comportamiento responsive;
- coherencia entre móvil y laptop.

## Criterio de aprobación

```text
✓ identidad visual aprobada
✓ componentes reutilizables
✓ desktop correcto
✓ mobile correcto
✓ estados definidos
```

---

# Fase 2 — Shell y navegación responsive

## Objetivo

Crear la estructura general de la aplicación antes de construir pantallas completas.

## Se logrará

- layout principal;
- navegación móvil;
- navegación desktop;
- header;
- sidebar cuando corresponda;
- contenedores;
- sistema de breakpoints;
- transición básica entre rutas.

## Integración con la fase anterior

Usará exclusivamente componentes y tokens definidos en la Fase 1.

No se crearán estilos aislados para resolver problemas puntuales.

## Entregables

Rutas navegables vacías:

```text
/
 /memories
 /memories/new
 /memories/[id]
 /settings
```

## Se evaluará

- claridad de navegación;
- tamaño de targets táctiles;
- comportamiento en distintos anchos;
- sensación de continuidad entre páginas;
- si algún elemento ocupa demasiado espacio;
- accesibilidad básica.

## Criterio de aprobación

```text
✓ navegación clara
✓ usable con una mano en móvil
✓ desktop bien distribuido
✓ no hay overflow
✓ no hay layouts rotos
```

---

# Fase 3 — Home

## Objetivo

Construir la primera pantalla real de la aplicación.

## Se logrará

Home con datos falsos:

- recuerdo destacado;
- recuerdos recientes;
- acceso a Timeline;
- CTA para crear recuerdo;
- bloque preparado para “Hoy hace...”.

## Integración con la fase anterior

La Home utilizará:

```text
AppShell
Navigation
MemoryCard
Photo
Button
Typography
Motion tokens
```

construidos previamente.

## Entregables

Una Home completamente responsive con mock data.

## Se evaluará

- primera impresión;
- jerarquía;
- claridad;
- cantidad de información;
- ubicación del CTA;
- impacto visual;
- comportamiento con 0, 1 y varios recuerdos;
- legibilidad sobre imágenes.

## Criterio de aprobación

```text
✓ Home entendible en segundos
✓ CTA claro
✓ sin exceso de contenido
✓ bonita en móvil
✓ bonita en laptop
```

---

# Fase 4 — Timeline

## Objetivo

Crear el corazón del álbum: la colección cronológica de recuerdos.

## Se logrará

Timeline con:

- grid responsive;
- agrupación por año/mes;
- filtros;
- estados vacíos;
- cards de recuerdos;
- navegación al detalle.

## Integración con la fase anterior

La Home comenzará a enlazar de forma real con Timeline.

```text
Home
  ↓
Timeline
```

Las mismas `MemoryCard` deberán funcionar en ambas vistas.

## Entregables

```text
/memories
```

con mock data suficiente para simular:

- 3 recuerdos;
- 30 recuerdos;
- varios años.

## Se evaluará

- facilidad para explorar;
- densidad;
- distribución;
- legibilidad de fechas;
- navegación;
- comportamiento con muchos recuerdos;
- coherencia entre Home y Timeline.

## Criterio de aprobación

```text
✓ explorable
✓ escalable visualmente
✓ sin saturación
✓ filtros claros
✓ responsive estable
```

---

# Fase 5 — Memory Detail

## Objetivo

Construir la experiencia más emocional del producto.

## Se logrará

Pantalla de recuerdo con:

- foto principal;
- galería;
- fecha;
- título;
- descripción;
- canción;
- autor;
- acciones de editar/eliminar.

## Integración con la fase anterior

Cada card de Timeline y Home abrirá esta vista.

```text
Home / Timeline
      ↓
Memory Detail
```

## Entregables

```text
/memories/[id]
```

con varias combinaciones:

```text
1 foto
5 fotos
10 fotos
texto corto
texto largo
sin canción
con canción
```

## Se evaluará

- impacto emocional;
- jerarquía de fotografía;
- lectura;
- galería;
- comportamiento de texto largo;
- navegación hacia atrás;
- interacción móvil;
- desktop.

## Criterio de aprobación

```text
✓ foto protagonista
✓ contenido legible
✓ navegación natural
✓ no se siente como red social
✓ experiencia emocional aprobada
```

---

# Fase 6 — Create / Edit Memory

## Objetivo

Construir el flujo principal de creación.

## Se logrará

Formulario con:

- título;
- fecha;
- fotos;
- descripción;
- canción;
- reordenamiento de imágenes;
- preview;
- editar recuerdo existente.

Todavía podrá usar mock state.

## Integración con la fase anterior

Se conectará todo el flujo visual:

```text
Home
  ↓
Create Memory
  ↓
Preview
  ↓
Memory Detail
```

También:

```text
Memory Detail
  ↓
Edit Memory
```

## Entregables

```text
/memories/new
/memories/[id]/edit
```

## Se evaluará

- cantidad de pasos;
- facilidad desde celular;
- claridad;
- validaciones;
- feedback de errores;
- facilidad para seleccionar fotos;
- reordenamiento;
- guardado.

## Criterio de aprobación

```text
✓ crear un recuerdo es sencillo
✓ formulario no intimida
✓ funciona bien con teclado móvil
✓ validaciones claras
✓ editar es intuitivo
```

---

# Fase 7 — Sistema de animaciones

## Objetivo

Convertir una interfaz bonita en una experiencia viva.

## Se logrará

Animaciones para:

- entrada de páginas;
- cards;
- apertura de recuerdo;
- galería;
- botones;
- guardado;
- modales;
- hover desktop;
- feedback de éxito/error;
- carga de contenido.

## Integración con la fase anterior

No se animarán componentes nuevos.

Se animará el flujo ya aprobado:

```text
Home
Timeline
Detail
Create/Edit
```

Así las animaciones mejoran una UX estable en lugar de ocultar problemas.

## Entregables

Motion system aplicado a las pantallas existentes.

## Se evaluará

Para cada animación:

```text
¿mejora?
¿distrae?
¿retarda?
¿se entiende?
¿funciona en móvil?
```

También:

- 60 FPS cuando sea viable;
- reduced motion;
- sensación premium;
- consistencia.

## Criterio de aprobación

```text
✓ animaciones útiles
✓ nada excesivo
✓ navegación rápida
✓ móvil fluido
✓ reduced-motion funcional
```

---

# Fase 8 — Base de datos y persistencia

## Objetivo

Reemplazar los datos falsos por una estructura real.

## Se logrará

Tablas:

```text
profiles
spaces
space_members
memories
memory_photos
```

Servicios y queries reales.

## Integración con la fase anterior

La UI no debería cambiar.

Se sustituye:

```text
mock data
   ↓
Supabase
```

Home, Timeline, Detail y Create consumirán el mismo contrato de datos que usaban los mocks.

## Entregables

- migraciones;
- schema;
- types;
- queries;
- inserts;
- updates;
- deletes.

## Se evaluará

- modelo de datos;
- relaciones;
- queries;
- duplicados;
- orden cronológico;
- errores;
- compatibilidad con UI existente.

## Criterio de aprobación

```text
✓ crear persiste
✓ editar persiste
✓ eliminar persiste
✓ Home lee datos reales
✓ Timeline lee datos reales
✓ Detail lee datos reales
```

---

# Fase 9 — Fotos reales y optimización

## Objetivo

Hacer que las fotografías funcionen de forma fiable y rápida.

## Se logrará

- Supabase Storage;
- compresión;
- resize;
- metadata;
- upload progress;
- retry;
- lazy loading;
- placeholders;
- orden de fotografías.

## Integración con la fase anterior

`memory_photos` de la Fase 8 pasará de almacenar datos simulados a rutas reales de Storage.

Flujo:

```text
Create Memory
   ↓
Image Processing
   ↓
Storage
   ↓
memory_photos
   ↓
Detail / Timeline
```

## Entregables

Carga real desde celular y desktop.

## Se evaluará

- tiempo de upload;
- peso;
- calidad;
- errores de red;
- fotos verticales;
- fotos horizontales;
- 1 foto;
- 10 fotos;
- redes lentas.

## Criterio de aprobación

```text
✓ subida confiable
✓ calidad adecuada
✓ peso controlado
✓ errores recuperables
✓ galería fluida
```

---

# Fase 10 — Auth, invitación y privacidad

## Objetivo

Convertir la app en un espacio realmente privado para dos personas.

## Se logrará

- Supabase Auth;
- login;
- sesiones;
- espacio compartido;
- invitación;
- membership;
- RLS;
- Storage privado;
- protección de rutas.

## Integración con la fase anterior

Los recuerdos reales ya existentes pasarán a depender de:

```text
user
  ↓
space_members
  ↓
space
  ↓
memories
```

Todo acceso será filtrado por espacio.

## Entregables

Flujo:

```text
Abdair crea espacio
     ↓
Invita a Alizon
     ↓
Alizon entra
     ↓
ambos ven el mismo álbum
```

## Se evaluará

- seguridad;
- experiencia de invitación;
- login;
- persistencia de sesión;
- accesos no autorizados;
- RLS;
- URLs privadas.

## Criterio de aprobación

```text
✓ dos cuentas funcionan
✓ comparten recuerdos
✓ terceros no acceden
✓ RLS comprobada
✓ Storage privado
```

---

# Fase 11 — Integración completa del flujo

## Objetivo

Verificar que la aplicación funcione como un producto, no como pantallas separadas.

## Se logrará

Flujo completo:

```text
Login
 ↓
Home
 ↓
Timeline
 ↓
Memory Detail
 ↓
Create
 ↓
Upload
 ↓
Save
 ↓
Detail
 ↓
Edit
 ↓
Timeline
```

## Integración con la fase anterior

Esta fase no agrega grandes funciones nuevas.

Su misión es unir y corregir las fases 0–10.

## Entregables

Versión MVP funcional end-to-end.

## Se evaluará

- consistencia;
- navegación;
- estados;
- errores;
- permisos;
- datos;
- animaciones;
- mobile;
- desktop.

## Criterio de aprobación

Una persona debe poder usar la aplicación sin explicación externa.

```text
✓ flujo completo funciona
✓ ningún callejón sin salida
✓ errores entendibles
✓ datos consistentes
✓ navegación coherente
```

---

# Fase 12 — PWA y experiencia instalada

## Objetivo

Hacer que Our Days se sienta como una aplicación real en el teléfono.

## Se logrará

- manifest;
- iconos;
- splash;
- standalone;
- instalación;
- safe areas;
- ajustes mobile;
- caching básico de assets.

## Integración con la fase anterior

El MVP completo se mantiene igual.

Solo cambia su integración con el dispositivo.

```text
Web App
   ↓
Install
   ↓
Home Screen
   ↓
Standalone Experience
```

## Entregables

App instalable en móvil.

## Se evaluará

- instalación;
- icono;
- pantalla completa;
- safe areas;
- apertura;
- navegación;
- comportamiento tras actualizar versión.

## Criterio de aprobación

```text
✓ instalable
✓ usable standalone
✓ no parece una web rota
✓ navegación correcta
```

---

# Fase 13 — Performance, resiliencia y QA

## Objetivo

Eliminar problemas antes del lanzamiento real.

## Se logrará

Optimización de:

- imágenes;
- JS;
- requests;
- caching;
- animaciones;
- queries;
- errores;
- retries;
- loading states;
- empty states.

## Integración con la fase anterior

Se prueba el sistema completo construido hasta ahora.

No se optimizan componentes aislados sin medir su efecto sobre el flujo real.

## Entregables

Checklist QA:

```text
Mobile
Desktop
Slow network
No network
Large images
Long descriptions
Empty album
Failed upload
Expired session
Invalid invite
```

## Se evaluará

- Core Web Vitals;
- fluidez;
- estabilidad;
- carga inicial;
- errores;
- memory leaks;
- layout shift;
- accesibilidad.

## Criterio de aprobación

```text
✓ rendimiento aceptable
✓ errores controlados
✓ sin pantallas rotas
✓ móvil estable
✓ desktop estable
```

---

# Fase 14 — Deploy de producción

## Objetivo

Publicar una versión estable y segura.

## Se logrará

- producción Vercel;
- Supabase producción;
- variables;
- dominio;
- HTTPS;
- backups;
- revisión de seguridad;
- logging básico.

## Integración con la fase anterior

La misma build aprobada en QA será la que se publique.

No se agregarán funciones entre QA y producción.

## Entregables

```text
https://<dominio>
```

Versión funcional para uso real.

## Se evaluará

- deployment;
- producción;
- sesiones;
- upload;
- base de datos;
- seguridad;
- responsive;
- errores.

## Criterio de aprobación

```text
✓ deploy estable
✓ HTTPS
✓ base de datos correcta
✓ Storage correcto
✓ Auth correcto
✓ probado en dispositivo real
```

---

# Fase 15 — Uso real y mejoras post-MVP

## Objetivo

Mejorar el producto basándonos en uso real, no en ideas hipotéticas.

## Integración con la fase anterior

Esta fase parte exclusivamente del MVP en producción.

No se hará redesign total.

Las mejoras serán incrementales.

## Posibles funciones

Solo después de validar la necesidad:

```text
Hoy hace...
Recuerdo aleatorio
Favoritos
Buscar
Filtros avanzados
Notas especiales
Mejoras PWA
Notificaciones
```

## Se evaluará

Para cada propuesta:

```text
¿lo usamos?
¿nos aporta algo?
¿complica la aplicación?
¿vale el mantenimiento?
```

## Criterio de aprobación

Una función nueva entra solo si aporta valor real.

---

# 4. Ciclo de feedback en cada fase

Después de cada fase se hará una revisión.

Formato recomendado:

```text
1. Qué me gusta
2. Qué no me gusta
3. Qué se siente innecesario
4. Qué falta
5. Qué cambiaría
6. Qué mantendría exactamente igual
```

Y la decisión final será una de estas:

```text
APROBADA
APROBADA CON CAMBIOS
REPETIR FASE
SIMPLIFICAR
ELIMINAR PARTE
```

---

# 5. Integración acumulativa

Las fases no son independientes.

La integración será:

```text
F0 Foundation
      ↓
F1 Design System
      ↓
F2 Shell
      ↓
F3 Home
      ↓
F4 Timeline
      ↓
F5 Detail
      ↓
F6 Create/Edit
      ↓
F7 Motion
      ↓
F8 Database
      ↓
F9 Photos
      ↓
F10 Auth
      ↓
F11 End-to-End Integration
      ↓
F12 PWA
      ↓
F13 QA
      ↓
F14 Production
      ↓
F15 Real Usage
```

Cada fase reutiliza y valida la anterior.

---

# 6. Qué NO haremos

No construiremos varias fases simultáneamente si una depende visual o funcionalmente de otra que aún no fue aprobada.

Ejemplos:

```text
No implementar DB antes de validar el flujo.
No implementar Auth antes de validar el modelo.
No optimizar animaciones antes de tener animaciones.
No hacer PWA antes de tener un MVP estable.
No agregar features extras antes del uso real.
```

---

# 7. Milestones

## Milestone A — Visual Prototype

Incluye:

```text
F0
F1
F2
F3
F4
F5
F6
F7
```

Resultado:

> La aplicación se ve y se siente prácticamente terminada, pero usa datos simulados.

---

## Milestone B — Functional MVP

Incluye:

```text
F8
F9
F10
F11
```

Resultado:

> Dos personas pueden crear y compartir recuerdos reales.

---

## Milestone C — Production Ready

Incluye:

```text
F12
F13
F14
```

Resultado:

> Our Days puede usarse diariamente desde móvil y laptop.

---

## Milestone D — Product Evolution

Incluye:

```text
F15+
```

Resultado:

> La aplicación evoluciona según uso real.

---

# 8. Definition of Done global

Ninguna fase se considera terminada solo porque “funciona”.

Debe cumplir:

```text
✓ funcional
✓ visualmente coherente
✓ responsive
✓ loading state
✓ empty state
✓ error state
✓ accesible
✓ integrada con la fase anterior
✓ probada en móvil
✓ probada en desktop
✓ feedback revisado
✓ aprobada antes de avanzar
```

---

# 9. Filosofía de ejecución

Our Days se desarrollará como un producto que queremos conservar durante años.

La prioridad será:

```text
calidad > cantidad de funciones
claridad > complejidad
emoción > decoración
estabilidad > velocidad de desarrollo
feedback > suposiciones
```

El proyecto avanzará únicamente cuando cada parte se sienta suficientemente buena como para permanecer.
