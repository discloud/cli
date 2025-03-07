import { type Options } from "yargs";
import type Core from "../core";

export interface CommandInterface<Args = any> {
  name: string | string[]
  description?: string
  aliases?: string | string[]
  /** Always `true` if `requiresApiToken` is `true` */
  checkRateLimit?: boolean
  requiresApiToken?: boolean
  options?: Record<keyof Args, Options>
  run(core: Core, args: Args): Promise<void>
}
