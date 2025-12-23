export interface Config {
  app: string;
  server: string;
  distFolder: string;
  ssh?: {
    user?: string;
    port?: number;
    keys?: string[];
    config?: string;
    baseFolder?: string;
  };
}

export interface DeployedVersion {
  name: string;
  isCurrent: boolean;
}
