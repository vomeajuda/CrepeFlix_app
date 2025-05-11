@echo off
cd /d "%~dp0"
cd server
echo Running npm install in %cd%
call npm install
call npm fund
echo Done. Pressione qualquer tecla para continuar...
pause >nul
cd /d "%~dp0"
cd mobile
cd caixa
echo Running npm install in %cd%
call npm install
call npm fund
echo Done. Pressione qualquer tecla para continuar...
pause >nul
cd /d "%~dp0"
cd mobile
cd cozinha
echo Running npm install in %cd%
call npm install
call npm fund
echo Done. Pressione qualquer tecla para fechar...
pause >nul