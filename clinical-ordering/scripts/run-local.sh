#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v java >/dev/null 2>&1; then
  echo "Java 17+ is required but was not found."
  exit 1
fi

if ! command -v mvn >/dev/null 2>&1; then
  echo "Maven 3.9+ is required but was not found."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found."
  exit 1
fi

echo "Starting backend on http://localhost:8080"
(cd "$ROOT_DIR/backend" && mvn spring-boot:run) &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" >/dev/null 2>&1 || true
}

trap cleanup EXIT

echo "Starting frontend on http://localhost:5173"
cd "$ROOT_DIR/frontend"
npm install
npm run dev

