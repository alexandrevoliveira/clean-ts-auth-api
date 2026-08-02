FROM node:24-alpine AS builder

WORKDIR /app

# bcrypt has no musl prebuilds, so it is compiled from source here.
RUN apk add --no-cache --virtual .build-deps python3 make g++

COPY package.json package-lock.json ./
# The prepare script runs husky, which needs a .git dir that is not copied here.
RUN npm pkg delete scripts.prepare \
  && npm ci

COPY tsconfig.json tsconfig-build.json ./
COPY ormconfig.js ./
COPY src ./src

RUN npm run build


FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# libstdc++ is required at runtime by the compiled bcrypt binding.
RUN apk add --no-cache libstdc++

COPY package.json package-lock.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
  && npm pkg delete scripts.prepare \
  && npm ci --omit=dev \
  && apk del .build-deps

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
