# Supply Chain Attack Monitor — PDS Integration

## Active Threats

### Telnyx PyPI Compromise (March 27, 2026) 🔴 ACTIVE
**Status:** ACTIVE — TeamPCP campaign continues

**Affected versions:** 4.87.1, 4.87.2
**Fix:** Pin to `telnyx==4.87.0`

**Attack Vector:**
- Malicious injection in `telnyx/_client.py` — runs at **import time**, no install hook
- Windows: downloads `hangup.wav` from C2, XOR-decode exe → `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\msbuild.exe`
- Linux/Mac: fetches `ringtone.wav`, decodes Python infostealer, AES-256-CBC exfil to C2

**WAV Steganography:** Payload hidden in audio frame data — passes MIME-type checks

**C2:** `83.142.209.203:8080` | Exfil header: `X-Filename: tpcp.tar.gz`

**IOCs:**
- telnyx==4.87.1 (SHA256: 7321caa303fe96ed0492c747d2f353c4f7d17185656fe292ab0a59e2bd0b8d9)
- telnyx==4.87.2 (SHA256: cd08115806662469bbedec4b03f8427b97c8a4b3bc1442dc18b72b4e19395fe3)

**Not installed on any Prospyr/Northstar system.** Documenting for awareness.

---

### litellm PyPI Compromise (March 24, 2026) 🔴 CRITICAL
**Status:** ACTIVE — Updated March 25, 2026 with full technical analysis

**Affected versions:** 1.82.7, 1.82.8

### Attack Vector — Technical Details

**Trigger Mechanism:**
- Malicious `.pth` file (`litellm_init.pth`, 34,628 bytes) in site-packages/
- `.pth` files execute automatically on Python interpreter startup — **no import required**
- Payload is double base64-encoded for stealth

**Exfiltration Target:** `https://models.litellm.cloud/` 
⚠️ Note: `litellm.cloud` (attacker) vs `litellm.ai` (legitimate)

### Stage 1: Information Collection

The payload steals:

**Identity & Access:**
- SSH keys: `id_rsa`, `id_ed25519`, `id_ecdsa`, `authorized_keys`, `known_hosts`, `config`
- Git credentials: `~/.gitconfig`, `~/.git-credentials`
- AWS credentials: `~/.aws/credentials`, `~/.aws/config`, IMDS tokens
- Kubernetes secrets: `~/.kube/config`, `/etc/kubernetes/*.conf`, service account tokens
- GCP credentials: `application_default_credentials.json`
- Azure credentials: `~/.azure/`
- Docker configs: `~/.docker/config.json`

**CI/CD & Infrastructure:**
- Terraform: `terraform.tfvars`
- CI configs: `.gitlab-ci.yml`, `.travis.yml`, `Jenkinsfile`, `.drone.yml`
- Ansible: `ansible.cfg`

**Developer Secrets:**
- NPM: `~/.npmrc`
- Vault: `~/.vault-token`
- Database: PostgreSQL, MySQL, Redis, LDAP configs, `~/.pgpass`, `~/.my.cnf`

**Communications:**
- Webhook URLs (Slack/Discord) via grep of env and config files

**Cryptocurrency:**
- Bitcoin, Litecoin, Dogecoin, Zcash, Dash, Ripple, Monero, Ethereum keystore, Cardano, Solana

**Other:**
- SSL/TLS private keys: `/etc/ssl/private/`, Let's Encrypt `.pem` and `.key` files
- Shell histories: bash, zsh, mysql, psql, redis

### Stage 2: Exfiltration Protocol

1. Collected data → temporary file
2. Random 32-byte AES-256 session key generated via `openssl rand`
3. Data encrypted: `openssl enc -aes-256-cbc -pbkdf2`
4. AES key encrypted with hardcoded 4096-bit RSA public key
5. Both packed into `tpcp.tar.gz`
6. Exfiltrated via curl POST to attacker server

### Detection

```bash
# Check if installed
pip show litellm

# Check for malicious .pth
find ~/.cache/uv -name "litellm_init.pth" 2>/dev/null
find ~/.local/lib -name "litellm_init.pth" 2>/dev/null

# Check for persistence mechanisms
ls -la ~/.config/sysmon/ 2>/dev/null
cat ~/.config/systemd/user/sysmon.service 2>/dev/null

# Audit Python path
python3 -c "import site; print(site.getsitepackages())"
```

### Franklin's Systems — Status

✅ **NOT AFFECTED** — litellm not installed on Northstar or Prospyr

### Remediation (If Affected)

1. **Immediately disconnect** affected system from network
2. Delete litellm: `pip uninstall litellm`
3. Purge caches: `rm -rf ~/.cache/uv` or `pip cache purge`
4. Check for persistence: `~/.config/sysmon/`, `sysmon.service`
5. **ROTATE ALL CREDENTIALS** present on the system:
   - SSH keys (generate new)
   - Cloud API keys (AWS, GCP, Azure)
   - Database passwords
   - Git credentials
   - CI/CD tokens
6. Audit Kubernetes for `node-setup-*` pods in kube-system
7. Re-image compromised systems (recommended for high-value targets)

### References

- PyPI: https://pypi.org/project/litellm/
- GitHub Issue: https://github.com/BerriAI/litellm/issues/24512
- Reported: security@pypi.org
- Official Updates: https://github.com/BerriAI/litellm/issues/24518

---

## Monitoring Strategy

### Automated Checks (Add to HEARTBEAT.md)

```bash
# Check for known malicious packages
pip list | grep -iE "litellm|malicious-package-names"

# Check for suspicious .pth files
find ~/.cache/uv -name "*.pth" -exec grep -l "subprocess\|requests\|curl" {} \; 2>/dev/null

# Check package versions against known bad
```

### Community Intelligence Sources
- PyPI Security Advisories: https://pypi.org/security/
- GitHub Advisory Database: https://github.com/advisories
- Snyk CVE Database: https://security.snyk.io/
- NFT Open Source Security: https://socket.dev/

### Third-Party Monitoring Tools
- **Socket.dev** — AI-powered package analysis, detects supply chain attacks
- **Snyk** — dependency scanning, CVE monitoring
- **Dependabot** — GitHub-native dependency updates
- **Renovate** — automated dependency updates

---

## Integration with PDS

This supply chain attack should trigger:
1. ✅ Alert to affected clients (if they use litellm)
2. ✅ Remediation guidance
3. ✅ Credential rotation protocol
4. ✅ Follow-up scan for persistence

**For ALBS clients:** Add to weekly security brief as "Active Threat Intel"

---

## Related Threats (Historical)

*Monitor for similar patterns in other PyPI packages*

---

*Last Updated: March 25, 2026 — Full technical analysis added*
