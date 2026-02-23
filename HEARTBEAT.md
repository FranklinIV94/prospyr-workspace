# ⚠️ IMPORTANT: Alert Configuration (Feb 20, 2026)
**DO NOT send heartbeat/cron alerts to +15614798624**
- Franklin receives all alerts via Telegram
- Only respond to direct messages from +15614798624 or +15615898900
- WhatsApp only for Prospyr communication
- **Proposed changes require team review and approval via email before implementation**

---

# Host Split (Northstar vs Prospyr)
- **Northstar (this machine):** Obsidian vault + heavy work + local gateway.
- **Prospyr (Oracle 4GB):** Graph email + WhatsApp gateway + lightweight monitors.

# Enhanced Security Monitoring (Feb 20, 2026)
**Weekly - Self-healing security practices**

```bash
# Run security audit
openclaw security audit --deep

# Check for known vulnerabilities in dependencies
npm audit --json | jq '.vulnerabilities'

# Review open ports and connections
netstat -tuln | grep LISTEN

# Check for unauthorized device pairings
cat /home/ubuntu/.clawdbot/devices/paired.json | jq '.'
```

**Process for proposed changes:**
1. Run security audit during heartbeat
2. Document findings and proposed fixes in a report
3. **Email detailed proposal to Franklin** with:
   - What vulnerability/issue was found
   - Why it matters (risk assessment)
   - Proposed fix with code/details
   - Impact of not fixing
4. Wait for approval before implementing
5. Implement approved changes
6. Verify fix worked

**Email template for proposed changes:**
- Subject: "[SECURITY] Proposed Fix: [Issue Name] - Review Required"
- Body: Detailed explanation, risk level, fix details, approval needed

---

# OpenClaw Security Threat Monitoring (Feb 20, 2026)
**Check daily - Alerts for OpenClaw CVEs, hacks, breaches**

```bash
# Run security threat monitor
/home/franklin-bryant/.openclaw/workspace/scripts/openclaw-security-monitor.sh

# Check GitHub directly for security advisories
curl -s "https://api.github.com/repos/openclai/openclaw/advisories" | jq '.[].summary'

# Monitor Twitter/X for OpenClaw security mentions (manual for now)
# Search: openclaw cve, openclaw vulnerability, openclaw hack
```

**Process:**
1. Run monitor during heartbeat
2. Check GitHub advisories and Reddit discussions
3. If critical vulnerability found → **IMMEDIATE email alert** with details
4. Include CVE number, severity, affected versions, mitigation
5. Wait for approval before implementing fixes

**Alert thresholds:**
- Critical/High severity → Immediate notification
- Medium → Weekly digest
- Low → Include in regular security report

---

# OpenRouter Credit Monitoring (CRITICAL - Added Feb 18, 2026)
**Check every heartbeat - This was flagged in TWO compound reviews and kept failing**

```bash
# Check OpenRouter credit balance
# If MiniMax model is failing with 402 errors, alert Franklin
curl -s "https://openrouter.ai/api/v1/auth/key" -H "Authorization: Bearer $OPENROUTER_API_KEY" | jq -r '.data.usage, .data.limit'
```

If you see 402 errors on MiniMax model (minimax/minimax-m2.5):
- **IMMEDIATELY** notify Franklin that OpenRouter credits are depleted
- Note: System falls back to Claude Opus, but this costs more
- Franklin's numbers: +15614798624 (personal), +15615898900 (business)

**Why this matters:** MiniMax is the default model ($0.20-0.30/1M input). When credits run out, every request falls back to Opus ($5.00/1M input) — 15-20x cost increase.

---

# Server Resource Monitoring (CRITICAL)
**Check every heartbeat - Alert if thresholds exceeded**

```bash
# Check disk usage
DISK_USED=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USED" -gt 85 ]; then
    echo "🚨 DISK ALERT: ${DISK_USED}% used - cleanup needed!"
fi

# Check memory usage
MEM_AVAIL=$(free -m | awk 'NR==2 {print $7}')
if [ "$MEM_AVAIL" -lt 150 ]; then
    echo "🚨 MEMORY ALERT: Only ${MEM_AVAIL}MB available!"
fi

# Check swap usage
SWAP_USED=$(free -m | awk 'NR==3 {print $3}')
if [ "$SWAP_USED" -gt 2000 ]; then
    echo "⚠️ SWAP WARNING: ${SWAP_USED}MB in use - system under pressure"
fi
```

Alert thresholds:
- Disk >85% → Alert Franklin immediately
- Memory <150MB available → Alert Franklin immediately
- Swap >2GB → Warning (system stressed but operational)

# Microsoft Graph Email Monitoring & Weekly AI Newsletter
**FREQUENCY: Every 90 minutes** (reduced to minimize context overload)

**NOTE:** Graph monitoring runs on **Prospyr** (Oracle) where the Graph scripts/tokens are installed.
On **Northstar**, this block should simply report "not configured" instead of failing.

```bash
# Prospyr-only Graph heartbeat
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

If connection fails after refresh, notify Franklin (Telegram preferred).

# Dropbox Activity Monitoring

Check Dropbox for recent uploads, changes, and action items that need follow-up.

```bash
# Check recent Dropbox activity (last 48 hours by default)
node dropbox-activity-monitor.js 48

# Automatic token renewal check
node dropbox-token-renewal.js check
```

Process:
- Review last 48 hours of activity
- Communicate findings immediately
- Delete detailed data after reporting (privacy)
- Await specific instructions for follow-ups

Monitors: proposals, contracts, client files, pending items

# Email Activity Monitoring

Check email for recent important messages and action items requiring attention.

```bash
# Check recent email activity (last 48 hours)
node email-activity-monitor.js

# Check for business emails requiring LangExtract analysis
/home/ubuntu/clawd/langextract-email-analyzer.sh
```

Process:
- Review last 48 hours of sent/received emails
- Analyze for importance and action requirements
- Process business documents with LangExtract (ALBS standard)
- Extract client communications, contracts, proposals, tax docs
- Communicate findings immediately
- Delete email cache after reporting (privacy)
- Await specific instructions for follow-ups

Monitors: urgent emails, action required, client communications, deadlines, document analysis requests

# Obsidian Access Monitoring (CRITICAL)

**Northstar:** Obsidian vault is local (filesystem). We monitor vault readability + basic write access.
**Prospyr:** If using REST API automation, monitor it there.

```bash
# Northstar local vault sanity check
VAULT="/home/franklin-bryant/Documents/Prospyr"
if [ -d "$VAULT" ]; then
  test -w "$VAULT" && echo "✅ Obsidian vault writable: $VAULT" || echo "🚨 Obsidian vault NOT writable: $VAULT"
  test -f "$VAULT/Vault Index.md" && echo "✅ Vault Index present" || echo "⚠️ Vault Index missing"
else
  echo "🚨 Obsidian vault path missing: $VAULT"
fi

# Prospyr-only REST monitor (if installed)
if [ -x /home/ubuntu/clawd/obsidian-automation/obsidian-connection-monitor.sh ]; then
  /home/ubuntu/clawd/obsidian-automation/obsidian-connection-monitor.sh || true
fi
```

Critical for: Real-time note creation + reliable vault operations.

# Security Monitoring (CRITICAL - VULN-188)

Enhanced security checks due to identified Clawdbot vulnerabilities.

```bash
# Prospyr-only: WhatsApp gateway logs + paired devices
if [ -f /home/ubuntu/.clawdbot/logs/whatsapp.log ]; then
  UNAUTHORIZED=$(grep -v "+15614798624\|+15615898900\|+19416469319\|+13059304695\|+19417165199" /home/ubuntu/.clawdbot/logs/whatsapp.log | tail -20 | wc -l)
  if [ "$UNAUTHORIZED" -gt 0 ]; then
    echo "⚠️ SECURITY: $UNAUTHORIZED unauthorized WhatsApp attempts detected in last check"
  fi
fi

if [ -f /home/ubuntu/.clawdbot/devices/paired.json ]; then
  cat /home/ubuntu/.clawdbot/devices/paired.json | jq -r 'keys | length' > /tmp/device_count_current
  if [ ! -f /tmp/device_count_baseline ]; then
    cat /tmp/device_count_current > /tmp/device_count_baseline
  fi

  CURRENT=$(cat /tmp/device_count_current)
  BASELINE=$(cat /tmp/device_count_baseline)

  if [ "$CURRENT" -gt "$BASELINE" ]; then
    echo "🚨 SECURITY ALERT: New device pairing detected ($CURRENT vs $BASELINE)"
  fi

  # Check for non-Tailscale connections
  grep -v "100\." /home/ubuntu/.clawdbot/devices/paired.json || echo "✅ All connections from Tailscale network"
else
  echo "WhatsApp security logs not configured on this host (expected on Northstar)."
fi

# Port 9377 monitor (if present)
if [ -x /home/ubuntu/clawd/port-9377-monitor.sh ]; then
  /home/ubuntu/clawd/port-9377-monitor.sh
fi
```

Process:
- Prospyr monitors WhatsApp contact attempts + device pairings
- Northstar focuses on local host posture + vault integrity
- Alert immediately if suspicious activity detected
- Enforce complete silence for unauthorized numbers

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