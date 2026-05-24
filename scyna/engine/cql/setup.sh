#!/bin/bash
host=localhost
port=1100
username=cassandra
password=cassandra

files='_cleanup.cql generator.cql domain.cql client.cql trace.cql task.cql data.cql'

for file in $files
do
    echo ${file}
    # cqlsh ${host} ${port} -u ${username} -p ${password} -f ${file}
    cqlsh -f ${file}
done

## create nats stream with name 'scyna'
#nats stream info scyna >/dev/null 2>&1
#if [ $? -eq 0 ]; then
#    echo "Stream 'scyna' already exists."
#else
#    nats stream add --config=stream.json
#    echo "Stream 'scyna' created."
#fi