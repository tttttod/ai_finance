#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"


start_service() {
    cd "${COZE_WORKSPACE_PATH}"

    # Load .env file if it exists (env vars for TUSHARE_TOKEN etc.)
    if [ -f .env ]; then
        set -a
        # shellcheck disable=SC1091
        source .env
        set +a
        echo "Loaded .env file"
    fi
    if [ -f .env.local ]; then
        set -a
        # shellcheck disable=SC1091
        source .env.local
        set +a
        echo "Loaded .env.local file"
    fi

    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    PORT=${DEPLOY_RUN_PORT} node dist/server.js
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
