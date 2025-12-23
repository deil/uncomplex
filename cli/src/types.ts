export interface Config {
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
