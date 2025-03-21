export interface IBuilder {
  load(path: string): Promise<void>
  run(): Promise<void>
}
