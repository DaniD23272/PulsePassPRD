# PulsePass

PulsePass es un proyecto académico de persistencia para una plataforma de eventos, artistas y entradas.

El proyecto implementa el modelo de dominio y la capa de persistencia utilizando Java 21, Spring Boot, Spring Data JPA, Hibernate, PostgreSQL y Flyway.

## Tecnologías

- Java 21
- Spring Boot 4.1.1
- Maven
- Spring Data JPA / Hibernate
- PostgreSQL
- Flyway
- Testcontainers
- JUnit 5
- Mockito

## Alcance

El proyecto está enfocado en:

- Persistencia de venues, eventos, artistas, usuarios, perfiles y tickets.
- Relaciones JPA entre las entidades.
- Migraciones de base de datos mediante Flyway.
- Consultas mediante Query Methods de Spring Data.
- Consultas JPQL con `@Query`.
- Pruebas de integración contra PostgreSQL mediante Testcontainers.

La API REST y la capa Service no forman parte del alcance principal del taller de persistencia.

## Modelo de dominio

Las principales entidades son:

- `Venue`
- `Event`
- `Artist`
- `User`
- `UserProfile`
- `Ticket`

Relaciones principales:

```text
Venue 1 ─────── N Event

Event N ─────── M Artist

User 1 ─────── 1 UserProfile

User 1 ─────── N Ticket

Event 1 ─────── N Ticket