# Uncomplex

A minimalist CLI tool for deploying Angular applications to remote servers via SSH. No CI/CD required—just direct rsync-based deployments with version tagging and rollback support.

## Installation

```bash
cd cli
pnpm install
pnpm run build
```

## Usage

### Initialize Deployment Config
```bash
un init
```
Interactive setup for server, SSH, and paths.

### Deploy
```bash
un deploy
```
Uploads dist folder to server, creates versioned directory, updates current symlink.

### List Versions
```bash
un versions
```
Shows deployed versions with timestamps and active version.

## Features

- Git SHA-based versioning
- Symlink-based rollbacks
- SSH key/config support
- Custom ports and users
- Integrated with Beads for issue tracking

## Configuration

Creates `un.config.json` with app name, server, SSH details, base folder, dist folder.