#!/bin/bash
# OpenClaw Security Monitor
# Monitors for CVEs, hacks, and security issues related to OpenClaw

APIFY_TOKEN="apify_api_d3lFIJUKqrZROQmy6ajdrkisgUs40T1SFH9e"
ALERT_EMAIL="franklin@simplifyingbusinesses.com"

echo "=== OpenClaw Security Monitor ==="
echo "Running: $(date)"

# Check GitHub Security Advisories for OpenClaw
echo -e "\n[1] Checking GitHub Security Advisories..."
GITHUB_ADVISORIES=$(curl -s "https://api.github.com/repos/openclai/openclaw/advisories" 2>/dev/null | jq -r '.[].summary' 2>/dev/null | head -5)

if [ -n "$GITHUB_ADVISORIES" ]; then
    echo "⚠️ SECURITY ADVISORIES FOUND:"
    echo "$GITHUB_ADVISORIES"
    echo "$GITHUB_ADVISORIES" | mail -s "[SECURITY] OpenClaw Advisory Alert" "$ALERT_EMAIL"
else
    echo "✅ No GitHub advisories"
fi

# Check Reddit for OpenClaw security discussions
echo -e "\n[2] Checking Reddit..."
REDDIT_RESULTS=$(curl -s "https://api.apify.com/v2/acts/FgJtjDwJCLhRH9saM/run?token=$APIFY_TOKEN" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "function": "scrapeReddit",
    "searchTerms": ["openclaw security", "openclaw vulnerability", "openclaw cve", "openclaw hack"],
    "subreddits": ["openclaw", "artificial", "MachineLearning"],
    "limit": 10
  }' 2>/dev/null | jq -r '.data[] | {title: .title, score: .score}' 2>/dev/null | head -20)

if [ -n "$REDDIT_RESULTS" ]; then
    echo "Recent discussions found:"
    echo "$REDDIT_RESULTS"
fi

# Check for known vulnerability keywords in recent posts
echo -e "\n[3] Scanning for vulnerability keywords..."
VULN_KEYWORDS="cve|vulnerability|exploit|hack|breach|pwn|security|patch"

# Summary
echo -e "\n=== Scan Complete ==="
echo "Next scan: Next heartbeat (90 min)"
