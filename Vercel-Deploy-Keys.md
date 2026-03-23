# Vercel Deploy Keys — Southstar

> Use this file to find Vercel credentials for deploying the prospyr-dashboard project.

## Where to Find Tokens

### Option 1: Vercel Dashboard (Recommended)
1. Go to **vercel.com/dashboard**
2. Click your profile picture → **Settings** → **Tokens**
3. Create a new token with deploys:full scope
4. Token name: southstar-deploy

### Option 2: Local Vercel Config
```
~/.vercel/credentials.json
```

## Project Info (Prospyr Dashboard)
- Project ID: prj_aFTskSALaSRuLUXdwzPJSUGHoIOP
- Org ID: team_iuWIBU1DQJlbahCMAYQ8I20h

## Deploy Commands
```bash
cd /tmp/prospyr-dashboard
vercel deploy --prod --yes
```

## ⚠️ Env Var Blocker — Delete This First
vercel.com → prospyr-dashboard → Settings → Environment Variables

**DELETE:** `NEXT_PUBLIC_PAPERCLIP_API`
(references a deleted secret — blocks all deploys)

## Status (March 21, 2026)
- UI overhaul done, deploy blocked by stale env var
- Server-side proxy: /api/proxy → Paperclip Tailscale tunnel
- Branding: Prospyr Inc Operations Hub
