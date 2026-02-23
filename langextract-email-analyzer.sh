#!/bin/bash
# LangExtract Email Analyzer - ALBS Standard Document Extraction
# Created: February 13, 2026
# Purpose: Analyze emails and attachments using LangExtract (Franklin's mandated standard)
#
# NOTE (Northstar vs Prospyr/Oracle):
# - Prospyr/Oracle host paths commonly live under /home/ubuntu
# - Northstar runs as franklin-bryant and should not attempt to write to /home/ubuntu
# - This script is safe to run on either host; it auto-disables if the email tooling isn't present.

set -euo pipefail

echo "🔍 LangExtract Email Analysis - Processing Business Documents"
echo "=============================================="

# ---- Host-safe paths (default to this workspace) ----
WORKSPACE_DIR="/home/franklin-bryant/.openclaw/workspace"
LOG_DIR="${WORKSPACE_DIR}/logs"
TEMP_DIR="/tmp/langextract-emails"
mkdir -p "$LOG_DIR" "$TEMP_DIR"

PROCESSED_LOG="${LOG_DIR}/langextract-processed.json"
LOG_FILE="${LOG_DIR}/langextract-email.log"

# Create processed log if it doesn't exist
if [ ! -f "$PROCESSED_LOG" ]; then
  echo "[]" > "$PROCESSED_LOG"
fi

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S %Z') - $1" | tee -a "$LOG_FILE"
}

# ---- Guard: only run if Graph tooling exists on this host ----
GET_RECENT="/home/ubuntu/bin/get-recent-emails.py"
if [ ! -x "$GET_RECENT" ]; then
  log "Email tooling not present on this host ($GET_RECENT missing) — skipping (expected on Prospyr/Oracle)."
  echo "✅ LangExtract email analysis complete - skipped on this host"
  exit 0
fi

log "Starting LangExtract email analysis"

echo "📧 Retrieving recent business emails..."
set +e
EMAIL_DATA=$($GET_RECENT --search "subject:analysis OR subject:contract OR subject:tax OR subject:client OR subject:proposal OR subject:obsidian OR subject:note" 2>/dev/null)
STATUS=$?
set -e

if [ $STATUS -ne 0 ] || [ -z "${EMAIL_DATA:-}" ]; then
  log "No emails retrieved or error occurred"
  echo "✅ LangExtract email analysis complete - no emails to process"
  exit 0
fi

EMAIL_COUNT=$(echo "$EMAIL_DATA" | jq '. | length' 2>/dev/null || echo "0")
log "Retrieved $EMAIL_COUNT emails for analysis"

if [ "$EMAIL_COUNT" -eq 0 ]; then
  echo "✅ LangExtract email analysis complete - no relevant emails"
  exit 0
fi

PROCESSED_COUNT=0

echo "$EMAIL_DATA" | jq -r '.[] | @base64' | while IFS= read -r email_b64; do
  email=$(echo "$email_b64" | base64 -d)

  EMAIL_ID=$(echo "$email" | jq -r '.id')
  EMAIL_SUBJECT=$(echo "$email" | jq -r '.subject')
  EMAIL_FROM=$(echo "$email" | jq -r '.from')
  EMAIL_DATE=$(echo "$email" | jq -r '.receivedDateTime')
  EMAIL_BODY=$(echo "$email" | jq -r '.body')

  ALREADY_PROCESSED=$(jq --arg id "$EMAIL_ID" 'any(. == $id)' "$PROCESSED_LOG" 2>/dev/null || echo "false")
  if [ "$ALREADY_PROCESSED" = "true" ]; then
    log "Skipping already processed email: $EMAIL_SUBJECT"
    continue
  fi

  log "Processing email with LangExtract: $EMAIL_SUBJECT"

  EMAIL_FILE="$TEMP_DIR/email_${EMAIL_ID}.txt"
  cat > "$EMAIL_FILE" << EOF
Subject: $EMAIL_SUBJECT
From: $EMAIL_FROM
Date: $EMAIL_DATE

$EMAIL_BODY
EOF

  # Process with LangExtract (best-effort). If unavailable, fall back to a truncated dump.
  set +e
  EXTRACT_RESULT=$(python3 - <<'PY'
import os
email_file = os.environ.get('EMAIL_FILE')
with open(email_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

try:
    import langextract
    extracted = langextract.extract(
        content,
        document_type='email',
        output_format='business_analysis'
    )
    print(extracted)
except Exception:
    print('**BASIC EXTRACTION FALLBACK**\n\nEmail (truncated):\n' + content[:1500])
PY
  )
  PY_STATUS=$?
  set -e

  if [ $PY_STATUS -ne 0 ] || [ -z "${EXTRACT_RESULT:-}" ] || [ ${#EXTRACT_RESULT} -le 50 ]; then
    log "⚠️ No meaningful content extracted from: $EMAIL_SUBJECT"
    rm -f "$EMAIL_FILE"
    continue
  fi

  # Persist analysis locally for review (no outbound messaging from this script).
  OUT_FILE="$LOG_DIR/langextract-analysis-${EMAIL_ID}.md"
  cat > "$OUT_FILE" << EOF
# LANGEXTRACT EMAIL ANALYSIS

- Subject: $EMAIL_SUBJECT
- From: $EMAIL_FROM
- Date: $EMAIL_DATE

---

$EXTRACT_RESULT

---
Processed via LangExtract - ALBS Standard Document Extraction
EOF

  log "✅ Processed: $EMAIL_SUBJECT → $OUT_FILE"
  jq --arg id "$EMAIL_ID" '. += [$id]' "$PROCESSED_LOG" > "${PROCESSED_LOG}.tmp" && mv "${PROCESSED_LOG}.tmp" "$PROCESSED_LOG"

  PROCESSED_COUNT=$((PROCESSED_COUNT + 1))
  if [ $PROCESSED_COUNT -ge 3 ]; then
    log "Reached processing limit (3 emails) - stopping for this cycle"
    rm -f "$EMAIL_FILE"
    break
  fi

  rm -f "$EMAIL_FILE"
  sleep 2
done

rm -rf "$TEMP_DIR"

if [ ${PROCESSED_COUNT:-0} -gt 0 ]; then
  log "Completed processing $PROCESSED_COUNT emails"
else
  log "No emails required processing this cycle"
fi

echo "✅ LangExtract email analysis complete"
