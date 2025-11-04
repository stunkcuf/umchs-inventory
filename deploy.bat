@echo off
echo.
echo 🚀 Deploying Inventory System to Fly.io...
echo.

REM Check if fly CLI is installed
where fly >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Fly CLI not found. Please install it first:
    echo    Visit: https://fly.io/docs/hands-on/install-flyctl/
    exit /b 1
)

REM Check if logged in
echo 📋 Checking Fly.io authentication...
fly auth whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to Fly.io. Please run:
    echo    fly auth login
    exit /b 1
)
echo ✅ Authenticated
echo.

REM Check if volume exists
echo 💾 Checking for persistent volume...
fly volumes list --app umchs-inventory-goypog | findstr "umchs_inventory_data" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Creating persistent volume...
    fly volumes create umchs_inventory_data --size 1 --region ams --app umchs-inventory-goypog
    echo ✅ Volume created
) else (
    echo ✅ Volume already exists
)
echo.

REM Check if JWT_SECRET is set
echo 🔐 Checking JWT secret...
fly secrets list --app umchs-inventory-goypog | findstr "JWT_SECRET" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  JWT_SECRET not set. Please set it manually:
    echo    Generate a secret: powershell -Command "[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))"
    echo    Then run: fly secrets set JWT_SECRET="your-secret-here" --app umchs-inventory-goypog
    pause
) else (
    echo ✅ JWT_SECRET already set
)
echo.

REM Deploy
echo 🚢 Deploying application...
fly deploy --app umchs-inventory-goypog

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Your API is live at: https://umchs-inventory-goypog.fly.dev/api
echo.
echo 🔍 Test it with:
echo    curl https://umchs-inventory-goypog.fly.dev/api/health
echo.
echo 👤 Default login:
echo    Username: admin
echo    Password: admin123
echo    ⚠️  CHANGE THIS IMMEDIATELY!
echo.
echo 📊 View logs:
echo    fly logs --app umchs-inventory-goypog
echo.
pause
