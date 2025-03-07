import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname } from "path";
import StoreError from "../errors/store";
import { type Store } from "../interfaces/store";

export type Encoding = Exclude<BufferEncoding, "ucs-2" | "ucs2" | "utf16le">;

export interface Options {
  encoding: Encoding
}

const defaultOptions: Options = {
  encoding: "utf8",
};

export default class FsJsonStore<T extends Record<any, any>> implements Store<T> {
  readonly #data: T;
  readonly options: Options;
  readonly #decoding: BufferEncoding = "utf8";

  constructor(readonly path: string, options?: Partial<Options>) {
    this.options = Object.assign(defaultOptions, options);

    this.#data = this.#read();
  }

  get data() {
    return this.#data;
  }

  #encode(data = this.#data, encoding = this.options.encoding) {
    return Buffer.from(JSON.stringify(data)).toString(encoding);
  }

  #decode(path = this.path, encoding = this.options.encoding): T {
    const content = this.#readFile(path);

    if (content !== undefined)
      try { return JSON.parse(Buffer.from(content, encoding).toString(this.#decoding)); } catch { }

    return <T>{};
  }

  #readFile(path = this.path) {
    try { if (existsSync(path)) return readFileSync(path, this.#decoding); } catch { }
  }

  #read(path = this.path): T {
    if (existsSync(path)) {
      return this.#decode(path);
    } else {
      mkdirSync(dirname(path), { recursive: true });
      return <T>{};
    }
  }

  clear() {
    // @ts-expect-error ts(2540)
    this.#data = {};

    this.update(this.#data);

    return this;
  }

  destroy() {
    try { rmSync(this.path); } catch { }

    return this;
  }

  delete<K extends keyof T>(key: K) {
    Reflect.deleteProperty(this.#data, key);

    this.update();

    return this;
  }

  get<V extends T[K], K extends keyof T = keyof T>(key: K): V | void
  get<V extends T[K], K extends keyof T = keyof T>(key: K, required: true): V
  get(key: string, required?: boolean) {
    if (required && !Reflect.has(this.#data, key)) throw new StoreError(`${key} is required`);
    return this.#data[key];
  }

  set<K extends keyof T, V extends T[K]>(key: K, value: V) {
    this.#data[key] = value;

    this.update(this.#data);

    return this;
  }

  update(data?: Partial<T>) {
    writeFileSync(this.path, this.#encode(Object.assign(this.#data, data)), this.#decoding);

    return this.data;
  }
}
