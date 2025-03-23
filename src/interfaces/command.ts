import type Core from "../core";

export interface ICommand<Args = any> {
  name?: string
  description?: string
  aliases?: string | string[]
  /** Always `true` if `requireAuth` is `true` */
  checkRateLimit?: boolean
  requireAuth?: boolean
  options?: CommandOptionsByArgs<Args>
  run(core: Core, args: Args): Promise<void>
}

type CommandOptionsByArgs<Args> = { [K in keyof Args]: CommandOptions<Args[K]> }

type CommandOptionTypeByType<Type> =
  Type extends Array<any> | ReadonlyArray<any> ? "array"
  : Type extends boolean ? "boolean"
  : Type extends number ? "number" | "count"
  : Type extends string ? "string"
  : any

export interface CommandOptions<Type> {
  alias?: string | ReadonlyArray<string>
  choices?: Type extends Array<any> | ReadonlyArray<any> ? Type : NonNullable<Type>[]
  coerce?: (arg: NonNullable<Type>) => any
  conflicts?: string | string[]
  default?: Type
  defaultDescription?: string
  description?: string
  type: CommandOptionTypeByType<Type>
}
