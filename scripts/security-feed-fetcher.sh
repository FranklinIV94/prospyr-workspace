#!/bin/bash
# Security News Feed Fetcher
# Pulls AI/agentic threats from secnewsapi.xyz

API_KEY="love-0606-breaks-0717"
OUTPUT_DIR="/home/franklin-bryant/.openclaw/workspace/security-feed"
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)

mkdir -p "$OUTPUT_DIR"

# Fetch stats
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://www.secnewsapi.xyz/api/stats" > "$OUTPUT_DIR/stats.json"

# Fetch latest AI/agentic threats (20 items)
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://www.secnewsapi.xyz/api/news?category=ai-agentic&pageSize=20" > "$OUTPUT_DIR/latest-ai-threats.json"

# Fetch vulnerability alerts
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://www.secnewsapi.xyz/api/news?category=vulnerability&pageSize=10" > "$OUTPUT_DIR/latest-vulns.json"

# Create summary for email
cat > "$OUTPUT_DIR/summary.md" << EOF
# Security Feed Summary - $(date '+%B %d, %Y')

## Stats
- Total Articles: $(jq -r '.totalArticles' "$OUTPUT_DIR/stats.json")
- Vulnerabilities: $(jq -r '.byCategory[] | select(.category=="vulnerability") | .total' "$OUTPUT_DIR/stats.json")
- Zero-Days: $(jq -r '.byCategory[] | select(.category=="zero-day") | .total' "$OUTPUT_DIR/stats.json")
- AI/Agentic: $(jq -r '.byCategory[] | select(.category=="ai-agentic") | .total' "$OUTPUT_DIR/stats.json")

## Latest AI/Agentic Threats
$(jq -r '.items[:5] | .[] | "- **\(.title)** [\(.sourceName)] (\(.publishedAt | split("T")[0]))" ' "$OUTPUT_DIR/latest-ai-threats.json")

## Latest Vulnerabilities
$(jq -r '.items[:5] | .[] | "- **\(.title)** [\(.sourceName)] (\(.publishedAt | split("T")[0]))" ' "$OUTPUT_DIR/latest-vulns.json")

---
*Generated: $(date)*
EOF

echo "Security feed updated at $TIMESTAMP"
