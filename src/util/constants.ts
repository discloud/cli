import { filesystem } from "gluegun";

export const logsPath = "discloud/logs";

export const configPath = `${filesystem.homedir()}/.discloud`;

export const locales = [
  "en-US",
  "pt-BR",
];