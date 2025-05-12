@echo off
cd /d "%~dp0"
cd bin
cd server
echo Running npm install in %cd%
call npm install
call npm fund
cd /d "%~dp0"
cd bin
cd mobile
cd caixa
echo Running npm install in %cd%
call npm install
call npm fund
cd /d "%~dp0"
cd bin
cd mobile
cd cozinha
echo Running npm install in %cd%
call npm install
call npm fund
echo Done. Pressione qualquer tecla para fechar...
pause >nul