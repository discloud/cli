import { filesystem } from "gluegun";

export const logsPath = "discloud/logs";

export const configPath = `${filesystem.homedir()}/.discloud`;

export const locales = [
  "en-US",
  "pt-BR",
];

export const blocked_files = {
  go: [".git", ".vscode"],
  js: [".git", ".vscode", "node_modules", "package-lock.json"],
  py: [".git", ".vscode"],
  rb: [".git", ".vscode", "Gemfile.lock"],
  rs: [".git", ".vscode", "Cargo.lock", "target"],
  ts: [".git", ".vscode", "node_modules", "package-lock.json"],
};

export const required_files = {
  go: ["discloud.config", "go.mod", "go.sum"],
  js: ["discloud.config", "package.json"],
  py: ["discloud.config", "requirements.txt"],
  rb: ["discloud.config", "Gemfile"],
  rs: ["discloud.config", "Cargo.toml"],
  ts: ["discloud.config", "package.json"],
};

export const requiredDiscloudConfigProps = ["MAIN", "TYPE", "RAM", "VERSION"];

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