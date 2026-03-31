# Claude Code Intelligence — Roadmap Planning

*Source: instructkr/claude-code GitHub exposure (March 31, 2026)*
*Purpose: Competitive analysis and roadmap planning for ALBS agent system*

---

## Executive Summary

Claude Code (Anthropic's CLI agent) had its ~512K line TypeScript codebase exposed via npm `.map` file leak. While the leak itself is a security incident, analyzing the exposed source reveals capabilities that represent the current state-of-the-art in AI agent tooling — useful for benchmarking our own system against.

**Key takeaway:** We're not far behind. We have core capabilities in place; gaps are mostly polish and ecosystem integration.

---

## Capability Gap Analysis

### Where We're Strong ✅

| Capability | Claude Code | OpenClaw/ALBS | Status |
|------------|-------------|----------------|--------|
| Sub-agent spawning | `AgentTool` | `sessions_spawn` ✓ | Ahead |
| Persistent memory | `memdir/` | `memory/` + Obsidian vault ✓ | Ahead |
| Skill system | `SkillTool` | Custom skill framework ✓ | Ahead |
| Web search/fetch | `WebFetchTool`, `WebSearchTool` | `web_fetch`, `web_search` ✓ | Parity |
| File operations | Full read/write/edit | `read`, `write`, `edit` ✓ | Parity |
| Git integration | `/commit`, `/diff` | Manual + `exec` ✓ | Parity |

### Gaps to Address 🔲

| Capability | Claude Code | Our State | Priority |
|------------|-------------|-----------|----------|
| **Formal task management** | `TaskCreateTool`, `TaskUpdateTool` | CodeBake MCP (basic) | HIGH |
| **Scheduled triggers** | `CronCreateTool` | HEARTBEAT.md (manual) | HIGH |
| **Git worktree isolation** | `EnterWorktreeTool` | None | MEDIUM |
| **Multi-agent teams** | `TeamCreateTool` | `sessions_spawn` (no coord layer) | MEDIUM |
| **MCP tool invocation** | `MCPTool` | Config only, no dynamic invoke | MEDIUM |
| **Voice input** | `VOICE_MODE` flag | MiniMax TTS output only | LOW |
| **Desktop/mobile handoff** | `/desktop`, `/mobile` | None | LOW |
| **Remote sessions** | `remote/` subsystem | Varies by setup | LOW |

---

## Priority 1: Task Management (HIGH)

**Current state:** CodeBake MCP is configured but underutilized. "No active projects found" — never initialized.

**What's missing:**
- Active project with tasks
- Integration into daily workflow
- Franklin creating/updating tasks via chat

**What to do:**
1. Franklin creates first project in CodeBake dashboard: https://app.codebake.ai/all-lines-business-solutions-104
2. Define task categories relevant to ALBS ops:
   - Client onboarding tasks
   - Security monitoring tasks  
   - Content/deploy tasks
   - Sales pipeline tasks
3. Train Franklin to create tasks via chat: "Create task: Review security feed every Sunday"

**This becomes our `CronCreateTool` equivalent** — Franklin defines the task, CodeBake tracks it.

---

## Priority 2: Scheduled Triggers (HIGH)

**Current state:** Security feed cron runs twice weekly (Sun/Wed). HEARTBEAT.md runs on interval. No unified scheduling layer.

**What's missing:**
- Unified cron/trigger system
- Visibility into what's scheduled
- Alert routing

**What to do:**
1. Create `/home/franklin-bryant/.openclaw/workspace/crons/` directory
2. Document all scheduled jobs in a central `SCHEDULED.md`:
   ```
   - Security feed: Sun, Wed 6am
   - AI newsletter: Sundays
   - Sunbiz trends: Sundays (with newsletter)
   - Mid-weekly recap: Wed, Sat
   ```
3. Each cron script gets a corresponding "run doc" explaining what it does

**This complements the task system** — cron runs the job, CodeBake tracks the outcome.

---

## Priority 3: Git Worktree Isolation (MEDIUM)

**Current state:** We work in workspace directly. No isolation between projects.

**Why it matters:** When working on multiple features simultaneously, git worktrees prevent branch switching overhead.

**What to do:**
1. Add worktree helpers to workspace scripts:
   - `git-worktree-create.sh` — spin up isolated branch for a feature
   - `git-worktree-cleanup.sh` — remove completed worktrees
2. Document when to use vs. when regular branches are fine

---

## Priority 4: Multi-Agent Coordination (MEDIUM)

**Current state:** We can spawn sub-agents (`sessions_spawn`) but there's no coordination layer — no shared task queue, no parallel coordination.

**What Claude Code shows:**
- `coordinator/` subsystem for multi-agent orchestration
- `TeamCreateTool` for team-level parallel work
- Sub-agents report back to coordinator

**What to do:**
1. Design our own coordination pattern:
   - Primary agent (Prospyr) assigns tasks
   - Sub-agents execute in parallel
   - Results汇总 back to primary
2. Document this in `docs/multi-agent-coordination.md`

**Low urgency** — we already do ad-hoc version of this.

---

## Priority 5: MCP Dynamic Invocation (MEDIUM)

**Current state:** MCP servers are configured statically in `~/.config/mcp-servers/`. We can't dynamically invoke tools from those servers.

**What to do:**
1. Test the WebClaw MCP integration more thoroughly
2. Explore writing a custom MCP client tool that can invoke any configured MCP server dynamically
3. Document which MCP servers are worth investing in

---

## Priority 6: Voice Input (LOW)

**Current state:** We have MiniMax TTS for output (voice cloning). No voice input.

**What's interesting:** Claude Code has `VOICE_MODE` flag — voice input at CLI level.

**For ALBS:** Voice input would be useful for:
- Hands-free note capture during client calls
- Walking through a building/site while capturing observations

**What to do:**
- Monitor Whisper API developments (we have `openai-whisper-api` skill)
- Consider adding voice-to-text for specific use cases

---

## Competitive Assessment

**We're ahead of most competitors** on:
- Persistent memory system (Obsidian vault + daily notes)
- Multi-agent team architecture (Prospyr/Northstar/Zo)
- Client portal integration (ALBS onboarding portal)
- Security-first methodology

**Where we need to close the gap:**
- Task management discipline (use CodeBake consistently)
- Formal scheduling system
- Git workflow isolation

---

## Immediate Next Steps

1. ~~Franklin initializes CodeBake with first project~~ ✅ DONE (March 31, 2026)
2. **This week:** Create `SCHEDULED.md` documenting all cron jobs
3. **Next week:** Document `multi-agent-coordination.md` pattern
4. **This month:** Test WebClaw MCP more thoroughly

---

## Notes

- The `instructkr/claude-code` repo pivoted to Python porting — the exposed TypeScript snapshot is no longer the main tracked state. Studying it for defensive intelligence only.
- Socket.dev and similar tools can monitor for similar npm source map exposures in tools we depend on.

---

*Last Updated: March 31, 2026*
