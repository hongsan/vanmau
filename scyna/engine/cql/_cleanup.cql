DROP KEYSPACE IF EXISTS scyna2;
CREATE KEYSPACE scyna2 WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy', 'replication_factor' : 1 };
