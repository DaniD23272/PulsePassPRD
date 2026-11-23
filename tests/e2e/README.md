# E2E manual de PulsePass

## Propósito

Esta carpeta contiene la colección manual Postman y el registro de la validación de las **22 rutas del backend**: 20 operaciones de negocio y 2 de autenticación. Se ejecutan enviando cada solicitud con **Send** y comparando la respuesta con lo esperado. Los archivos no ejecutan pruebas por sí solos.

## Reglas de ejecución

- Importar `postman/PulsePass-Manual-E2E.postman_collection.json` y `postman/PulsePass-local.postman_environment.json` en Postman.
- Seleccionar el entorno `PulsePass - local (manual)` y completar contraseñas solo en Postman local. No guardar contraseñas, JWT ni datos personales reales en Git.
- No hay pre-request scripts ni test scripts. No usar Newman, CLI ni Collection Runner para esta entrega.
- Preparar las cuentas y datos siguiendo `fixtures/README.md`.
- En el orden de trabajo: registrar cuentas → asignar STAFF/ADMIN solo en la base local de pruebas → iniciar sesión con cada actor → preparar venue → crear evento DRAFT → asociar artista → publicar → comprar tickets → probar consulta, cancelación y uso.
- Copiar manualmente los tokens de la respuesta de login a las variables `userAToken`, `userBToken`, `staffToken` y `adminToken`. Copiar los códigos de ticket de las respuestas a las variables que indica cada descripción. No se automatiza la captura porque la colección no incluye scripts.
- Repetir la ejecución con nombres/códigos únicos si la base conserva registros de una ejecución anterior. El teléfono/fecha son datos sintéticos de prueba.
- Registrar cada resultado en `registro-ejecucion-manual.md`. Dejar como **NOT RUN** lo que todavía no se haya enviado desde Postman. Las llamadas exploratorias hechas con PowerShell no cuentan como ejecución Postman.

## Interpretación

Un resultado HTTP 500 es un fallo inesperado. En caso de diferencia, guardar el request, actor, código y cuerpo de respuesta (sin compartir tokens ni contraseñas), y anotarlo como FAIL. No cambiar el resultado esperado para hacer coincidir un comportamiento incorrecto.

## Bitácora de la ejecución manual

Ejecución local realizada entre el 20 y el 23 de noviembre de 2026 contra `http://localhost:8080`, con PostgreSQL en Docker y la base de pruebas `pulsepass_e2e`. El detalle por solicitud está en `registro-ejecucion-manual.md`. Las 36 solicitudes de la colección terminaron con el resultado esperado.

### Errores encontrados y solución

| Situación | Solución aplicada y resultado |
|---|---|
| El backend no arrancaba porque el puerto 8080 ya estaba ocupado. | Se identificó el proceso Java que ya escuchaba en el puerto, se detuvo la instancia anterior y se inició una sola instancia. |
| Se intentó ejecutar el wrapper Maven con una ruta incorrecta o desde `pulsepass-web`. | El wrapper del backend está en la raíz del repositorio. En PowerShell se ejecutó desde allí con `.\mvnw.cmd spring-boot:run`. |
| La compilación de pruebas falló porque `UserServiceImplTest` construía `RegisterUserRequest` con un argumento menos que el record actual. | Se actualizó el fixture de la prueba para incluir el parámetro requerido; después la compilación avanzó y la aplicación inició. |
| Flyway encontró un choque de versiones después de integrar `main`: ambas ramas tenían una migración V4 distinta. | La migración de seguridad se renumeró como V5. La base E2E confirmó las migraciones 1 a 5 con `success = true`. |
| Postman mostró `ECONNREFUSED` al consultar `localhost:8080`. | La aplicación estaba detenida. Se inició PostgreSQL y luego Spring Boot; Postman pudo conectarse. |
| `GET /api/venues/active` devolvía `[]` aunque el endpoint respondía 200. | Faltaba el venue sintético en la base E2E. Se cargó el fixture y la respuesta incluyó `E2E-VENUE`; `VNU-02` también lo encontró por código. |
| El registro de usuario devolvió 400 por una contraseña menor al mínimo de 12 caracteres. | Se corrigió el valor local de la variable de contraseña en Postman y el registro devolvió 201. La contraseña no se guarda en el repositorio. |
| PowerShell produjo un error de análisis al pegar dos instrucciones juntas (`$response.Content` y `$loginBody`). | Se ejecutaron las asignaciones por separado, se construyó el JSON de login y se recibió el token correctamente. |
| Un login de STAFF usando username/identifier devolvió 401. | Se usó el correo de STAFF (`staffEmail`), con el que `AUTH-04` devolvió 200 y un token Bearer. |
| `USR-04` devolvió 409 al repetir el registro de una cuenta ya creada. | La primera ejecución había creado la cuenta con 201. El 409 posterior indicó duplicidad; las cuentas repetidas requieren valores únicos o reiniciar la base local de pruebas. |
| `EVT-03` devolvió 400 Malformed request y un intento posterior devolvió 401. | Se corrigieron el cuerpo JSON y las variables del evento, y se usó una sesión ADMIN válida. La creación terminó en 201 y el evento quedó DRAFT. |
| Solicitudes protegidas devolvieron 401 cuando faltaba el Bearer token, el token había vencido o no se había actualizado. | Se ejecutó el login del actor correspondiente y se renovó su token. El 401 de `AUTH-06`, que se envía sin token, sí era el resultado esperado. |
| `EVT-09` devolvió 403 porque la cuenta elegida para STAFF solo tenía el rol `USER` en la base E2E. | Se asignó `STAFF` a esa cuenta únicamente en `pulsepass_e2e` y se renovó el token con `AUTH-04`. `EVT-09` respondió 200. |
| Repetir `EVT-06` después de publicar el evento devolvió 409. | La primera solicitud ya había publicado el evento con 200. El 409 ocurrió al repetir una transición ya aplicada; se conservó el resultado exitoso original. |
| Una URL de Postman incluía el texto `GET` antes de `http://...` y devolvió `Invalid protocol`. | Se dejó solo la URL en el campo de dirección y el método HTTP en el selector de Postman. La consulta correcta respondió 200. |

También se reportaron respuestas 500 durante las primeras pruebas de seguridad. No quedó un stack trace completo asociado a cada respuesta para atribuirles una causa concreta. Las solicitudes incluidas en el registro final se ejecutaron después y cumplieron sus resultados esperados.

### Resultado final

- `VNU-01`–`VNU-02`, `ART-01`–`ART-03`: PASS.
- `USR-01`–`USR-07`, `AUTH-01`–`AUTH-06`: PASS.
- `EVT-01`–`EVT-09`: PASS.
- `TKT-00`–`TKT-08`: PASS, incluidos los controles anti-IDOR, la cancelación (`CANCELLED`) y el uso (`USED`).

Los códigos 401 y 403 de los casos negativos se consideran PASS cuando coinciden con el resultado esperado. Los 409 de reintentos se documentan como incidencias de repetición y no reemplazan la primera respuesta exitosa.

## Contenido

- `postman/`: colección v2.1 y entorno local con secretos vacíos.
- `fixtures/README.md`: datos iniciales, cuentas y asignación local de roles.
- `fixtures/seed-e2e.sql`: creación idempotente del venue sintético.
- `matriz-cobertura-rutas-roles.md`: rutas, roles y resultado esperado.
- `checklist-e2e-manual.md` y `registro-ejecucion-manual.md`: preparación y evidencia.
