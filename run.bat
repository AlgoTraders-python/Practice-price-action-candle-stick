@echo off
echo Starting the Flask application...

:: Set the path to your Python executable dynamically
for %%a in ("python.exe") do (
  if exist "%%~$PATH:a" (
    set "PYTHON_PATH=%%~$PATH:a"
    goto :foundPython
  )
)
echo Python executable not found in PATH. Please ensure Python is installed and in your system's PATH.
pause
exit /b 1

:foundPython
echo Python found at: %PYTHON_PATH%

:: Navigate to the directory containing app.py
cd /d "%~dp0"

:: Activate the virtual environment (if you are using one)
if exist .venv\Scripts\activate (
    call .venv\Scripts\activate
)

:: Install requirements
echo Installing requirements...
"%PYTHON_PATH%" -m pip install -r requirements.txt

:: Run the Flask application
echo Running the Flask application...
"%PYTHON_PATH%" app.py

pause