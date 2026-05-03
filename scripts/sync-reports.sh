#!/bin/bash
set -e

SOURCE="$HOME/.tradingagents/logs/"
DEST="$(cd "$(dirname "$0")/.." && pwd)/src/content/reports/"

mkdir -p "$DEST"

echo "Syncing reports from $SOURCE to $DEST..."
rsync -av --delete --exclude="*.log" "$SOURCE" "$DEST"
echo "Sync complete."
