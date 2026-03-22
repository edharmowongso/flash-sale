FROM node:20-alpine

RUN apk add --no-cache openssl
RUN npm install -g pnpm@9.15.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/worker ./apps/worker

RUN pnpm install --frozen-lockfile

# Generate the Prisma client for the current platform (linux/alpine)
RUN pnpm --filter @flash-sale/database db:generate

# Build packages in dependency order
RUN pnpm --filter @flash-sale/shared build
RUN pnpm --filter @flash-sale/database build
RUN pnpm --filter @flash-sale/worker build
RUN test -f apps/worker/dist/index.js || (echo "ERROR: worker dist/index.js not found after build" && exit 1)

ENV NODE_ENV=production
CMD ["node", "apps/worker/dist/index.js"]
