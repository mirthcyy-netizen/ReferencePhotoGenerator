#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  echo ".env already exists at $ENV_FILE"
  read -r -p "Overwrite it? [y/N] " overwrite
  case "$overwrite" in
    y|Y|yes|YES) ;;
    *)
      echo "Canceled. Existing .env was not changed."
      exit 0
      ;;
  esac
fi

echo "Paste your OpenAI API key. Input will be hidden."
read -r -s -p "OPENAI_API_KEY: " OPENAI_API_KEY
echo

trimmed_key="$(printf '%s' "$OPENAI_API_KEY" | tr -d '[:space:]')"
if [[ -z "$trimmed_key" ]]; then
  echo "No key entered. .env was not created."
  exit 1
fi

case "$trimmed_key" in
  *your-api-key*|*replace-me*|*sk-your-api-key-here*)
    echo "That looks like a placeholder, not a real API key. .env was not created."
    exit 1
    ;;
esac

umask 077
cat > "$ENV_FILE" <<EOF
OPENAI_API_KEY=$trimmed_key
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_IMAGE_QUALITY=medium
OPENAI_TIMEOUT_SECONDS=180
EOF

chmod 600 "$ENV_FILE"

echo ".env created at $ENV_FILE"
echo "Restart the Reference Studio server so it can load the new key."
