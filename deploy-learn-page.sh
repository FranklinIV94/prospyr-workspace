#!/bin/bash
set -e

WP_CREDS="admin:ktLT 9Snk pNIJ GWl2 d1qN DYzn"
WP_URL="https://simplifyingbusinesses.com"

curl -X POST "${WP_URL}/wp-json/wp/v2/pages" \
  -H "Content-Type: application/json" \
  -u "${WP_CREDS}" \
  -d '{
    "title": "Learn",
    "content": "<!-- wp:html --><meta http-equiv=\"refresh\" content=\"0; url=https://all-lines-learning-center.vercel.app\" /><p>Redirecting to <a href=\"https://all-lines-learning-center.vercel.app\">ALBS Learning Center</a>...</p><!-- /wp:html -->",
    "slug": "learn",
    "status": "publish"
  }' -v
