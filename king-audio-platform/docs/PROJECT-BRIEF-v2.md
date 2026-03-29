---
created: 2026-03-28
updated: 2026-03-28
status: 📋 Planning — Finalizing Tonight
type: Product Line
client: T17 Entertainment Services / King
priority: High
deadline: June 1, 2026 (LiveVocal MVP)
---

# T17 Entertainment — Studio & LiveVocal Product Line

> [!quote]
> **Core Vision:** Build T17 Entertainment's proprietary audio technology stack — a studio powerhouse workstation plus a portable live performance app — to establish T17 as both a recording label and a technology company.

---

## Product 1: T17 Studio Workstation
### "The Powerhouse"

**Purpose:** Permanent studio workstation for T17 Entertainment's recording studio. Runs all production, KingDAW, stem processing, and future AI-assisted mixing.

**Target Spec:**
| Component | Recommendation |
|---|---|
| **Machine** | Beelink SER7 (AMD Ryzen 7 8845HS, 32GB RAM, 1TB NVMe) |
| **Audio Interface** | Focusrite Scarlett 2i2 (studio-grade) |
| **OS** | Ubuntu Studio 24.04 LTS |
| **DAW** | Reaper ($60, Linux native) |
| **Stem Processing** | Demucs (local CPU, no GPU needed) |
| **AI Tools** | Ollama (local LLM), librosa (audio analysis), custom Python apps |
| **Studio Furniture** | TBD — confirm room dimensions |
| **Estimated Cost** | ~$720 (Beelink + Scarlett) |

**Core Apps on Workstation:**
- KingDAW — Custom DAW (Ardour-based or JUCE build)
- StemLab — Demucs-powered stem separation interface
- VocalChain — King's proprietary vocal chain preset manager
- (Future) MixAI — AI-assisted mixing/mastering

**Note:** This machine stays in the studio. It's not portable.

---

## Product 2: LiveVocal
### "Take Your Sound Anywhere"

**Purpose:** A portable, self-contained Linux app on a USB drive that runs on any laptop or PC at live venues. No installation needed on venue computers. Plug in, load your stems, perform.

**Key Technical Decision — Portable App vs. Live OS:**
| Approach | Pros | Cons |
|---|---|---|
| **Full Live OS on USB** | Everything self-contained, no host OS interference | Slower (USB3 vs NVMe), larger drive needed |
| **Portable App (AppImage/PyInstaller)** | Runs on venue's existing OS, faster, smaller | Depends on host OS audio stack, less controlled |
| **Custom ISO with Ventoy** | Multiple apps/tools on one USB, persistent storage | More complex to build, requires Ventoy setup |

**Recommended:** Ventoy-based approach:
1. USB drive flashed with Ventoy
2. LiveVocal ISO stored on USB
3. Boot into LiveVocal Linux on any venue laptop
4. King's stems loaded from USB or streamed from phone hotspot

**LiveVocal App Stack:**
| Layer | Technology |
|---|---|
| OS | Ubuntu Studio 24.04 LTS (Live mode) |
| Audio routing | JACK Audio Connection Kit |
| Stem playback | Reaper (lightweight, low-latency) |
| Stem separation | Demucs CLI (pre-processed stems) |
| UI | Custom Python/GTK app (minimal, dark mode, large touch targets) |
| Trigger | Python-pyaudio + keyboard shortcuts |

**LiveVocal UI (MVP Design):**
- Large track name display (readable from stage)
- Big VOCAL ON/OFF toggle (MIDI or keyboard "V")
- Volume faders: PA Mix / IEM Mix
- Simple transport: Play / Pause
- Dark theme only (stage-friendly)

**LiveVocal 1.0 Feature List:**
- [ ] USB-bootable Linux environment
- [ ] Stem loader (loads pre-processed instrumental + vocal WAV files)
- [ ] 2-bus audio routing (PA + IEM)
- [ ] Vocal toggle (keyboard shortcut + MIDI trigger)
- [ ] Minimal stage UI (dark mode, large text)
- [ ] JackTrip integration (future: stream vocal stem to IEM from studio)

**Long-term LiveVocal Roadmap:**
- [ ] Ventoy multi-tool USB (LiveVocal + utility tools)
- [ ] Wifi streaming: Venue laptop gets stems via local network from King's phone
- [ ] Multi-artist support (other T17 artists can load their stems)
- [ ] Cloud stem library (pre-processed stems sync from cloud)
- [ ] iOS/Android companion app for stem control

---

## Product 3: KingDAW (Post-June 1)
### "The Custom DAW"

**Purpose:** Replace Logic Pro X with a modern, cross-platform DAW that supports King's full vocal chain and allows custom plugin development.

**Short-term (Ardour-based):**
- Customize Ardour with King/T17 branding
- Pre-configure Linux VST3 plugin chain (Graillon 2, TDR Kotelnikov, etc.)
- 3 track templates: Lo-fi, Pop-Hook, Aggro

**Long-term (JUCE build):**
- Native macOS/Windows/Linux DAW
- Custom plugin SDK
- AI-assisted mixing via Ollama integration
- Cloud session sync

**See:** `KingDAW-Sound-Analysis-Report.md` for full technical spec.

---

## King's Sound Profile (3-Track Analysis — March 28, 2026)

**Files analyzed:** "Smoking in a Hotel Room" | "Don't Believe What You See" | "Tryna Find a Way"

### Core Vocal Signature (Consistent)
- Subtle Auto-Tune melodic retouch (20-35% retune) — King's identity, not effect
- Mid-forward EQ positioning — clear, present vocals
- Controlled dynamics — strong breath control
- Melodic sensibility — rapping-singing hybrid
- Pop hook architecture — memorable, simple, repeatable

### Three Performance Modes
| Mode | Tracks | BPM | Style | Chain Settings |
|---|---|---|---|---|
| **Lo-fi / Introspective** | Hotel Room | ~70-75 | Bedroom, raw | Warm, Saturn 10%, Graillon 25%, minimal reverb |
| **Pop-Hook / Atmospheric** | Don't Believe | ~85-95 | Radio-ready, bright | Bright, Saturn 15%, Graillon 35%, hall reverb |
| **Aggro / Energetic** | Tryna Find | ~90-100 | 808s, hard snare | Saturated, Saturn 20%, Graillon 35%, tight |

### Linux VST3 Chain (Recommended)
```
[Input] → Graillon 2 (pitch) → TDR Kotelnikov (comp+EQ)
  → TDR Slick EQ (tone) → Saturn 2 (saturation)
  → Valhalla SuperMassive (reverb) → [Output]
```

---

## Project Timeline

| Phase | Product | Timeline | Target |
|---|---|---|---|
| **Phase 1** | LiveVocal MVP (USB) | Weeks 1-6 | June 1, 2026 |
| **Phase 1a** | Hardware procurement | Week 1 | Confirm Beelink order |
| **Phase 1b** | LiveVocal Linux USB build | Weeks 2-3 | ISO ready for testing |
| **Phase 1c** | Reaper routing + JACK setup | Week 3 | 2-bus routing confirmed |
| **Phase 1d** | Stage UI app | Weeks 4-5 | Dark mode, vocal toggle |
| **Phase 1e** | End-to-end test | Week 6 | Live demo |
| **Phase 2** | T17 Studio Workstation | June-July 2026 | Full production setup |
| **Phase 3** | KingDAW (Ardour build) | July-August 2026 | Studio DAW live |
| **Phase 4** | KingDAW (JUCE build) | Q4 2026+ | Full custom DAW |

---

## Hardware Summary

### Studio Workstation (Beelink SER7)
| Item | Price |
|---|---|
| Beelink SER7 (Ryzen 7 8845HS, 32GB, 1TB) | ~$550 |
| Focusrite Scarlett 2i2 | ~$170 |
| **Subtotal** | **~$720** |

### LiveVocal Performance Kit (Per-Show)
| Item | Price |
|---|---|
| USB 3.1 128GB drive (SanDisk Extreme) | ~$25 |
| Behringer UCA222 (audio interface for venue laptop) | ~$30 |
| USB-C hub (for venue laptop connectivity) | ~$20 |
| **Sennheiser EW IEM G4 (transmitter + belt pack)** | ~$700 |
| Sennheiser IE4 earphones (IEM buds) | ~$80 |
| **Subtotal** | **~$855** |

### Grand Total — Full Studio + Live Kit
| Category | Cost |
|---|---|
| Studio Workstation | ~$720 |
| LiveVocal Performance Kit | ~$855 |
| **Total** | **~$1,575** |

> [!NOTE] The LiveVocal USB boots Ubuntu Studio on any x86 laptop at venues. The Sennheiser EW IEM G4 transmits the IEM mix (Bus B) from the USB audio interface to King's belt pack. Scarlett 2i2 stays in the studio; UCA222 is the portable backup for the LiveVocal kit.

---

## Open Questions / Blockers

1. **Beelink order** — Franklin to place order
2. **Room dimensions** — For studio furniture planning (TBD)
3. **IEM system** — Sennheiser EW IEM G4 confirmed — confirm quantity (1 or 2 belt packs?)
4. **Scarlett vs. UCA222 for studio** — Both confirmed: Scarlett for studio, UCA222 for portable kit
5. **LiveVocal USB target size** — How many performance tracks should the MVP USB hold? (Recommended: 20 tracks, expandable)
6. **LiveVocal licensing** — Is this a T17 product only, or are we planning to license/sell to other artists?

---

## Files
- `king-audio-platform/docs/PROJECT-BRIEF.md` — This file
- `king-audio-platform/docs/PROJECT-BRIEF-v1.md` — Previous version (archived)
- `king-audio-platform/audio-analysis/KingDAW-Sound-Analysis-Report.md` — 3-track analysis
- `king-audio-platform/audio-analysis/king_smoking_hotel_room.mp3` — Track 1
- `king-audio-platform/audio-analysis/king_track2.mp3` — Track 2
- `king-audio-platform/audio-analysis/king_track3.mp3` — Track 3
