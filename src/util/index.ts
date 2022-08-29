import { RouteBases } from "@discloudapp/api-types/v2";
import { readFileSync } from "fs";
import { filesystem, http } from "gluegun";
import type { RawFile, ResolveArgsOptions } from "../@types";
import { configPath } from "./constants";

export class FsJson {
  data: Record<string, any> = {};

  constructor(public path: string) {
    this.data = filesystem.read(path, "json") ?? {};
  }

  write(data: Record<string, any>, path = this.path) {
    this.data = { ...this.data, ...data };
    filesystem.write(path, this.data, { jsonIndent: 0 });
    return this.data;
  }
}

export const config = new class Config extends FsJson {
  constructor() {
    super(`${configPath}/.cli`);
  }
};

export const apidiscloud = http.create({
  baseURL: RouteBases.api,
  headers: {
    "api-token": config.data.token,
  },
});

export function resolveArgs(args: string[], options: ResolveArgsOptions[]) {
  const resolved = <Record<string, string | undefined>>{};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    for (let j = 0; j < options.length; j++) {
      const option = options[j];

      if (option.pattern.test(arg)) {
        resolved[option.name] = arg;

        args.splice(i, 1);
        i--;

        options.splice(j, 1);
        j--;
      }
    }
  }

  return resolved;
}

export async function resolveFile(file: string): Promise<RawFile> {
  if (typeof file === "string") {
    return {
      name: file.split("/").pop()!,
      data: readFileSync(file),
      key: "file",
    };
  }

  return file;
}