# ---------- build ----------
FROM node:22 AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only needed files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


# ---------- production ----------
FROM node:22-slim

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only needed files
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist

COPY server/package.json ./server/

# install only prod deps for server
RUN pnpm install --prod --filter server

HEALTHCHECK CMD curl --fail http://localhost:1337 || exit 1

EXPOSE 1337
CMD ["node", "server/dist/server.js"]