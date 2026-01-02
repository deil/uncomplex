import type { DeployedVersion } from "../types.js";

export interface DeploymentBackend {
  validate(): Promise<boolean>;
  deploy(sourcePath: string, destPath: string): Promise<void>;
  switchVersion(versionTag: string, appName: string): Promise<void>;
  rollback(versionTag: string, appName: string): Promise<void>;
  listVersions(appName: string): Promise<DeployedVersion[]>;
  checkDirectoryExists(path: string): Promise<boolean>;
}

export interface State {
  ingress: Array<{
    uid: string;
    hostname: string;
    name: string;
    routes: Array<{
      uid?: string;
      path: string;
      app: string;
    }>;
  }>;
}

export interface StateBackend {
  loadState(): Promise<State>;
  saveState(state: State): Promise<void>;
  listNginxSites(): Promise<string[]>;
}
