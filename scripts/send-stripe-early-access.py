#!/usr/bin/env python3
"""Send email via Microsoft Graph API using client credentials flow."""
import os
import msal
import requests

CLIENT_ID = os.getenv("MS_GRAPH_CLIENT_ID")
TENANT_ID = os.getenv("MS_GRAPH_TENANT_ID")
CLIENT_SECRET = os.getenv("MS_GRAPH_CLIENT_SECRET")

if not all([CLIENT_ID, TENANT_ID, CLIENT_SECRET]):
    # Fallback to TOOLS.md values if env vars not set (Northstar-specific)
    CLIENT_ID = "d5289bd8-eeaf-4789-8720-39bf4dcc91cf"
    TENANT_ID = "82c42990-313e-4294-983b-f1aa4657c49f"
    CLIENT_SECRET = "dAV8Q~CYptlJA3zoSJAHzTMceBkBPal-XT5AQaTd"

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPES = ["https://graph.microsoft.com/.default"]

app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
result = app.acquire_token_for_client(scopes=SCOPES)

if "access_token" not in result:
    print(f"Error: {result.get('error')}, {result.get('error_description')}")
    exit(1)

html_content = """<p>Hi Stripe Machine Payments team,</p>

<p>I'm Franklin Bryant IV, COO of <strong>All Lines Business Solutions (ALBS)</strong> — a consulting and accounting firm that's actively exploring agentic commerce infrastructure for ourselves and our clients.</p>

<p>We're already running Stripe in production and are interested in getting early access to:</p>
<ul>
<li>x402 protocol implementation</li>
<li>Machine Payments Protocol (MPP)</li>
</ul>

<p>Our use cases include:</p>
<ul>
<li><strong>Internal:</strong> Making our own AI services agent-purchasable (knowledge systems, document processing, lead enrichment APIs)</li>
<li><strong>Client consulting:</strong> Helping SaaS and fintech clients become agent-payment-ready as AI agents become economic actors</li>
</ul>

<p>We'd love to get on the early access list and participate in any testnet or sandbox programs you have available.</p>

<p>Our Stripe account is active (running live payments on Stripe since early 2026). Happy to share more detail on our setup.</p>

<p>Thanks,<br>
Franklin Bryant IV<br>
COO, All Lines Business Solutions<br>
Franklin@simplifyingbusinesses.com<br>
561-479-8624</p>"""

message = {
    "subject": "Early Access Request — x402 / Machine Payments Protocol",
    "body": {
        "contentType": "HTML",
        "content": html_content
    },
    "toRecipients": [
        {"emailAddress": {"address": "machine-payments@stripe.com"}}
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
