@echo off
REM Docker build script for Windows with retry logic

set RETRIES=3
set DELAY=30
set IMAGE_NAME=empire-entreprise
set TAG=latest

echo Building Docker image: %IMAGE_NAME%:%TAG%

for /l %%i in (1,1,%RETRIES%) do (
    echo Attempt %%i of %RETRIES%...
    
    REM Try to build the Docker image
    docker build -t "%IMAGE_NAME%:%TAG%" .
    if %errorlevel% equ 0 (
        echo ✅ Docker build successful!
        echo Image: %IMAGE_NAME%:%TAG%
        echo.
        echo To run the container:
        echo docker run -p 8080:8080 --env-file .env %IMAGE_NAME%:%TAG%
        goto :success
    ) else (
        echo ❌ Build failed ^(attempt %%i/%RETRIES%^)
        if %%i lss %RETRIES% (
            echo Waiting %DELAY% seconds before retry...
            timeout /t %DELAY% /nobreak > nul
            set /a DELAY+=30
        )
    )
)

echo ❌ Docker build failed after %RETRIES% attempts
echo.
echo If you're getting rate limiting errors, try:
echo 1. Wait a few hours and try again
echo 2. Use a different Docker registry mirror
echo 3. Sign up for a Docker Hub account for higher rate limits
exit /b 1

:success
exit /b 0
