export interface Config {
  appName: string;
  baseFolder: string;
  server: string;
  distFolder: string;
  ssh?: {
    user?: string;
    port?: number;
    keys?: string[];
    config?: boolean;
  };
}

export interface DeployedVersion {
  name: string;
  isCurrent: boolean;
}
