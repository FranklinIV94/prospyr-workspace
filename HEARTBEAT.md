# ⚠️ IMPORTANT: Alert Configuration (Feb 20, 2026)
**DO NOT send heartbeat/cron alerts to +15614798624**
- Franklin receives all alerts via **Discord** (primary)
- Only respond to direct messages from +15614798624 or +15615898900
- WhatsApp only for Prospyr internal communication
- **Proposed changes require team review and approval via email before implementation**

---

# 🚨 MODEL CONFIGURATION (Feb 26, 2026 — ACTIVE UNTIL FURTHER NOTICE)
**QWEN-ONLY MODE:** OpenRouter disabled by Franklin. Use `qwen-portal/coder-model` and `qwen-portal/vision-model` exclusively.
- Reference: `MODEL-CONFIG-REMINDER.md`
- Do NOT attempt OpenRouter API calls until explicitly re-enabled

---

# Host Split (Northstar vs Prospyr)
- **Northstar (this machine):** Obsidian vault + heavy work + local gateway.
- **Prospyr (Oracle 4GB):** Graph email + WhatsApp gateway + lightweight monitors.

# ✅ Heartbeat Checks (Patched Feb 23, 2026)

This file now has **two explicit sections**:
- **Northstar-local checks** (run on this machine)
- **Prospyr-only checks** (run on Oracle; guarded so Northstar doesn’t “false fail”)

---

# Northstar-local checks (run every heartbeat)

## Server Resource Monitoring (CRITICAL)
```bash
DISK_USED=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
[ "$DISK_USED" -gt 85 ] && echo "🚨 DISK ALERT: ${DISK_USED}% used - cleanup needed!"

MEM_AVAIL=$(free -m | awk 'NR==2 {print $7}')
[ "$MEM_AVAIL" -lt 150 ] && echo "🚨 MEMORY ALERT: Only ${MEM_AVAIL}MB available!"

SWAP_USED=$(free -m | awk 'NR==3 {print $3}')
[ "$SWAP_USED" -gt 2000 ] && echo "⚠️ SWAP WARNING: ${SWAP_USED}MB in use - system under pressure"
```

## OpenClaw gateway sanity
```bash
openclaw gateway status || true
```

## OpenClaw security threat monitor (local script)
```bash
if [ -x /home/franklin-bryant/.openclaw/workspace/scripts/openclaw-security-monitor.sh ]; then
  /home/franklin-bryant/.openclaw/workspace/scripts/openclaw-security-monitor.sh
else
  echo "openclaw-security-monitor.sh not found (ok)"
fi
```

## Obsidian vault sanity (filesystem)
```bash
VAULT="/home/franklin-bryant/Documents/Prospyr"
if [ -d "$VAULT" ]; then
  test -w "$VAULT" && echo "✅ Obsidian vault writable" || echo "🚨 Obsidian vault NOT writable"
  test -f "$VAULT/Vault Index.md" && echo "✅ Vault Index present" || echo "⚠️ Vault Index missing"
else
  echo "🚨 Obsidian vault path missing: $VAULT"
fi
```

## OpenRouter credit monitoring (only if key is present)
```bash
if [ -n "${OPENROUTER_API_KEY:-}" ]; then
  curl -s "https://openrouter.ai/api/v1/auth/key" -H "Authorization: Bearer $OPENROUTER_API_KEY" | jq -r '.data.usage, .data.limit'
else
  echo "OPENROUTER_API_KEY not set on this host (ok)"
fi
```

---

# Prospyr-only checks (Oracle) — guarded (won’t fail Northstar)

## Microsoft Graph email heartbeat (Prospyr only)
```bash
if [ -x /home/ubuntu/bin/msgraph-email.py ]; then
  /home/ubuntu/bin/msgraph-email.py --heartbeat || {
    echo "Token expired, refreshing...";
    /home/ubuntu/bin/refresh-msgraph-token.py;
    /home/ubuntu/bin/msgraph-email.py --heartbeat;
  }
else
  echo "Graph heartbeat not configured on this host (expected on Northstar)."
fi
```

## LangExtract email analyzer (prefer local workspace script if present)
```bash
if [ -x /home/franklin-bryant/.openclaw/workspace/langextract-email-analyzer.sh ]; then
  /home/franklin-bryant/.openclaw/workspace/langextract-email-analyzer.sh
else
  echo "LangExtract analyzer not configured on this host (ok)"
fi
```

## WhatsApp security logs (Prospyr only)
```bash
if [ -f /home/ubuntu/.clawdbot/logs/whatsapp.log ]; then
  UNAUTHORIZED=$(grep -v "+15614798624\|+15615898900\|+19416469319\|+13059304695\|+19417165199" /home/ubuntu/.clawdbot/logs/whatsapp.log | tail -20 | wc -l)
  [ "$UNAUTHORIZED" -gt 0 ] && echo "⚠️ SECURITY: $UNAUTHORIZED unauthorized WhatsApp attempts detected in last check"
else
  echo "WhatsApp logs not configured on this host (expected on Northstar)."
fi

if [ -f /home/ubuntu/.clawdbot/devices/paired.json ]; then
  cat /home/ubuntu/.clawdbot/devices/paired.json | jq -r 'keys | length' || true
fi
```

---

# Weekly (manual / scheduled separately)

## Security audit (read-only unless approved)
```bash
openclaw security audit --deep
```

## Open ports snapshot
```bash
ss -ltnup 2>/dev/null | head -n 50 || netstat -tuln | head -n 50
```

# Weekly AI Newsletter (Sundays)
Email Franklin a weekly summary of:
- Latest AI releases and updates
- How new AI developments can benefit ALBS business
- Industry trends and opportunities
- AI security developments and partnership announcements
- Technology Watch List updates (monitoring targets like Antfarm/OpenClaw)
- **PRIORITY: Clawdbot VULN-188 patch status**

# Mid-Weekly Business Recap (Automated Wed/Sat)
Email Franklin a mid-weekly business summary including:
- Major accomplishments and completed tasks (last 3-4 days)
- Outstanding items and their status
- Business progress metrics (prospects, meetings, revenue)
- Critical priorities for the next few days
- Financial summary and pipeline status

Note: Daily summaries only generated when prompted. Mid-weekly summaries automated.

# AI Resilience Monitoring

Check RESILIENCE.md status weekly. Flag any:
- Provider policy changes
- Regulatory developments affecting AI access
- Local infrastructure progress updates
- Model availability changes

If significant regulatory news breaks, add to Thursday AI brief immediately.

# Learning Reviews (Systematic Improvement)

## Daily Learning Check (During Memory Updates)
Review recent activities and ask:
1. What broke or went wrong today?
2. What was the root cause?
3. What principle would have prevented this?
4. Does an existing principle need updating?

Update `REGRESSIONS.md` if failures occurred.
Update `PRINCIPLES.md` if guidance was insufficient.

## Weekly Learning Review (Sundays with AI Newsletter)
Analyze patterns from the past week:
1. Which principles are working well?
2. Which principles need refinement?
3. What new challenges emerged?
4. Are we learning faster or just working harder?

## Monthly Learning Audit (1st Saturday)
Deep review of learning effectiveness:
1. Which regressions keep recurring?
2. What systematic changes are needed?
3. How can we optimize for learning rate vs task completion?
4. Are our principles actually changing behavior?

## Quarterly Archive Cleanup (Every 3 Months)
Archive management to prevent REGRESSIONS.md bloat:
1. Move entries >90 days old to supermemory archive
2. Consolidate similar issues into pattern summaries
3. Keep file under 50 active entries for performance
4. Test supermemory_search capability for historical patterns

**Goal:** Turn every mistake into institutional learning, not just individual problem-solving. Maintain performance through systematic archiving.