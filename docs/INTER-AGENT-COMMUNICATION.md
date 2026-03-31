# Inter-Agent Communication Architecture

*Phase 2: Agent Integration — PI-6*
*Created: March 31, 2026*

---

## Overview

Prospyr Inc operates a multi-agent system where agents coordinate through defined communication channels and protocols. This document defines the current state and planned improvements.

---

## Current Architecture

### Agent Roster

| Agent | Host | Primary Role | Status |
|-------|------|--------------|--------|
| **Prospyr Prime** | Oracle VPS (cloud) | Primary business agent — Discord, WhatsApp, email, client comms | Active |
| **Northstar** | Northstar hardware (local) | Operations agent — heavy development, vault, local infra | Active |
| **Southstar** | Office Paled server (Punta Gorda) | Dashboard agent — web hosting, client demos | Needs attention |
| **Zo** | Zo Cloud | Demo/prototype agent — sandboxed builds | Active |

### Current Communication Channels

| Channel | Purpose | Agents Using |
|---------|---------|--------------|
| **Discord** | Primary alerts & Franklin direct comms | Prospyr Prime → Franklin |
| **WhatsApp** | Internal agent communication | Prospyr Prime (internal only) |
| **Graph Email** | Client comms via support@ | Prospyr Prime |
| **sessions_send** | Cross-session messaging | All agents |
| **Obsidian Vault** | Shared knowledge & context | Northstar (primary), all (read) |

---

## Communication Matrix

```
                    → Franklin (Discord)
                   /
Prospyr Prime ←────+→ Nadesha/Camila (email)
    |              \
    +→ Northstar (sessions_send)
    |
    +→ Southstar (TBD)
    |
    +→ Zo (TBD)

Northstar ←→ Southstar (Tailscale/local network)
Northstar ←→ Zo (TBD)
```

---

## Message Protocols

### 1. Task Delegation (sessions_send)
When Prospyr Prime delegates to Northstar:
```json
{
  "sessionKey": "northstar-session-id",
  "message": "Task description for Northstar",
  "timeoutSeconds": 300
}
```

### 2. Completion Report
Sub-agents report completion via:
- Session message back to parent
- CodeBake task update (for tracked work)
- Vault note (for context to persist)

### 3. Alert Routing
| Alert Type | Channel | Agent |
|------------|---------|-------|
| Security alert | Discord | Prospyr Prime → Franklin |
| System down | Discord + WhatsApp | Prospyr Prime → Franklin + team |
| Task complete | Session message | Any agent → parent |
| Client message | Email (Graph) | Prospyr Prime → support |

---

## Channel Assignment (Per SOUL.md)

- **+15615898900 (business)** → Prospyr Prime direct
- **+15614798624 (personal)** → Northstar
- Both respond to the same human — stay aligned

---

## Planned Improvements

### PI-6 Tasks: Configure Inter-Agent Communication

1. **Define message protocols** — Documented in this file ✅
2. **Set up session key exchange** — Document session IDs for each agent
3. **Create escalation paths** — What happens when an agent can't reach another?
4. **Add monitoring** — Track when agents fail to respond

### Session IDs (Current)

| Agent | Session Type | Notes |
|-------|--------------|-------|
| Prospyr Prime | Oracle VPS | Primary parent agent |
| Northstar | This host | Active development |
| Southstar | Office Paled | Dashboard + demos |
| Zo | Zo Cloud | Prototype/demo hosting |

---

## Security Considerations

- **WhatsApp:** Internal-only for agent coordination, not for client data
- **Discord:** Primary client-facing alert channel (Franklin)
- **Email:** External client communication only via Graph API
- **Sessions:** Encrypted via OpenClaw's session system

---

## Gaps & TODO

- [ ] **Southstar connection** — PI-5 blocked, needs Paperclip tunnel
- [ ] **Zo session key** — Need to establish sessions_send capability
- [ ] **Escalation automation** — What triggers automatic escalation?
- [ ] **Heartbeat monitoring** — Inter-agent health checks (HEARTBEAT.md covers Franklin-side only)

---

*Document to be updated as inter-agent communication is formalized.*
