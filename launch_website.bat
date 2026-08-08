@echo off
title IUPAC Vocabulary Companion - Local Server
setlocal enabledelayedexpansion

:: Set working directory to the folder containing this batch file
cd /d "%~dp0"

echo ========================================================
echo    IUPAC Vocabulary Companion - Local Server Launcher
echo ========================================================
echo.

set "PY_CMD="

:: Check for python in PATH or py launcher
where python >nul 2>&1 && set "PY_CMD=python"
if not defined PY_CMD (
    where py >nul 2>&1 && set "PY_CMD=py"
)

:: Search common installation directories if where failed
if not defined PY_CMD (
    for /d %%D in ("%LocalAppData%\Programs\Python\Python*") do (
        if exist "%%D\python.exe" set "PY_CMD="%%D\python.exe""
    )
)

:: Fallback to standalone offline HTML if Python is unavailable
if not defined PY_CMD (
    echo [NOTICE] Python was not found on your system.
    echo Opening standalone offline site directly in browser...
    echo.
    if exist "IUPAC_Offline.html" (
        start "" "IUPAC_Offline.html"
    ) else (
        start "" "index.html"
    )
    ping 127.0.0.1 -n 3 >nul
    exit /b 0
)

:: Execute serve.py to handle free port binding and browser launch
%PY_CMD% "%~dp0serve.py"

if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Python server stopped. Fallback to standalone offline file...
    if exist "IUPAC_Offline.html" (
        start "" "IUPAC_Offline.html"
    ) else (
        start "" "index.html"
    )
)

pause
