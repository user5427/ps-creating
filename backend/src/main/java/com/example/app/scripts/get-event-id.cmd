@echo off
setlocal

rem Usage:
rem   get-event-id.cmd [random|first]
rem Examples:
rem   get-event-id.cmd
rem   get-event-id.cmd first

set "MODE=%~1"
if "%MODE%"=="" set "MODE=random"

if /I not "%MODE%"=="random" if /I not "%MODE%"=="first" (
  echo Usage: %~nx0 [random^|first]
  exit /b 2
)

for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$ErrorActionPreference='Stop'; $resp = Invoke-RestMethod -Uri 'http://localhost:8080/api/events?page=0&size=100' -Method Get; if (-not $resp.content -or $resp.content.Count -eq 0) { Write-Error 'No events found'; exit 3 }; if ('%MODE%' -eq 'first') { $resp.content[0].id } else { (Get-Random -InputObject $resp.content).id }"`) do set "EVENT_ID=%%I"

if not defined EVENT_ID (
  echo Failed to fetch event id from backend. Make sure API is running on localhost:8080.
  exit /b 1
)

echo %EVENT_ID%
exit /b 0
