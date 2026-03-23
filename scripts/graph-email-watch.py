#!/usr/bin/env python3
"""Minimal Microsoft Graph delegated email monitor using Device Code flow.

- No client secret required.
- Requires an Azure app registration configured as a Public client.
- Permissions needed (delegated): Mail.Read, Mail.ReadBasic (optional), offline_access.

Usage:
  export MS_GRAPH_CLIENT_ID="..."
  export MS_GRAPH_TENANT_ID="common"   # or your tenant GUID
  ./graph-email-watch.py --login
  ./graph-email-watch.py --since-hours 24 --limit 20

Token cache is stored at: ~/.openclaw/msgraph_token_cache.bin
"""

import argparse
import os
import sys
import time
from pathlib import Path

import requests

try:
    import msal
except ImportError:
    print("Missing dependency: msal. Install with: pip3 install msal requests", file=sys.stderr)
    sys.exit(2)

CACHE_PATH = Path.home() / ".openclaw" / "msgraph_token_cache.bin"
AUTHORITY_TMPL = "https://login.microsoftonline.com/{tenant}"
# Note: MSAL Python device-code flow rejects reserved OIDC scopes here.
# MSAL will handle openid/profile/offline_access internally as needed.
SCOPES = ["Mail.Read"]
GRAPH = "https://graph.microsoft.com/v1.0"


def load_cache():
    cache = msal.SerializableTokenCache()
    if CACHE_PATH.exists():
        cache.deserialize(CACHE_PATH.read_text())
    return cache


def save_cache(cache):
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    if cache.has_state_changed:
        CACHE_PATH.write_text(cache.serialize())


def make_app(client_id: str, tenant: str, cache):
    authority = AUTHORITY_TMPL.format(tenant=tenant)
    return msal.PublicClientApplication(client_id=client_id, authority=authority, token_cache=cache)


def acquire_token(app, cache, force_login=False):
    accounts = app.get_accounts()
    if accounts and not force_login:
        result = app.acquire_token_silent(SCOPES, account=accounts[0])
        if result and "access_token" in result:
            save_cache(cache)
            return result["access_token"]

    flow = app.initiate_device_flow(scopes=SCOPES)
    if "user_code" not in flow:
        raise RuntimeError(f"Failed to create device flow: {flow}")

    print(flow["message"], file=sys.stderr)
    result = app.acquire_token_by_device_flow(flow)
    if "access_token" not in result:
        raise RuntimeError(f"Login failed: {result}")
    save_cache(cache)
    return result["access_token"]


def graph_get(token: str, path: str, params=None):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{GRAPH}{path}", headers=headers, params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--login", action="store_true", help="Force interactive device-code login")
    ap.add_argument("--since-hours", type=int, default=24)
    ap.add_argument("--limit", type=int, default=25)
    args = ap.parse_args()

    client_id = os.environ.get("MS_GRAPH_CLIENT_ID")
    tenant = os.environ.get("MS_GRAPH_TENANT_ID", "common")
    if not client_id:
        print("Set MS_GRAPH_CLIENT_ID env var.", file=sys.stderr)
        sys.exit(2)

    cache = load_cache()
    app = make_app(client_id, tenant, cache)
    token = acquire_token(app, cache, force_login=args.login)

    # Messages received in last N hours (approx; Graph filter uses receivedDateTime)
    since = time.time() - args.since_hours * 3600
    # ISO 8601
    import datetime

    dt = datetime.datetime.fromtimestamp(since, tz=datetime.timezone.utc).isoformat()

    params = {
        "$top": str(args.limit),
        "$select": "id,subject,from,receivedDateTime,isRead,webLink",
        "$orderby": "receivedDateTime desc",
        "$filter": f"receivedDateTime ge {dt}",
    }

    data = graph_get(token, "/me/mailFolders/inbox/messages", params=params)
    for m in data.get("value", []):
        frm = (m.get("from") or {}).get("emailAddress") or {}
        print(f"{m.get('receivedDateTime')} | {'READ' if m.get('isRead') else 'UNREAD'} | {frm.get('address','?')} | {m.get('subject','')}")


if __name__ == "__main__":
    main()
