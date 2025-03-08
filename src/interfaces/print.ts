import { type Ora } from "ora";

export interface PrintInterface {
  apiResponse(...args: any): void
  error(...args: any): void
  debug(...args: any): void
  info(...args: any): void
  log(...args: any): void
  spin(text?: string): Ora
  success(...args: any): void
  warn(...args: any): void
}
