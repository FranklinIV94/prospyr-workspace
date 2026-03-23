#!/bin/bash
# OpenClaw 2026.2.21-2 Dynamic Model Switcher
# Define your models
VISION_MODEL="qwen-portal/vision-model"
CODER_MODEL="qwen-portal/coder-model"

# Logic: Switch to Vision for multimedia tasks, Coder for everything else
# This script can be expanded to check specific task folders or triggers

CURRENT_TASK=""
# Try to get latest session message - fallback methods if primary fails
if command -v openclaw >/dev/null 2>&1; then
    # Attempt primary method
    SESSION_DATA=$(openclaw sessions list --json 2>/dev/null)
    if [ -n "$SESSION_DATA" ]; then
        CURRENT_TASK=$(echo "$SESSION_DATA" | jq -r '.[0].latestMessage' 2>/dev/null | grep -Ei "image|photo|draw|vision" | head -1)
    fi
fi

# Fallback: check recent memory files for vision-related terms
if [ -z "$CURRENT_TASK" ]; then
    RECENT_MEMORY=$(find /home/franklin-bryant/.openclaw/workspace/memory -name "*.md" -mtime -1 -exec cat {} \; 2>/dev/null | grep -Ei "image|photo|draw|vision" | head -1)
    if [ -n "$RECENT_MEMORY" ]; then
        CURRENT_TASK="vision_detected"
    fi
fi

# Determine model to use
if [[ -z "$CURRENT_TASK" ]]; then
    echo "$(date): Switching to Coder model..."
    # Since openclaw models set may not exist, we'll use environment variable approach
    echo "qwen-portal/coder-model" > /home/franklin-bryant/.openclaw/workspace/.current_model
    echo "Coder model selected"
else
    echo "$(date): Vision task detected. Switching to Vision model..."
    echo "qwen-portal/vision-model" > /home/franklin-bryant/.openclaw/workspace/.current_model
    echo "Vision model selected"
fi

# Apply changes - restart gateway if available
if command -v openclaw >/dev/null 2>&1; then
    openclaw gateway restart 2>/dev/null || echo "Gateway restart failed or not available"
fi