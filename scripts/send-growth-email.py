#!/usr/bin/env python3
"""Send email via Microsoft Graph API using client credentials flow."""
import os
import msal
import requests

CLIENT_ID = os.getenv("MS_GRAPH_CLIENT_ID", "d5289bd8-eeaf-4789-8720-39bf4dcc91cf")
TENANT_ID = os.getenv("MS_GRAPH_TENANT_ID", "82c42990-313e-4294-983b-f1aa4657c49f")
CLIENT_SECRET = "8tq8Q~GjcYnxnaDwI2Pxw4c57vehS3fmc62akdsf"

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPES = ["https://graph.microsoft.com/.default"]

app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
result = app.acquire_token_for_client(scopes=SCOPES)

if "access_token" in result:
    print("Got token")
else:
    print(f"Error: {result.get('error')}, {result.get('error_description')}")
    exit(1)

import sys
html_file = sys.argv[1] if len(sys.argv) > 1 else "/home/franklin-bryant/Documents/Prospyr/Personal-Growth-System/Email-Drafts/2026-03-20-Growth-Kickoff.html"

with open(html_file, 'r') as f:
    html_content = f.read()

from email.mime.text import MIMEText
import base64

# Extract subject from HTML
import re
subject_match = re.search(r'<h1>(.*?)</h1>', html_content)
subject = subject_match.group(1) if subject_match else "10x Growth System"

message = {
    "subject": subject,
    "body": {
        "contentType": "HTML",
        "content": html_content
    },
    "toRecipients": [
        {"emailAddress": {"address": "franklin@simplifyingbusinesses.com"}}
    ]
}

response = requests.post(
    "https://graph.microsoft.com/v1.0/users/franklin@simplifyingbusinesses.com/sendMail",
    headers={"Authorization": f"Bearer {result['access_token']}", "Content-Type": "application/json"},
    json={"message": message}
)

if response.status_code in [200, 202]:
    print(f"✅ Email sent successfully!")
else:
    print(f"❌ Failed: {response.status_code} - {response.text}")
