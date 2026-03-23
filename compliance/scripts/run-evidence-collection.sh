#!/bin/bash
#==============================================================================
# Evidence Collection Runner
# Purpose: Run all evidence collectors in sequence
# Usage: ./run-evidence-collection.sh
#==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$(dirname "$SCRIPT_DIR")/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="${LOG_DIR}/evidence-$(date +%Y-%m-%d).log"

log() {
    echo "[$(date)] $1" | tee -a "$LOG_FILE"
}

log "=== Starting Evidence Collection ==="

# Run each collector and capture results
collectors=(
    "collect-github-audit.sh"
    "collect-aws-cloudtrail.sh"
    "collect-google-workspace.sh"
    "collect-openclaw-logs.sh"
    "collect-system-logs.sh"
)

for collector in "${collectors[@]}"; do
    log "Running: $collector"
    if bash "$SCRIPT_DIR/$collector" 2>&1 | tee -a "$LOG_FILE"; then
        log "SUCCESS: $collector"
    else
        log "WARNING: $collector failed or had issues"
    fi
    log "---"
done

log "=== Evidence Collection Complete ==="

# Update vault index
VAULT_INDEX="/home/franklin-bryant/Documents/Prospyr/Compliance/SOC2/Evidence/collection-log.md"
echo "## $(date)" >> "$VAULT_INDEX"
echo "Collection run completed. See logs for details." >> "$VAULT_INDEX"
echo "" >> "$VAULT_INDEX"

exit 0
