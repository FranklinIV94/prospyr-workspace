#!/bin/bash
# IntelBase Email Lookup Wrapper
# Usage: ./intelbase-lookup.sh <email> [--breaches]

API_KEY="in_oHY6RrfAwuXPgUMiOhtn"
BASE_URL="https://api.intelbase.is"

EMAIL="${1:?Usage: $0 <email> [--breaches]}"
BREACHES="false"

if [[ "$2" == "--breaches" ]]; then
  BREACHES="true"
fi

curl -s -X POST "${BASE_URL}/lookup/email" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg email "$EMAIL" --argjson breaches "$BREACHES" \
    '{email: $email, include_data_breaches: $breaches}')" \
  | jq .
