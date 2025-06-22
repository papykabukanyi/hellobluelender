FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json, package-lock.json, and prisma schema first
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Skip Prisma generate during installation since we'll run it separately
RUN npm ci --legacy-peer-deps --ignore-scripts

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production
ENV PORT=8080

# Build the application with legacy peer dependencies flag
RUN npm run build --legacy-peer-deps

# Expose the listening port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
