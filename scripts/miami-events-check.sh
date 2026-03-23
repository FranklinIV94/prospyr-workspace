#!/bin/bash
# Weekly Miami tech event monitor
# Checks for new AI/hackathon/tech events and logs to workspace

WORKSPACE="/home/franklin-bryant/.openclaw/workspace"
LOG="$WORKSPACE/miami-tech-events.md"

# Fetch from luma
LUMA=$(curl -s "https://lu.ma/miami/tech" 2>/dev/null | grep -oP '(?<=event/)[a-z0-9]+' | head -10)

# Simple check - just report what's found
echo "=== Miami Tech Events Check: $(date) ===" 
echo "Found luma events: $LUMA"
echo "Checked: https://lu.ma/miami/tech"
echo "" >> "$LOG"
echo "=== $(date '+%Y-%m-%d') ===" >> "$LOG"
echo "Checked: lu.ma/miami/tech" >> "$LOG"
echo "Luma IDs: $LUMA" >> "$LOG"
