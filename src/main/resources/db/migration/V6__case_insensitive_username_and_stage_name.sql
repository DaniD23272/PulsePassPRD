CREATE UNIQUE INDEX ux_users_username_lower ON users (LOWER(username));
CREATE UNIQUE INDEX ux_artists_stage_name_lower ON artists (LOWER(stage_name));
