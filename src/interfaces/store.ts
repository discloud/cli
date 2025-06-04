export type DefaultNestChar = "."

export type NestedStoreData<O, K, NestChar extends string = DefaultNestChar> =
  K extends string
  ? K extends `${infer Segment}${NestChar}${infer Rest}`
  ? NestedStoreData<NestedData<O, Segment>, Rest, NestChar>
  : NestedData<O, K>
  : NestedData<O, K>

type NestedData<O, K> =
  K extends keyof O
  ? O[K]
  : K extends `${number}`
  // @ts-expect-error ts(2536)
  ? O[K]
  : void

export interface PathsOptions {
  bracketNotation?: boolean
  leavesOnly?: boolean
}

export type NestedStoreKeys<O, Options extends PathsOptions = {}> = _NestedStoreKeys<Required<O>, Options>

type Primitive = string | number | bigint | boolean | symbol | null | undefined

type _NestedStoreKeys<O, Options extends PathsOptions> = {
  [K in keyof O]:
  O[K] extends Primitive
  ? K & string
  : O[K] extends Array<infer V>
  ? Options["bracketNotation"] extends true
  ? Options["leavesOnly"] extends true
  ? `${K & string}[${number}].${NestedStoreKeys<V, Options>}`
  :
  | K & string
  | `${K & string}[${number}]`
  | `${K & string}[${number}].${NestedStoreKeys<V, Options>}`
  : Options["leavesOnly"] extends true
  ? `${K & string}.${number}.${NestedStoreKeys<V, Options>}`
  :
  | K & string
  | `${K & string}.${number}`
  | `${K & string}.${number}.${NestedStoreKeys<V, Options>}`
  : O extends object
  ? Options["leavesOnly"] extends true
  ? `${K & string}.${NestedStoreKeys<O[K], Options>}`
  :
  | K & string
  | `${K & string}.${NestedStoreKeys<O[K], Options>}`
  : never
}[keyof O];

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
