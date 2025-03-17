export type DefaultNestChar = "."

export type NestedStoreData<Obj, Key, NestChar extends string = DefaultNestChar> =
  Key extends string
  ? Key extends `${infer Segment}${NestChar}${infer Rest}`
  ? NestedStoreData<NestedData<Obj, Segment>, Rest, NestChar>
  : NestedData<Obj, Key>
  : NestedData<Obj, Key>

type NestedData<Obj, Key> =
  Key extends keyof Obj
  ? Obj[Key]
  : Key extends `${number}`
  // @ts-expect-error ts(2536)
  ? Obj[Key]
  : void

export type NestedStoreKeys<Obj, Key extends keyof Obj = keyof Obj, NestChar extends string = DefaultNestChar> =
  Key extends string
  ? Obj[Key] extends Record<string, any>
  ? Key | `${Key}${NestChar}${NestedStoreKeys<Obj[Key]>}`
  : Key
  : string

export interface IStore<T extends object> {
  delete<K extends NestedStoreKeys<T>>(key: K): void

  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K): V | void
  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, required: true): V

  set<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, value: V): void
}

export interface IAsyncStore<T extends Record<any, any>> {
  delete<K extends NestedStoreKeys<T>>(key: K): Promise<void>

  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K): Promise<V | void>
  get<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, required: true): Promise<V>

  set<K extends NestedStoreKeys<T>, V extends NestedStoreData<T, K>>(key: K, value: V): Promise<void>
}
