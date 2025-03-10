import { arch, platform, release, type } from "os";

export class UserAgent {
  constructor(readonly version: string, readonly prefix?: string) {
    prefix ??= "DiscloudCLI";
  }

  #userAgent!: string;

  #getUserAgent() {
    const osRelease = release().split?.(".").slice(0, 2).join(".") ?? release();
    return `${this.prefix}/${this.version} (${type()} ${osRelease}; ${platform()}; ${arch()})`;
  }

  toString() {
    return this.#userAgent ??= this.#getUserAgent();
  }
}
