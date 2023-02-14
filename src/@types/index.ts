import { DiscloudConfig } from "@discloudapp/util"

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

export type FsJsonEncoding = Extract<BufferEncoding, "base64" | "utf8">

export interface MakeZipArgs {
  debug?: boolean
  fileName?: string | null
  ignore?: string[]
  path?: string
}

export interface ResolveArgsOptions {
  name: string
  pattern: RegExp
}
