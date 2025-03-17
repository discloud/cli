import { type Data, renderFile } from "ejs";
import { writeFile } from "fs/promises";
import { type ITemplater } from "../../interfaces/templater";
import { joinWithRoot } from "../../utils/path";

export default class EjsTemplater implements ITemplater {
  #readTemplateFile(inputFileName: string, props?: any) {
    return renderFile(joinWithRoot("templates", `${inputFileName}.ejs`), { props });
  }

  #writeFile(outputFilePath: string, content: string) {
    return writeFile(outputFilePath, content, "utf8");
  }

  async generate(inputFileName: string, outputFilePath: string, props?: Data) {
    const content = await this.#readTemplateFile(inputFileName, props);
    await this.#writeFile(outputFilePath, content);
  }
}
