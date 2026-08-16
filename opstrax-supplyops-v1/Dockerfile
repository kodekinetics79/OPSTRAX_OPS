FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./
RUN npm run build \
  && npm prune --omit=dev \
  && npm cache clean --force

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build --chown=node:node /app/ ./
RUN mkdir -p /app/data \
  && chown -R node:node /app

USER node
EXPOSE 10000

CMD ["npm", "start"]
