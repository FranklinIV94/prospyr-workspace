#!/bin/bash
WP_CREDS="admin:h681 Vnoa E05y yZrR bGk7 gA1B"
WP_URL="https://simplifyingbusinesses.com"

# Check if /learn page already exists
EXISTING=$(curl -s -u "${WP_CREDS}" "${WP_URL}/wp-json/wp/v2/pages?slug=learn" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -n "$EXISTING" ] && [ "$EXISTING" != "" ]; then
    echo "Page exists with ID: $EXISTING. Updating..."
    curl -X PUT "${WP_URL}/wp-json/wp/v2/pages/${EXISTING}" \
      -H "Content-Type: application/json" \
      -u "${WP_CREDS}" \
      -d '{
        "content": "<!-- wp:html --><meta http-equiv=\"refresh\" content=\"0; url=https://all-lines-learning-center.vercel.app\" /><p>Redirecting to <a href=\"https://all-lines-learning-center.vercel.app\">ALBS Learning Center</a>...</p><!-- /wp:html -->",
        "status": "publish"
      }'
else
    echo "Creating new /learn page..."
    curl -X POST "${WP_URL}/wp-json/wp/v2/pages" \
      -H "Content-Type: application/json" \
      -u "${WP_CREDS}" \
      -d '{
        "title": "Learn",
        "content": "<!-- wp:html --><meta http-equiv=\"refresh\" content=\"0; url=https://all-lines-learning-center.vercel.app\" /><p>Redirecting to <a href=\"https://all-lines-learning-center.vercel.app\">ALBS Learning Center</a>...</p><!-- /wp:html -->",
        "slug": "learn",
        "status": "publish"
      }'
fi
