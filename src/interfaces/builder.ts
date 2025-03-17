export interface IBuilder {
  loadCommands(path: string): Promise<void>
  run(): Promise<void>
}
