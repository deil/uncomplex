export interface SSHDeploymentConfig {
  type: "ssh";
}

export interface LocalStateConfig {
  type: "local";
  path: string;
}

export interface Config {
  backends: {
    deployment: SSHDeploymentConfig;
    state: LocalStateConfig;
  };
  server: {
    host: string;
    baseFolder: string;
    ssh?: {
      user?: string;
      port?: number;
      keys?: string[];
      config?: string;
    };
  };
  app: {
    name: string;
    distFolder: string;
    uid: string;
  };
}

export interface DeployedVersion {
  name: string;
  isCurrent: boolean;
  deployedAt: Date;
}
