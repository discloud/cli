import { arch, platform, release, type } from "os";

export class UserAgent {
  constructor(version: string, prefix?: string) {
    prefix ??= "DiscloudCLI";

    const osRelease = release().split?.(".").slice(0, 2).join(".") ?? release();

    this.#userAgent = `${prefix}/${version} (${type()} ${osRelease}; ${platform()}; ${arch()})`;
  }

  #userAgent!: string;

  toString() {
    return this.#userAgent;
  }
}
