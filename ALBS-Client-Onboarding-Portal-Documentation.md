# ALBS Client Onboarding Portal

## System Overview

The ALBS Client Onboarding Portal is a comprehensive client management system that streamlines the onboarding process for new clients, handles service selection, availability scheduling, contract signing, PIN-secured client portal access, and calendar booking with Outlook sync.

**Last Updated:** March 16, 2026  
**Status:** Production - Live at https://albs-portal.vercel.app

---

## Features

### 1. Multi-Step Onboarding Flow

| Step | Name | Description |
|------|------|-------------|
| 0 | Welcome | Introduction and initial welcome screen |
| 1 | Services | Client selects desired services from the catalog |
| 2 | Availability | Client provides availability preferences |
| 3 | Terms & Signature | Digital contract signing with Master Service Agreement |
| 4 | PIN Setup | Client creates 6-digit PIN for portal access |
| 5 | Confirmation | Completion confirmation with booking link |

### 2. Client Portal (/client/[token])

**Security:** Protected by 6-digit PIN authentication (each client sets their own unique PIN)

Features:
- View selected services and subscription status
- Progress tracker showing onboarding completion
- Chat panel for client support communication
- Document upload capability (emailed to support)
- **Book a Meeting** button → internal calendar
- **Contact Support** button

### 3. Calendar & Booking System

**Location:** https://albs-portal.vercel.app/calendar

- Interactive calendar with available time slots
- Client self-service booking
- **Microsoft Graph Integration:** Bookings automatically sync to Franklin's Outlook calendar
- Teams meetings auto-created for each booking

### 4. Admin Dashboard (/admin)

- Lead management with full CRUD
- Service proposal sending
- Document request system
- Chat with clients
- Progress tracking per client
- Subscription/billing management

---

## Recent Updates (March 16, 2026)

### Resend Email Configuration Fix
- Updated all `from:` addresses → `Franklintaxpros@gmail.com`
- Files: `lib/email.ts`, `app/api/chat/route.ts`, `app/api/documents/route.ts`

### Microsoft Graph Outlook Calendar Sync
- Created `lib/graph.ts` - Graph API client
- Added `outlookEventId` to CalendarEvent model
- Bookings now sync to Franklin's Outlook calendar
- Credentials in Vercel environment variables

---

## URLs

- **Onboarding:** https://onboarding.simplifyingbusinesses.com/onboard/[token]
- **Client Portal:** https://albs-portal.vercel.app/client/[token]
- **Admin:** https://albs-portal.vercel.app/admin
- **Calendar:** https://albs-portal.vercel.app/calendar
- **Learning Center:** https://learn.simplifyingbusinesses.com