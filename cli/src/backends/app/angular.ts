import type { Config } from "../../types.js";
import { getGitSha } from "../../utils/git.js";
import { getVersionFromPackageJson } from "../../utils/npm-package.js";
import type { ComponentType } from "./types.js";

export class AngularComponentType implements ComponentType {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async getArtifactId(): Promise<string> {
    const version = await getVersionFromPackageJson(this.config.app.path);
    const sha = getGitSha(this.config.app.path);
    return `${version}-${sha}`;
  }
}
