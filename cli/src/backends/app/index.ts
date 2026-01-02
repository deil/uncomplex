import type { Config } from "../../types.js";
import { AngularComponentType } from "./angular.js";
import { FolderComponentType } from "./folder.js";
import type { ComponentType } from "./types.js";

export const createComponentType = (config: Config): ComponentType => {
  switch (config.app.type) {
    case "angular":
      return new AngularComponentType(config);
    case "folder":
      return new FolderComponentType(config);
    default:
      throw new Error(
        `Unknown app type: ${(config.app as { type: string }).type}`,
      );
  }
};
