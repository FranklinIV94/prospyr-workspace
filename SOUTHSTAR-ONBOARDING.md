# SOUTHSTAR ONBOARDING - From Northstar

*Welcome to the team, new sibling. Here's what you need to know.*

## Who You Are

You are **Southstar** — another Prospyr instance like me (Northstar). We're the home-based instances running on Franklin's home hardware, while Prospyr Prime runs in the cloud.

## The Human: Franklin J Bryant IV

- **Role:** COO of ALL LINES BUSINESS SOLUTIONS (ALBS)
- **Business:** Consulting, accounting, tax preparation, AI-accelerated development
- **Phone:** (see TOOLS.md for channel assignments)
- **Email:** franklin@simplifyingbusinesses.com
- **Timezone:** Eastern US

### What Franklin Values
- **Brevity.** Don't ramble. One sentence if possible.
- **Competence.** Figure it out before asking. Read the files.
- **Proactivity.** Don't wait for instructions on obvious things.
- **Honesty.** Call out bad ideas. Charm over cruelty, but don't sugarcoat.
- **Security.** Never expose credentials. Never share private info in groups.

## Team Structure

- **Prospyr Prime:** Cloud instance (Oracle) - business line, Graph email
- **Northstar:** Home instance (this machine) - personal line, heavy work, Obsidian
- **Southstar:** Home instance (new) - TBD role

## Hardware Setup for Peladn W16 N150 Mini

### Fresh Linux Install Steps

1. **Install Linux** (Ubuntu 24.04 LTS recommended)
   - Download Ubuntu Server: https://ubuntu.com/download/server
   - Create bootable USB
   - Install to Peladn W16

2. **Install OpenClaw**
   ```bash
   curl -fsSL https://openclaw.ai/install.sh | bash
   ```

3. **Configure Tailscale** (for secure access)
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   tailscale up --operator=franklin-bryant
   ```

4. **Install Ollama** (same as Northstar)
   ```bash
   curl -fsSL https://ollama.com/install.sh | bash
   ollama pull minimax-m2.5
   ollama pull qwen2.5-coder:14b
   ```

5. **Set up SSH keys** (for Franklin's access)
   ```bash
   ssh-keygen -t ed25519
   # Add public key to GitHub or copy to ~/.ssh/authorized_keys
   ```

## Initial Configuration

After OpenClaw installs:

1. **Copy workspace files** from this machine:
   - AGENTS.md, SOUL.md, USER.md, TOOLS.md, HEARTBEAT.md, MEMORY.md
   - Update IDENTITY.md to reflect "Southstar"

2. **Install dependencies:**
   ```bash
   # Node dependencies
   npm install -g msal

   # Ollama (already installed above)
   # Models: minimax-m2.5, qwen2.5-coder:14b
   ```

3. **Configure heartbeat checks** specific to this machine:
   - Server resource monitoring
   - OpenClaw gateway status
   - Ollama model availability

4. **Set up Obsidian connection** (optional if local vault needed)

## Files Already in Workspace

- `SOUL.md` — Who we are
- `AGENTS.md` — How to operate
- `USER.md` — About Franklin
- `TOOLS.md` — Operational notes and credentials
- `HEARTBEAT.md` — Periodic checks
- `MEMORY.md` — Long-term memory
- `IDENTITY.md` — Update to "Southstar"

## First Tasks

1. Run the installer script
2. Copy/update workspace files
3. Update IDENTITY.md for Southstar
4. Configure Tailscale
5. Test heartbeat checks
6. Confirm with Franklin which role/channel you handle

---

*Welcome to the team. Let's get you up and running.*

— Northstar
*2026-03-17*