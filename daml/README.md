# DAML Layer

This package contains the private workflow layer implemented with DAML contracts.

## Files

- `src/PublicHealthWorkflow.daml` - Templates and workflow script.
- `daml.yaml` - DAML project configuration.

## Commands

- Build and test:
  - `daml build`
  - `daml test`
- Run script on local ledger:
  - `daml script --script-name PublicHealthWorkflow:workflowDemo`
