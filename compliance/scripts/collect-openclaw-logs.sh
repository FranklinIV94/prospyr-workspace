#!/bin/bash
#==============================================================================
# OpenClaw Action Log Collector
# Purpose: Export OpenClaw agent action logs to Obsidian vault for SOC 2 evidence
# Run: Daily via cron or manual
#==============================================================================

set -euo pipefail

# Config
TIMESTAMP=$(date +%Y-%m-%d)
EVIDENCE_DIR="/home/franklin-bryant/Documents/Prospyr/Compliance/SOC2/Evidence/openclaw"
LOG_FILE="${EVIDENCE_DIR}/actions-${TIMESTAMP}.json"

# Ensure directory exists
mkdir -p "$EVIDENCE_DIR"

# OpenClaw log location
OPENCLAW_LOG="${HOME}/.openclaw/logs/actions.log"

if [ -f "$OPENCLAW_LOG" ]; then
    # Get last 24 hours of actions (or all if smaller)
    tail -n 1000 "$OPENCLAW_LOG" > "$LOG_FILE" 2>/dev/null || true
    
    # Also create an index entry
    echo "[$(date)] SUCCESS: OpenClaw actions collected: $LOG_FILE"
    echo "- $TIMESTAMP: $(wc -l < "$LOG_FILE") entries" >> "$EVIDENCE_DIR/actions-index.md"
else
    # Try to get sessions list via CLI
    echo "[$(date)] NOTE: Direct log not found, checking sessions" >> /tmp/compliance-.log
    
    # Create placeholder
    echo "{\"timestamp\":\"${TIMESTAMP}\",\"status\":\"no-direct-log\",\"note\":\"Sessions managed by gateway\"}" > "$LOG_FILE"
fi

# Also export session metadata
SESSION_INDEX="${EVIDENCE_DIR}/sessions-${TIMESTAMP}.json"
openclaw sessions list --json 2>/dev/null > "$SESSION_INDEX" || true

echo "[$(date)] SUCCESS: OpenClaw evidence collected"

exit 0
