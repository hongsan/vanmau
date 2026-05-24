USE scyna2;

/*client*/
DROP TABLE IF EXISTS client;
CREATE TABLE client
(
    id          text PRIMARY KEY,
    secret      text,
    name text,
    active      boolean,
    data        text,
);
CREATE INDEX ON client (active);

/*relations*/
DROP TABLE IF EXISTS  client_use_endpoint;
CREATE TABLE  client_use_endpoint
(
    client      text,
    url         text,
    PRIMARY KEY (client, url)
);
