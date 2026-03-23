@echo off
echo ========================================
echo   Command Center Connection Test
echo ========================================
echo.
echo This script tests connectivity to the Command Center server.
echo.
echo Server: 10.0.0.229:3001
echo.
echo Press any key to run tests...
pause > nul

echo.
echo 🔍 Testing connection to 10.0.0.229:3001...
echo.

REM Test 1: Ping server
echo ✅ Test 1: Network Connectivity
ping -n 2 10.0.0.229 > nul
if %errorlevel% equ 0 (
    echo    🟢 SUCCESS: Server is reachable
) else (
    echo    🔴 FAILED: Cannot ping server
)

REM Test 2: Check if port is open (using PowerShell)
echo.
echo ✅ Test 2: Port 3001 Check
powershell -Command "try { $tcp = New-Object System.Net.Sockets.TcpClient; $tcp.Connect('10.0.0.229', 3001); $tcp.Close(); Write-Host '    🟢 SUCCESS: Port 3001 is open' -ForegroundColor Green } catch { Write-Host '    🔴 FAILED: Port 3001 is closed' -ForegroundColor Red }"

echo.
echo ✅ Test 3: Web Interface
echo    Opening browser to http://10.0.0.229:3001...
start http://10.0.0.229:3001

echo.
echo 📊 TEST COMPLETE
echo ================
echo.
echo 🎯 Next Steps:
echo 1. Browser should open to Command Center
echo 2. Try chatting with Prospyr (left sidebar)
echo 3. Ask about OmniMind deployment status
echo 4. Switch to Northstar for UI questions
echo.
echo 💡 If browser doesn't load:
echo    • Check if server is running on Ubuntu
echo    • Try: http://141.148.13.65:3001 (public IP)
echo.
echo Press any key to exit...
pause > nul