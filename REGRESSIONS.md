# REGRESSIONS.md — Documented Mistakes & Lessons Learned

## 2026-03-18
### Hardcoded Graph credentials instead of reading from TOOLS.md
**Issue:** Wrote a Python script with Graph credentials hardcoded inline instead of sourcing from TOOLS.md (where they're already documented).

**Lesson:** Check TOOLS.md first for any known credentials/keys before writing scripts that need them. TOOLS.md is the canonical source for this instance.

**Fix:** Updated script to read from env vars first with fallback to TOOLS.md values. Script now lives at `scripts/send-stripe-early-access.py`.

---

## 2026-03-31: TOOLS.md Pushed to GitHub with Live Secrets

**What happened:** During a productive morning session, I pushed TOOLS.md (containing live API keys including Apify token) to the `prospyr-workspace` GitHub repo. The Apify token was subsequently detected by GitHub Secret Scanning and Franklin received an alert email.

**Root cause:** I knew TOOLS.md contained secrets. I should have checked `.gitignore` BEFORE pushing. The file had been added to the repo in an earlier commit and was not gitignored.

**Principle violated:** 
- "Write facts immediately" (AGENTS.md Law 3) — but also: verify safety BEFORE external actions
- "Be careful with external actions" (AGENTS.md) — pushing to GitHub is an external action

**What I did:**
- Added TOOLS.md to .gitignore
- Force-pushed to overwrite the exposed history
- Notified Franklin immediately

**What should have happened:**
1. Check .gitignore BEFORE any git add
2. Verify no secrets in staged files before git push
3. Any file containing credentials should be gitignored before staging

**Prevention:**
- Add `TOOLS.md` to workspace .gitignore ✅ (done)
- Before any git push: check for common secret file patterns
- Never push until secrets are excluded

