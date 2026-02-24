#!/bin/bash
set -e

echo "Testing Backend Docker Build..."
docker build -t modbus-backend-test .

echo "Backend build successful!"
