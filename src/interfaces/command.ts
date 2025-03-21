import { type Options } from "yargs";
import type Core from "../core";

export interface ICommand<Args = any> {
  name?: string
  description?: string
  aliases?: string | string[]
  /** Always `true` if `requiresApiToken` is `true` */
  checkRateLimit?: boolean
  requireAuth?: boolean
  options?: Record<keyof Args, Options>
  run(core: Core, args: Args): Promise<void>
}

export interface CommandOptions {
  alias?: string | readonly string[]
  coerce?: (arg: any) => any
  default?: any
  description?: string
  type:
  | "array"
  | "boolean"
  | "count"
  | "number"
  | "string"
}
