$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

powershell -ExecutionPolicy Bypass -File (Join-Path $RootDir "scripts/setup-dev.ps1")
Push-Location $RootDir
try {
  docker compose up
} finally {
  Pop-Location
}
