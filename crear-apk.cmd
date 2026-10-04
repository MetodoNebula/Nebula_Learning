@echo off
setlocal
cd /d "%~dp0"
set "NEBULA_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NEBULA_NODE%" set "NEBULA_NODE=node"
"%NEBULA_NODE%" scripts\android-apk.mjs
pause
