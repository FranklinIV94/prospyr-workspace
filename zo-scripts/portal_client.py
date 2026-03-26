"""
ALBS Portal API Client
Zo uses this to interact with the onboarding portal
"""

import os
import requests
from datetime import datetime

PORTAL_API_KEY = os.environ.get("PORTAL_API_KEY", "4c254466258077d5b755273b24f0a46c261ec0e64316f774")
BASE_URL = "https://onboarding.simplifyingbusinesses.com"

headers = {"x-api-key": PORTAL_API_KEY}


def get_leads(status=None, search=None, limit=20, page=1):
    """Fetch leads from portal"""
    params = [("limit", limit), ("page", page)]
    if status:
        params.append(("status", status))
    if search:
        params.append(("search", search))
    
    resp = requests.get(f"{BASE_URL}/api/v1/clients",
                        headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()


def get_lead(lead_id):
    """Fetch single lead by ID"""
    resp = requests.get(f"{BASE_URL}/api/v1/clients/{lead_id}",
                        headers=headers)
    resp.raise_for_status()
    return resp.json()


def create_lead(first_name, last_name, email, company=None, phone=None, 
                 title=None, service_categories=None, notes=None):
    """Create a new lead in portal"""
    payload = {
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
    }
    if company:
        payload["company"] = company
    if phone:
        payload["phone"] = phone
    if title:
        payload["title"] = title
    if service_categories:
        payload["serviceCategories"] = service_categories
    if notes:
        payload["notes"] = notes
    
    resp = requests.post(f"{BASE_URL}/api/v1/clients",
                        headers=headers, json=payload)
    resp.raise_for_status()
    return resp.json()


def get_conversations():
    """Get all active chat conversations"""
    resp = requests.get(f"{BASE_URL}/api/chat",
                        headers=headers,
                        params={"conversations": "true"})
    resp.raise_for_status()
    return resp.json()


def get_messages(lead_id):
    """Get chat messages for a specific lead"""
    resp = requests.get(f"{BASE_URL}/api/chat",
                        headers=headers,
                        params={"leadId": lead_id})
    resp.raise_for_status()
    return resp.json()


def get_services():
    """Get available service catalog"""
    resp = requests.get(f"{BASE_URL}/api/services",
                        headers=headers)
    resp.raise_for_status()
    return resp.json()


def daily_briefing():
    """Generate morning briefing of all leads"""
    data = get_leads(limit=100)
    clients = data.get("clients", [])
    
    status_counts = {}
    for c in clients:
        s = c.get("status", "UNKNOWN")
        status_counts[s] = status_counts.get(s, 0) + 1
    
    new_leads = [c for c in clients if c.get("status") == "NEW"]
    onboarding = [c for c in clients if c.get("status") == "ONBOARDING"]
    active = [c for c in clients if c.get("status") == "ACTIVE"]
    
    msg = f"""📊 ALBS Portal Morning Briefing — {datetime.now().strftime('%B %d, %Y')}

Total Clients: {len(clients)}

By Status:
"""
    for status, count in sorted(status_counts.items()):
        msg += f"  {status}: {count}\n"
    
    msg += f"""
Pipeline:
  🆕 New (need contact): {len(new_leads)}
  🚀 In Onboarding: {len(onboarding)}
  ✅ Active: {len(active)}

Recent New Leads:
"""
    for lead in new_leads[:5]:
        name = f"{lead.get('firstName','')} {lead.get('lastName','')}".strip()
        email = lead.get('email', 'No email')
        company = lead.get('company', '-')
        msg += f"  • {name} | {email} | {company}\n"
    
    if len(new_leads) > 5:
        msg += f"  ...and {len(new_leads) - 5} more\n"
    
    return msg


if __name__ == "__main__":
    print(daily_briefing())
