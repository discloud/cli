import { filesystem } from "gluegun";

export const logsPath = "discloud/logs";

export const configPath = `${filesystem.homedir()}/.discloud`;

export const locales = ["en-US", "pt-BR"];

export const blocked_files = {
  go: [".git", ".vscode"],
  js: [".git", ".vscode", "node_modules", "package-lock.json", "yarn.lock"],
  py: [".git", ".vscode"],
  rb: [".git", ".vscode", "Gemfile.lock"],
  rs: [".git", ".vscode", "Cargo.lock", "target"],
  ts: [".git", ".vscode", "node_modules", "package-lock.json", "yarn.lock"],
};

export const required_files = {
  go: ["go.mod", "go.sum"],
  js: ["package.json"],
  py: ["requirements.txt"],
  rb: ["Gemfile"],
  rs: ["Cargo.toml"],
  ts: ["package.json"],
};

export const requiredDiscloudConfigProps = ["MAIN", "NAME", "TYPE", "RAM", "VERSION"];

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

export const Apt = {
  canvas: [
    "libcairo2-dev",
    "libpango1.0-dev",
    "libjpeg-dev",
    "libgif-dev",
    "librsvg2-dev",
    "libgbm-dev",
  ],
  puppeteer: [
    "libnss3",
    "libatk-bridge2.0-0",
    "libgtk-3-0",
    "libasound2",
    "libxshmfence-dev",
    "libxshmfence-dev",
    "libdrm-dev",
    "libgbm-dev",
  ],
  java: ["default-jre"],
  ffmpeg: ["ffmpeg"],
  libgl: ["libsm6", "libxext6"],
  tools: ["git", "wget", "make", "openssl", "curl"],
};
