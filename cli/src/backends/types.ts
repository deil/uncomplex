import type { DeployedVersion } from "../types.js";

export interface DeploymentBackend {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  deploy(versionTag: string): Promise<void>;
  rollback(versionTag: string): Promise<void>;
  listVersions(): Promise<DeployedVersion[]>;
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
