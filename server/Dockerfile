# Digital Bridges API — multi-stage build on Node 22 LTS.
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY migrations ./migrations
# tsx is a dev dependency; run the compiled migrate from dist in production.
EXPOSE 4000
# Env comes from the container (compose), so run node directly (no --env-file).
# Apply any pending migrations, then start the API.
CMD ["sh", "-c", "node dist/migrate.js && node dist/index.js"]
