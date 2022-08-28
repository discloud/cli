import { RouteBases } from "@discloudapp/api-types/v2";
import { readFileSync } from "fs";
import { filesystem, http } from "gluegun";
import { RawFile } from "../@types";

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
    super(`${filesystem.homedir()}/.discloud/cli`);
  }
};

export const apidiscloud = http.create({
  baseURL: RouteBases.api,
  headers: {
    "api-token": config.data.token
  }
});

export async function resolveFile(file: string): Promise<RawFile> {
  if (typeof file === "string") {
    return {
      name: file.split("/").pop()!,
      data: readFileSync(file),
      key: "file"
    };
  }

  return file;
}