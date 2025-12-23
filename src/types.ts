export interface Config {
  app: string;
  server: string;
  distFolder: string;
  ssh?: {
    user?: string;
    port?: number;
    keys?: string[];
    config?: boolean | string;
    baseFolder?: string;
  };
}

export interface DeployedVersion {
  name: string;
  isCurrent: boolean;
}
