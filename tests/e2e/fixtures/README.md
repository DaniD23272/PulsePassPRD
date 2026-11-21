# Fixtures locales E2E

Usar solo una base de datos local/desechable. No ejecutar estos cambios en producción ni subir contraseñas, tokens o datos personales. La colección registra usuarios públicamente como USER; **no acepta ni debe enviar un campo role**.

## Preparación

1. Arrancar PostgreSQL y PulsePass con la base de pruebas configurada.
2. En Postman, ajustar los usernames/emails a valores nuevos si ya existen en la base. Usar contraseñas locales de al menos 12 caracteres.
3. Enviar una vez las solicitudes `USR-01` a `USR-04`. Luego iniciar sesión como USER A y USER B para comprobar las credenciales.
4. En la base local, asignar roles de prueba STAFF y ADMIN a las cuentas creadas. La tabla usa `user_id` y `role`; la migración permite USER, STAFF y ADMIN.
5. Crear el venue de prueba con `seed-e2e.sql` o insertar la fila equivalente. Los artistas de V2 incluyen Solar Beat; comprobar su id con `GET /api/artists/active` y actualizar `artistId` si no es 1.
6. Iniciar sesión como STAFF y ADMIN; copiar cada `accessToken` solo a la variable local correspondiente en Postman.

## Asignar roles de prueba

Después de registrar las cuentas, ejecutar en la base **local de pruebas** una consulta equivalente a esta, cambiando los usernames para que coincidan con el entorno Postman:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'STAFF' FROM users WHERE username = 'e2e_staff_20261121'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE username = 'e2e_admin_20261121'
ON CONFLICT (user_id, role) DO NOTHING;
```

No cambiar el código de registro para asignar roles desde una petición pública. Estas cuentas son exclusivamente fixtures para probar permisos.

## Datos ya presentes en el proyecto

- `V2__insert_initial_artists.sql` agrega artistas, incluido `Solar Beat`.
- `V1` crea la tabla `venues`, pero no inserta un venue.
- La fecha del evento debe ser posterior al día de ejecución.
- La compra requiere un evento PUBLISHED, futuro, usuario activo y capacidad disponible.
- La edad mínima del evento de ejemplo es 0 para evitar que la prueba dependa de la edad del usuario.
