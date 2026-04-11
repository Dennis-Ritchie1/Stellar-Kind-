#!/usr/bin/env bash

set -euo pipefail

echo "Running migrations..."

# Example migration flow
# cd ../backend && node ./scripts/run-migrations.js

if [ -f ../backend/migrations/0001_init.sql ]; then
  echo "Migration file found: ../backend/migrations/0001_init.sql"
fi

echo "Migration helper complete."
