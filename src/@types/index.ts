import { BinaryLike } from "crypto";

export interface RawFile {
  /**
   * The name of the file
   */
  name: string
  /**
   * An explicit key to use for key of the formdata field for this file.
   * When not provided, the index of the file in the files array is used in the form `files[${index}]`.
   * If you wish to alter the placeholder snowflake, you must provide this property in the same form (`files[${placeholder}]`)
   */
  key?: string
  /**
   * The actual data for the file
   */
  data: Blob | BinaryLike | Buffer
  /**
   * Content-Type of the file
   */
  contentType?: string
}

export interface ResolveArgsOptions {
  name: string
  pattern: RegExp
}

export interface AskForAppsOptions {
  /**
   * @default false
   */
  all?: boolean
  /**
   * @default "."
   */
  discloudConfigPath?: string
  /**
   * @default true
   */
  showStatus?: boolean
}