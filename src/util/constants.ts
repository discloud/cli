import { filesystem } from "gluegun";

export const logsPath = "discloud/logs";

export const configPath = `${filesystem.homedir()}/.discloud`;

export const locales = [
  "en-US",
  "pt-BR",
];

export const required_files = ["discloud.config"];

export const requiredDiscloudConfigProps = ["MAIN", "TYPE", "RAM", "VERSION"];