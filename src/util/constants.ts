import { AppLanguages, AppVersion } from "@discloudapp/api-types/v2";
import { filesystem } from "@discloudapp/gluegun";
import { readFileSync } from "node:fs";
import { arch, platform, release, type } from "node:os";
import { join } from "node:path";

export const version: string = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8")).version;
export const os_name = type();
export const os_release = release().split?.(".").slice(0, 2).join(".") ?? release();
export const os_platform = platform();
export const cpu_arch = arch();

export const backupsPath = join("discloud", "backups");
export const logsPath = join("discloud", "logs");

export const configPath = join(filesystem.homedir(), ".discloud");

export const locales = ["en-US", "pt-BR"];

export const blocked_files = {
  common: [".git", ".vscode"],
  go: [],
  js: ["node_modules", "package-lock.json", "yarn.lock"],
  py: [],
  rb: ["Gemfile.lock"],
  rs: ["Cargo.lock", "target"],
  ts: ["node_modules", "package-lock.json", "yarn.lock"],
};

export enum FileExt {
  cjs = "js",
  cts = "ts",
  go = "go",
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  js = "js", jsx = "js", mjs = "js", mts = "ts",
  py = "py",
  rb = "rb",
  rlib = "rs",
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  rs = "rs", ts = "ts", tsx = "ts",
}

export const required_files = {
  common: ["discloud.config"],
  go: ["go.mod", "go.sum"],
  js: ["package.json"],
  py: ["requirements.txt"],
  rb: ["Gemfile"],
  rs: ["Cargo.toml"],
  ts: ["package.json"],
};

export const mapDiscloudConfigProps = <Record<string, Record<string, string>>>{
  site: {
    ID: "subdomain",
  },
};

export const requiredDiscloudConfigProps = {
  bot: ["MAIN", "NAME", "TYPE", "RAM", "VERSION"],
  site: ["ID", "MAIN", "TYPE", "RAM", "VERSION"],
};

export const ModPermissions = {
  backup_app: 1,
  commit_app: 2,
  edit_ram: 4,
  logs_app: 8,
  restart_app: 16,
  start_app: 32,
  status_app: 64,
  stop_app: 128,
};

export const app_version: Record<AppLanguages, AppVersion[]> = {
  go: ["latest"],
  java: ["latest"],
  js: ["latest", "current", "suja"],
  php: ["latest"],
  py: ["latest", "suja"],
  rb: ["latest"],
  rs: ["latest", "suja"],
};