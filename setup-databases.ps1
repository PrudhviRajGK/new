# Kraya-AI Database Setup Script for Windows

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Kraya-AI Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking for Docker..." -ForegroundColor Yellow
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if (-not $dockerInstalled) {
    Write-Host "Docker is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop for Windows:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Install Docker Desktop" -ForegroundColor White
    Write-Host "3. Start Docker Desktop" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Docker is installed!" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting databases with Docker Compose..." -ForegroundColor Yellow
Write-Host ""

# Start databases
docker-compose up -d

Write-Host ""
Write-Host "Waiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check database status
Write-Host ""
Write-Host "Database Status:" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan

$postgresStatus = docker ps --filter "name=kraya-postgres" --format "{{.Status}}"
$mongoStatus = docker ps --filter "name=kraya-mongodb" --format "{{.Status}}"
$redisStatus = docker ps --filter "name=kraya-redis" --format "{{.Status}}"

Write-Host "PostgreSQL: $postgresStatus" -ForegroundColor $(if ($postgresStatus -match "Up") { "Green" } else { "Red" })
Write-Host "MongoDB:    $mongoStatus" -ForegroundColor $(if ($mongoStatus -match "Up") { "Green" } else { "Red" })
Write-Host "Redis:      $redisStatus" -ForegroundColor $(if ($redisStatus -match "Up") { "Green" } else { "Red" })

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Databases are ready!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Yellow
Write-Host "PostgreSQL: localhost:5432 (user: postgres, password: postgres, db: kraya)" -ForegroundColor White
Write-Host "MongoDB:    localhost:27017 (db: kraya)" -ForegroundColor White
Write-Host "Redis:      localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: cd backend" -ForegroundColor White
Write-Host "2. Run: npm run migrate" -ForegroundColor White
Write-Host "3. Run: npm run seed" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""
