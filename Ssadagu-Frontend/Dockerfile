FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY .env.local* .env
RUN [ -s .env ] || (echo "ERROR: .env file is missing or empty! Please check Jenkins Credentials." && exit 1)
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone mode is used
# The standalone folder is created at apps/web/.next/standalone
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/.env ./.env

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is located within the app directory in standalone output
CMD ["node", "apps/web/server.js"]
