ALTER TABLE events ALTER COLUMN event_date TYPE TIMESTAMP USING event_date::timestamp;
