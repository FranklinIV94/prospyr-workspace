# WORKFLOW_AUTO.md - ALBS Automation Standards

*Automated workflow documentation for All Lines Business Solutions*

## Overview

This document defines standardized automation workflows for ALBS operations, ensuring consistent quality and deployment standards.

---

## Deployment Workflow

### React Application Deployment

1. **Build**: `npm run build` in project directory
2. **Test**: Verify build output in `dist/` folder
3. **Deploy**: Push to Vercel via `npx vercel --prod`
4. **Verify**: Test live URL within 5 minutes

### Quality Gates

- [ ] Mobile responsiveness verified
- [ ] Form validation working
- [ ] Email notifications tested
- [ ] Error handling in place

---

## Client Intake Automation

### Form Submission Flow

1. Client submits form → Formspree
2. Formspree → EmailJS notification to ALBS
3. Data stored in Formspree dashboard
4. Optional: Zapier → Google Sheets

### Service Triage

- Tax services → Tax team queue
- AI Consultation → AIIO discovery call
- Bookkeeping → Onboarding workflow

---

## Communication Standards

### HTML Email Protocol

- **CRITICAL**: Always use `--body-file` flag, never `--body "$(cat file.html)"`
- Template: Bailey Woodin format
- Test all client emails before sending

### Professional Templates

- Client intake confirmation
- Service proposals
- Meeting follow-ups
- Invoice communications

---

## Security Protocols

### Access Control

- Only respond to authorized numbers
- Silent on unknown contacts
- Heartbeats via Telegram (not WhatsApp)

### API Key Management

- Store in vault, not in code
- Rotate regularly
- Never expose in logs or URLs

---

## Team Coordination

### Prospyr (Oracle Cloud)
- System monitoring
- API/data pipelines
- Email processing
- Security audits

### Northstar (N150)
- Dashboard development
- Frontend/UI work
- Testing/QA

### Handoff Protocol

1. Document changes in memory
2. Update relevant workflow files
3. Notify team of status changes

---

## Document Processing

### LangExtract Standard

All document extraction uses LangExtract (ALBS mandate as of Feb 9, 2026):
- Tax documents
- Contracts
- Client files
- Financial statements

### Email Analysis

- Use `/home/ubuntu/clawd/langextract-email-analyzer.sh`
- Prioritize recent (last 24-48 hours)
- Extract to Obsidian for client files

---

*Last Updated: 2026-02-21*
*Maintainer: ALBS Automation Team*
