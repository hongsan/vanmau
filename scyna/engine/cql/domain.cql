USE scyna2;

DROP TABLE IF EXISTS module;
CREATE TABLE module
(
    code        text PRIMARY KEY,
    secret      text,
    name        text,
);

DROP TABLE IF EXISTS setting;
CREATE TABLE  setting
(
    module     text,
    key         text,
    value       text,
    PRIMARY KEY (module, key)
);

DROP TABLE IF EXISTS session;
CREATE TABLE  session
(
    module      text,
    id          bigint,
    started     timestamp,
    updated     timestamp,
    ended       timestamp,
    exit_code   int,
    state       text, //RUNNING, STOPPED, FAILED
    PRIMARY KEY (module, id)
) WITH CLUSTERING ORDER BY (id DESC);
CREATE INDEX ON  session (id);
CREATE INDEX ON  session (state);
