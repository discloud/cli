export interface ITemplater {
  generate(inputFileName: string, outputFilePath: string, props?: any): Promise<void>
}
