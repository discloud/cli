import type Core from "../../core";
import { RateLimitError } from "./errors";

export default class RateLimit {
  constructor(
    readonly core: Core,
  ) { }

  #encoding: BufferEncoding = "base64";

  #encode(context: string) {
    return Buffer.from(context).toString(this.#encoding);
  }

  getResetDateString(context: string) {
    const rateLimit = this.core.config.get(`limited.${this.#encode(context)}`, true);
    return Intl.DateTimeFormat([this.core.locale], { dateStyle: "short", timeStyle: "medium" })
      .format(new Date(rateLimit));
  }

  verify(context: string) {
    const rateLimit = this.core.config.get(`limited.${this.#encode(context)}`) ?? 0;
    if (Date.now() < rateLimit) throw new RateLimitError();
  }

  limit(headers: Headers, context: string) {
    let remaining: string | number | null = headers.get("ratelimit-remaining");
    let reset: string | number | null = headers.get("ratelimit-reset");

    if (!remaining || !reset) return;

    remaining = Number(remaining);
    reset = Number(reset);

    if (isNaN(remaining) || remaining > 0 || isNaN(reset) || reset < 0) return;

    const date = new Date();
    date.setSeconds(date.getSeconds() + 1, 0);

    const resetTimestamp = reset * 1000 + date.getTime();

    this.core.config.set(`limited.${this.#encode(context)}`, resetTimestamp);
  }
}