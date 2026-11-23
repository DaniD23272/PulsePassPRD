# PulsePass

PulsePass es una plataforma académica para consultar venues, eventos y artistas, registrar usuarios y gestionar entradas. El proyecto integra persistencia relacional, reglas de negocio y una API REST.

## Tecnologías

- Java 21 y Spring Boot 4.1.1
- Maven
- Spring Web MVC y Bean Validation
- Spring Data JPA / Hibernate
- PostgreSQL y Flyway
- MapStruct 1.6.3 para el mapeo de DTOs
- JUnit 5, Mockito, AssertJ y MockMvc
- Testcontainers para pruebas de integración con PostgreSQL

## Arquitectura

El proyecto separa responsabilidades en tres capas principales:

- **Persistencia:** entidades JPA, relaciones, repositories y migraciones Flyway.
- **Service:** reglas de negocio, transacciones, DTOs y mapeo de respuestas.
- **Controller:** API REST, validación de solicitudes HTTP y traducción de errores a respuestas HTTP.

Las respuestas de la API utilizan DTOs; los controllers no exponen directamente entidades JPA ni acceden a repositories.

## Requisitos previos

- JDK 21.
- Docker en ejecución para las pruebas de integración que utilizan Testcontainers.
- PostgreSQL disponible para ejecutar la aplicación localmente.

## Cómo ejecutar las pruebas

Desde la raíz del repositorio:

```bash
./mvnw clean test
```

Este comando ejecuta las pruebas unitarias y de controller descubiertas por Surefire.

Para una verificación completa en una sola ejecución, incluyendo todas las clases de integración terminadas en `IT`, usa:

```bash
./mvnw clean verify
```

Maven Failsafe ejecuta las pruebas de integración durante las fases `integration-test` y `verify`. Estas pruebas utilizan PostgreSQL mediante Testcontainers, por lo que Docker debe estar instalado y en ejecución. Si `clean verify` falla, revisa si el error corresponde a compilación, pruebas unitarias/controller o integración con PostgreSQL.

En Windows puedes ejecutar el wrapper desde PowerShell con `.\mvnw.cmd` o desde Git Bash con `./mvnw`.

## Cómo ejecutar la API localmente

Configura una base de datos PostgreSQL y las siguientes variables de entorno antes de iniciar la aplicación. Sustituye los valores de ejemplo por los de tu entorno.

En Git Bash, Linux o macOS:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/pulsepass
export DB_USER=postgres
export DB_PASSWORD=tu_clave
export PULSEPASS_JWT_SECRET_BASE64="$(openssl rand -base64 32)"
./mvnw spring-boot:run
```

En PowerShell:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/pulsepass"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "tu_clave"
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($bytes)
$rng.Dispose()
.\mvnw.cmd spring-boot:run
```

La base indicada debe existir y las credenciales deben tener permisos suficientes para que Flyway ejecute las migraciones y JPA acceda al esquema. El secreto JWT se genera localmente y no debe guardarse en Git.

La configuración de la aplicación establece `spring.jpa.hibernate.ddl-auto=validate`: Flyway crea/evoluciona el esquema y Hibernate valida su correspondencia con las entidades, sin generar ni modificar tablas. Las migraciones V1–V5 crean el modelo, los datos iniciales, `streaming_url`, restricciones de integridad y las tablas de credenciales y roles.

## Endpoints REST

La API expone 20 operaciones de negocio y 2 de autenticación mediante los siguientes endpoints.

### Venues

| Método | Endpoint | Respuesta exitosa |
|---|---|---|
| GET | `/api/venues/{code}` | 200 OK |
| GET | `/api/venues/active` | 200 OK |

### Eventos

| Método | Endpoint | Respuesta exitosa |
|---|---|---|
| POST | `/api/events` | 201 Created |
| GET | `/api/events/{eventCode}` | 200 OK |
| GET | `/api/events/published` | 200 OK |
| PATCH | `/api/events/{eventCode}/publish` | 200 OK |
| POST | `/api/events/{eventCode}/artists/{artistId}` | 200 OK |
| GET | `/api/events/by-artist?stageName=...` | 200 OK |

### Artistas

| Método | Endpoint | Respuesta exitosa |
|---|---|---|
| GET | `/api/artists/{id}` | 200 OK |
| GET | `/api/artists/by-stage-name?stageName=...` | 200 OK |
| GET | `/api/artists/active` | 200 OK |

### Usuarios

| Método | Endpoint | Respuesta exitosa |
|---|---|---|
| POST | `/api/users` | 201 Created |
| GET | `/api/users/by-email?email=...` | 200 OK |
| GET | `/api/users/by-username?username=...` | 200 OK |

### Autenticación

La API usa tokens JWT Bearer. El inicio de sesión devuelve un token con vigencia de 900 segundos; las rutas protegidas requieren enviarlo en el encabezado `Authorization`. Los roles `USER`, `STAFF` y `ADMIN` controlan el acceso.

| Método | Endpoint | Respuesta exitosa |
|---|---|---|
| POST | `/api/auth/login` | 200 OK |
| GET | `/api/auth/me` | 200 OK |

En las pruebas E2E, `STAFF` y `ADMIN` se asignan solo en la base local de pruebas. Consulta `tests/e2e/fixtures/README.md`.

### Tickets

| Método | Endpoint | Respuesta exitosa |
|---|---|---|
| POST | `/api/tickets` | 201 Created |
| GET | `/api/tickets/{ticketCode}` | 200 OK |
| GET | `/api/tickets/by-user?email=...` | 200 OK |
| GET | `/api/events/{eventCode}/tickets/paid` | 200 OK |
| PATCH | `/api/tickets/{ticketCode}/cancel` | 200 OK |
| PATCH | `/api/tickets/{ticketCode}/use` | 200 OK |

## Validación y manejo de errores

Las solicitudes se validan antes de llamar al Service. El `GlobalExceptionHandler` devuelve respuestas con una estructura común `ErrorResponse`.

- **400 Bad Request:** validación de campos o JSON mal formado.
- **404 Not Found:** recurso no encontrado.
- **409 Conflict:** recurso duplicado o regla de negocio incumplida.
- **500 Internal Server Error:** error inesperado, sin exponer detalles internos.

Las pruebas de controller utilizan `@WebMvcTest`, `@MockitoBean` y `MockMvc` para comprobar códigos HTTP, contenido JSON y delegación a los servicios.

## Modelo de dominio

Las entidades principales son `Venue`, `Event`, `Artist`, `User`, `UserProfile` y `Ticket`.

Relaciones principales:

```text
Venue 1 ─────── N Event
Event N ─────── M Artist
User 1 ─────── 1 UserProfile
User 1 ─────── N Ticket
Event 1 ─────── N Ticket
```

## Pruebas E2E manuales

La colección Postman, el entorno local, los fixtures y el registro de resultados están en [`tests/e2e`](tests/e2e/README.md). La guía registra los errores encontrados durante la ejecución y cómo se resolvieron; no incluye contraseñas ni tokens.

## Alcance actual

El backend incluye persistencia con PostgreSQL y Flyway, servicios, API REST, validación HTTP, autenticación JWT, autorización por roles y pruebas unitarias, de controller, integración y E2E manual.
