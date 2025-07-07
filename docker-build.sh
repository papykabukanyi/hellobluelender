#!/bin/bash

# Docker build script with retry logic for rate limiting issues

RETRIES=3
DELAY=30
IMAGE_NAME="empire-entreprise"
TAG="latest"

echo "Building Docker image: $IMAGE_NAME:$TAG"

for ((i=1; i<=RETRIES; i++)); do
    echo "Attempt $i of $RETRIES..."
    
    # Try to build the Docker image
    if docker build -t "$IMAGE_NAME:$TAG" .; then
        echo "✅ Docker build successful!"
        echo "Image: $IMAGE_NAME:$TAG"
        echo ""
        echo "To run the container:"
        echo "docker run -p 8080:8080 --env-file .env $IMAGE_NAME:$TAG"
        exit 0
    else
        echo "❌ Build failed (attempt $i/$RETRIES)"
        if [ $i -lt $RETRIES ]; then
            echo "Waiting $DELAY seconds before retry..."
            sleep $DELAY
            # Increase delay for next attempt
            DELAY=$((DELAY + 30))
        fi
    fi
done

echo "❌ Docker build failed after $RETRIES attempts"
echo ""
echo "If you're getting rate limiting errors, try:"
echo "1. Wait a few hours and try again"
echo "2. Use a different Docker registry mirror"
echo "3. Sign up for a Docker Hub account for higher rate limits"
exit 1
