-- One-time backfill for legacy auth_users data.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'auth_users'
    ) THEN
        INSERT INTO users (
            id,
            email,
            password,
            created_at,
            verified_at,
            verification_token,
            verification_token_expires,
            reset_password_token,
            reset_password_expires
        )
        SELECT
            au.id,
            au.email,
            COALESCE(au.password, ''),
            COALESCE(au.created_at, NOW()),
            COALESCE(au.created_at, NOW()),
            NULL,
            NULL,
            NULL,
            NULL
        FROM auth_users au
        WHERE NOT EXISTS (
            SELECT 1
            FROM users u
            WHERE u.id = au.id OR u.email = au.email
        );
    END IF;
END $$;

SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    COALESCE((SELECT MAX(id) FROM users), 1),
    true
);
