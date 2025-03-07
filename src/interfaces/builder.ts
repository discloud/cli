export interface BuilderInterface {
  loadCommands(path: string): Promise<void>
  run(): Promise<void>
}
