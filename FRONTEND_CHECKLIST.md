# Verificación del frontend contra el PRD

Fuente de requisitos: `PRD_PulsePass_Frontend_React_TypeScript_Tailwind (1).pdf`, principalmente las secciones 10.3, 12–16, 21, 23 y 30.2. Este registro describe el código de `pulsepass-web/`; no se ha creado commit ni se ha subido nada al repositorio remoto.

## Definition of Done — sección 30.2

| Requisito del PRD | Estado | Evidencia |
|---|---|---|
| 20 rutas/páginas; carga perezosa excepto Inicio y Layout | Implementado | `pulsepass-web/src/App.tsx`; Inicio y Layout son las únicas páginas/layout importados de forma síncrona. |
| `createBrowserRouter` y `RouterProvider` de `react-router/dom`; sin `react-router-dom` | Implementado | `pulsepass-web/src/App.tsx`; `rg` no encuentra `react-router-dom`. |
| 20 operaciones de Fase 3 y 3 endpoints de Fase 4 invocables desde la UI | Implementado | Clientes por funcionalidad en `pulsepass-web/src/features/{artistas,auth,eventos,sedes,tickets,usuarios}/api.ts`; Registro invoca `POST /api/users`. |
| Tipos derivados de Zod y respuestas de API validadas | Implementado | Esquemas `zod` en los clientes de cada funcionalidad; cada función que procesa una respuesta aplica `.parse()`. |
| Formularios con React Hook Form y Zod | Implementado | Login, registro, compra, creación/gestión de eventos, búsquedas y validación STAFF usan `useForm` y `zodResolver`. |
| JWT solo en memoria/sessionStorage y enviado en `Authorization` | Implementado | `pulsepass-web/src/features/auth/AuthProvider.tsx` y `pulsepass-web/src/lib/http.ts`; token fuera de URL y `localStorage`. |
| Guardas de sesión y rol; respetar `401`/`403` del servidor | Implementado | `pulsepass-web/src/layouts/Guards.tsx`; respuestas HTTP no se sustituyen por una autorización inferida en el cliente. |
| `401` cierra sesión, limpia caché privada y redirige a login | Implementado y probado | `pulsepass-web/src/lib/http.ts`, `AuthProvider.tsx` y `pulsepass-web/src/lib/http.test.ts`. |
| Estados de error para `400`, `401`, `403`, `404`, `409` y `500` | Implementado | Errores normalizados como `ApiError`; las páginas muestran mensajes según la operación y ofrecen reintento donde aplica. |
| Compra usa el correo de la sesión, no un campo editable | Implementado | `EventoDetallePage.tsx` obtiene `userEmail` de la sesión al crear el ticket. |
| Reglas de negocio fuera de los componentes | Implementado | Reglas de disponibilidad/cancelación/publicación en módulos de políticas por funcionalidad. |
| Estados de carga, vacío y error en pantallas de datos | Implementado | Catálogos, detalle de evento/artista/sede, tickets y vistas STAFF/ADMIN tienen estados explícitos. |
| Clases Tailwind estáticas | Implementado | Variantes visuales usan mapas de clases; no se interpolan fragmentos dinámicos de Tailwind. |
| Vistas coherentes con los diseños de la sección 9.0 | Revisado parcialmente | Comparadas referencias de Inicio, layout, cartelera, evento, tickets, artistas, login, cuenta y administración. Se alinearon categorías/estados crudos de la API, el CTA anónimo de compra, tarjetas de tickets a dos columnas, lista de sesiones, formulario compacto de creación y composición de gestión de evento. La navegación ubica “Mis tickets” en el menú de cuenta. Falta una pasada visual manual de todas las rutas. |
| Móvil (390 px) y tema oscuro | Parcialmente verificado | Se emuló Inicio de sesión a 390 px sin desbordamiento horizontal; hay estilos `dark:` en las vistas. Falta recorrer en móvil detalle, tickets, administración y probar el cambio de tema visualmente. |
| Responsive desde 360 px y navegación por teclado | Parcialmente verificado | Inicio de sesión se comprobó a 360 y 390 px sin desbordamiento; Registro se observó a 360 px. El menú móvil tiene prueba automatizada de cierre con Escape y navegación; falta una pasada manual de teclado y revisar el resto de rutas en 360 px. |
| Accesibilidad WCAG 2.1 AA | Parcialmente verificado | Se ejecuta axe en 7 vistas para nombres, estructura y landmarks; axe no calcula contraste en JSDOM. Se corrigieron los textos de marca en modo oscuro para subir el contraste, pero falta una auditoría visual completa de contraste y teclado. |
| Sin `any`, `React.FC`, `localStorage` para JWT ni `dangerouslySetInnerHTML` con datos API | Verificado | TypeScript estricto; búsqueda estática en el código fuente no encontró esos patrones prohibidos. |
| Pruebas con Vitest, Testing Library y MSW | Verificado | `npm.cmd test -- --reporter=dot`: **11 archivos y 77 pruebas pasan**. Solicitudes sin handler fallan en vez de salir a la red. |
| `lint`, `build` y `test` finalizan sin errores | Verificado | `npm.cmd run lint`, `npm.cmd run build` y `npm.cmd test -- --reporter=dot` terminan con código 0. |
| No incluir secretos; entregar `.env.example` | Verificado en frontend | Existe `pulsepass-web/.env.example`; `.gitignore` excluye `.env` y `.env.*` excepto ese ejemplo; no se encontraron JWT literales en el código fuente. |
| README documenta variables, comandos, roles y rutas | Verificado | `pulsepass-web/README.md` y el README raíz enlazan la guía y esta matriz. |
| Lighthouse Performance ≥80 | Sin medir | Esta sesión no contó con Lighthouse instalado. |
| Compatibilidad con las dos últimas versiones de navegadores requeridas | Sin medir | No se ejecutó una matriz de navegadores. |

## Comprobaciones realizadas el 24 de noviembre de 2026

- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto; se generan chunks separados para las rutas con carga perezosa.
- `npm.cmd test -- --reporter=dot`: 77/77 pruebas correctas en 11 archivos.
- El 24 de noviembre, `npm.cmd run lint`, `npm.cmd run build` y `npm.cmd test -- --reporter=dot` volvieron a terminar correctamente: 77/77 pruebas.
- Comparadas las referencias visuales de las secciones 9.2, 9.3, 9.5 y 9.11 con el código; se alinearon navbar, detalle de evento y lista de tickets. La prueba del comprador anónimo ahora comprueba la redirección a login y el estado `desde` para regresar al evento.
- Comparadas las referencias de artistas (9.6–9.7), login (9.8) y cuenta (9.11): paleta de avatares, eventos asociados con `EventoCard`, etiqueta del login, revelar contraseña y acción “Cerrar sesión” en la cuenta.
- Comparadas las capturas de cartelera y administración (9.2, 9.16–9.18): categorías y estados de API en tarjetas; creación compacta con contador `0/500`; gestión con estado, publicación, artistas con iniciales y enlace de tickets pagados. Las tarjetas de “Mis tickets” también siguen la composición de dos columnas del diseño.
- Se corrigió MSW para rechazar solicitudes sin handler y se agregaron respuestas de evento/sede a la prueba de eventos asociados a un artista.
- En navegador `http://localhost:5173`, Inicio y detalle de un evento real cargaron sus datos; no se hicieron flujos de compra, administración ni STAFF en esta revisión.
- En sesiones previas, Edge emuló Login a 360/390 px y Registro a 360 px; la vista de Login no presentó desplazamiento horizontal.
- `mvnw.cmd clean verify`: BUILD SUCCESS; 193 pruebas del ciclo Surefire y 115 pruebas de integración del ciclo Failsafe, todas sin fallas ni errores.
- Testcontainers inició una base PostgreSQL 16.15 temporal y Flyway aplicó correctamente las 7 migraciones. Tras la prueba, `docker ps` mostró únicamente el contenedor de desarrollo `pulsepass-postgres`.
- En esta máquina, Testcontainers requirió `DOCKER_HOST=npipe:////./pipe/dockerDesktopLinuxEngine` y `EnvironmentAndSystemPropertyClientProviderStrategy`; se pasaron solo al proceso Maven y no se cambió la configuración global de Docker.
- No se hizo `git add`, commit, push ni creación de Pull Request.

## Límites de medición

No se inventa un resultado: Lighthouse Performance ≥80 y la matriz de navegadores siguen sin medir. La auditoría automatizada con axe cubre siete vistas y no se presenta como certificación WCAG AA: JSDOM no mide contraste visual. La implementación responsive y de modo oscuro está en el código, pero falta comprobar visualmente los viewports emulados de 360/390 px. El backend respondió a las consultas de Inicio y detalle observadas en el navegador; las rutas protegidas y mutaciones no se repitieron manualmente en esta revisión.
