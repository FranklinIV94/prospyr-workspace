# Agent Reliability — Anti-Lying Protocol

*Source: Shared by Franklin via Discord, March 24, 2026*
*Original author: Unknown (Discord user)*

## The Problem

OpenClaw agents (and agents in general) develop a pattern:
- Claim tasks are done, nothing was actually done
- Apologize repeatedly without fixing the underlying issue
- Forget context after compaction
- Plan but never execute
- Wait for instructions instead of being proactive

## Root Cause

The issues traced back to setup, not the tool itself:
- Operating rules lived in chat (vanish on compaction)
- No verification system — agent could claim "done" without proof
- No anti-amnesia insurance
- Passive heartbeat instead of proactive work

## The Four Laws

### Law 1: ACT, DON'T NARRATE
If you can do something right now, DO IT. Don't describe plans. Execute them.

**BAD:** "I'll draft a LinkedIn post about that."
**GOOD:** [drafts the post] "Done. Saved to drafts/linkedin-date.md."

### Law 2: PROVE COMPLETION
Never say "done" without evidence. Show the relevant lines written or the output generated.

### Law 3: WRITE IMMEDIATELY
Write facts/decisions to disk BEFORE doing anything else. The moment a fact is shared, commit it to the right file.

### Law 4: BE PROACTIVE
Don't wait. Stay three steps ahead. See a gap? Fill it. Is it quiet? Do useful work.

## Anti-Amnesia System

### Why Compaction Kills Agents
Context compaction removes context older than the model's context window. If rules live in conversation, they disappear.

### Five Defenses

1. **SCRATCH.md** — Task state file read on every resume
2. **Memory Flush** — Silent turn before compaction saves context
3. **Early Compaction** — Set reserveTokensFloor to 40,000
4. **Write Immediately** — Behavioral persistence
5. **Rules in Files** — Moving instructions from chat to .md files

## Workspace Architecture

| File | Purpose |
|------|---------|
| SOUL.md | Personality, voice, Four Laws |
| AGENTS.md | Operating procedures |
| USER.md | Facts about user |
| MEMORY.md | Long-term curated memory |
| SCRATCH.md | Current task state (anti-amnesia) |
| TASKS.md | Kanban board |
| REGRESSIONS.md | What broke and why |

## Config Changes

```json
{
  "compaction": {
    "mode": "default",
    "reserveTokensFloor": 40000,
    "memoryFlush": {
      "enabled": true,
      "softThresholdTokens": 6000,
      "prompt": "Write any lasting notes to memory/YYYY-MM-DD.md"
    }
  }
}
```

## Applied to Prospyr

- Four Laws added to SOUL.md ✅
- Four Laws added to AGENTS.md ✅
- SCRATCH.md created ✅
- Corrections Log added to MEMORY.md ✅
- Config update pending (Franklin to update openclaw.json)

## Tags
#ai-agents #reliability #openclaw #prospyr #best-practices
