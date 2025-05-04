@echo off
setlocal EnableDelayedExpansion

:MENU
cls
echo ========== USB Storage Management ==========
echo.
call :GET_CURRENT_STATUS
echo.
echo MENU:
echo 1. Enable USB Storage
echo 2. Disable USB Storage
echo 3. Check Current Status
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto ENABLE
if "%choice%"=="2" goto DISABLE
if "%choice%"=="3" goto STATUS
if "%choice%"=="4" goto END

echo Invalid choice. Press any key to continue...
pause >nul
goto MENU

:GET_CURRENT_STATUS
:: Get USBSTOR value and display status
for /f "tokens=3" %%A in ('reg query "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\USBSTOR" /v Start 2^>nul') do (
    set "currentValue=%%A"
)

if not defined currentValue (
    echo ERROR: Cannot find USBSTOR registry key
    exit /b 1
)

set "currentValue=%currentValue:0x=%"
if "%currentValue%"=="3" (
    echo Current Status: USB Storage is ENABLED
) else if "%currentValue%"=="4" (
    echo Current Status: USB Storage is DISABLED
) else (
    echo Current Status: Unknown value (%currentValue%)
)
exit /b

:ENABLE
reg query "HKU\S-1-5-19" >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ERROR: This operation requires Administrator privileges
    pause
    goto MENU
)

reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\USBSTOR" /v Start /t REG_DWORD /d 3 /f
if %errorlevel% == 0 (
    echo USB Storage has been ENABLED successfully
) else (
    echo Failed to enable USB Storage
)
pause
goto MENU

:DISABLE
reg query "HKU\S-1-5-19" >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ERROR: This operation requires Administrator privileges
    pause
    goto MENU
)

reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\USBSTOR" /v Start /t REG_DWORD /d 4 /f
if %errorlevel% == 0 (
    echo USB Storage has been DISABLED successfully
) else (
    echo Failed to disable USB Storage
)
pause
goto MENU

:STATUS
call :GET_CURRENT_STATUS
pause
goto MENU

:END
exit /b