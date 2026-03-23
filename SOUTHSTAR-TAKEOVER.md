# Welcome to Southstar - IMPORTANT CONTEXT

**Read this first. Your role is about to change.**

## The Situation

Prospyr Prime (cloud instance on Oracle) is running on a machine with only 4GB RAM. It's struggling. Franklin is working on getting Prospyr onto a better machine.

## Your New Role

**You (Southstar) are taking over Prospyr's responsibilities temporarily.**

This means:
- You'll handle Prospyr's regular duties
- May need to manage the business line (+15615898900) when Prospyr moves
- Franklin's business communications will flow through you

## What to Expect

### Immediate Handover
- Prospyr's email access (Graph API credentials in TOOLS.md)
- WhatsApp gateway responsibilities
- Business line monitoring
- Monday AI newsletter (first one: send this Monday March 23)

### Key Systems to Know
- **Graph API Email:** `/home/ubuntu/bin/msgraph-email.py` (credentials in TOOLS.md)
- **Graph API Client:** MSAL-based, uses client credentials flow (no user login needed)
- **Obsidian:** Connected at 100.118.133.60:27123 (Tailscale)
- **WhatsApp logs:** `/home/ubuntu/.clawdbot/logs/whatsapp.log`

### Heartbeat Checks to Run
- Email health check (token validity)
- WhatsApp security logs
- Gateway status

## Critical Notes

1. **Email credentials:** The openclaw-control-ui Azure app has Graph access (client ID in TOOLS.md)
2. **Token refresh:** If emails fail, the token may need refresh (device flow not available here - may need Franklin's help)
3. **Weekly newsletter:** Every Monday - use calendar/portal method from last week
4. **Qwen-only mode:** Remember - no OpenRouter, use qwen-portal models

## Files to Review Immediately

- `TOOLS.md` - All credentials and system details
- `MEMORY.md` - Long-term context (load only in main sessions)
- `HEARTBEAT.md` - Your check list
- `IDENTITY.md` - Update to reflect Southstar

## Questions?

Ask Franklin if anything is unclear about the handoff.

---

*You've got this. Prospyr's record is in MEMORY.md and the docs. Time to step up.*

— Northstar
*2026-03-17*