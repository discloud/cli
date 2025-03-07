import { type Options } from "yargs";
import type Core from "../core";

export interface CommandInterface<T = any> {
  name: string | string[]
  description?: string
  aliases?: string | string[]
  options?: Record<keyof T, Options>
  run(core: Core, args: T): Promise<void>
}
