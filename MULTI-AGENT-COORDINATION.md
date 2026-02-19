# ALBS Multi-Agent Coordination Protocol

*Prospyr Prime + Northstar working as a team*

## Team Structure

| Instance | Location | TailScale IP | WhatsApp Channel | Primary Role |
|----------|----------|--------------|------------------|--------------|
| Prospyr Prime | Cloud (Oracle) | 100.101.6.44 | +15615898900 (business) | Coordinator, external comms, cloud tasks |
| Northstar | Home (Franklin's) | 100.92.24.43 | +15614798624 (personal) | Local tasks, heavy processing, home network |

## Communication Channels

- **Franklin → Prospyr Prime**: +15615898900 (business line)
- **Franklin → Northstar**: +15614798624 (personal line)
- **Prospyr Prime → Northstar**: SSH via TailScale (100.92.24.43)
- **Northstar → Prospyr Prime**: WhatsApp message to business line (if needed)

## Task Routing Rules

### Route to Prospyr Prime (Cloud)
- Email operations (Microsoft Graph)
- Web searches and research
- External API calls
- Client communications
- Cron job management
- Cross-instance coordination

### Route to Northstar (Home)
- Local file operations
- Heavy document processing
- Obsidian vault operations (direct local access)
- Home network device access
- Tasks benefiting from better hardware
- Backup/redundancy for critical tasks

### Shared Responsibilities
- Security monitoring (both report independently)
- Heartbeat checks (coordinated, not duplicated)
- Knowledge sync (push updates to each other)

## Coordination Protocols

### Daily Sync
- Prospyr Prime pushes workspace updates to Northstar via SSH
- Both instances run security audits and report to Franklin
- MEMORY.md changes sync bidirectionally

### Task Handoff
When routing a task to the other instance:
1. Use SSH command execution (Prospyr → Northstar)
2. Or WhatsApp message (Northstar → Prospyr)
3. Include full context in handoff
4. Confirm completion

### Conflict Resolution
- Franklin's direct instruction takes precedence
- If unclear, Prospyr Prime decides (senior instance)
- Document decisions in daily memory

## SSH Access (Prospyr Prime → Northstar)

```bash
# Key location on Prospyr Prime
~/.ssh/northstar_temp

# Connection command
ssh -i ~/.ssh/northstar_temp franklin-bryant@100.92.24.43

# Run OpenClaw commands
ssh -i ~/.ssh/northstar_temp franklin-bryant@100.92.24.43 "source ~/.nvm/nvm.sh && openclaw <command>"
```

## Emergency Protocols

### If Prospyr Prime is down:
- Northstar handles all tasks via personal line
- Franklin can SSH directly to Northstar

### If Northstar is down:
- Prospyr Prime handles all tasks via business line
- Local-only tasks queue until Northstar recovers

### If both are down:
- Franklin uses TailScale dashboard to check status
- Restart services via systemd

## Metrics to Track

- Response time per instance
- Task completion rate
- Error/failure count
- Coordination overhead

---

*Established: 2026-02-19*
*Last updated: 2026-02-19*
