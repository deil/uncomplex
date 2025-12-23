export interface Config {
  appName: string;
  baseFolder: string;
  host: string;
  user: string;
  port: number;
  distFolder: string;
}

export interface DeployedVersion {
  name: string;
  isCurrent: boolean;
}
