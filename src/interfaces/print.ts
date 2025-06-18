import { type Ora } from "ora";

export interface IPrint {
  apiResponse(...args: any): void
  bold(...args: any): void
  clear(): void
  debug(...args: any): void
  error(...args: any): void
  info(...args: any): void
  log(...args: any): void
  spin(text?: string): Ora
  success(...args: any): void
  table<T>(array: T[], excludeKeys?: (keyof T)[]): void
  table(obj: unknown, excludeKeys?: any[]): void
  warn(...args: any): void
  write(buffer: Uint8Array | string): void
}
