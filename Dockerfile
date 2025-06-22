FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy everything at once (simpler approach)
COPY . .

# Install dependencies with legacy-peer-deps to handle React conflicts
# We're using --no-optional to skip optional dependencies that might cause issues
RUN npm install --legacy-peer-deps --no-optional

# Generate Prisma client explicitly
RUN npx prisma generate

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
