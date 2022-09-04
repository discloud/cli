import { filesystem } from "gluegun";

export const logsPath = "discloud/logs";

export const configPath = `${filesystem.homedir()}/.discloud`;

export const locales = [
  "en-US",
  "pt-BR",
];

export const required_files = ["discloud.config"];

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