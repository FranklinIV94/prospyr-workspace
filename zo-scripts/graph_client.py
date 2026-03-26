"""
Microsoft Graph API Client for Zo
Connects to support@simplifyingbusinesses.com via Graph API (app-only, client credentials flow)

IMPORTANT: App-only tokens use /users/{UPN}/ endpoints, NOT /me/
/me only works with delegated (user) auth tokens.
"""

import os
import requests
from datetime import datetime, timedelta

GRAPH_BASE = "https://graph.microsoft.com/v1.0"
GRAPH_USERS_BASE = "https://graph.microsoft.com/v1.0/users/support@simplifyingbusinesses.com"
TOKEN_FILE = os.path.expanduser("~/.msgraph-zo-token")

# App credentials for support@simplifyingbusinesses.com (ALBS)
CLIENT_ID = os.environ.get("GRAPH_CLIENT_ID", "d5289bd8-eeaf-4789-8720-39bf4dcc91cf")
CLIENT_SECRET = os.environ.get("GRAPH_CLIENT_SECRET", "ZMQ8Q~HsrlEJ5V9G1y6NL2eY6a2YTnyxQdip6bUB")
TENANT_ID = os.environ.get("GRAPH_TENANT_ID", "82c42990-313e-4294-983b-f1aa4657c49f")


def get_access_token():
    """Get Graph API access token using client credentials flow (app-only)"""
    if not all([CLIENT_ID, CLIENT_SECRET, TENANT_ID]):
        raise EnvironmentError(
            "Missing Graph credentials. Set GRAPH_CLIENT_ID, "
            "GRAPH_CLIENT_SECRET, GRAPH_TENANT_ID in environment."
        )
    
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "https://graph.microsoft.com/.default",
    }
    
    resp = requests.post(url, data=data)
    resp.raise_for_status()
    return resp.json()["access_token"]


def get_token():
    """
    Load cached token or fetch new one.
    App-only tokens don't need /me verification — just try the request.
    """
    token_path = os.path.expanduser(TOKEN_FILE)
    try:
        with open(token_path) as f:
            token = f.read().strip()
        if token:
            return token
    except (FileNotFoundError, OSError):
        pass
    token = get_access_token()
    with open(token_path, "w") as f:
        f.write(token)
    return token


def graph_headers():
    return {"Authorization": f"Bearer {get_token()}", "Content-Type": "application/json"}


def get_inbox_emails(folder="inbox", top=20, filter_since=None):
    """
    Fetch emails from support@ inbox (or specified folder)
    App-only: uses /users/{upn}/mailFolders/{folder}/messages
    """
    params = {"$top": top, "$orderby": "receivedDateTime desc"}
    
    if filter_since:
        dt = filter_since.strftime("%Y-%m-%dT%H:%M:%SZ")
        params["$filter"] = f"receivedDateTime ge {dt}"
    
    # IMPORTANT: /users/{upn}/ not /me/ for app-only auth
    resp = requests.get(
        f"{GRAPH_USERS_BASE}/mailFolders/{folder}/messages",
        headers=graph_headers(),
        params=params,
    )
    resp.raise_for_status()
    return resp.json().get("value", [])


def get_email_body(message_id):
    """Get full body of a specific email"""
    resp = requests.get(
        f"{GRAPH_USERS_BASE}/messages/{message_id}?$select=subject,body,from,toRecipients,receivedDateTime",
        headers=graph_headers(),
    )
    resp.raise_for_status()
    return resp.json()


def send_reply(in_reply_to_id, content):
    """Send reply to an existing email thread"""
    payload = {
        "message": {
            "body": {"contentType": "Text", "content": content},
            "inReplyTo": {"@odata.type": "Microsoft.Graph.Message", "id": in_reply_to_id},
        },
        "saveToSentItems": "true",
    }
    # IMPORTANT: /users/{upn}/sendMail not /me/sendMail for app-only auth
    resp = requests.post(
        f"{GRAPH_USERS_BASE}/sendMail",
        headers=graph_headers(),
        json=payload,
    )
    resp.raise_for_status()
    return resp


def send_email(to_address, subject, body, CC=None):
    """Send a new email"""
    to_recipients = [{"emailAddress": {"address": to_address}}]
    msg = {
        "message": {
            "subject": subject,
            "body": {"contentType": "Text", "content": body},
            "toRecipients": to_recipients,
        }
    }
    if CC:
        msg["message"]["ccRecipients"] = [
            {"emailAddress": {"address": a}} for a in CC
        ]
    
    # IMPORTANT: /users/{upn}/sendMail not /me/sendMail for app-only auth
    resp = requests.post(
        f"{GRAPH_USERS_BASE}/sendMail",
        headers=graph_headers(),
        json=msg,
    )
    resp.raise_for_status()
    return resp


def get_unread_count():
    """Get unread email count in inbox"""
    resp = requests.get(
        f"{GRAPH_USERS_BASE}/mailFolders/inbox",
        headers=graph_headers(),
    )
    resp.raise_for_status()
    return resp.json().get("totalUnreadCount", 0)


def triage_emails(since_hours=24):
    """
    Triage recent emails - identify new client inquiries vs existing vs support
    Returns categorized dict
    """
    since = datetime.utcnow() - timedelta(hours=since_hours)
    emails = get_inbox_emails(filter_since=since)
    
    triage = {
        "new_client_inquiry": [],
        "existing_client": [],
        "auto_notification": [],
        "unread_count": get_unread_count(),
    }
    
    for email in emails:
        subject = email.get("subject", "").lower()
        from_addr = email.get("from", {}).get("emailAddress", {}).get("address", "")
        body_preview = email.get("bodyPreview", "").lower()
        
        # Skip auto-notifications
        if any(k in subject for k in ["no-reply", "noreply", "notification", "donotreply"]):
            triage["auto_notification"].append(email)
            continue
        
        # New client signals
        new_client_keywords = ["interested", "services", "help", "need", "looking for", 
                             "quote", "consultation", "pricing", "how much", "tax", 
                             "bookkeeping", "payroll", "onboarding"]
        
        is_new = any(k in subject or k in body_preview for k in new_client_keywords)
        
        if is_new and email.get("toRecipients"):
            triage["new_client_inquiry"].append(email)
        else:
            triage["existing_client"].append(email)
    
    return triage


if __name__ == "__main__":
    # Quick test
    try:
        unread = get_unread_count()
        print(f"Unread: {unread}")
        recent = get_inbox_emails(top=5)
        print(f"Recent emails: {len(recent)}")
    except EnvironmentError as e:
        print(f"Setup needed: {e}")
    except Exception as e:
        print(f"Error: {e}")
