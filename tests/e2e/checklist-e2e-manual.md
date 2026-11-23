# Checklist de ejecución manual

## Antes de enviar solicitudes

- [ ] Rama actual: `End2End`; colección y entorno se importaron en Postman.
- [ ] PostgreSQL y PulsePass están activos; las migraciones Flyway finalizaron sin error.
- [ ] Entorno local seleccionado; base URL apunta a `http://localhost:8080`.
- [ ] Venue `E2E-VENUE` creado y activo.
- [ ] Artista Solar Beat existe; el ID de entorno corresponde a la respuesta actual.
- [ ] USER A, USER B, STAFF y ADMIN existen y pueden iniciar sesión.
- [ ] STAFF/ADMIN se asignaron solo en la base de pruebas.
- [ ] Contraseñas y tokens permanecen fuera del repositorio y de capturas compartidas.

## Flujo funcional

- [ ] Catálogos públicos de venues y artistas.
- [ ] Registro de usuario y respuesta sin contraseña.
- [ ] Login por identificador y consulta de /me.
- [ ] Registro DRAFT, asociación de artista y publicación de evento.
- [ ] Compra de dos tickets distintos para evento publicado.
- [ ] Consulta de tickets, cancelación de uno y uso del otro.

## Seguridad y evidencia

- [ ] Anónimo recibe 401 en /api/auth/me y al consultar un evento DRAFT.
- [ ] USER no puede crear/publicar eventos ni consultar datos/tickets ajenos (403).
- [ ] STAFF/ADMIN pueden usar las operaciones reservadas que contempla el contrato.
- [ ] Sin respuestas 500 en los escenarios nominales.
- [ ] Resultado, código HTTP observado y evidencia se anotaron en el registro.
- [ ] Los casos no ejecutados siguen como NOT RUN; no se marcan PASS por compilación o por una llamada distinta a Postman.
