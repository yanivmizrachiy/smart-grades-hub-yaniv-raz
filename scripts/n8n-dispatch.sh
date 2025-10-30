#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
EVENT="${1:-demo}"
JSON="${2:-{"hello":"world"}}"
gh workflow run dispatch_to_n8n.yml \
  -f event="$EVENT" \
  -f payload="$(printf %s "$JSON")"
echo "Triggered: $EVENT"
