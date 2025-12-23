export interface Config {
  appName: string;
  baseFolder: string;
  host: string;
  user: string;
  port: number;
  sshKey?: string;
  distFolder: string;
}

export interface DeployedVersion {
  name: string;
  isCurrent: boolean;
}
