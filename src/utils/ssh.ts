import { NodeSSH } from "node-ssh";
import { Config, DeployedVersion } from "../types.js";
import { execSync } from "child_process";

export class SSHClient {
  private ssh: NodeSSH;
  private config: Config;

  constructor(config: Config) {
    this.ssh = new NodeSSH();
    this.config = config;
  }

  async connect(): Promise<void> {
    await this.ssh.connect({
      host: this.config.host,
      username: this.config.user,
      port: this.config.port,
      privateKeyPath: this.config.sshKey,
      agent: process.env.SSH_AUTH_SOCK,
    });
  }

  async disconnect(): Promise<void> {
    this.ssh.dispose();
  }

  private getAppPath(): string {
    return `${this.config.baseFolder}/${this.config.appName}`;
  }

  async deploy(versionTag: string): Promise<void> {
    const appPath = this.getAppPath();
    const versionPath = `${appPath}/${versionTag}`;

    await this.ssh.execCommand(`mkdir -p ${versionPath}`);

    const sshOpt = this.config.sshKey ? `-e "ssh -i ${this.config.sshKey}"` : "-e ssh";
    const rsyncCmd = `rsync -avz --delete ${sshOpt} ${this.config.distFolder}/ ${this.config.user}@${this.config.host}:${versionPath}/`;
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
