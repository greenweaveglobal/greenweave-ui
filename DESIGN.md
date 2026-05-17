---
name: GreenWeave Terminal Aesthetic
version: alpha
colors:
  primary: "#10B981"
  primary-glow: "rgba(16, 185, 129, 0.2)"
  background: "#000000"
  surface: "#111827"
  text-main: "#D1D5DB"
  text-highlight: "{colors.primary}"
  danger-slash: "#EF4444"
typography:
  fontFamily: "Space Mono, monospace"
  letterSpacing: "-0.02em"
components:
  button-primary:
    background: transparent
    color: "{colors.primary}"
    border: "1px solid {colors.primary}"
    textTransform: uppercase
    borderRadius: "0px"
  json-payload:
    background: "{colors.surface}"
    color: "{colors.text-main}"
    fontFamily: "{typography.fontFamily}"
    padding: "1rem"
---

# GreenWeave Design Intent

## The Vision: A Decentralized Ecological State
GreenWeave is not a Web2 consumer application. It is a cryptographic interface for Eco-Miners, Validators, and Cypherpunks. The aesthetic must reflect a **raw, data-centric Terminal** (think The Matrix or a hacker's console). It prioritizes transparency, cryptography, and absolute truth over friendly, polished UI.

## Core Directives for UI Generation
- **No Softness:** Absolutely NO rounded corners (`border-radius: 0`). Use sharp, aggressive lines and borders.
- **Data is Beautiful:** Do not hide JSON payloads, hashes, or ZKP (Zero-Knowledge Proofs). Display them proudly in raw format to emphasize the "Don't Trust, Verify" ethos.
- **Temporal Strictness:** All dates and times must use ISO 8601 formatting appended with UTC (e.g., `YYYY-MM-DD HH:MM:SS UTC`). Do not use relative times like "2 hours ago".
- **Color Discipline:** Stick strictly to Pure Black for backgrounds, Gray-900 for card surfaces, and Emerald Green for actions and primary data points. Red is reserved strictly for network penalties (Slashing malicious nodes).
