# Matriz de cobertura manual

Los códigos HTTP son las expectativas para las solicitudes válidas descritas en la colección. Los negativos están separados. Todos los escenarios inician **NOT RUN** hasta enviarlos manualmente desde Postman.

| # | Método y ruta | Actor | Esperado | Solicitud |
|---:|---|---|---|---|
| 1 | GET /api/venues/active | Anónimo | 200 | VNU-01 |
| 2 | GET /api/venues/{code} | Anónimo | 200 | VNU-02 |
| 3 | GET /api/artists/active | Anónimo | 200 | ART-01 |
| 4 | GET /api/artists/{id} | Anónimo | 200 | ART-02 |
| 5 | GET /api/artists/by-stage-name | Anónimo | 200 | ART-03 |
| 6 | POST /api/auth/login | USER/STAFF/ADMIN | 200 | AUTH-01, AUTH-03–05 |
| 7 | GET /api/auth/me | Autenticado | 200 | AUTH-02 |
| 8 | POST /api/users | Anónimo | 201 | USR-01–04 |
| 9 | GET /api/users/by-email | Propio | 200 | USR-05 |
| 10 | GET /api/users/by-username | Propio | 200 | USR-07 |
| 11 | GET /api/events/published | Anónimo | 200 | EVT-01 |
| 12 | GET /api/events/by-artist | Anónimo | 200 | EVT-02 |
| 13 | POST /api/events | ADMIN | 201 | EVT-03 |
| 14 | GET /api/events/{eventCode} | ADMIN / STAFF / publicado | 200 | EVT-04 |
| 15 | POST /api/events/{eventCode}/artists/{artistId} | ADMIN | 200 | EVT-05 |
| 16 | PATCH /api/events/{eventCode}/publish | ADMIN | 200 | EVT-06 |
| 17 | GET /api/events/{eventCode}/tickets/paid | STAFF / ADMIN | 200 | EVT-09 |
| 18 | POST /api/tickets | USER propietario | 201 | TKT-01/02 |
| 19 | GET /api/tickets/{ticketCode} | Propietario / STAFF / ADMIN | 200 | TKT-03 |
| 20 | GET /api/tickets/by-user?email=… | Propietario / ADMIN | 200 | TKT-04 |
| 21 | PATCH /api/tickets/{ticketCode}/cancel | Propietario / ADMIN | 200 | TKT-07 |
| 22 | PATCH /api/tickets/{ticketCode}/use | STAFF / ADMIN | 200 | TKT-08 |

## Controles negativos

| Solicitud | Actor | Esperado | Riesgo revisado |
|---|---|---:|---|
| AUTH-06: GET /api/auth/me sin token | Anónimo | 401 | Autenticación |
| USR-06: consultar email de otra persona | USER A | 403 | Anti-IDOR |
| EVT-07: crear evento | USER | 403 | Autorización por rol |
| EVT-08: ver evento DRAFT | Anónimo | 401 | Recurso protegido |
| TKT-05: comprar para otra persona | USER A | 403 | Anti-IDOR |
| TKT-06: leer ticket de USER B | USER A | 403 | Anti-IDOR |
