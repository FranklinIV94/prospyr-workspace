#!/usr/bin/env python3
"""Create a calendar event via Microsoft Graph API."""
import msal, requests

client_id = "d5289bd8-eeaf-4789-8720-39bf4dcc91cf"
tenant_id = "82c42990-313e-4294-983b-f1aa4657c49f"
client_secret = "dAV8Q~CYptlJA3zoSJAHzTMceBkBPal-XT5AQaTd"

app = msal.ConfidentialClientApplication(client_id, authority=f"https://login.microsoftonline.com/{tenant_id}", client_credential=client_secret)
result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])

if "access_token" not in result:
    print(f"Error: {result.get('error')}")
    exit(1)

# April 8, 2026 at 6:00 PM EST = April 9, 2026 at 2:00 AM UTC
start_utc = "2026-04-09T02:00:00Z"
end_utc = "2026-04-09T03:00:00Z"

event = {
    "subject": "Valentina Mami (Valenntina Echeverry Portuondo) - Consultation",
    "body": {
        "contentType": "HTML",
        "content": "Consultation with Valentina Mami (Valenntina Echeverry Portuondo).<br><br>See onboarding portal for client details."
    },
    "start": {
        "dateTime": start_utc,
        "timeZone": "UTC"
    },
    "end": {
        "dateTime": end_utc,
        "timeZone": "UTC"
    },
    "attendees": [
        {
            "emailAddress": {
                "address": "valomg1@gmail.com",
                "name": "Valentina Mami"
            },
            "type": "required"
        },
        {
            "emailAddress": {
                "address": "franklin@simplifyingbusinesses.com",
                "name": "Franklin Bryant"
            },
            "type": "required"
        }
    ],
    "isOnlineMeeting": True,
    "onlineMeetingProvider": "teamsForBusiness"
}

response = requests.post(
    "https://graph.microsoft.com/v1.0/users/franklin@simplifyingbusinesses.com/calendar/events",
    headers={
        "Authorization": f"Bearer {result['access_token']}",
        "Content-Type": "application/json"
    },
    json=event
)

if response.status_code in [200, 201]:
    data = response.json()
    print(f"✅ Event created")
    print(f"   Subject: {data.get('subject')}")
    print(f"   When: April 8, 2026 at 6:00 PM EST")
    print(f"   Attendees: Valentina Mami, Franklin Bryant")
    join_url = data.get('onlineMeeting', {}).get('joinUrl', 'N/A')
    print(f"   Teams link: {join_url}")
else:
    print(f"❌ Failed: {response.status_code} - {response.text}")
