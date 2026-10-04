@echo off
setlocal
cd /d "%~dp0"
set "NEBULA_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NEBULA_NODE%" set "NEBULA_NODE=node"
echo.
echo Nebula Tech - Demo local
echo Abre http://localhost:5173 en tu navegador.
echo En el movil, usa la direccion Network que aparece abajo.
echo Para detener la demo pulsa Ctrl+C o cierra esta ventana.
echo.
"%NEBULA_NODE%" node_modules\vinext\dist\cli.js dev --host 0.0.0.0 --port 5173
pause
