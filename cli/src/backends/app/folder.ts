import type { Config } from "../../types.js";
import { getGitSha } from "../../utils/git.js";
import { getVersion } from "../../utils/npm-package.js";
import type { ComponentType } from "./types.js";

export class FolderComponentType implements ComponentType {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async getArtifactId(): Promise<string> {
    const version = await getVersion(this.config.app.path);
    const sha = getGitSha(this.config.app.path);
    return `${version}-${sha}`;
  }
}
