USE scyna2;

DROP TABLE IF EXISTS trace;
CREATE TABLE trace
(
    path        text,
    day         int,
    time        timestamp,
    id          bigint,
    type        smallint,
    session     bigint,
    duration    bigint,
    parent      bigint,
    status      int,
    source      text,
    origin_ip   text,
    PRIMARY KEY ((path,day), time, id)
) WITH CLUSTERING ORDER BY (time DESC);
CREATE INDEX ON  trace(id);
CREATE INDEX ON  trace(parent);

DROP TABLE IF EXISTS endpoint_trace;
CREATE TABLE endpoint_trace
(
    day         int,
    time        timestamp,
    id          bigint,
    request     text,
    response    text,
    status      int,
    session     bigint,
    PRIMARY KEY (day, time, id)
) WITH CLUSTERING ORDER BY (time DESC);
CREATE INDEX ON endpoint_trace(id);

DROP TABLE IF EXISTS log;
CREATE TABLE log
(
    day          int,
    time         timestamp,
    source       bigint,  /*trace_id or session_id*/
    seq          bigint,
    message      text,
    level        smallint,
    PRIMARY KEY (day, time, source, seq)
) WITH CLUSTERING ORDER BY (time DESC);
CREATE INDEX ON log(source);

DROP TABLE IF EXISTS stats;
CREATE TABLE stats
(
    key text PRIMARY KEY,
    value counter
);

DROP TABLE IF EXISTS endpoint_monitor;
CREATE TABLE endpoint_monitor
(
    day         int,
    path        text,
    total       counter,
    error       counter,
    PRIMARY KEY (day, path)
);

-- example for query list top 5 trace in day of monitor_endpoint table:
-- select * from monitor_endpoint where day = 20160101 order by total desc limit 5;
