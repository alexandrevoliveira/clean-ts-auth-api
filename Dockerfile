FROM node:18-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig-build.json ./
COPY ormconfig.js ./
COPY src ./src

RUN npm run build


FROM node:18-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY ormconfig.js ./

ENV PORT=8080
ENV DB_HOST=clean-ts-auth-pg
ENV DB_PORT=5432
ENV DB_USERNAME=clean_ts_auth
ENV DB_PASSWORD=clean_ts_auth_dev
ENV DB_DATABASE=clean_ts_auth_api
ENV JWT_SECRET=change-me-in-production

EXPOSE 8080

CMD ["node", "-r", "dotenv/config", "dist/main/server.js"]
