@echo off
echo Starting SGMastery Backend Server...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the server
python start.py
