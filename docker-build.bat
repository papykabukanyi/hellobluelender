@echo off
REM Docker build script for Windows with dependency fix

set IMAGE_NAME=empire-entreprise
set TAG=latest

echo ==========================================
echo   EMPIRE ENTREPRISE - DOCKER BUILD
echo ==========================================
echo.

echo Building Docker image: %IMAGE_NAME%:%TAG%
echo.

REM Clean up any existing images
echo Cleaning up previous builds...
docker rmi %IMAGE_NAME%:%TAG% 2>nul

echo.
echo Starting build with stable Tailwind v3 Dockerfile...
docker build -f Dockerfile.stable -t "%IMAGE_NAME%:%TAG%" .

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Stable Dockerfile failed, trying Ubuntu...
    docker build -f Dockerfile.ubuntu -t "%IMAGE_NAME%:%TAG%" .
    
    if %errorlevel% neq 0 (
        echo.
        echo ⚠️ Ubuntu Dockerfile failed, trying Alpine with fixes...
        docker build -f Dockerfile.fixed -t "%IMAGE_NAME%:%TAG%" .
        
        if %errorlevel% neq 0 (
            echo.
            echo ⚠️ All enhanced Dockerfiles failed, trying original...
            docker build -t "%IMAGE_NAME%:%TAG%" .
        )
    )
)

if %errorlevel% equ 0 (
    echo.
    echo ✅ Docker build successful!
    echo Image: %IMAGE_NAME%:%TAG%
    echo.
    echo To run the container:
    echo docker run -p 8080:8080 --env-file .env %IMAGE_NAME%:%TAG%
    echo.
    echo To run with environment variables:
    echo docker run -p 8080:8080 -e REDIS_URL="your-redis-url" -e SMTP_USER="your-email" %IMAGE_NAME%:%TAG%
) else (
    echo.
    echo ❌ Docker build failed
    echo.
    echo If the build is still failing, try:
    echo 1. railway up (deploy to Railway instead)
    echo 2. docker build -f Dockerfile.alternative -t %IMAGE_NAME%:%TAG% .
    echo 3. Check the logs above for specific errors
)

echo.
pause
