# REGRESSIONS.md — Documented Mistakes & Lessons Learned

## 2026-03-18
### Hardcoded Graph credentials instead of reading from TOOLS.md
**Issue:** Wrote a Python script with Graph credentials hardcoded inline instead of sourcing from TOOLS.md (where they're already documented).

**Lesson:** Check TOOLS.md first for any known credentials/keys before writing scripts that need them. TOOLS.md is the canonical source for this instance.

**Fix:** Updated script to read from env vars first with fallback to TOOLS.md values. Script now lives at `scripts/send-stripe-early-access.py`.
