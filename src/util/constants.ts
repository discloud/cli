import { AppLanguages, AppVersion } from "@discloudapp/api-types/v2";
import { filesystem } from "gluegun";

export const backupsPath = "discloud/backups";
export const logsPath = "discloud/logs";

export const configPath = `${filesystem.homedir()}/.discloud`;

export const locales = ["en-US", "pt-BR"];

export const blocked_files = {
  common: [".git", ".vscode", "discloud"],
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
  js = "js",
  jsx = "js",
  mjs = "js",
  mts = "ts",
  py = "py",
  rb = "rb",
  rlib = "rs",
  rs = "rs",
  ts = "ts",
  tsx = "ts",
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

export const Apt = {
  canvas: [
    "libcairo2-dev",
    "libpango1.0-dev",
    "libjpeg-dev",
    "libgif-dev",
    "librsvg2-dev",
    "libgbm-dev",
  ],
  ffmpeg: ["ffmpeg"],
  java: ["default-jre"],
  libgl: ["libsm6", "libxext6"],
  openssl: ["pkg-config", "libssl-dev"],
  puppeteer: [
    "libnss3",
    "libatk-bridge2.0-0",
    "libgtk-3-0",
    "libasound2",
    "libxshmfence-dev",
    "libdrm-dev",
    "libgbm-dev",
    "libglib2.0-dev",
    "libx11-xcb-dev",
  ],
  tools: ["git", "wget", "make", "curl"],
};

export const aptPackages = <(keyof typeof Apt)[]>Object.keys(Apt);

export const app_version: Record<AppLanguages, AppVersion[]> = {
  go: ["latest"],
  java: ["latest"],
  js: ["latest", "current", "suja"],
  php: ["latest"],
  py: ["latest", "suja"],
  rb: ["latest"],
  rs: ["latest", "suja"],
};