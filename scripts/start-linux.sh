#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../frontend"
[ -d node_modules ] || npm ci
npm run setup:offline
npm run build
npm run preview
