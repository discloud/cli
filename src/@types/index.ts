import { DiscloudConfig } from "@discloudapp/util";

export interface ApiResPrinterOptions {
  exitOnError?: boolean
}

export interface AskForAppsOptions {
  /**
   * @default false
   */
  all?: boolean
  discloudConfigPath?: string
  discloudConfig?: DiscloudConfig
  /**
   * @default true
   */
  showStatus?: boolean
}

export interface FetchAndAskForAppsOptions extends AskForAppsOptions {
  url?: string
}

export interface ConfigData {
  limited?: number
  token?: string
}

export interface FsJsonOptions {
  encoding?: FsJsonEncoding
}

export type FsJsonEncoding = Extract<BufferEncoding, "base64" | "utf8">;

export interface ResolveArgsOptions {
  name: string
  pattern: RegExp
}

export type RestPutApiTerminalResult =
  | RestPutApiTerminalOkResult
  | RestPutApiTerminalErrorResult;

export interface RestPutApiTerminalOkResult {
  status: "ok"
  apps: ApiTerminalApp
}

export interface RestPutApiTerminalErrorResult {
  status: "error"
  message: string
}

export interface ApiTerminalApp {
  id: string
  shell: ApiTerminalAppShell
}

export interface ApiTerminalAppShell {
  online: boolean
  cmd: string
}
