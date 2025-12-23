import { NodeSSH } from "node-ssh";
import SSHConfig from "ssh-config";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Config, DeployedVersion } from "../types.js";
import { execSync } from "child_process";

interface SSHOptions {
  host: string;
  username: string;
  port: number;
  privateKeyPath?: string;
}

function first(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

function loadSSHConfig(host: string): Partial<SSHOptions> {
  const configPath = join(homedir(), ".ssh", "config");
  if (!existsSync(configPath)) return {};

  const configFile = readFileSync(configPath, "utf-8");
  const config = SSHConfig.parse(configFile);
  const section = config.compute(host);

  const port = first(section.Port);
  return {
    host: first(section.HostName) || host,
    username: first(section.User),
    port: port ? parseInt(port, 10) : undefined,
    privateKeyPath: first(section.IdentityFile),
  };
}

export class SSHClient {
  private ssh: NodeSSH;
  private config: Config;
  private sshOpts: SSHOptions;

  constructor(config: Config) {
    this.ssh = new NodeSSH();
    this.config = config;

    const fromConfig = loadSSHConfig(config.host);
    this.sshOpts = {
      host: fromConfig.host || config.host,
      username: config.user || fromConfig.username || "root",
      port: config.port || fromConfig.port || 22,
      privateKeyPath: fromConfig.privateKeyPath,
    };
  }

  async connect(): Promise<void> {
    await this.ssh.connect({
      host: this.sshOpts.host,
      username: this.sshOpts.username,
      port: this.sshOpts.port,
      privateKeyPath: this.sshOpts.privateKeyPath,
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

    // Create version directory
    await this.ssh.execCommand(`mkdir -p ${versionPath}`);

    // rsync files (use config.host as alias - ssh reads ~/.ssh/config)
    const rsyncCmd = `rsync -avz --delete -e ssh ${this.config.distFolder}/ ${this.config.host}:${versionPath}/`;
    execSync(rsyncCmd, { stdio: "inherit" });

    // Update symlink
    await this.ssh.execCommand(
      `cd ${appPath} && rm -f current && ln -s ${versionTag} current`,
    );
  }

  async listVersions(): Promise<DeployedVersion[]> {
    const appPath = this.getAppPath();

    // Get current symlink target
    const currentResult = await this.ssh.execCommand(
      `readlink ${appPath}/current 2>/dev/null || echo ""`,
    );
    const currentVersion = currentResult.stdout.trim();

    // List version directories
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
