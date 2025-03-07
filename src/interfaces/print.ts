export interface PrintInterface {
  error(...args: any): void
  debug(...args: any): void
  info(...args: any): void
  log(...args: any): void
  warn(...args: any): void
}
