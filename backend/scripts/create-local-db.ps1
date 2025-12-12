# PowerShell script to create database in local PostgreSQL
# This is needed if you have a local PostgreSQL service running on port 5432

Write-Host "Creating database in local PostgreSQL instance..." -ForegroundColor Yellow
Write-Host "Note: This requires psql to be in your PATH or PostgreSQL bin directory accessible" -ForegroundColor Gray

# Try to find psql
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    # Common PostgreSQL installation paths
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\18\bin\psql.exe",
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $psqlPath = $path
            break
        }
    }
}

if (-not $psqlPath) {
    Write-Host "❌ psql not found. Please either:" -ForegroundColor Red
    Write-Host "   1. Add PostgreSQL bin directory to your PATH" -ForegroundColor Yellow
    Write-Host "   2. Or use Docker container: docker exec -it datavex-postgres psql -U postgres -c 'CREATE DATABASE datavex_dev;'" -ForegroundColor Yellow
    Write-Host "   3. Or stop local PostgreSQL and use only Docker" -ForegroundColor Yellow
    exit 1
}

$env:PGPASSWORD = "sparsh@123"

Write-Host "Creating database 'datavex_dev'..." -ForegroundColor Cyan
& $psqlPath -h localhost -p 5432 -U postgres -c "CREATE DATABASE datavex_dev;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'datavex_dev' created successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database might already exist or there was an error" -ForegroundColor Yellow
    Write-Host "Checking if database exists..." -ForegroundColor Cyan
    & $psqlPath -h localhost -p 5432 -U postgres -c "\l" | Select-String "datavex_dev"
}



