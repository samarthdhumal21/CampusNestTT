@echo off
set "NODE=C:\Users\Samarth\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%NODE%" (
  "%NODE%" "node_modules\vite\bin\vite.js" preview --port 4173 --host
) else (
  node "node_modules\vite\bin\vite.js" preview --port 4173 --host
)
