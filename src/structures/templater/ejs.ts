import { type Data, renderFile } from "ejs";
import { writeFile } from "fs/promises";
import { join } from "path";
import { ROOT_PATH } from "../..";
import { type Templater } from "../../interfaces/templater";

export default class EjsTemplater implements Templater {
  #readTemplateFile(inputFileName: string, props?: any) {
    return renderFile(join(ROOT_PATH, "templates", `${inputFileName}.ejs`), { props });
  }

  #writeFile(outputFilePath: string, content: string) {
    return writeFile(outputFilePath, content, "utf8");
  }

  async generate(inputFileName: string, outputFilePath: string, props?: Data) {
    const content = await this.#readTemplateFile(inputFileName, props);
    await this.#writeFile(outputFilePath, content);
  }
}
