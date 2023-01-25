import { filesystem } from "gluegun";
import { FsJsonOptions } from "../@types";

export class FsJson<D extends Partial<Record<any, any>>> {
  #data = <D>{};

  constructor(public path: string, public options: FsJsonOptions = {}) {
    this.options = {
      encoding: "utf8",
      ...this.options,
    };

    this.#data = this.#read() ?? {};
  }

  get data() {
    return this.#data;
  }

  #encode(data = this.#data, encoding = this.options.encoding) {
    return Buffer.from(JSON.stringify(data)).toString(encoding);
  }

  #decode(path = this.path, encoding = this.options.encoding): D {
    try {
      return JSON.parse(Buffer.from(filesystem.read(path)!, encoding).toString("utf8"));
    } catch {
      return <D>{};
    }
  }

  #read(path = this.path) {
    if (filesystem.exists(path))
      try {
        return filesystem.read(path, "json");
      } catch {
        return this.#decode(path);
      }
    return {};
  }

  update(data: D, path = this.path) {
    this.#data = { ...this.#data, ...data };
    const encoded = this.#encode(this.#data);
    filesystem.write(path, encoded);
    return this.#data;
  }
}

export default FsJson;