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

## Contenido

- `postman/`: colección v2.1 y entorno local con secretos vacíos.
- `fixtures/README.md`: datos iniciales, cuentas y asignación local de roles.
- `fixtures/seed-e2e.sql`: creación idempotente del venue sintético.
- `matriz-cobertura-rutas-roles.md`: rutas, roles y resultado esperado.
- `checklist-e2e-manual.md` y `registro-ejecucion-manual.md`: preparación y evidencia.
