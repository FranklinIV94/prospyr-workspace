#!/bin/bash
#==============================================================================
# AWS CloudTrail Evidence Collector
# Purpose: Export CloudTrail events to Obsidian vault for SOC 2 evidence
# Run: Daily via cron or manual
#==============================================================================

set -euo pipefail

# Config
TIMESTAMP=$(date +%Y-%m-%d)
EVIDENCE_DIR="/home/franklin-bryant/Documents/Prospyr/Compliance/SOC2/Evidence/aws"
LOG_FILE="${EVIDENCE_DIR}/cloudtrail-${TIMESTAMP}.json"

# Ensure directory exists
mkdir -p "$EVIDENCE_DIR"

# AWS CLI required - check if configured
if ! command -v aws &> /dev/null; then
    echo "[$(date)] ERROR: AWS CLI not installed" >> /tmp/compliance-errors.log
    exit 1
fi

# Collect CloudTrail events (last 24 hours)
aws cloudtrail lookup-events \
    --output json \
    --max-results 100 \
    > "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "[$(date)] SUCCESS: AWS CloudTrail collected: $LOG_FILE"
    # Update index
    echo "- $TIMESTAMP: $(wc -l < "$LOG_FILE") events" >> "$EVIDENCE_DIR/cloudtrail-index.md"
else
    echo "[$(date)] ERROR: Failed to collect CloudTrail" >> /tmp/compliance-errors.log
    exit 1
fi

exit 0
