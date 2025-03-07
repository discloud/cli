export interface Templater {
  generate(inputFileName: string, outputFilePath: string, props?: any): Promise<void>
}
