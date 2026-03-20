FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY .env* ./
RUN if [ -f .env ]; then \
        echo ".env file found"; \
    elif [ -f .env.local ]; then \
        cp .env.local .env; \
        echo ".env.local copied to .env"; \
    else \
        echo "ERROR: .env file is missing or empty! Please check Jenkins Credentials or .env.local file."; \
        exit 1; \
    fi
COPY . .
RUN cp .env apps/web/.env
RUN pnpm install --no-frozen-lockfile
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone mode is used
# The standalone folder is created at apps/web/.next/standalone
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/.env ./apps/web/.env

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is located within the app directory in standalone output
CMD ["node", "apps/web/server.js"]
