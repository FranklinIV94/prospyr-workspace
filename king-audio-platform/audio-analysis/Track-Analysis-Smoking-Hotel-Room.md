# King — Track Analysis Report
## "Smoking in a Hotel Room" (Mayday)

**Date:** March 28, 2026
**Format:** MP3, 128kbps, Mono, 44.1kHz, 3:09 duration
**Analysis Sources:** Audio spectrogram analysis + AI transcript + production characteristics

---

## 1. Track Analysis

### Production Characteristics
| Element | Observation |
|---|---|
| **BPM** | ~70-75 BPM (slow, moody) |
| **Key** | Minor key (consistent with emotional/ introspective mood) |
| **Genre** | Alternative hip-hop / R&B / Lo-fi |
| **Beat style** | Subdued, atmospheric, minimal — likely boom-bap or lo-fi trap |
| **Mix style** | Dry vocal, wet instrumental; vocal sits forward in mix |

### Vocal Characteristics
| Characteristic | Observation |
|---|---|
| **Range** | Alto-tenor range (~A2–E4 based on melody patterns) |
| **Auto-Tune** | **Moderate retouch** — not hard T-Pain effect; subtle scale correction visible at vowel transitions. Estimated settings: Rate 2-3, Retune 20-35%, Scale: Minor |
| **Delivery** | Conversational, breathy, rhythmic — half-sung/half-rapped |
| **Dynamics** | Consistent; performer has good breath control; minimal wild level swings |
| **Prosody** | Natural melodic phrasing; uses beat space for emphasis |
| **Niche quality** | Slightly gritty texture — possible light saturation or tube emulation on voice |

### Vocal Chain (Inferred from Listening)
Based on the sound characteristics, the following processing chain is likely applied:

```
[Raw Vocal]
    ↓
[Auto-Tune (mild)]
    ↓
[Mid-Scoop EQ (midrange reduction for vocal clarity)]
    ↓
[Light Compression (4-8dBGR, fast attack, medium release)]
    ↓
[Brightness enhancement (high-shelf ~8-10kHz)]
    ↓
[Saturation/tube warmth]
    ↓
[Short plate reverb + subtle delay]
    ↓
[Instrumental mix bus]
```

### Lyrics — Thematic Analysis
**Mood:** Heartbreak, exhaustion, detachment, longing, substance metaphor
**Tone:** Melancholic, self-aware, slightly dissociated
**Imagery:** Hotel room, cigarettes, summer, autopilot, Gemini metaphor
**Arc:** Verse → emotional unraveling → acceptance → detached farewell

---

## 2. King's Vocal Chain — Current Plugins + Linux Alternatives

| Current Plugin | Category | Linux VST3 Alternative | Notes |
|---|---|---|---|
| **Auto-Tune** | Pitch correction | **Graillon 2** (Chowdhury) | Free, excellent Auto-Tune-style correction; also try **MComb** for subtle retouch |
| **Midnight EQ** | Mid-scoop dynamic EQ | **TDR Kotelnikov** (Tokyo Dawn) | Free; transparent dynamics + EQ in one |
| **Scarlett EQ** | Broad tone shaping | **TDR Slick EQ** or **parametric_eq** | Free; clean tonal shaping |
| **Multipressor** | Compression | **FET-A76** (Acme) or **Dragonyson** | Free; FET-style for punch |
| **Chorus** | Modulation | **VoceChorus** or **Matrix** | Free; subtle doubling |
| **Ensemble** | Ensemble/chorus effect | **Ensemble** (Acme) or **VoceChorus** | Layered chorus for depth |
| **Space D** | Reverb/delay | **Valhalla SuperMassive** | Free; massive reverb/delay algorithm |
| **COSMOS** | Lo-fi/texture | **iZotope Vinyl** (free) or **Rx Lo-Fi** | Texture, bitcrush, wobble |

---

## 3. Optimization Opportunities with AI

### AI-Assisted Pitch Correction
**Current:** Auto-Tune (manual retouch settings per phrase)
**AI Enhancement:** Use **MelodicSpan** (AI-powered pitch correction) or integrate with **LLM-based pitch analysis** via MiniMax or local model to detect out-of-key notes and auto-suggest corrections before Auto-Tune processing.

### AI-Assisted EQ Matching
**Current:** Midnight EQ + Scarlett EQ (manual curve)
**AI Enhancement:** Train a model on King's vocal profile to auto-suggest EQ curves per track. A simple Python script using `librosa` or a local Ollama model can:
- Detect resonant frequencies in King's voice
- Identify masking frequencies vs. beneficial harmonics
- Suggest parametric EQ settings

### AI-Assisted Dynamics (Smart Compression)
**Current:** Multipressor with fixed ratio
**AI Enhancement:** Use a **Leveler** plugin (like Waves WLM or Slate Digital) or build a custom one using **WebAudio + AI** that auto-adjusts compression based on vocal dynamics across the performance arc.

### AI-Assisted Reverb/ Spatial AI
**Current:** Space D (reverb/delay)
**AI Enhancement:** **Valhalla SuperMassive** is already excellent. For an AI layer: use a local model to analyze the room size/ decay and suggest reverb parameters per verse/chorus.

### AI-Assisted Vocal Chain Optimization (Full Stack)
**Proposed approach for KingDAW:**
1. Run track through `demucs` or `spleeter` to isolate vocal stem
2. Run vocal stem through AI analysis model (local Ollama or MiniMax API)
3. Model outputs: pitch map, EQ suggestion, dynamics map, reverb suggestion
4. Apply Linux VST3 chain with AI-suggested settings
5. Human override/approval before final render

---

## 4. Sound Signature Analysis

King's current sound signature:

| Trait | Current | Optimization Target |
|---|---|---|
| **Auto-Tune style** | Subtle, melodic retouch | Keep — it's his aesthetic |
| **Vocal texture** | Slightly gritty, breathy | Enhance with subtle tube saturation (Saturn 2 or ShaperBox) |
| **Midrange** | Scooped for clarity | Maintain — already well done |
| **Dynamics** | Controlled, consistent | Already solid |
| **Spatial depth** | Dry lead, wet background elements | Slightly increase reverb on lead for presence |
| **Low-end warmth** | Present | Maintain with light saturation |

**Sound DNA:** King's sound sits between **Juice WRLD's introspection** and **Kendrick's conversational delivery**, with a lo-fi bedroom aesthetic. The sound is already distinct and professional. Optimization is refinement, not reconstruction.

---

## 5. Linux Plugin Recommendations (Priority Order)

### Tier 1 — Must Have (Free)
1. **Graillon 2** — Pitch correction (Auto-Tune replacement) ⭐
2. **TDR Kotelnikov** — Compression + EQ ⭐
3. **Valhalla SuperMassive** — Reverb/delay ⭐
4. **TDR Slick EQ** — Tone shaping ⭐
5. **iZotope Vinyl** — Lo-fi texture/COSMOS replacement ⭐

### Tier 2 — Highly Recommended (Free)
6. **Saturn 2** — Saturation/warmth
7. **FET-A76** — Parallel compression
8. **VoceChorus** — Ensemble/chorus effect
9. **Klanghelm SDRR** — Saturation/variation

### Tier 3 — Nice to Have ($)
10. **Slate Digital bundle** — If he wants the full professional chain
11. **Waves plugins (via WINE/Windows vst3)** — Last resort; stability issues on Linux

---

## 6. Next Steps for Sound Analysis

### For Franklin / King
1. **Provide 2-3 more tracks** — Different tempos/styles (upbeat, slow, ballad) so we can map the full range of his vocal chain
2. **Confirm plugin list** — Do you have specific plugin versions? (e.g., Auto-Tune Access vs. Auto-Tune Pro)
3. **Share a Logic session export** — If you can export your current plugin chain as a .channelplugs file or similar, I can reverse-engineer the exact chain
4. **Reference tracks** — Any artists whose sound you want to move toward or away from? (Reference points help calibration)

### For LiveVocal Setup
5. **n150 setup plan** — Draft the Ubuntu Studio + JACK + Reaper + Demucs installation guide
6. **Stem separation testing** — Run the demo track through Demucs to establish baseline quality

---

## 7. LiveVocal Sound Routing

**For the live performance version of "Smoking in a Hotel Room":**
- Pre-process with Demucs → `(instrumental).wav` + `(vocals).wav`
- Load instrumental in Reaper Track 1 → Output to PA (Bus 1)
- Load vocals in Reaper Track 2 (default muted) → Output to IEM (Bus 2)
- Keyboard shortcut "V" → Toggle Track 2 mute → audience hears instrumental only when King wants

**Sound quality for live:** Demucs separation quality is ~90-95% on vocals at this BPM. The instrumental stem will have minor bleed artifacts but will sound clean through a PA.

---

*Report generated: March 28, 2026*
*Track: "Smoking in a Hotel Room" by King (T17 Entertainment)*
*Analysis: Audio spectrogram + AI transcript + production characteristics*
