#!/bin/bash
#==============================================================================
# GitHub Audit Log Collector
# Purpose: Export GitHub audit log entries to Obsidian vault for SOC 2 evidence
# Run: Daily via cron or manual
#==============================================================================

set -euo pipefail

# Config
TIMESTAMP=$(date +%Y-%m-%d)
EVIDENCE_DIR="/home/franklin-bryant/Documents/Prospyr/Compliance/SOC2/Evidence/github"
LOG_FILE="/home/franklin-bryant/.openclaw/workspace/compliance/evidence/github/audit-${TIMESTAMP}.json"

# Ensure directory exists
mkdir -p "$EVIDENCE_DIR"

# GitHub API - requires GH_TOKEN environment variable
if [ -z "${GH_TOKEN:-}" ]; then
    echo "[$(date)] ERROR: GH_TOKEN not set" >> /tmp/compliance-errors.log
    exit 1
fi

# Collect audit log (last 7 days by default, adjust per SOC2 audit window)
# GitHub Enterprise Cloud audit log API
curl -s -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/enterprises/$(echo $GH_TOKEN | cut -d/ -f1)/audit-log" \
  --data '{"per_page":100,"phrase":"created:>=2026-03-16"}' \
  > "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "[$(date)] SUCCESS: GitHub audit log collected: $LOG_FILE"
    # Also update the index
    echo "- $TIMESTAMP: $(wc -l < "$LOG_FILE") entries" >> "$EVIDENCE_DIR/audit-index.md"
else
    echo "[$(date)] ERROR: Failed to collect GitHub audit log" >> /tmp/compliance-errors.log
    exit 1
fi

exit 0
