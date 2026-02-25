#!/bin/bash
set -e

echo "Testing Frontend Docker Build..."
docker build -t modbus-frontend-test ./frontend

echo "Frontend build successful!"
echo "Checking if image exists..."
docker image inspect modbus-frontend-test > /dev/null

echo "Frontend verification script complete."
