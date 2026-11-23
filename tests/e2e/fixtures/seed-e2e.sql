-- Ejecutar únicamente en la base de datos local/desechable de E2E.
-- Código sintético; ajustarlo si ya existe o si el nombre real de la columna difiere.
INSERT INTO venues (code, name, city, address, capacity, active)
VALUES ('E2E-VENUE', 'Venue E2E', 'Bogota', 'Direccion de prueba 123', 500, TRUE)
ON CONFLICT (code) DO NOTHING;
