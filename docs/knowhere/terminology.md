# Terminology

## Domain Concepts

**Project** - Your whole system described in one place. Components, links between them, config params, everything.

**Environment** - An instance of your infrastructure. Production, dev, staging, local - whatever you need. A project can have multiple environments.

**Artifacts Registry** - Where built artifacts live. When you build a component, the result goes here. Deploying means pulling from the registry and pushing to a container.

**Container** - Where a component actually runs. Could be a bare metal server, VM, Docker container, or a managed service. A MySQL database component might run on a MySQL server component - that server is its container.

**Component** - A deployable piece of your system. An Angular app, a Go API, a MySQL database, a Redis cache - all components.

**External Component** - Something managed outside this project or layer. Like infrastructure defined in a separate Terraform repo, or a shared service from another team.

**Output** - What a component provides to others. An HTTP endpoint, a database connection string, a metrics port.

**Input** - What a component needs to work. Database URLs, API keys, feature flags.

**Link** - A connection between components. Links match one or more outputs to one or more inputs.

**Linking** - Setting up the link. Usually just wiring env vars, but might mean creating a DB user, opening a firewall port, or whatever makes the connection work.

## Uncomplex Concepts

**Implementation Backend** - How uncomplex does the heavy lifting. These are the technology-specific implementations. `SshDeploymentBackend` handles SSH and rsync; `LocalStateBackend` manages a local file.
