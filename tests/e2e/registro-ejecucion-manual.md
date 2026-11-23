# Registro de ejecución manual E2E

Fecha de ejecución: ____
Ejecutor/a: ____
Commit probado: ____
Base URL: ____
Entorno: local / otro: ____

> No pegar aquí contraseñas, JWT, datos personales reales ni cuerpos que incluyan secretos. Adjuntar evidencia sin encabezado Authorization.

| ID | Resultado esperado | HTTP observado | Resultado (PASS/FAIL/NOT RUN) | Evidencia (archivo o referencia) | Nota |
|---|---|---:|---|---|---|
| VNU-01 | 200 | 200 | PASS | — | GET /api/venues/active, anónimo. Incluye E2E-VENUE con active=true. |
| VNU-02 | 200 | 200 | PASS | - | GET /api/venues/{venuecode}, anónimo; devuelve E2E-VENUE con active=true. |
| ART-01 | 200 | 200 | PASS | - | GET /api/artists/active, anónimo; devuelve 5 artistas activos |
| ART-02 | 200 | 200 | PASS | - | GET /api/artists/1, anónimo; devuelve Solar Beat con active=true |
| ART-03 | 200 | 200 | PASS | - | Consulta por nombre artístico Solar Beat; devuelve el artista activo |
| USR-01 | 201 | 201 | PASS | - | Registro anónimo de USER A; cuenta activa y respuesta sin contraseña |
| USR-02 | 201 | 201 | PASS | - | Registro anónimo de USER B; cuenta activa y respuesta sin contraseña |
| USR-03 | 201 | 201 | PASS | - | Registro anónimo de cuenta de prueba STAFF; creada activa como USER, pendiente asignación local de STAFF |
| USR-04 | 201 | 201 | PASS | - | Registro anónimo de cuenta de prueba ADMIN; creada activa como USER, pendiente asignación local de ADMIN |
| AUTH-01 | 200 | 200 | PASS | - | Login de USER A; recibió token Bearer con vigencia de 900 segundos |
| AUTH-02 | 200 | 200 | PASS | - | GET /api/auth/me; devuelve id, username, email y rol USER de USER A |
| AUTH-03 | 200 | 200 | PASS | - | Login USER B; token recibido y guardado localmente en userBToken |
| AUTH-04 | 200 | 200 | PASS | - | Login STAFF usando staffEmail; recibió accessToken Bearer |
| AUTH-05 | 200 | 200 | PASS | - | Login ADMIN; token recibido y guardado localmente en adminToken |
| AUTH-06 | 401 | 401 | PASS | - | GET /api/auth/me sin token; acceso rechazado |
| USR-05 | 200 | 200 | PASS | - | USER A consulta su propio perfil por email |
| USR-06 | 403 | 403 | PASS | - | USER A intenta consultar el email de USER B; acceso denegado (anti-IDOR) |
| USR-07 | 200 | 200 | PASS | - | USER A consulta su propio perfil por username |
| EVT-01 | 200 | 200 | PASS | - | GET /api/events/published, anónimo |
| EVT-02 | 200 | 200 | PASS | - | Consulta pública de eventos por artista Solar Beat |
| EVT-03 | 201 | 201 | PASS | - | ADMIN crea evento E2E-EVENT-20261122 en estado DRAFT |
| EVT-04 | 200 | 200 | PASS | - | ADMIN consulta E2E-EVENT-20261122; confirma estado DRAFT |
| EVT-05 | 200 | 200 | PASS | - | ADMIN asocia Solar Beat al evento E2E-EVENT-20261122 |
| EVT-06 | 200 | 200 | PASS | - | ADMIN publica E2E-EVENT-20261122; al repetir la solicitud, devuelve 409 porque ya estaba publicado |
| EVT-07 | 403 | 403 | PASS | - | USER A intenta crear evento; acceso denegado |
| EVT-08 | 401 | 401 | PASS | - | GET /api/events/{{draftEventCode}} sin token; acceso denegado
| EVT-09 | 200 | 200 | PASS | - | STAFF consulta los tickets PAID del evento |
| TKT-00 | 201 | 201 | PASS | - | USER B compra un ticket para preparar la prueba anti-IDOR |
| TKT-01 | 201 | 201 | PASS | - | USER A compra un ticket para cancelar |
| TKT-02 | 201 | 201 | PASS | - | USER A compra un ticket para marcar como usado |
| TKT-03 | 200 | 200 | PASS | - | USER A consulta su propio ticket |
| TKT-04 | 200 | 200 | PASS | - | USER A consulta sus tickets |
| TKT-05 | 403 | 403 | PASS | - | USER A intenta comprar para USER B; acceso denegado (anti-IDOR) |
| TKT-06 | 403 | 403 | PASS | - | USER A intenta consultar el ticket de USER B; acceso denegado (anti-IDOR) |
| TKT-07 | 200 | 200 | PASS | - | USER A cancela su propio ticket; queda en estado CANCELLED |
| TKT-08 | 200 | 200 | PASS | - | STAFF marca como usado el ticket de USER A; queda en estado USED |

## Criterio

PASS solo si el HTTP y el contenido cumplen la expectativa. Un error 500 en una ruta nominal es FAIL. Si no se ejecutó en Postman, conservar NOT RUN.
