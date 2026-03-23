# Security News Feed - Prospyr Integration

**Source:** secnewsapi.xyz
**API Key:** love-0606-breaks-0717

## What It Provides
- AI/agentic threats (109 articles)
- Vulnerabilities (259 articles)
- Zero-day alerts (113 articles)
- Sources: NVD/CVE, GitHub Advisory, Hacker News, SecurityWeek, Dark Reading, Schneier

## Where Data Lives
- **Local (Northstar):** `/home/franklin-bryant/.openclaw/workspace/security-feed/`
- **Summary:** `security-feed/summary.md`
- **Raw data:** `security-feed/latest-ai-threats.json`, `security-feed/latest-vulns.json`

## Weekly Update Integration
Include security feed highlights in the **weekly AI/Tech newsletter** to Franklin.

**Script location:** `/home/franklin-bryant/.openclaw/workspace/scripts/security-feed-fetcher.sh`

**To fetch manually:**
```bash
/home/franklin-bryant/.openclaw/workspace/scripts/security-feed-fetcher.sh
```

## Cron Setup (Northstar)
Run daily at 6 AM to have fresh data for weekly wrap-up:
```bash
0 6 * * * /home/franklin-bryant/.openclaw/workspace/scripts/security-feed-fetcher.sh
```

## Key Categories to Monitor
- `ai-agentic` — AI/agent security threats
- `vulnerability` — CVE, exploits
- `zero-day` — Active exploits
- `breach` — Data breaches

## Notes
- Franklin approved this integration (March 5, 2026)
- Use for weekly AI/Tech updates only
- API key: love-0606-breaks-0717
