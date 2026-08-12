@echo off
setlocal enabledelayedexpansion
cd server

:: Attempt to run python and discard the output
python --version >nul 2>&1

:: Check the error level of the previous command
if %errorlevel% equ 0 (
    echo [SUCCESS] Python is installed!
    for /f "delims=" %%i in ('python --version') do set pyver=%%i
    echo Version: !pyver!
) else (
    echo [ERROR] Python is NOT installed or not added to your system PATH
       winget install Python
       setx PATH "%PATH%;%localappdata%\Programs\Python\Python314;%localappdata%\Programs\Python\Python314\Scripts"
)

if not exist venv\Scripts\python.exe (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)
venv\Scripts\python.exe -m pip install -r requirements.txt

:: Check if the node executable is in the system PATH
where node >nul 2>nul

if %errorlevel% equ 0 (
    echo Node.js is installed.
    echo Version:
    node -v
) else (
    echo Node.js is not installed.
    winget install OpenJS.NodeJS.LTS
)
cd..
cd client
npm install
pause
endlocal
