#!/bin/bash

docker build -f service/docker/local/Dockerfile -t cortex-route . && docker run --network=backend \
-p 8000:8000 --privileged --name route-machine -d -i -t cortex-route:latest /bin/bash