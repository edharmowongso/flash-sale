FROM node:20-alpine AS builder

RUN npm install -g pnpm@9.15.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

RUN pnpm install --frozen-lockfile

# Build shared first (backend depends on it), then backend
RUN pnpm --filter @flash-sale/shared build
RUN pnpm --filter @flash-sale/backend build

FROM node:20-alpine AS runner

RUN npm install -g pnpm@9.15.0
WORKDIR /app
ENV NODE_ENV=production

# Copy workspace manifests so pnpm can create the workspace symlinks
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install production deps only — pnpm symlinks @flash-sale/shared → packages/shared
RUN pnpm install --frozen-lockfile --prod

# Inject the built outputs that pnpm symlinks resolve to at runtime
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["node", "dist/index.js"]
