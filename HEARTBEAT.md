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

Check Microsoft Graph email connection and automatically refresh token if needed.

```bash
# Check Microsoft Graph email status
/home/ubuntu/bin/msgraph-email.py --heartbeat

# If token expired, automatically refresh it
if [ $? -ne 0 ]; then
    echo "Token expired, refreshing..."
    /home/ubuntu/bin/refresh-msgraph-token.py
fi
```

If connection fails after refresh, send WhatsApp notification to Franklin.

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

# Obsidian API Connection Monitoring (CRITICAL)

Monitor and maintain connection to Franklin's Obsidian workspace for AI-accelerated business automation.

```bash
# Check Obsidian API connection health and auto-reconnect if needed
/home/ubuntu/clawd/obsidian-automation/obsidian-connection-monitor.sh

# Check connection status
if [ -f /tmp/obsidian-connection-status.json ]; then
    STATUS=$(jq -r '.status' /tmp/obsidian-connection-status.json)
    FAILURES=$(jq -r '.consecutive_failures' /tmp/obsidian-connection-status.json)
    if [ "$STATUS" != "connected" ] && [ "$FAILURES" -gt 0 ]; then
        echo "⚠️ OBSIDIAN API: Connection issues detected ($FAILURES failures)"
    fi
fi
```

Process:
- **PRIORITY:** Maintain 24/7 connection to http://100.118.133.60:27123
- Auto-reconnect procedures if connection fails
- Alert immediately if connection lost >3 attempts
- Monitor Tailscale tunnel health
- Ensure Local REST API plugin is responding

Critical for: Real-time note creation, AI analysis integration, business automation pipeline

# Security Monitoring (CRITICAL - VULN-188)

Enhanced security checks due to identified Clawdbot vulnerabilities.

```bash
# Check for unauthorized WhatsApp message attempts
if [ -f /home/ubuntu/.clawdbot/logs/whatsapp.log ]; then
    # Check last 24 hours for unauthorized number attempts
    UNAUTHORIZED=$(grep -v "+15614798624\|+15615898900\|+19416469319\|+13059304695\|+19417165199" /home/ubuntu/.clawdbot/logs/whatsapp.log | tail -20 | wc -l)
    if [ "$UNAUTHORIZED" -gt 0 ]; then
        echo "⚠️ SECURITY: $UNAUTHORIZED unauthorized WhatsApp attempts detected in last check"
    fi
fi

# Check for unauthorized device pairings (daily)
cat /home/ubuntu/.clawdbot/devices/paired.json | jq -r 'keys | length' > /tmp/device_count_current
if [ ! -f /tmp/device_count_baseline ]; then
    echo "2" > /tmp/device_count_baseline
fi

CURRENT=$(cat /tmp/device_count_current)
BASELINE=$(cat /tmp/device_count_baseline)

if [ "$CURRENT" -gt "$BASELINE" ]; then
    echo "🚨 SECURITY ALERT: New device pairing detected ($CURRENT vs $BASELINE)"
    # MANDATORY: Send to BOTH numbers immediately
    # Personal: +15614798624
    # Business: +15615898900
    # Message: "🚨 New connection detected. Is this new connection secured or authorized?"
    # 15-MINUTE RESPONSE WINDOW
    # If no response within 15 minutes OR response "no": Execute emergency protocol
fi

# Check for non-Tailscale connections
grep -v "100\." /home/ubuntu/.clawdbot/devices/paired.json || echo "✅ All connections from Tailscale network"

# Port 9377 Security Monitor (camofox-browser preparation)
/home/ubuntu/clawd/port-9377-monitor.sh
```

Process:
- **NEW:** Monitor unauthorized WhatsApp contact attempts
- Monitor device pairings for unauthorized additions
- Watch for WebSocket connections outside Tailscale (100.x.x.x)
- Alert immediately if suspicious activity detected
- Check for Clawdbot security updates/patches
- **Enhanced:** Complete silence enforcement for unauthorized numbers

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