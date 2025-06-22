FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install build dependencies needed for some npm packages
RUN apk add --no-cache python3 make g++ build-base

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies including optionals, as some are required for build
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production
ENV PORT=8080

# Set CI environment variable to use alternate .next directory
ENV CI=true

# Build the application without using prebuild (cleanup)
# We don't need cleanup in Docker since we start with a clean container
RUN node cleanup.js && npx next build

# Expose the listening port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
