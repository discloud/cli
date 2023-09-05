import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type Encoding = Exclude<BufferEncoding, "ucs-2" | "ucs2" | "utf16le">;

export interface Options {
  encoding: Encoding
}

export class FsJson<D extends Record<any, any>> {
  #data: D;
  declare options: Options;

  constructor(public path: string, options?: Partial<Options>) {
    this.options = Object.assign({ encoding: "utf8" }, options);

    this.#data = this.#read();
  }

  get data() {
    return this.#data;
  }

  #encode(data = this.#data, encoding = this.options.encoding) {
    return Buffer.from(JSON.stringify(data)).toString(encoding);
  }

  #decode(path = this.path, encoding = this.options.encoding): D {
    try {
      if (existsSync(path))
        return JSON.parse(Buffer.from(readFileSync(path, "utf8"), encoding).toString("utf8"));

      return <D>{};
    } catch {
      return <D>{};
    }
  }

  #read(path = this.path): D {
    if (existsSync(path)) {
      return this.#decode(path);
    } else {
      mkdirSync(dirname(path), { recursive: true });
      return <D>{};
    }
  }

  clear<K extends keyof D>(key?: K) {
    if (key !== undefined) {
      this.delete(key);

      return;
    }

    this.#data = <D>{};

    this.update(this.#data);

    return this;
  }

  delete<K extends keyof D>(key: K) {
    delete this.#data[key];

    this.update(this.#data);

    return this;
  }

  destroy() {
    try { rmSync(this.path); } catch { null; }

    return this;
  }

  get<V extends D[K] = any, K extends keyof D = keyof D>(key: K): V {
    return this.#data[key];
  }

  set<K extends keyof D, V extends D[K]>(key: K, value: V) {
    this.#data[key] = value;

    this.update(this.#data);

    return this;
  }

  update(data: Partial<D>) {
    writeFileSync(this.path, this.#encode(Object.assign(this.#data, data)), "utf8");

    return this.data;
  }
}

export default FsJson;
