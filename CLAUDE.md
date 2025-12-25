# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General rules
- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- At the end of each plan, show the list of unresolved questions, if any. Be extremely concise and sacrifice grammar for the sake of concision.

## Project Overview

Uncomplex (`un`) is a minimalist CLI tool for deploying Angular applications to remote servers via SSH. It uses rsync for file transfer, git SHA-based versioning, and symlink-based rollbacks.

## Common Commands

```bash
# Development (run from cli/ directory)
cd cli
pnpm install        # Install dependencies
pnpm run build      # Compile TypeScript to dist/
pnpm run dev        # Watch mode compilation
pnpm run lint       # Run Biome linter
pnpm run format     # Auto-format with Biome

# Running the CLI locally
node dist/index.js <command>
# Or after build:
./dist/index.js <command>
```

## Architecture

### Directory Structure
- `cli/` - Main CLI application
  - `src/index.ts` - Entry point with Commander.js command definitions
  - `src/commands/` - Command handlers (init, deploy, versions, ingress, config, validate)
  - `src/utils/` - Shared utilities (config, ssh, git, logger, state)
  - `src/types.ts` - TypeScript interfaces

### Core Patterns

**Configuration**: Uses `un.config.json` for per-project settings. Schema validated with Zod in `utils/config.ts`.

**State Management**: Uses `state.unstate` file for ingress/routing state, also Zod-validated in `utils/state.ts`.

**SSH Operations**: The `SSHClient` class (`utils/ssh.ts`) wraps native `ssh` and `rsync` commands via `child_process.execSync`. Supports custom ports, keys, and SSH config files.

**Deployment Flow**:
1. Get git SHA as version tag
2. Create versioned directory on server
3. rsync dist folder contents
4. Update `current` symlink to new version

### Key Files
- `cli/src/utils/ssh.ts` - All remote server operations (deploy, rollback, list versions, nginx sites)
- `cli/src/utils/config.ts` - Config file I/O with Zod validation
- `cli/src/commands/ingress.ts` - Nginx ingress management and routing

## Technology Stack
- TypeScript (ES2022, NodeNext modules)
- Commander.js for CLI framework
- Zod for schema validation
- Biome for linting/formatting
- pnpm as package manager
- mise for Node/pnpm version management
