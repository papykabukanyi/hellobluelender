@echo off
echo ==========================================
echo   EMPIRE ENTREPRISE - RAILWAY DEPLOYMENT
echo ==========================================
echo.

echo Checking Railway CLI...
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found
    echo Please install: npm install -g @railway/cli
    pause
    exit /b 1
)

echo ✅ Railway CLI found
echo.

echo Checking Railway login status...
railway status >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Railway...
    railway login
)

echo.
echo 🚀 Starting deployment...
echo.

REM Deploy to Railway
railway up

if %errorlevel% equ 0 (
    echo.
    echo ✅ Deployment successful!
    echo.
    echo 📋 Next steps:
    echo 1. Set environment variables in Railway dashboard
    echo 2. Configure custom domain if needed
    echo 3. Check deployment logs: railway logs
    echo.
    echo 🌐 Railway dashboard: https://railway.app/dashboard
) else (
    echo.
    echo ❌ Deployment failed
    echo Check Railway logs: railway logs
)

echo.
pause
