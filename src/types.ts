export interface Config {
  appName: string;
  baseFolder: string;
  host: string;
  user: string;
  port: number;
  ssh?: {
    keys?: string[];
    config?: boolean;
  };
  distFolder: string;
}

export interface DeployedVersion {
  name: string;
  isCurrent: boolean;
}
