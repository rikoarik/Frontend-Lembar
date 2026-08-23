FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN groupadd --system --gid 10001 nodejs \
  && useradd --system --uid 10001 --gid nodejs appuser
COPY --from=build --chown=appuser:nodejs /app/.next/standalone ./
COPY --from=build --chown=appuser:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=appuser:nodejs /app/public ./public
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
