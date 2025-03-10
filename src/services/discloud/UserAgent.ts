import { arch, platform, release, type } from "os";

export class UserAgent {
  constructor(readonly version: string, readonly prefix?: string) {
    this.prefix ??= "DiscloudCLI";
  }

  #getUserAgent() {
    const osRelease = release().split?.(".").slice(0, 2).join(".") ?? release();
    return `${this.prefix}/${this.version} (${type()} ${osRelease}; ${platform()}; ${arch()})`;
  }

  #userAgent!: string;

  toString() {
    return this.#userAgent ??= this.#getUserAgent();
  }
}
