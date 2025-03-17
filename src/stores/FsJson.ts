import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname } from "path";
import StoreError from "../errors/store";
import { type DefaultNestChar, type IStore, type NestedStoreData, type NestedStoreKeys } from "../interfaces/store";

export type Encoding = Exclude<BufferEncoding, "ucs-2" | "ucs2" | "utf16le">;

export interface Options {
  encoding: Encoding
}

const defaultOptions: Options = {
  encoding: "utf8",
};

const defaultNestChar: DefaultNestChar = ".";

export default class FsJsonStore<T extends Record<any, any>> implements IStore<T> {
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

  #decode(content: string, encoding = this.options.encoding): T {
    if (content !== undefined)
      try { return JSON.parse(Buffer.from(content, encoding).toString(this.#decoding)); } catch { }

    return <T>{};
  }

  #getNestedData(key: string): [any, string]
  #getNestedData(key: any) {
    let data = this.#data as any;

    const keys = key.split(defaultNestChar);
    const lastKey = keys.splice(-1)[0];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!Reflect.has(data, key)) data[key] = isNaN(keys[i + 1] as any) ? {} : [];
      data = data[key];
    }

    return [data, lastKey];
  }

  #setNestedData(key: string, value: unknown) {
    let data = this.#data as Record<string, any>;

    const keys = key.split(defaultNestChar);
    const lastKey = keys.splice(-1)[0];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!Reflect.has(data, key)) data[key] = isNaN(keys[i + 1] as any) ? {} : [];
      data = data[key];
    }

    data[lastKey] = value;
  }

  #readFile(path = this.path) {
    try { return readFileSync(path, this.#decoding); } catch { }
  }

  #read(path = this.path): T {
    if (existsSync(path)) {
      return this.#decode(this.#readFile(path)!);
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

  delete<K extends NestedStoreKeys<T>>(key: K): void
  delete(key: string) {
    Reflect.deleteProperty(this.#data, key);

    this.update();

    return this;
  }

  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K): V | void
  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, required: true): V
  get(key: string, required?: boolean) {
    const [data, lastKey] = this.#getNestedData(key);
    if (required && !Reflect.has(data, lastKey)) throw new StoreError(`${key} is required, but is missing`);
    return data[lastKey];
  }

  set<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, value: V): this
  set(key: string, value: unknown) {
    this.#setNestedData(key, value);

    this.update(this.#data);

    return this;
  }

  update(data?: Partial<T>) {
    writeFileSync(this.path, this.#encode(Object.assign(this.#data, data)), this.#decoding);

    return this.data;
  }
}
