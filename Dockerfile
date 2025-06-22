FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./
# Use legacy-peer-deps to handle React version conflicts
RUN npm ci --legacy-peer-deps

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
