#!/bin/bash
set -e

# Server
cd "$(dirname "$0")/../bin/server"
echo "Running npm install in $(pwd)"
npm install
npm fund || true

# Caixa
cd ../mobile/caixa
echo "Running npm install in $(pwd)"
npm install
npm fund || true

# Cozinha
cd ../cozinha
echo "Running npm install in $(pwd)"
npm install
npm fund || true

echo "Done. Pressione Enter para fechar..."
read
