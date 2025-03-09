import { type RESTApiBaseResult } from "@discloudapp/api-types/v2";
import Table from "easy-table";
import ora from "ora";
import type Core from "../../core";
import { type PrintInterface } from "../../interfaces/print";

export default class ConsolePrint implements PrintInterface {
  constructor(
    readonly core: Core,
  ) {
    if (process.argv.includes("--debug")) this.debug = this.#debug;
  }

  apiResponse(response: RESTApiBaseResult) {
    const method: keyof PrintInterface = response.status === "ok" ? "info" : "warn";

    const additional: unknown[] = [];
    if ("localeList" in response) additional.push("Supported locales:", response.localeList);
    if ("logs" in response) additional.push(response.logs);

    this[method]("[DISCLOUD API] %s", response.message, ...additional);
  }

  // #noop() { }

  #debug(first: any, ...args: any) {
    if (typeof first === "string") return console.debug(`[debug] ${first}`, ...args);
    console.debug("[debug]", first, ...args);
  }

  debug(..._args: any) { }

  error(first: any, ...args: any) {
    if (typeof first === "string") return console.error(`[error] ${first}`, ...args);
    console.error("[error]", first, ...args);
  }

  info(first: any, ...args: any) {
    if (typeof first === "string") return console.log(`[info] ${first}`, ...args);
    console.log("[info]", first, ...args);
  }

  log(...args: any) {
    console.log(...args);
  }

  spin(text?: any) {
    return ora({ text }).start();
  }

  success(first: any, ...args: any): void {
    if (typeof first === "string") return console.log(`[success] ${first}`, ...args);
    console.log("[success]", first, ...args);
  }

  table<T>(objOrArray: T, excludeKeys?: any[]) {
    resolveTableObj(objOrArray, excludeKeys);

    Table.log(objOrArray);
  }

  warn(first: any, ...args: any): void {
    if (typeof first === "string") return console.warn(`[warn] ${first}`, ...args);
    console.warn("[warn]", first, ...args);
  }
}

function resolveTableObj(objOrArray: any, excludeKeys: string[] = []) {
  if (Array.isArray(objOrArray)) {
    for (let i = 0; i < objOrArray.length; i++) {
      resolveTableObj(objOrArray[i], excludeKeys);
    }
  } else if (typeof objOrArray === "object" && objOrArray !== null) {
    if (excludeKeys?.length) {
      for (let j = 0; j < excludeKeys.length; j++) {
        Reflect.deleteProperty(objOrArray, excludeKeys[j]);
      }
    }

    const keys = Object.keys(objOrArray);

    for (let j = 0; j < keys.length; j++) {
      const key = keys[j] as keyof typeof objOrArray;
      if (typeof objOrArray[key] === "string") objOrArray[key].replace(/[\r\n]+/g, "");
    }
  }
}
