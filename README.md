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

### Show Configuration
```bash
un config
```
Displays your config.

### Validate Configuration
```bash
un validate
```
Checks SSH config file, server connection, base folder existence, and local dist folder.

### Deploy
```bash
un deploy
```
Uploads dist folder to server, creates versioned directory, updates current symlink.

### List Versions
```bash
un versions list
```
Shows deployed versions with timestamps and active version.

### Rollback to Version
```bash
un versions rollback <version>
```
Rolls back to a specific deployed version by updating the current symlink.

### List Public Ingresses
```bash
un ingress list
```
Lists public ingresses from sites starting with "un__", removes prefix, reverses domains, and sorts alphabetically.

## Features

- Git SHA-based versioning
- Symlink-based rollbacks
- SSH key/config support
- Custom ports and users

## Configuration

Creates `un.config.json` with app name, server, SSH details, base folder, dist folder.