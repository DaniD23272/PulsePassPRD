# PulsePass Web

Interfaz React + TypeScript para el backend REST de PulsePass. Esta guía cubre instalación, ejecución local, configuración, roles y rutas implementadas.

## Requisitos

- Node.js `22.22+` (requisito del PRD para React Router 8).
- npm incluido con Node.js.
- PostgreSQL y backend PulsePass activos en `http://localhost:8080`.

## Configuración

La configuración predeterminada usa el proxy local de Vite: las llamadas a `/api` se reenvían al backend en el puerto `8080`.

El servidor de desarrollo queda fijado en `http://localhost:5173`, el origen permitido por CORS en la configuración local del backend. Si ese puerto está ocupado, Vite se detiene con error en vez de cambiar de puerto y dejar que las peticiones fallen por CORS.

```powershell
Copy-Item .env.example .env.local
```

`VITE_API_BASE_URL` es opcional y por defecto vale `/api`. Para un backend local distinto, asigna su URL, por ejemplo `http://localhost:8080`. No guardes secretos ni tokens en archivos `.env` versionados. `.env.example` contiene solo valores de ejemplo.

## Ejecutar en Windows

Desde una terminal en `pulsepass-web/`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abre la URL de Vite que muestra la terminal, normalmente `http://localhost:5173`. Antes, inicia PostgreSQL y el backend desde la raíz del repositorio siguiendo [`README.md`](../README.md#cómo-ejecutar-la-api-localmente). Si el frontend carga pero las consultas fallan, confirma que el backend responda en el puerto `8080`.

## Comprobaciones

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

- `lint`: Oxlint.
- `test`: Vitest + React Testing Library + MSW; las peticiones se interceptan y no usan la API real.
- `build`: TypeScript estricto y bundle de producción.
- La suite incluye una auditoría axe de landmarks, nombres y estructura accesible en Inicio de sesión, Cartelera, Detalle, Mis tickets, STAFF y ADMIN. JSDOM no calcula contraste visual; la inspección visual de colores debe hacerse en navegador.

## Rutas y roles

| Ruta | Acceso | Función |
|---|---|---|
| `/` | Público | Inicio y eventos destacados |
| `/eventos` | Público | Cartelera, filtros por texto, categoría y artista |
| `/eventos/:eventCode` | Público | Detalle y compra de entradas |
| `/artistas` | Público | Artistas activos |
| `/artistas/:id` | Público | Perfil y eventos del artista |
| `/sedes` | Público | Sedes activas |
| `/sedes/:code` | Público | Detalle de sede |
| `/login` | Anónimo | Inicio de sesión |
| `/registro` | Anónimo | Registro de cuenta USER |
| `/cuenta` | Sesión activa | Perfil autenticado |
| `/mis-tickets` | USER | Entradas propias, filtros y cancelación |
| `/mis-tickets/:ticketCode` | USER | Detalle de entrada propia |
| `/compra/confirmacion/:ticketCode` | USER | Confirmación de compra |
| `/staff/validacion` | STAFF, ADMIN | Buscar y usar un ticket pagado |
| `/staff/eventos/:eventCode/tickets` | STAFF, ADMIN | Tickets pagados de un evento |
| `/admin/eventos` | ADMIN | Abrir y gestionar eventos |
| `/admin/eventos/nuevo` | ADMIN | Crear borrador |
| `/admin/eventos/:eventCode` | ADMIN | Asociar artistas y publicar |
| `/403` | Público | Acceso denegado |
| Cualquier ruta desconocida | Público | Página 404 |

Las rutas de página se cargan de forma perezosa, excepto Inicio y Layout. El router usa `createBrowserRouter` y `RouterProvider` de `react-router`/`react-router/dom`.

## Roles de demostración

- El formulario de registro crea cuentas `USER`.
- `STAFF` y `ADMIN` se asignan únicamente en una base local desechable para la demostración; las instrucciones están en [`tests/e2e/fixtures/README.md`](../tests/e2e/fixtures/README.md). No se habilita la selección de rol en el registro público.
- No se incluyen credenciales, contraseñas ni JWT en esta guía.

El JWT se guarda en `sessionStorage` hasta cerrar o expirar la sesión y se envía únicamente en el encabezado `Authorization: Bearer`. Un `401` autenticado limpia la caché privada y devuelve a inicio de sesión.

## Alcance funcional

La interfaz cubre el catálogo de eventos, artistas y sedes; registro e inicio de sesión; perfil; compra/consulta/cancelación de entradas; validación STAFF y administración de eventos. El flujo de entrada crea el ticket en el sistema y **no procesa un cobro en línea**.

### Verificación de edad

Antes de mostrar cualquier ruta, PulsePass solicita la fecha de nacimiento y requiere una edad mínima de 16 años. La decisión se conserva en `sessionStorage` solo durante la sesión del navegador; la fecha ingresada en esta pantalla no se almacena. El registro también valida la edad en el formulario, mientras que el backend vuelve a comprobarla para registro, inicio de sesión y compra de entradas.

### Operaciones API conectadas a la interfaz

- `GET /api/artists/by-stage-name` se activa desde el filtro de artista de `/eventos` al usar `?artista=Nombre`.
- `GET /api/users/by-email` carga el perfil de `/cuenta`.
- `GET /api/users/by-username` completa los datos del titular en `/mis-tickets/:ticketCode`.

Estas operaciones no requieren pantallas independientes: se consumen dentro de flujos existentes.

Los contratos HTTP y el registro de las pruebas manuales del backend están documentados en [`tests/e2e/README.md`](../tests/e2e/README.md) y [`tests/e2e/registro-ejecucion-manual.md`](../tests/e2e/registro-ejecucion-manual.md).
