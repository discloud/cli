import { join } from "path";
import { type ConfigData } from "../@types";
import { type Store } from "../interfaces/store";
import { CONFIG_PATH } from "../utils/constants";
import FsJsonStore from "./FsJson";

type T = ConfigData

export default class ConfigStore implements Store<T> {
  readonly #fs: Store<T> = new FsJsonStore<T>(join(CONFIG_PATH, ".cli"));

  delete<K extends keyof T>(key: K): void {
    this.#fs.delete(key);
  }

  get<V extends T[K], K extends keyof T = keyof T>(key: K): void | V;
  get<V extends T[K], K extends keyof T = keyof T>(key: K, required: true): V;
  get(key: keyof T, required?: boolean) {
    return required ? this.#fs.get(key, required) : this.#fs.get(key);
  }

  set<K extends keyof T, V extends T[K]>(key: K, value: V): void {
    this.#fs.set(key, value);
  }
}
