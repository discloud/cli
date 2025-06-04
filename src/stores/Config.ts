import { type IStore, type NestedStoreData, type NestedStoreKeys } from "../interfaces/store";

export default class ConfigStore<T extends object> implements IStore<T> {
  constructor(
    protected readonly _store: IStore<T>,
  ) { }

  delete<K extends NestedStoreKeys<T>>(key: K): void
  delete(key: any): void {
    this._store.delete(key);
  }

  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K): V | void
  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, required: true): V
  get(key: any, required?: boolean) {
    return required ? this._store.get(key, required) : this._store.get(key);
  }

  set<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, value: V): void
  set(key: any, value: any): void {
    this._store.set(key, value);
  }
}
