import { type ConfigData } from "../@types";
import { type NestedStoreData, type NestedStoreKeys, type Store } from "../interfaces/store";
import { CLI_CONFIG_FILEPATH } from "../utils/constants";
import FsJsonStore from "./FsJson";

type T = ConfigData

export default class ConfigStore implements Store<T> {
  readonly #fs: Store<T> = new FsJsonStore<T>(CLI_CONFIG_FILEPATH, { encoding: "base64" });

  delete<K extends NestedStoreKeys<T>>(key: K): void
  delete(key: any): void {
    this.#fs.delete(key);
  }

  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K): V | void
  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, required: true): V
  get(key: any, required?: boolean) {
    return required ? this.#fs.get(key, required) : this.#fs.get(key);
  }

  set<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, value: V): void
  set(key: any, value: any): void {
    this.#fs.set(key, value);
  }
}
