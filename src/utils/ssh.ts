import { NodeSSH } from "node-ssh";
import { Config, DeployedVersion } from "../types.js";
import { execSync } from "child_process";
import { homedir } from "os";
import { join } from "path";

function expandPath(p: string): string {
  return p.startsWith("~") ? join(homedir(), p.slice(1)) : p;
}

export class SSHClient {
  private ssh: NodeSSH;
  private config: Config;

  constructor(config: Config) {
    this.ssh = new NodeSSH();
    this.config = config;
  }

  async connect(): Promise<void> {
    const keys = this.config.ssh?.keys?.map(expandPath);

    await this.ssh.connect({
      host: this.config.host,
      username: this.config.user,
      port: this.config.port,
      privateKeyPath: keys?.[0],
      agent: process.env.SSH_AUTH_SOCK,
    });
  }

  async disconnect(): Promise<void> {
    this.ssh.dispose();
  }

  private getAppPath(): string {
    return `${this.config.baseFolder}/${this.config.appName}`;
  }

  private buildSshArgs(): string {
    const args: string[] = [];
    const ssh = this.config.ssh;

    if (ssh?.config === false) {
      args.push("-F /dev/null");
    }

    if (ssh?.keys?.length) {
      for (const key of ssh.keys) {
        args.push(`-i ${expandPath(key)}`);
      }
    }

    return args.length ? `-e "ssh ${args.join(" ")}"` : "-e ssh";
  }

  async deploy(versionTag: string): Promise<void> {
    const appPath = this.getAppPath();
    const versionPath = `${appPath}/${versionTag}`;

    await this.ssh.execCommand(`mkdir -p ${versionPath}`);

    const sshArgs = this.buildSshArgs();
    const rsyncCmd = `rsync -avz --delete ${sshArgs} ${this.config.distFolder}/ ${this.config.user}@${this.config.host}:${versionPath}/`;
    execSync(rsyncCmd, { stdio: "inherit" });

    await this.ssh.execCommand(
      `cd ${appPath} && rm -f current && ln -s ${versionTag} current`,
    );
  }

  async listVersions(): Promise<DeployedVersion[]> {
    const appPath = this.getAppPath();

    const currentResult = await this.ssh.execCommand(
      `readlink ${appPath}/current 2>/dev/null || echo ""`,
    );
    const currentVersion = currentResult.stdout.trim();

    const listResult = await this.ssh.execCommand(
      `ls -1 ${appPath} 2>/dev/null | grep -v current || echo ""`,
    );
    const versions = listResult.stdout.trim().split("\n").filter(Boolean);

    return versions.map((name) => ({
      name,
      isCurrent: name === currentVersion,
    }));
  }
}
