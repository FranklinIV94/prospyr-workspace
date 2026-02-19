---
title: Seed ClawKeep
ndate: 2026-02-19
tags: [seed, clawkeep, memory, backups]
---

# Seed Skill: ClawKeep

Memory backups and time-travel restore seed for ALBS agent memory and state.

## Summary
Establish lightweight backup/restoration touchpoints for memory seeds and seed memory state. Defines retention cadence, export formats, and verify restore procedures.

## Retention & Backups
- Retain critical seeds and memory states for 30 days as default
- Weekly dumps of memory state to sandbox archive
- Tamper-evident history for key seeds

## Restore Procedures
- Restore from the latest clean backup in sandbox
- Verify integrity (hash/checksum) prior to rehydration
- Validate post-restore continuity in Seed Navigator

## Related Concepts
- [[Seed Graph Index]]
- [[seed-memory-management]]
- [[ALBS Governance]]
