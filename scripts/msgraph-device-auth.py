#!/usr/bin/env python3
"""
Microsoft Graph Device Authentication Script
Run this once to get a refresh token for Graph API access.
Saves token to ~/.msgraph-token
"""

import requests
import json
import time
import os

CLIENT_ID = "d5289bd8-eeaf-4789-8720-39bf4dcc91cf"
TENANT_ID = "82c42990-313e-4294-983b-f1aa4657c49f"
TOKEN_FILE = os.path.expanduser("~/.msgraph-token")

def get_device_code():
    """Get device code for interactive login"""
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/devicecode"
    data = {
        "client_id": CLIENT_ID,
        "scope": "https://graph.microsoft.com/.default offline_access"
    }
    resp = requests.post(url, data=data)
    resp.raise_for_status()
    return resp.json()

def poll_for_token(device_code):
    """Poll until user authenticates"""
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    data = {
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "client_id": CLIENT_ID,
        "device_code": device_code["device_code"]
    }
    
    print("\nWaiting for authentication...")
    print(f"URL: {device_code['verification_uri']}")
    print(f"User Code: {device_code['user_code']}")
    print("\nOpen the URL above and enter your code.")
    print("Sign in with your Microsoft account (franklin@simplifyingBusinesses.com)")
    print("After signing in, this script will automatically continue.\n")
    
    while True:
        time.sleep(device_code.get("interval", 5))
        resp = requests.post(url, data=data)
        resp_data = resp.json()
        
        if "access_token" in resp_data:
            # Save token
            with open(TOKEN_FILE, 'w') as f:
                json.dump(resp_data, f)
            print(f"Success! Token saved to {TOKEN_FILE}")
            print(f"Access token expires: {resp_data.get('expires_in', 'unknown')} seconds")
            if "refresh_token" in resp_data:
                print("Refresh token obtained — will auto-refresh when access token expires")
            return resp_data
        
        error = resp_data.get("error", "")
        if error == "authorization_pending":
            print(".", end="", flush=True)
            continue
        elif error == "authorization_declined":
            print("\nAuthorization declined by user.")
            return None
        elif error == "expired_token":
            print("\nDevice code expired. Please run this script again.")
            return None
        else:
            print(f"\nError: {error} - {resp_data.get('error_description', 'Unknown')}")
            return None

def main():
    print("=" * 60)
    print("Microsoft Graph Device Authentication")
    print("=" * 60)
    print("\nThis will authenticate you with Microsoft Graph API.")
    print("You'll be asked to sign in to your Microsoft account.")
    print()
    
    # Check if we already have a valid token
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'r') as f:
            token_data = json.load(f)
        if "access_token" in token_data:
            print(f"Existing token found in {TOKEN_FILE}")
            expires = token_data.get("expires_in", 0)
            print(f"Expires in: {expires} seconds")
            resp = input("\nOverwrite with new authentication? (y/N): ")
            if resp.lower() != 'y':
                print("Keeping existing token.")
                return
    
    try:
        device_code = get_device_code()
        result = poll_for_token(device_code)
        if result:
            print("\n✓ Authentication complete!")
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    main()
