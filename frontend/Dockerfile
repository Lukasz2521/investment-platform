# syntax=docker/dockerfile:1

# Build either Angular app:
#   docker build --build-arg APP_NAME=client-app -t client-app .
#   docker build --build-arg APP_NAME=admin-app -t admin-app .

ARG APP_NAME=client-app

FROM oven/bun:1.3-debian AS build

ARG APP_NAME
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# `docker` config: static SPA output (admin disables SSR for nginx serving)
RUN bun run ng build "${APP_NAME}" --configuration=docker

FROM nginx:1.27-alpine AS runtime

ARG APP_NAME
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/${APP_NAME}/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
