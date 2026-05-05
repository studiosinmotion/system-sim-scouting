
SELECT
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM
    pg_policies
WHERE
    schemaname = 'public';

SELECT
    relname,
    relrowsecurity
FROM
    pg_class
JOIN
    pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE
    relkind = 'r'
    AND nspname = 'public';
