SELECT
    pid,
    usename,
    datname,
    application_name,
    client_addr,
    backend_start,
    state,
    query
FROM
    pg_stat_activity
ORDER BY
    backend_start;

/*

SELECT pg_terminate_backend(21003);

*/

SELECT version();
