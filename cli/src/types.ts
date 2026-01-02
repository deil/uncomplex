export interface SSHDeploymentConfig {
  type: "ssh";
}

export interface LocalStateConfig {
  type: "local";
  path: string;
}

export interface ServerConfig {
  host: string;
  baseFolder: string;
  ssh?: {
    user?: string;
    port?: number;
    keys?: string[];
    config?: string;
  };
}

export interface Config {
  backends: {
    deployment: SSHDeploymentConfig;
    state: LocalStateConfig;
  };
  server: ServerConfig;
  app: {
    name: string;
    type: "angular" | "folder";
    path: string;
    uid: string;
  };
}

export interface DeployedVersion {
  name: string;
  isCurrent: boolean;
  deployedAt: Date;
}
