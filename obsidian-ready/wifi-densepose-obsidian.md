# WiFi DensePose - Technology Research

**Status:** 🔴 Researching  
**Created:** 2026-03-01  
**Category:** Technology / Security / Privacy

## What Is It

WiFi DensePose turns commodity WiFi signals into real-time human pose estimation, vital sign monitoring, and presence detection — without cameras. Uses Channel State Information (CSI) disturbances caused by human movement.

## Technical Details

| Capability | Method | Performance |
|------------|--------|-------------|
| Pose estimation | CSI → DensePose UV maps | 54K fps |
| Breathing detection | Bandpass 0.1-0.5 Hz → FFT | 6-30 BPM |
| Heart rate | Bandpass 0.8-2.0 Hz → FFT | 40-120 BPM |
| Presence sensing | RSSI variance + motion | <1ms latency |
| Through-wall | Fresnel zone geometry | Up to 5m depth |

## Hardware Requirements

**CSI-capable hardware required:**

- ESP32-S3 Mesh (recommended): ~$54 — Full capabilities
- Intel 5300 NIC: $50-100 — Full CSI with MIMO
- Standard laptop: $0 — RSSI only (limited)

## Privacy Implications

**Risks:**
- Detect presence through standard walls
- Track movement between rooms
- Monitor vital signs (breathing, heartbeat)
- No cameras to avoid — WiFi is everywhere
- Low cost ($54 ESP32 modules)

**Vulnerable:** Executive offices, conference rooms, healthcare, legal

## Protection

1. RF shielding for sensitive spaces
2. Network segmentation
3. Regular hardware sweeps
4. CSI device detection

## ALBS Service Opportunities

| Service | One-Time | Monthly |
|---------|----------|---------|
| WiFi Threat Assessment | $1,500-3,000 | $500 |
| RF Shielding | $5,000-15,000 | — |
| Continuous Monitoring | — | $750-1,500 |
| Policy Development | $2,000-4,000 | $250 |

**Target:** Executives, legal, healthcare, financial advisors

## Next Steps

- [ ] Review blog draft (wifi-densepose-blog-draft.md)
- [ ] Finalize service pricing
- [ ] Identify pilot clients
