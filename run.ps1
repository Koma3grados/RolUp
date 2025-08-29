# =========================
# RolUp - Start and Stop All Services (single console)
# =========================

# Guardar la ruta actual (RolUp)
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $rootDir

# -------------------------
# Arrancar PostgreSQL
# -------------------------
Write-Host "Arrancando contenedor PostgreSQL..."
docker compose -f .\docker\docker-compose.yml up -d

# Esperar unos segundos a que la base de datos inicialice
Write-Host "Esperando 10s para que la base de datos inicialice..."
Start-Sleep -Seconds 10

# -------------------------
# Arrancar Backend y Frontend como trabajos en el mismo PowerShell
# -------------------------
Write-Host "Arrancando backend..."
$backendJob = Start-Job -ScriptBlock {
    cd "$using:rootDir\backend"
    mvn spring-boot:run
}

Write-Host "Arrancando frontend..."
$frontendJob = Start-Job -ScriptBlock {
    cd "$using:rootDir\frontend"
    npm run dev
}

# -------------------------
# Mostrar mensaje e input del usuario
# -------------------------
Write-Host "`nTodos los servicios arrancados. Escribe 'exit' para detener todo."
while ($true) {
    $input = Read-Host ">"
    if ($input -eq "exit") {
        break
    } else {
        Write-Host "Comando no reconocido. Escribe 'exit' para detener los servicios."
    }
}

# -------------------------
# Detener backend y frontend
# -------------------------
Write-Host "Deteniendo backend y frontend..."
Stop-Job $backendJob
Stop-Job $frontendJob
Remove-Job $backendJob
Remove-Job $frontendJob

# -------------------------
# Detener PostgreSQL
# -------------------------
Write-Host "Deteniendo contenedor PostgreSQL..."
docker compose -f .\docker\docker-compose.yml down

Write-Host "Todos los servicios se han detenido."
