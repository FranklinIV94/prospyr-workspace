#!/bin/bash
#==============================================================================
# System Logs Collector
# Purpose: Export critical system logs for SOC 2 evidence
# Run: Daily via cron or manual
#==============================================================================

set -euo pipefail

# Config
TIMESTAMP=$(date +%Y-%m-%d)
EVIDENCE_DIR="/home/franklin-bryant/Documents/Prospyr/Compliance/SOC2/Evidence/system"
LOG_DIR="${EVIDENCE_DIR}/raw"

# Ensure directory exists
mkdir -p "$LOG_DIR"

# Collect SSH logs
if [ -f /var/log/auth.log ]; then
    tail -n 500 /var/log/auth.log > "${LOG_DIR}/ssh-auth-${TIMESTAMP}.log" 2>/dev/null || true
fi

# Collect syslog
if [ -f /var/log/syslog ]; then
    tail -n 500 /var/log/syslog > "${LOG_DIR}/syslog-${TIMESTAMP}.log" 2>/dev/null || true
fi

# Collect OpenClaw gateway logs
OPENCLAW_LOG_DIR="${HOME}/.openclaw/logs"
if [ -d "$OPENCLAW_LOG_DIR" ]; then
    cp -r "$OPENCLAW_LOG_DIR"/*.log "${LOG_DIR}/" 2>/dev/null || true
fi

# Collect systemd services status
systemctl --user status openclaw-gateway > "${LOG_DIR}/openclaw-status-${TIMESTAMP}.txt" 2>&1 || true
systemctl --user status openclaw-node > "${LOG_DIR}/openclaw-node-status-${TIMESTAMP}.txt" 2>&1 || true

# Collect disk/memory snapshot
df -h > "${LOG_DIR}/disk-${TIMESTAMP}.txt"
free -h > "${LOG_DIR}/memory-${TIMESTAMP}.txt"

# List open ports (security monitoring)
ss -tuln > "${LOG_DIR}/ports-${TIMESTAMP}.txt" 2>/dev/null || netstat -tuln > "${LOG_DIR}/ports-${TIMESTAMP}.txt" 2>/dev/null || true

# Update index
echo "[$(date)] SUCCESS: System logs collected"
echo "- $TIMESTAMP: system snapshot complete" >> "${EVIDENCE_DIR}/system-index.md"

exit 0
