# Use a more reliable base image source
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json ./
COPY package-lock.json* ./
RUN npm ci --legacy-peer-deps --production=false || \
    (rm -f package-lock.json && npm install --legacy-peer-deps --production=false)

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production
ENV DOCKER_BUILD=true

# Run cleanup and build
RUN node cleanup.js 2>/dev/null || echo "Cleanup script not found, continuing..."
RUN npm run build

# Debug: List what was actually created
RUN echo "=== Debugging build output ===" && \
    ls -la .next/ && \
    echo "=== Checking for standalone ===" && \
    ls -la .next/standalone/ 2>/dev/null || echo "No standalone directory found" && \
    echo "=== Checking for static ===" && \
    ls -la .next/static/ 2>/dev/null || echo "No static directory found"

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size  
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT=8080

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
