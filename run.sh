#!/bin/bash

docker build -f service/docker/local/Dockerfile -t cortex-route . && docker run --network=backend \
-p 9000:8080 -p 3478:3478 -p 3479:3479 --privileged --name route-machine -d -i -t cortex-route:latest /bin/bash