# Registro de ejecución manual E2E

Fecha de ejecución: ____
Ejecutor/a: ____
Commit probado: ____
Base URL: ____
Entorno: local / otro: ____

> No pegar aquí contraseñas, JWT, datos personales reales ni cuerpos que incluyan secretos. Adjuntar evidencia sin encabezado Authorization.

| ID | Resultado esperado | HTTP observado | Resultado (PASS/FAIL/NOT RUN) | Evidencia (archivo o referencia) | Nota |
|---|---|---:|---|---|---|
| VNU-01 | 200 | — | NOT RUN | — | |
| VNU-02 | 200 | — | NOT RUN | — | |
| ART-01 | 200 | — | NOT RUN | — | |
| ART-02 | 200 | — | NOT RUN | — | |
| ART-03 | 200 | — | NOT RUN | — | |
| AUTH-01–05 | 200 | — | NOT RUN | — | completar por actor |
| AUTH-06 | 401 | — | NOT RUN | — | sin token |
| USR-01–04 | 201 | — | NOT RUN | — | roles públicos USER |
| USR-05 | 200 | — | NOT RUN | — | propio |
| USR-06 | 403 | — | NOT RUN | — | anti-IDOR |
| USR-07 | 200 | — | NOT RUN | — | propio |
| EVT-01–02 | 200 | — | NOT RUN | — | públicos |
| EVT-03 | 201 | — | NOT RUN | — | ADMIN, crea DRAFT |
| EVT-04–05 | 200 | — | NOT RUN | — | ADMIN |
| EVT-06 | 200 | — | NOT RUN | — | ADMIN, publica |
| EVT-07 | 403 | — | NOT RUN | — | USER |
| EVT-08 | 401 | — | NOT RUN | — | anónimo, DRAFT |
| EVT-09 | 200 | — | NOT RUN | — | STAFF |
| TKT-01–02 | 201 | — | NOT RUN | — | tickets separados |
| TKT-03–04 | 200 | — | NOT RUN | — | propietario |
| TKT-05–06 | 403 | — | NOT RUN | — | anti-IDOR |
| TKT-07–08 | 200 | — | NOT RUN | — | CANCELLED / USED |

## Criterio

PASS solo si el HTTP y el contenido cumplen la expectativa. Un error 500 en una ruta nominal es FAIL. Si no se ejecutó en Postman, conservar NOT RUN.
