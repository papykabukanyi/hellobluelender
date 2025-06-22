FROM node:18-alpine AS base

# Install dependencies needed for node-canvas
RUN apk add --no-cache --virtual .build-deps \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    python3 \
    musl-dev

# Create app directory  
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code
COPY . .

# Set environment variables for the build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_OPTIONS --max-old-space-size=4096

# Run the cleanup before building
RUN node cleanup.js

# Build the application with verbose output
RUN npm run build

# Production image, copy all the files and run
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only
ENV NODE_ENV production
COPY --from=base /app/package.json /app/package-lock.json* ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.js ./
COPY --from=base /app/server.js ./
COPY --from=base /app/healthcheck.js ./

# Add necessary runtime deps for production image
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    # Additional dependencies that may be needed at runtime
    tzdata \
    ca-certificates

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Set environment variables
ENV PORT 8080
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Expose the listening port
EXPOSE 8080

# Health check to ensure container is ready
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
  CMD node healthcheck.js

# Start the server using the production build
CMD ["node", "server.js"]

# Run this locally with:
# docker build -t hempire-enterprise .
# docker run -p 8080:8080 --env-file .env.local hempire-enterprise
