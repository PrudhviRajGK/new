# Complete Startup Script for Kraya-AI with Databases

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kraya-AI Complete Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if (-not $dockerInstalled) {
    Write-Host "[ERROR] Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Restart your computer (if Docker just installed)" -ForegroundColor White
    Write-Host "2. Start Docker Desktop" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Docker is installed" -ForegroundColor Green

# Step 2: Check if Docker is running
Write-Host ""
Write-Host "[2/6] Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Start databases
Write-Host ""
Write-Host "[3/6] Starting databases..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "[WAIT] Waiting for databases to initialize (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 4: Check database health
Write-Host ""
Write-Host "[4/6] Checking database health..." -ForegroundColor Yellow

$postgresHealth = docker inspect kraya-postgres --format='{{.State.Health.Status}}' 2>$null
$mongoRunning = docker ps --filter "name=kraya-mongodb" --filter "status=running" --format "{{.Names}}"
$redisRunning = docker ps --filter "name=kraya-redis" --filter "status=running" --format "{{.Names}}"

if ($postgresHealth -eq "healthy" -or $postgresHealth -eq "") {
    Write-Host "[OK] PostgreSQL is ready" -ForegroundColor Green
} else {
    Write-Host "[WARN] PostgreSQL status: $postgresHealth" -ForegroundColor Yellow
}

if ($mongoRunning) {
    Write-Host "[OK] MongoDB is ready" -ForegroundColor Green
} else {
    Write-Host "[ERROR] MongoDB is not running" -ForegroundColor Red
}

if ($redisRunning) {
    Write-Host "[OK] Redis is ready" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Redis is not running" -ForegroundColor Red
}

# Step 5: Run migrations
Write-Host ""
Write-Host "[5/6] Running database migrations..." -ForegroundColor Yellow
Set-Location backend
npm run migrate

Write-Host ""
Write-Host "Seeding database with initial data..." -ForegroundColor Yellow
npm run seed

Set-Location ..

# Step 6: Start services
Write-Host ""
Write-Host "[6/6] Starting services..." -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  PostgreSQL:  localhost:5432" -ForegroundColor White
Write-Host "  MongoDB:     localhost:27017" -ForegroundColor White
Write-Host "  Redis:       localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Terminal 1 - Backend:" -ForegroundColor White
Write-Host "    cd backend" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Terminal 2 - Frontend:" -ForegroundColor White
Write-Host "    cd frontend" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Access:" -ForegroundColor Yellow
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:4000" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:4000/api-docs" -ForegroundColor White
Write-Host ""
Write-Host "Login:" -ForegroundColor Yellow
Write-Host "  Email:     admin@kraya.ai" -ForegroundColor White
Write-Host "  Password:  Admin@123" -ForegroundColor White
Write-Host "  Tenant:    demo-tenant" -ForegroundColor White
Write-Host ""
