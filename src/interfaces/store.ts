export interface Store<T extends Record<any, any>> {
  delete<K extends keyof T>(key: K): void

  get<V extends T[K], K extends keyof T = keyof T>(key: K): V | void
  get<V extends T[K], K extends keyof T = keyof T>(key: K, required: true): V

  set<K extends keyof T, V extends T[K]>(key: K, value: V): void
}

export interface AsyncStore<T extends Record<any, any>> {
  delete(key: keyof T): Promise<void>

  get<V extends T[K], K extends keyof T = keyof T>(key: K): Promise<V | void>
  get<V extends T[K], K extends keyof T = keyof T>(key: K, required: true): Promise<V>

  set<K extends keyof T, V extends T[K]>(key: K, value: V): Promise<void>
}
