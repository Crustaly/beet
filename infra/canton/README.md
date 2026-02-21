# Canton Layer

This folder contains local Canton network bootstrapping for development.

## Prerequisites

- Docker Desktop running.
- DAML SDK installed.

## Commands

- Start Canton:
  - `docker-compose up -d`
- Stop Canton:
  - `docker-compose down`
- Inspect logs:
  - `docker-compose logs -f canton`

## Notes

- For production, replace `latest` image tags and provide explicit node/domain config files.
- The DAML contracts in `daml/src/PublicHealthWorkflow.daml` enforce party-based visibility and authorization independent of transport/runtime.
