import { filesystem } from "gluegun";

export default class FsJson {
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