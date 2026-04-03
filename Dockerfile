FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    pnpm install --frozen-lockfile

FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    pnpm run build:swc
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    pnpm install --frozen-lockfile

FROM base AS runner 
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/LICENSE ./LICENSE

EXPOSE 3000
CMD ["node", "dist/main"]
