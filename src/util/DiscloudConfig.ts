import { AppLanguages, AppTypes, DiscloudConfig as DiscloudConfigType } from "@discloudapp/api-types/v2";
import { filesystem } from "gluegun";
import { normalizePathlike, objToString } from ".";
import { FileExt, requiredDiscloudConfigProps } from "./constants";

export type DiscloudConfigConstructor<T extends AppTypes, V extends AppLanguages> = typeof DiscloudConfig<T, V> & {
  findDiscloudConfig(paths?: string | string[]): string | undefined
}

export interface DiscloudConfig<T extends AppTypes, V extends AppLanguages> {
  constructor: DiscloudConfigConstructor<T, V>;
}

export class DiscloudConfig<T, V> {
  path!: string;
  #data!: DiscloudConfigType<T, V>;

  constructor(path: string | string[] = [""], data?: DiscloudConfigType<T, V>) {
    path = this.constructor.findDiscloudConfig(path)!;
    if (typeof path === "string") this.path = path;

    this.#data = this.#read();
    if (data) this.update(data);
  }

  get data(): DiscloudConfigType<T, V> {
    return this.#data;
  }

  get fileExt() {
    return this.#data.MAIN?.split(".").pop() as `${keyof typeof FileExt}`;
  }

  get missingProps() {
    return this.#requiredProps.filter(key => !this.#data[<keyof DiscloudConfigType>key]);
  }

  get #requiredProps() {
    return requiredDiscloudConfigProps[this.data.TYPE] ?? Object.values(requiredDiscloudConfigProps);
  }

  #stringToObj(s: string) {
    if (typeof s !== "string") return {};
    try {
      return JSON.parse(s);
    } catch {
      return Object.fromEntries(s.split(/\r?\n/).map(a => a.split("=")));
    }
  }

  #read() {
    return this.#stringToObj(filesystem.read(this.path) ?? filesystem.read("discloud.config") ?? "");
  }

  pushToFileList(fileList: string[] = []) {
    return fileList.filter(file => !/discloud\.config$/.test(file)).concat(this.path);
  }

  update(save: Partial<DiscloudConfigType<T, V>>) {
    this.#data = { ...this.data, ...save };
    filesystem.write(`${this.path}/discloud.config`, objToString(this.#data, "="));
    return this.#data;
  }

  static findDiscloudConfig(paths: string | string[] = [""]) {
    if (!Array.isArray(paths)) paths = [paths];

    for (let i = 0; i < paths.length; i++) {
      let path = normalizePathlike(paths[i]);

      if (filesystem.isFile(path))
        path = path.split("/").slice(0, -1).join("/");

      if (filesystem.exists(`${path}/discloud.config`))
        return normalizePathlike(`${path}/discloud.config`);
    }

    if (filesystem.exists("discloud.config"))
      return "discloud.config";
  }
}

export default DiscloudConfig;