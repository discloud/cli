import { type AppLanguages, type AppVersion } from "@discloudapp/api-types/v2";
import { homedir } from "os";
import { extname, join } from "path";

export const FILE_EXT = extname(__filename);
export const MODULES_EXTENSIONS = new Set([FILE_EXT, ".js", ".cjs", ".mjs"]);

export const CONFIG_FILENAME = "discloud.config";

export const ERRORS_TO_IGNORE = new Set<string>([]);

export const ERRORS_TO_LOG = new Set<string>(["Prompt", "Store"]);

export const backupsPath = join("discloud", "backups");
export const logsPath = join("discloud", "logs");

export const CONFIG_PATH = join(homedir(), ".discloud");

export const locales = ["en-US", "pt-BR"];

export const blocked_files = {
  common: [".git", ".vscode"],
  go: [],
  js: ["node_modules", "package-lock.json", "yarn.lock"],
  py: [".venv"],
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