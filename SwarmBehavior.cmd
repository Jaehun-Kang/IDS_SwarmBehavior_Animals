@echo off
setlocal
title SwarmBehavior
pushd "%~dp0"
if errorlevel 1 goto failed

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install a current Node.js LTS version, then try again.
  goto failed
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js, then try again.
  goto failed
)

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=12)?0:1)"
if errorlevel 1 (
  echo Node.js 22.12 or newer is required. Install a current LTS version.
  goto failed
)

node -e "const fs=require('fs');if(!fs.existsSync('node_modules/vite/bin/vite.js'))process.exit(1);try{if(!fs.existsSync(require('electron')))process.exit(1)}catch{process.exit(1)}" >nul 2>nul
if errorlevel 1 (
  echo Installing dependencies. Internet is required for this step.
  call npm ci --no-audit --no-fund
  if errorlevel 1 goto failed
)

if /i "%~1"=="--check" goto check
call npm run sb
if errorlevel 1 goto failed
goto done

:check
call npm run build
if errorlevel 1 goto failed
node scripts/start-exhibition.mjs --check
if errorlevel 1 goto failed

:done
popd
endlocal
exit /b 0

:failed
echo.
echo SwarmBehavior could not start. See the error above.
if /i not "%~1"=="--check" pause
popd
endlocal
exit /b 1
