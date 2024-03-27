FROM docker.io/node:20-alpine as base

LABEL maintainer="Christian Koop <contact@sprax2013.de>"

RUN mkdir -p /app/ && \
    chown -R node:node /app/

USER node
WORKDIR /app/
COPY --chown=node:node package.json package-lock.json README.md LICENSE ./


FROM base as builder

RUN npm clean-install

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node src/ ./src/
RUN npm run build


FROM base as prod

VOLUME /app/storage/

ENV NODE_ENV=production
RUN npm clean-install && \
    npm cache clean --force && \
    rm -Rf /home/node/.npm/

COPY --chown=node:node --from=builder /app/dist/ ./dist/
COPY --chown=node:node resources/ ./resources/

CMD ["node", "dist/main.js"]
