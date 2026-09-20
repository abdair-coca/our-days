# Our Days — Design System & Motion Rules

## 1. Propósito

Este documento define las reglas visuales y de movimiento de **Our Days** y debe usarse como referencia desde el primer componente hasta producción.

La dirección elegida es **Editorial Living Scrapbook**: un álbum digital contemporáneo con fotografía protagonista, textura de papel, tipografía editorial, notas manuscritas sutiles y una paleta cálida.

La app debe sentirse como:

> un recuerdo físico convertido en producto digital.

La prioridad es que se sienta **íntima, cálida, premium, simple, moderna y viva**, sin parecer una plantilla genérica, una red social o un dashboard.

---

# 2. Principios de diseño

## 2.1 La fotografía es protagonista

La UI acompaña el recuerdo; nunca compite con él.

- Fotos grandes y con aire.
- Evitar overlays pesados.
- Evitar decoraciones encima de caras o contenido importante.
- La interfaz debe poder “desaparecer” visualmente cuando una foto merece protagonismo.

## 2.2 Romance sin clichés

Evitar:

- corazones por todas partes;
- rosas brillantes;
- exceso de rosa;
- gradientes románticos genéricos;
- emojis permanentes;
- partículas y corazones flotando.

Permitido con moderación:

- un corazón dibujado a mano;
- una frase breve;
- cinta adhesiva;
- papel rasgado;
- flores secas;
- una nota manuscrita.

## 2.3 Editorial antes que dashboard

Our Days no debe parecer:

- SaaS;
- CRM;
- panel administrativo;
- Instagram;
- feed infinito.

Debe sentirse como:

- álbum;
- diario;
- colección;
- revista íntima.

## 2.4 Simplicidad visible

Regla por pantalla:

```text
1 acción principal
2–3 acciones secundarias máximo
```

Si una pantalla necesita explicación para entenderse, debe simplificarse.

## 2.5 Consistencia antes que novedad

No crear una nueva variante de botón, card, input, modal, navegación o animación si ya existe una solución equivalente.

---

# 3. Identidad visual

La personalidad de la app debe transmitir:

```text
calidez
nostalgia
intimidad
cuidado
elegancia
orden
tecnología invisible
```

La tecnología debe sentirse sofisticada, pero nunca fría.

---

# 4. Paleta

## 4.1 Tokens base

```css
--bg: #F7F1E8;
--surface: #FFFDF9;
--surface-soft: #F2E8DD;

--text: #2B211D;
--text-soft: #6F625C;
--text-muted: #9A8C84;

--accent: #9E4B3D;
--accent-hover: #873F34;
--accent-soft: #E7C8BE;

--rose-paper: #D9AAA0;
--terracotta: #B86552;
--sand: #D8C5AE;
--olive: #798069;

--border: #DFD4C9;
--border-soft: #EAE2DA;

--success: #64735D;
--warning: #B48248;
--error: #A8463D;
```

## 4.2 Reglas de color

- Fondo principal: `#F7F1E8`; evitar blanco puro.
- `surface` para cards, forms, sheets y modals.
- `accent` solo para CTA, estados seleccionados y highlights importantes.
- No cubrir grandes superficies con el accent.
- Texto funcional crítico nunca debe usar color muted con bajo contraste.
- La decoración puede usar rose, sand, terracotta y olive, pero no la lógica principal de navegación.

---

# 5. Tipografía

## 5.1 Familias

### Editorial / títulos

Preferida:

```text
Fraunces
```

Alternativa:

```text
Cormorant Garamond
```

Usar para:

- títulos de recuerdos;
- hero;
- headings emocionales;
- fechas destacadas.

### UI / lectura

Preferida:

```text
Inter
```

Alternativa:

```text
Manrope
```

Usar para:

- navegación;
- formularios;
- botones;
- labels;
- metadata;
- párrafos.

### Manuscrita

Preferida:

```text
Caveat
```

Usar solo para detalles emocionales o decorativos.

Nunca usar tipografía manuscrita para:

- botones;
- navegación;
- errores;
- formularios;
- textos largos.

## 5.2 Escala

```text
Display XL    56–72px desktop / 40–48px mobile
Display       42–56px desktop / 32–40px mobile
H1            36–44px desktop / 28–34px mobile
H2            28–34px desktop / 24–28px mobile
H3            22–26px
Body Large    18px
Body          16px
Body Small    14px
Caption       12–13px
```

Reglas:

- body nunca menor a 15px en móvil;
- line-height body: `1.5–1.7`;
- títulos editoriales: `1.05–1.2`;
- evitar bloques de texto excesivamente anchos.

---

# 6. Espaciado

Sistema base de 4px:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Evitar valores arbitrarios salvo una excepción visual documentada.

---

# 7. Layout responsive

## 7.1 Mobile first

Diseñar primero para:

```text
360px
390px
430px
```

Luego escalar.

## 7.2 Breakpoints

```text
sm  640px
md  768px
lg  1024px
xl  1280px
2xl 1536px
```

## 7.3 Contenedores

```text
app max-width:       1280px
editorial content:   1080px
long text:           680px
```

## 7.4 Márgenes

```text
mobile:   16–20px
tablet:   24–32px
desktop:  40–64px
```

## 7.5 Regla responsive

No escalar simplemente el móvil.

Mobile prioriza:

```text
foto → acción → contenido → navegación
```

Desktop puede aprovechar:

- whitespace;
- grids;
- sidebar;
- composición editorial;
- hover;
- imágenes más amplias.

---

# 8. Bordes, radios y sombras

## Radios

```text
cards:       16–20px
buttons:     12–16px
inputs:      12–14px
modal/sheet: 20–24px
```

Evitar estética “bubble UI”.

## Borders

Preferir:

```text
1px solid var(--border)
```

antes que sombras fuertes.

## Sombras

```css
/* Card */
0 8px 24px rgba(43, 33, 29, 0.06)

/* Floating */
0 12px 40px rgba(43, 33, 29, 0.10)

/* Overlay */
0 20px 60px rgba(43, 33, 29, 0.16)
```

Regla:

> la sombra debe sentirse, no verse.

---

# 9. Texturas y scrapbook

Elementos permitidos:

```text
tape
paper
polaroid
handwritten note
dried flower
torn edge
watercolor patch
```

No deben usarse como estructura funcional.

Densidad máxima recomendada:

```text
mobile:  1 elemento decorativo fuerte por viewport
desktop: 2–4 elementos decorativos por composición
```

La regla es:

> composición editorial, no collage caótico.

---

# 10. Fotografía

## Tratamiento

- mantener proporción;
- evitar crop agresivo;
- cargar progresivamente;
- conservar tonos naturales;
- nunca deformar imágenes;
- considerar vertical, horizontal y ratios extraños desde el diseño inicial.

## Ratios recomendados

```text
Hero:        4:5 mobile / 16:9 desktop
MemoryCard:  4:5 o 3:4
Gallery:     ratio original cuando sea viable
Thumbnail:   1:1
```

## Texto sobre imagen

Usar solo cuando sea necesario.

```text
gradient bottom:
transparent → rgba(20, 14, 12, 0.45)
```

Evitar overlays negros pesados.

---

# 11. Iconografía

Preferencia:

```text
Lucide Icons
```

Características:

- outline;
- stroke consistente;
- simple;
- tamaños 16 / 20 / 24px.

No mezclar familias de iconos.

### Regla de implementación

Our Days usa una familia local de SVG outline para mantener el trazo consistente
sin añadir una dependencia de iconos. Los iconos compartidos viven en
`components/ui/icons.tsx` y deben usar `currentColor`, stroke ligero y uno de
estos tamaños: 16, 20 o 24 px.

- acciones compactas: icono visible, `aria-label` y `title`;
- navegación: icono visible y nombre disponible para lectores de pantalla;
- iconos decorativos: `aria-hidden="true"`;
- targets táctiles: mínimo 44 × 44 px;
- acciones primarias o ambiguas conservan texto visible;
- no mezclar emojis, iconos rellenos o familias externas.

La reducción de texto es visual, no semántica: una acción icon-only siempre
debe seguir siendo identificable por teclado, lector de pantalla y tooltip.

---

# 12. Botones

## Primary

```text
background: accent
text: white
height: 48–52px
radius: 14px
```

Uso:

- Crear recuerdo
- Guardar recuerdo
- Confirmar

## Secondary

```text
surface + border + text
```

## Ghost

Sin fondo permanente.

Uso:

- editar;
- volver;
- opciones;
- filtros.

## Touch target

```text
mínimo 44×44px
ideal 48×48px
```

---

# 13. Inputs

```text
altura mínima: 48px
textarea mínima: 120px
```

Estados obligatorios:

```text
default
focus
filled
error
disabled
loading
```

No depender únicamente del color para comunicar errores.

---

# 14. Cards

## Memory Card

Debe contener como máximo:

```text
foto
fecha
título
microdetalle opcional
```

No llenar la card de metadata.

### Mobile

Preferir foto grande y contenido debajo.

### Desktop

Se permiten grids, masonry moderado y layouts editoriales.

---

# 15. Song Card

Debe sentirse parte del recuerdo, no como Spotify embebido.

Contenido:

```text
cover opcional
song title
artist
play/open action
```

Compacta, limpia y secundaria respecto a la fotografía.

---

# 16. Navegación

## Mobile

Bottom navigation con máximo 5 destinos.

Base recomendada:

```text
Home
Timeline
Create
Library/Search
Profile
```

Create puede tener más jerarquía visual.

## Desktop

Sidebar o navigation rail.

No mostrar bottom nav en desktop.

---

# 17. Reglas por pantalla

## Home

Jerarquía:

```text
1. contexto / saludo
2. recuerdo destacado
3. CTA crear
4. recuerdos recientes
5. acceso Timeline
```

No convertir Home en feed infinito.

## Timeline

Debe sentirse como colección, no como feed social.

Usar:

- agrupación temporal;
- grid;
- filtros discretos;
- aire visual.

Desktop:

```text
2–4 columnas según ancho
```

Mobile:

```text
1–2 columnas
```

## Memory Detail

Debe ser la pantalla más emocional.

Orden:

```text
foto principal
fecha
título
descripción
song card
galería
acciones
```

La fotografía puede romper parcialmente el contenedor. El texto no.

## Create / Edit

Orden:

```text
fotos
fecha
título
descripción
canción
guardar
```

No usar wizard salvo que sea estrictamente necesario.

Crear un recuerdo debe poder completarse en menos de un minuto.

---

# 18. Estados obligatorios

Todo componente relevante debe contemplar:

```text
loading
empty
error
success
disabled
offline/retry
```

## Loading

Preferir:

- skeleton;
- fade;
- blur-up image;
- placeholder.

No mostrar un spinner genérico como solución principal.

## Empty

Ejemplo:

```text
Todavía no hay recuerdos aquí.

Cuando quieran guardar uno,
este será su lugar.
```

## Error

Evitar mensajes técnicos.

No:

```text
Error 500
Failed request
```

Sí:

```text
No pudimos guardar este recuerdo.
Tus cambios siguen aquí.
Intentar de nuevo.
```

---

# 19. Filosofía de animación

Las animaciones deben ser:

```text
útiles
rápidas
naturales
consistentes
interrumpibles
```

Nunca deben bloquear al usuario.

La app debe sentirse viva por su respuesta, no porque todo se mueve.

---

# 20. Motion tokens

## Duraciones

```text
Instant feedback      100–160ms
Micro interaction     160–220ms
Component transition  220–320ms
Page transition       280–380ms
Emotional transition  350–500ms
```

No superar 500ms salvo una excepción muy puntual.

## Easing

### Standard

```css
cubic-bezier(0.2, 0.8, 0.2, 1)
```

### Gentle

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

### Exit

```css
cubic-bezier(0.4, 0, 1, 1)
```

## Ejemplo de tokens

```ts
export const motion = {
  instant: 0.12,
  fast: 0.18,
  normal: 0.28,
  page: 0.34,
  emotional: 0.44,
  easeStandard: [0.2, 0.8, 0.2, 1],
  easeGentle: [0.22, 1, 0.36, 1],
}
```

---

# 21. Propiedades a animar

Priorizar:

```text
transform
opacity
clip-path moderado
```

Usar `filter` solo de forma ocasional.

Evitar animar continuamente:

```text
width
height
top
left
margin
padding
blur grande
box-shadow grande
```

Siempre que sea posible, resolver movimiento con `transform`.

---

# 22. Entrada de elementos

Patrón base:

```text
opacity: 0 → 1
translateY: 8–16px → 0
duration: 280–360ms
```

No usar desplazamientos grandes.

La UI debe sentirse asentada, no flotante.

---

# 23. Stagger

Para pequeños grupos:

```text
20–50ms por elemento
```

Máximo recomendado:

```text
300ms total
```

No animar decenas de elementos uno por uno.

---

# 24. Hover desktop

Cards:

```text
translateY: -2px
scale: 1.005–1.015
```

Imagen:

```text
scale: 1 → 1.02
```

Duración:

```text
180–240ms
```

Evitar grandes elevaciones.

---

# 25. Press / Tap

Botones:

```text
scale: 1 → 0.98
```

Cards:

```text
scale: 1 → 0.99
```

Duración:

```text
80–120ms
```

Debe sentirse inmediato.

---

# 26. Page transitions

Patrón general:

```text
old page:
opacity 1 → 0

new page:
opacity 0 → 1
translateY 8px → 0
```

Duración:

```text
250–350ms
```

No hacer slide horizontal largo en todas las rutas.

---

# 27. Home / Timeline → Memory Detail

Esta puede ser la transición distintiva de Our Days.

Ideal:

```text
shared photo transition
```

La misma fotografía se expande desde la card hacia el hero del recuerdo.

Reglas:

```text
duration: 350–450ms
scale suave
sin blur fuerte
sin delay perceptible
```

Si afecta rendimiento:

```text
fade + scale
```

La sensación buscada es:

> sigo viendo el mismo recuerdo, solo más cerca.

---

# 28. Galería

Swipe:

- natural;
- inercial;
- sin overscroll exagerado.

Transición:

```text
200–280ms
```

Thumbnail seleccionado:

```text
opacity
border
scale mínimo
```

No animar todas las fotos simultáneamente.

---

# 29. Create / Edit motion

## Añadir foto

```text
fade + scale 0.96 → 1
```

## Reordenar

Usar spring suave, sin bounce exagerado.

## Guardar

Flujo:

```text
button
  ↓
loading state
  ↓
confirmación breve
  ↓
Memory Detail
```

No usar confetti.

---

# 30. Success feedback

Ejemplo:

```text
✓ Recuerdo guardado
```

Duración visible:

```text
1.5–2.5s
```

No debe bloquear navegación.

---

# 31. Delete

Nunca borrar inmediatamente.

```text
Delete
 ↓
Confirm
 ↓
Delete
 ↓
Undo opcional
```

Salida:

```text
opacity 1 → 0
scale 1 → 0.98
```

---

# 32. Modal / Sheet

Mobile:

```text
bottom sheet
```

Desktop:

```text
centered modal
```

Backdrop:

```text
rgba(30, 22, 18, 0.25–0.35)
```

Entrada:

```text
opacity + translateY
```

Evitar blur fuerte.

---

# 33. Bottom navigation motion

Al cambiar de tab:

- el icono cambia suavemente;
- el label puede cambiar peso;
- un indicador puede deslizarse.

Duración:

```text
160–220ms
```

No mover toda la barra.

---

# 34. Parallax

Permitido solo en:

- hero;
- una fotografía destacada;
- especialmente desktop.

Rango:

```text
8–16px máximo
```

Desactivar si perjudica rendimiento.

---

# 35. Animaciones decorativas

Permitidas:

- pequeño movimiento de papel;
- rotación mínima de una nota;
- underline dibujándose;
- corazón manuscrito apareciendo;
- fade de textura.

Máximo:

```text
1–2 detalles animados por pantalla
```

---

# 36. Reduced Motion

Obligatorio respetar:

```css
@media (prefers-reduced-motion: reduce)
```

En este modo:

- eliminar parallax;
- eliminar shared transitions complejas;
- eliminar stagger;
- reducir scale;
- usar fades mínimos;
- limitar duración a ~100ms cuando sea posible.

---

# 37. Performance de animaciones

Nunca usar animaciones que:

- provoquen scroll jank;
- mantengan la GPU activa permanentemente;
- ejecuten loops decorativos sin razón;
- bloqueen interacción;
- dependan de partículas;
- introduzcan librerías excesivas.

No implementar smooth-scroll global.

El scroll debe sentirse nativo.

---

# 38. Responsive motion

## Mobile

```text
menos movimiento
menos parallax
sin hover
más feedback táctil
```

## Desktop

```text
hover
shared transitions
parallax ligero
mayor profundidad
```

La identidad debe seguir siendo la misma.

---

# 39. Accesibilidad

## Contraste

Cumplir WCAG AA cuando aplique.

## Focus

Todo elemento interactivo debe tener focus visible.

## Keyboard

Desktop debe permitir:

- Tab;
- Enter/Space;
- Escape en modal;
- flechas en galería cuando tenga sentido.

## Touch

```text
mínimo: 44×44px
ideal: 48×48px
separación mínima: 8px
```

---

# 40. Safe Areas

En PWA/iOS contemplar:

```css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

La bottom nav nunca debe quedar pegada al borde físico.

---

# 41. Dark mode

No forma parte del MVP.

La identidad base será cálida y clara.

No implementar dark mode hasta que el sistema principal esté estable.

---

# 42. Glassmorphism

No usar como lenguaje principal.

Permitido de forma puntual en:

- controles flotantes sobre fotografía;
- pequeños overlays;
- player compacto.

Nunca usar pantallas completas de vidrio.

---

# 43. Gradientes

Usar solo para:

- legibilidad sobre fotografías;
- hero;
- transiciones de superficie muy suaves.

Evitar gradientes multicolor.

---

# 44. Copy y tono

La voz debe ser:

- cálida;
- breve;
- natural;
- íntima;
- no exagerada.

Evitar:

```text
¡Increíble!
¡Mágico!
¡Perfecto!
```

Preferir:

```text
Un recuerdo más.
Guardado.
Hoy hace un año...
```

Acciones:

```text
Crear recuerdo
Guardar
Editar
Añadir fotos
Añadir canción
```

Evitar lenguaje técnico como “Procesar” o “Ejecutar”.

---

# 45. Reusable motion variants

Crear variantes compartidas desde el inicio:

```text
fadeIn
fadeUp
scaleIn
pageEnter
pageExit
cardHover
modalEnter
sheetEnter
staggerContainer
```

No definir easings diferentes en cada componente.

---

# 46. Tokens obligatorios

Todos los componentes deben consumir:

```text
color tokens
spacing tokens
radius tokens
shadow tokens
motion tokens
```

Evitar hardcodear estilos dentro de componentes salvo excepción justificada.

---

# 47. Estados de interacción

Todo componente interactivo debe definir:

```text
default
hover
active
focus
disabled
loading
```

Hover solo aplica donde exista puntero.

---

# 48. Skeletons

Deben respetar la geometría del componente final.

Ejemplo `MemoryCard`:

```text
image block
date line
title line
```

No usar rectángulos genéricos sin relación con el layout.

---

# 49. Validación visual

Probar cada pantalla al menos en:

```text
360×800
390×844
430×932
768×1024
1366×768
1440×900
1920×1080
```

Y con:

```text
sin datos
1 recuerdo
muchos recuerdos
texto muy largo
texto muy corto
sin canción
1 foto
10 fotos
red lenta
error
```

---

# 50. Regla de “nada roto”

Antes de aprobar una pantalla:

```text
✓ no overflow horizontal
✓ no texto cortado accidentalmente
✓ no CTA fuera del viewport
✓ no imágenes deformadas
✓ no modal inaccesible
✓ no botón debajo de safe area
✓ no estado vacío improvisado
✓ no layout shift visible innecesario
```

---

# 51. Performance visual

No usar:

```text
backdrop-filter enorme
blur continuo
muchas capas con shadow
parallax en todo
video autoplay
canvas decorativo
partículas
```

La sensación premium debe venir de:

```text
espaciado
tipografía
fotografía
motion
consistencia
```

---

# 52. Orden de implementación visual

Para cada pantalla:

```text
1. estructura
2. spacing
3. tipografía
4. imágenes
5. colores
6. estados
7. responsive
8. motion
9. polish
```

Nunca comenzar por animaciones.

---

# 53. Checklist de UI por componente

```text
□ usa tokens
□ responsive
□ hover cuando aplica
□ active
□ focus
□ disabled
□ loading
□ error si aplica
□ accesible
□ touch target correcto
□ reduced motion
```

---

# 54. Checklist de animación

```text
□ tiene propósito
□ dura menos de 500ms
□ no bloquea interacción
□ funciona en móvil
□ no provoca layout shift
□ usa transform/opacity cuando sea posible
□ reduced-motion definido
□ no compite con fotografía
```

---

# 55. Definition of Done visual

Una pantalla está aprobada cuando:

```text
✓ se entiende sin explicación
✓ se siente como Our Days
✓ funciona en móvil
✓ funciona en laptop
✓ usa el Design System
✓ contempla sus estados
✓ las animaciones aportan
✓ reduced motion funciona
✓ no presenta problemas evidentes de rendimiento
✓ no parece una plantilla genérica
```

---

# 56. Regla final

Antes de añadir cualquier elemento visual o animación, preguntar:

```text
¿Hace que el recuerdo se sienta más importante?
¿Hace que la app sea más fácil de usar?
¿Hace que la experiencia se sienta más humana?
```

Si la respuesta a las tres es no:

> no se añade.

---

# 57. Identidad resumida

```text
Our Days
=
editorial
+ cálido
+ íntimo
+ fotografía
+ papel
+ movimiento sutil
+ tecnología invisible
```

El objetivo final es que la aplicación no parezca simplemente bien diseñada.

Debe sentirse como:

> **un lugar que vale la pena conservar.**
