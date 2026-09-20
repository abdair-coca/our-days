# QA — Fase 13

La aplicación tiene una base verificable de performance y resiliencia. Este documento separa las comprobaciones automatizadas de la revisión manual que debe hacerse en un móvil y un escritorio reales antes de producción.

## Quick path

```text
1. npm run lint
2. npx tsc --noEmit --incremental false
3. npm run build -- --webpack
4. npm run start -- -p 3006
5. Revisar /login, /memories, /manifest.webmanifest y /sw.js
```

## Verificado en esta fase

| Área | Resultado | Evidencia |
| --- | --- | --- |
| TypeScript | ✅ | `npx tsc --noEmit --incremental false` |
| Lint | ✅ | `npm run lint` |
| Build de producción | ✅ | `npm run build -- --webpack` |
| Sesión sin autenticar | ✅ | `/memories` redirige a `/login?next=%2Fmemories` |
| Falla de Supabase | ✅ | El runtime ya no vuelve silenciosamente al catálogo demo |
| Error de login/invitación | ✅ | Devuelve mensaje de conexión recuperable |
| URL firmada vencida | ✅ | Renueva una vez y muestra `Reintentar` si vuelve a fallar |
| CLS de fotografías | ✅ | Las tarjetas reservan geometría con `aspect-*` |
| Service worker | ✅ | Solo cachea assets públicos `/_next/static/*`, iconos y manifest |

## Revisión manual antes de producción

- [ ] 360×800 y 430×932: navegación, formulario y bottom navigation sin overflow.
- [ ] 1366×768 y 1440×900: timeline, detalle y formulario sin saltos visibles.
- [ ] Red lenta: skeletons visibles y formularios con estado de guardado.
- [ ] Sin red: errores comprensibles y posibilidad de reintentar.
- [ ] Álbum vacío: CTA para crear el primer recuerdo.
- [ ] Recuerdo sin canción y sin fotos: estados claros y salida a editar.
- [ ] Diez fotos grandes: compresión, progreso y memoria estable.
- [ ] Sesión expirada: acceso devuelto a login sin mostrar datos demo.
- [ ] Invitación inválida o caducada: mensaje específico y navegación recuperable.
- [ ] `prefers-reduced-motion`: no hay loops ni desplazamientos innecesarios.
- [ ] Lighthouse móvil y escritorio: revisar LCP, CLS, INP y peso inicial.

## Fuera de esta fase

La medición real de Core Web Vitals, la instalación standalone en iOS/Android y las pruebas de red física necesitan un navegador y dispositivos reales. Deben completarse antes de la Fase 14 de deploy.
