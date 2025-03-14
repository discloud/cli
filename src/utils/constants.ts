import { type AppLanguages, type AppVersion } from "@discloudapp/api-types/v2";
import { homedir } from "os";
import { join } from "path";

export const MINUTE_IN_MILLISECONDS = 60_000;
export const DAY_IN_MILLISECONDS = 86_400_000;

/** `536_870_888` | `2^29-24` | `511.99998 MB` */
export const MAX_STRING_LENGTH = 0x1fffffe8;

export const IGNORE_FILENAME = ".discloudignore";

export const CLI_CONFIG_DIR = join(homedir(), ".discloud");
export const CLI_CONFIG_FILENAME = ".cli";
export const CLI_CONFIG_FILEPATH = join(CLI_CONFIG_DIR, CLI_CONFIG_FILENAME);

export const ERRORS_TO_IGNORE = new Set<string>([]);

export const ERRORS_TO_LOG = new Set<string>(["MissingRequiredOption", "Prompt", "Store"]);

export const BACKUPS_PATH = join("discloud", "backups");
export const LOGS_PATH = join("discloud", "logs");

/* export enum FileExt {
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
} */

export const APP_VERSION: Record<AppLanguages, AppVersion[]> = {
  go: ["latest"],
  java: ["latest"],
  js: ["latest", "current", "suja"],
  php: ["latest"],
  py: ["latest", "suja"],
  rb: ["latest"],
  rs: ["latest", "suja"],
};