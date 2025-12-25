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

### Deploy Application
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
Lists public ingresses from state file.

### Add Route to Ingress
```bash
un ingress route add <ingress-uid> <path> <app>
```
Adds a route mapping path to app for the specified ingress.

### Import Ingresses
```bash
un import ingress
```
Fetches ingresses from server and saves to state file.

### Show Configuration
```bash
un config
un config show
```
Displays your config.

### Validate Configuration
```bash
un config validate
```
Checks SSH config file presence, server connection, base folder existence, and local dist folder.

## Global Options

```bash
un --config <path> <command>
```
Use custom config file instead of `./un.config.json`.

## Features

- Git SHA-based versioning
- Symlink-based rollbacks
- SSH key/config support
- Pluggable backends (deployment, state)

## Configuration

Creates `un.config.json`:

```json
{
  "backends": {
    "deployment": { "type": "ssh" },
    "state": { "type": "local", "path": "state.unstate" }
  },
  "server": {
    "host": "example.com",
    "baseFolder": "/var/www",
    "ssh": { "user": "root", "config": "~/.ssh/config" }
  },
  "app": {
    "name": "my-app",
    "distFolder": "./dist",
    "uid": "..."
  }
}
```