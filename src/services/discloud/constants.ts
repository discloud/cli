/** `100MB` */
export const MAX_ZIP_BUFFER = 104_857_600;

export const CONFIG_FILENAME = "discloud.config";

export const REQUIRED_FILES = {
  common: ["discloud.config"],
  go: ["go.mod", "go.sum"],
  js: ["package.json"],
  py: ["requirements.txt"],
  rb: ["Gemfile"],
  rs: ["Cargo.toml"],
  ts: ["package.json"],
};
