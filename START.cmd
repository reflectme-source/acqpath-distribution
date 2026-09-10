@echo off
setlocal EnableExtensions DisableDelayedExpansion
cd /d "%~dp0"
echo AcqPath Distribution - LOCAL PREPARATION ONLY
echo Does not change the existing Worker, wallet or payment settings.
node scripts\cli.mjs prepare
set "ACQ_EXIT=%ERRORLEVEL%"
echo.
echo Preparation is not publication and is not proof of customer revenue.
pause
exit /b %ACQ_EXIT%
