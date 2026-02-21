# Beet: Decentralized Public Health Infrastructure

This repository is structured for a four-layer architecture:

1. `hardware/` - Offline symptom capture device logic (ESP32 + LCD + keypad).
2. `infra/adi/` - Public proof anchoring (hash-only reports on ADI testnet).
3. `daml/` - Private workflow and authorization model on Canton using DAML.
4. `ui/` - Web interfaces for patient, hospital, and institutional analytics.

## Repo Layout

- `daml/`
- `docs/`
- `hardware/`
- `infra/adi/`
- `infra/canton/`
- `scripts/`
- `ui/`

## Quick Start

1. Run dependency checks:
   - `make check`
2. Install local tooling (macOS):
   - `make install`
3. Start Canton (Docker):
   - `make canton-up`
4. Run DAML workflow script:
   - `make daml-test`

If `daml` is not on your shell path yet:

- `export PATH="$HOME/.daml/bin:$PATH"`

## Notes

- Raw health data remains in private DAML contracts and is not published publicly.
- ADI layer only anchors hashes and metadata.
- Research organizations consume only aggregate-level outputs.
