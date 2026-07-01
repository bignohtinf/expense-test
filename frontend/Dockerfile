# --- deps ---
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- builder ---
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# Enables `output: 'standalone'` in next.config.ts -- only for this Docker build,
# never for Vercel (see next.config.ts comment for why).
ENV DOCKER_BUILD=1
RUN npm run build

# --- runner ---
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cloud Run injects $PORT (defaults to 8080); Next's standalone server.js honors it.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
