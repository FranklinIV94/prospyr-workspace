# ALBS Client Onboarding Automation System

*Streamlined pipeline from prospect to active client*

## Overview

This system automates the client onboarding workflow using Prospyr + Northstar coordination, Obsidian for documentation, and Microsoft Graph for communications.

## Pipeline Stages

```
[Prospect] → [Discovery Call] → [Audit] → [Proposal] → [Contract] → [Kickoff] → [Active Client]
```

## Stage 1: New Prospect Capture

**Trigger:** Franklin mentions a new prospect
**Automation:**

1. Create Obsidian note using client-intake-template.md
2. Add to CRM/tracking (if applicable)
3. Schedule discovery call reminder

**Command:**
```bash
# Create new client file in Obsidian
/home/ubuntu/clawd/obsidian-automation/obsidian-redundant-connector.sh create "Client Files/[CLIENT NAME] - Intake.md" "$(cat /home/ubuntu/clawd/obsidian-templates/client-intake-template.md | sed 's/{{title}}/[CLIENT NAME]/g')"
```

## Stage 2: Discovery Call Completed

**Trigger:** Franklin completes discovery call
**Automation:**

1. Update Obsidian note with call notes
2. Qualify prospect (budget, team size, readiness)
3. If qualified → Generate audit proposal
4. Schedule follow-up

**Prospyr tasks:**
- Extract key info from call notes
- Calculate preliminary ROI estimates
- Draft proposal email

## Stage 3: Audit Phase ($2,500)

**Trigger:** Client approves audit
**Automation:**

1. Create audit project folder in Obsidian
2. Generate audit checklist
3. Set up Dropbox shared folder (if needed)
4. Schedule audit milestones

**Audit Checklist:**
- [ ] Technology stack inventory
- [ ] Process mapping sessions
- [ ] Data flow analysis
- [ ] Team skill assessment
- [ ] AI opportunity identification
- [ ] ROI calculations
- [ ] Risk assessment
- [ ] Implementation roadmap draft

## Stage 4: Proposal & Contract

**Trigger:** Audit complete
**Automation:**

1. Generate proposal from audit findings
2. Create contract from template
3. Send via email with portal link
4. Track signature status

## Stage 5: Project Kickoff

**Trigger:** Contract signed
**Automation:**

1. Create project workspace in Obsidian
2. Set up recurring check-in schedule
3. Create milestone tracking
4. Assign tasks to Prospyr/Northstar

## Automation Scripts

### new-client.sh
```bash
#!/bin/bash
# Usage: ./new-client.sh "Company Name" "Contact Name" "email@domain.com"

CLIENT_NAME="$1"
CONTACT="$2"
EMAIL="$3"

# Create Obsidian note
/home/ubuntu/clawd/obsidian-automation/obsidian-redundant-connector.sh create \
  "Client Files/${CLIENT_NAME} - Intake.md" \
  "# Client Intake: ${CLIENT_NAME}

## 📋 CLIENT INFORMATION
**Client Name:** ${CLIENT_NAME}
**Contact Person:** ${CONTACT}
**Email:** ${EMAIL}
**Created:** $(date +%Y-%m-%d)
**Status:** New Prospect

## 🎯 NEXT STEPS
- [ ] Schedule discovery call
- [ ] Qualify prospect
- [ ] Send audit proposal

---
**ALBS Contact:** Franklin Bryant | franklin@simplifyingbusinesses.com"

echo "✅ Client file created: ${CLIENT_NAME}"
```

### send-audit-proposal.sh
```bash
#!/bin/bash
# Send audit proposal email via Microsoft Graph

CLIENT_NAME="$1"
EMAIL="$2"

/home/ubuntu/bin/msgraph-email.py --send \
  --to "$EMAIL" \
  --subject "ALBS AI Systems Audit Proposal - ${CLIENT_NAME}" \
  --body-file "/home/ubuntu/clawd/email-templates/audit-proposal.html" \
  --html
```

## Multi-Agent Coordination

| Stage | Primary | Backup |
|-------|---------|--------|
| Prospect capture | Prospyr Prime | Northstar |
| Discovery prep | Prospyr Prime | Northstar |
| Audit execution | Both (parallel) | - |
| Proposal generation | Prospyr Prime | - |
| Document processing | Northstar | Prospyr Prime |
| Email communications | Prospyr Prime | - |

## Metrics Dashboard

Track in weekly reviews:
- Prospects in pipeline
- Discovery calls scheduled
- Audits in progress
- Proposals sent
- Conversion rate
- Revenue pipeline

## Integration Points

1. **Obsidian** - All client documentation
2. **Microsoft Graph** - Email communications
3. **Dropbox** - Shared client files (needs token refresh)
4. **Prospyr/Northstar** - Automation execution

---

*System established: 2026-02-19*
*Ready for deployment*
