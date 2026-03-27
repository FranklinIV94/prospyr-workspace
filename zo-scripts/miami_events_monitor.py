"""
Miami Tech & AI Events Monitor
Zo runs this weekly to find upcoming events and send a digest.

Usage (in Zo cron):
  python3 ~/zo-scripts/miami_events_monitor.py

Env vars needed in Zo:
  PORTAL_API_KEY=4c254466258077d5b755273b24f0a46c261ec0e64316f774
  DISCORD_WEBHOOK_URL=<your discord webhook for alerts>
  FRANKLIN_DISCORD_ID=<discord user id or channel>
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta

# Try to import Discord webhook helper
try:
    from discord_webhook import DiscordWebhook
    HAS_DISCORD = True
except ImportError:
    HAS_DISCORD = False

SEARCH_TERMS = [
    "Miami tech meetup",
    "Miami AI meetup",
    "Fort Lauderdale tech",
    "Naples tech meetup",
    "South Florida business networking",
    "Miami blockchain",
    "Miami startup",
    "Miami entrepreneurship",
]

EVENT_SOURCES = [
    # Meetup API (free, no key needed for basic search)
    "https://api.meetup.com/find/upcoming_events",
    # Eventbrite (basic search)
    "https://www.eventbrite.com/api/v3/datasets/",
]

GEO_PARAMS = {
    "Miami": {"lat": 25.7617, "lon": -80.1918, "distance": 50},
    "Fort Lauderdale": {"lat": 26.1224, "lon": -80.1373, "distance": 30},
    "Naples FL": {"lat": 26.1420, "lon": -81.7949, "distance": 30},
}


def search_meetup(events_of_interest=None, days_ahead=14):
    """Search Meetup.com for events in South Florida"""
    results = []
    cutoff = (datetime.now() + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
    
    for city, params in GEO_PARAMS.items():
        url = "https://api.meetup.com/find/upcoming_events"
        querystring = {
            "key": os.environ.get("MEETUP_API_KEY", ""),
            "lat": params["lat"],
            "lon": params["lon"],
            "radius": params["distance"],
            "format": "json",
            "page": 10,
        }
        
        try:
            resp = requests.get(url, params=querystring, timeout=10)
            if resp.status_code != 200:
                continue
                
            data = resp.json()
            events = data.get("events", [])
            
            for event in events:
                name = event.get("name", "")
                # Filter for relevant events
                if events_of_interest:
                    if not any(term.lower() in name.lower() for term in events_of_interest):
                        continue
                
                results.append({
                    "name": name,
                    "date": event.get("local_date", ""),
                    "time": event.get("local_time", ""),
                    "location": event.get("venue", {}).get("name", "TBD"),
                    "city": city,
                    "link": event.get("link", ""),
                    "source": "Meetup",
                    "rsvps": event.get("yes_rsvp_count", 0),
                })
        except Exception as e:
            print(f"Meetup search error ({city}): {e}")
    
    return results


def build_digest():
    """Build weekly events digest"""
    events = search_meetup(events_of_interest=SEARCH_TERMS, days_ahead=21)
    
    if not events:
        return "📅 **Miami/South Florida Events This Week**\n\nNo new events found in the next 2 weeks. Check back next week!"
    
    # Sort by date
    events.sort(key=lambda x: x.get("date", "9999"))
    
    msg = f"""📅 **South Florida Tech & Business Events — Week of {datetime.now().strftime('%B %d')}**

Found {len(events)} events:

"""
    
    for ev in events[:15]:
        date_str = ev.get("date", "TBD")
        time_str = ev.get("time", "")
        name = ev.get("name", "TBD")
        location = ev.get("location", "TBD")
        city = ev.get("city", "")
        link = ev.get("link", "")
        rsvps = ev.get("rsvps", 0)
        
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            date_display = dt.strftime("%a %b %d")
        except:
            date_display = date_str
        
        msg += f"""**{date_display}** {time_str} | {city}
[{name}]({link})
📍 {location} | 👥 {rsvps} RSVPs

"""
    
    msg += """---
_Updates every week automatically. Forward event contacts to Prospyr to add them to your network._
"""
    
    return msg


def send_to_discord(message):
    """Send digest to Discord"""
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        print("No DISCORD_WEBHOOK_URL set, skipping Discord")
        return False
    
    if not HAS_DISCORD:
        print("discord_webhook not installed, skipping")
        return False
    
    try:
        webhook = DiscordWebhook(url=webhook_url, content=message)
        resp = webhook.execute()
        print(f"Discord webhook sent: {resp.status_code}")
        return True
    except Exception as e:
        print(f"Discord error: {e}")
        return False


def main():
    print(f"Miami Events Monitor — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    digest = build_digest()
    print(digest)
    
    # Send to Discord if configured
    send_to_discord(digest)
    
    return digest


if __name__ == "__main__":
    main()
