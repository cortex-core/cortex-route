FROM node:10-jessie
RUN apt-get update && apt-get install sudo nano
RUN adduser node sudo
RUN echo "node:node" | chpasswd
RUN mkdir -p /home/node/cortex-route && chown -R node:node /home/node/cortex-route
WORKDIR /home/node/cortex-route
RUN npm install -g lerna
COPY --chown=node:node . .
RUN lerna bootstrap
EXPOSE 3478 3479
COPY --chown=node:node service/docker/local/entrypoint.sh .
ENTRYPOINT ["/home/node/cortex-route/entrypoint.sh"]
CMD ["init_alias"]