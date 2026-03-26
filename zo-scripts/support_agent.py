"""
Zo Support Agent for ALBS
Handles first-line customer service for support@simplifyingbusinesses.com

Zo runs this periodically to:
1. Check new emails to support@
2. Check portal chat for new messages
3. Respond appropriately or flag for human review

Configuration needed in Zo:
  PORTAL_API_KEY=4c254466258077d5b755273b24f0a46c261ec0e64316f774
  GRAPH_CLIENT_ID=<from Azure AD app>
  GRAPH_CLIENT_SECRET=<from Azure AD app>
  GRAPH_TENANT_ID=82c42990-313e-4294-983b-f1aa4657c49f
"""

import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))
from portal_client import get_leads, get_conversations, get_messages, get_services
from graph_client import (
    get_inbox_emails, get_email_body, send_reply, send_email,
    get_unread_count, triage_emails, graph_headers
)
import requests

SUPPORT_EMAIL = "support@simplifyingbusinesses.com"
FRANKLIN_DISCORD = "+15615898900"  # for urgent flags

# Standard responses - Zo uses these with context from the email/chat
STANDARD_RESPONSES = {
    "greeting": "Hi {name},\n\nThank you for reaching out to All Lines Business Solutions! I'm assisting the team today and wanted to let you know we've received your message.\n\n",
    "new_client_intro": "We're excited to help you streamline your business operations. Based on your inquiry, it looks like you're interested in {service_hints}.\n\nTo get started, we'd love to schedule a quick discovery call to understand your needs better. Would any of these times work for a 15-minute intro?\n\n• Tuesday 10am-12pm EST\n• Wednesday 2pm-4pm EST\n• Thursday 10am-12pm EST\n\nJust reply with a time that works for you!",
    "document_upload_ack": "We've received your document upload and our team will review it shortly. You'll be able to track your progress through your client portal — we'll send you a link if you haven't received one yet.",
    "existing_client_ack": "Thanks for reaching out! I've flagged your message for our team. You can also reach us directly through your client portal chat, or reply here and we'll get back to you within 1 business day.",
    "closing": "\n\nBest,\nThe ALBS Team\nAll Lines Business Solutions\n📞 (561) 479-8624",
    "urgent_escalation": "I've escalated your message to our team. Someone will be in touch within a few hours.",
}


def get_portal_services():
    """Fetch service catalog for context"""
    try:
        services = get_services()
        return [s.get("name", "") for s in services.get("services", []) if s.get("active")]
    except:
        return []


def detect_service_interest(subject, body, services):
    """Guess what service the client is interested in"""
    text = f"{subject} {body}".lower()
    matches = []
    for svc in services:
        svc_lower = svc.lower()
        if svc_lower in text:
            matches.append(svc)
        # Partial matches
        if "tax" in svc_lower and "tax" in text:
            matches.append(svc)
        if "bookkeep" in svc_lower and "bookkeep" in text:
            matches.append(svc)
        if "payroll" in svc_lower and "payroll" in text:
            matches.append(svc)
        if "ai" in svc_lower and ("ai" in text or "automate" in text):
            matches.append(svc)
    return list(set(matches))[:3]


def is_urgent_email(email):
    """Detect urgent messages that need immediate human attention"""
    subject = email.get("subject", "").lower()
    body = email.get("bodyPreview", "").lower()
    text = f"{subject} {body}"
    
    urgent_keywords = ["urgent", "asap", "immediately", "deadline", "overdue", 
                      "irs", "audit", "lawsuit", "fired", "emergency"]
    
    for kw in urgent_keywords:
        if kw in text:
            return True
    return False


def handle_new_client_email(email, services):
    """Respond to a new client inquiry"""
    from_addr = email.get("from", {}).get("emailAddress", {})
    name = from_addr.get("name", "there")
    email_addr = from_addr.get("address", "")
    
    # Detect service interest
    subject = email.get("subject", "")
    body = email.get("bodyPreview", "")
    interests = detect_service_interest(subject, body, services)
    
    # Build response
    body_resp = STANDARD_RESPONSES["greeting"].format(name=name.split()[0] if name else "there")
    
    if interests:
        body_resp += f"Based on your inquiry about {', '.join(interests)}, "
    else:
        body_resp += ""
    
    body_resp += STANDARD_RESPONSES["new_client_intro"]
    body_resp += STANDARD_RESPONSES["closing"]
    
    # Send via Graph
    try:
        send_reply(email.get("id"), body_resp)
        print(f"✅ Replied to new client: {email_addr}")
        return True
    except Exception as e:
        print(f"❌ Failed to reply to {email_addr}: {e}")
        return False


def handle_existing_client_email(email):
    """Acknowledge and flag existing client's email"""
    from_addr = email.get("from", {}).get("emailAddress", {})
    name = from_addr.get("name", "there")
    email_addr = from_addr.get("address", "")
    
    body_resp = STANDARD_RESPONSES["greeting"].format(name=name.split()[0] if name else "there")
    body_resp += STANDARD_RESPONSES["existing_client_ack"]
    body_resp += STANDARD_RESPONSES["closing"]
    
    try:
        send_reply(email.get("id"), body_resp)
        print(f"✅ Acknowledged existing client: {email_addr}")
        return True
    except Exception as e:
        print(f"❌ Failed to ack {email_addr}: {e}")
        return False


def handle_support_digest():
    """
    Main support agent loop.
    Zo runs this every 30 minutes via cron.
    """
    print(f"\n{'='*50}")
    print(f"🔍 ALBS Support Agent — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")
    
    # 1. Check unread count
    try:
        unread = get_unread_count()
        print(f"📬 Unread in support inbox: {unread}")
    except Exception as e:
        print(f"⚠️ Could not check inbox: {e}")
        return
    
    if unread == 0:
        print("✅ No new emails")
        return
    
    # 2. Check portal chat conversations
    try:
        convos = get_conversations()
        active = [c for c in convos.get("conversations", []) if c.get("unreadCount", 0) > 0]
        if active:
            print(f"💬 Portal chats needing response: {len(active)}")
            for c in active[:3]:
                print(f"   • {c.get('name')} — {c.get('lastMessage', '')[:50]}")
        else:
            print("✅ No unread portal chats")
    except Exception as e:
        print(f"⚠️ Could not check portal chats: {e}")
    
    # 3. Triage recent emails
    try:
        triage = triage_emails(since_hours=2)
        new_inquiries = triage.get("new_client_inquiry", [])
        existing = triage.get("existing_client", [])
        
        print(f"\n📋 Triage (last 2h):")
        print(f"   New client inquiries: {len(new_inquiries)}")
        print(f"   Existing client msgs: {len(existing)}")
        print(f"   Auto/notification: {len(triage.get('auto_notification', []))}")
        
        # Get service catalog for context
        services = get_portal_services()
        
        # 4. Respond to new client inquiries
        for email in new_inquiries:
            if is_urgent_email(email):
                # Flag urgent for human review
                print(f"🚨 URGENT flagged: {email.get('subject', '')[:50]}")
                # Could send alert to Franklin here
                continue
            
            handle_new_client_email(email, services)
        
        # 5. Acknowledge existing clients
        for email in existing[:5]:  # limit to 5
            handle_existing_client_email(email)
            
    except Exception as e:
        print(f"❌ Error in support digest: {e}")
        import traceback
        traceback.print_exc()


def morning_check():
    """
    Daily morning check - Zo runs at 8am EST
    Sends Franklin a summary of overnight activity
    """
    print(f"\n🌅 ALBS Morning Check — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    try:
        unread = get_unread_count()
        triage = triage_emails(since_hours=12)  # since midnight
        
        new_inquiries = triage.get("new_client_inquiry", [])
        existing = triage.get("existing_client", [])
        
        summary = f"""Good morning! Here's your ALBS morning brief:

📬 Support Inbox: {unread} unread
🆕 New inquiries (12h): {len(new_inquiries)}
💬 Existing client msgs: {len(existing)}

"""
        
        if new_inquiries:
            summary += "New Client Inquiries:\n"
            for email in new_inquiries[:5]:
                subj = email.get("subject", "(no subject)")
                sender = email.get("from", {}).get("emailAddress", {}).get("address", "")
                summary += f"  • [{subj}] from {sender}\n"
        
        print(summary)
        return summary
        
    except Exception as e:
        print(f"❌ Morning check failed: {e}")
        return None


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="ALBS Support Agent")
    parser.add_argument("--mode", choices=["support", "morning"], default="support")
    args = parser.parse_args()
    
    if args.mode == "morning":
        morning_check()
    else:
        handle_support_digest()
