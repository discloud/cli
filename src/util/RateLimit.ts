import { config } from ".";

export class RateLimit {
  constructor(headers?: Record<string, string>) {
    this.limit(headers);
  }

  static get limited() {
    return Intl.DateTimeFormat([], { dateStyle: "short", timeStyle: "medium" })
      .format(new Date(config.data.limited!));
  }

  static get isLimited() {
    return new Date(config.data.limited!) >= new Date();
  }

  limit(headers?: Record<string, string>) {
    if (!headers) return;

    const remaining = Number(headers["ratelimit-remaining"]);
    if (isNaN(remaining)) return;
    if (remaining > 0) return;

    config.write({ limited: Date.now() + (Number(headers["ratelimit-reset"]) * 1000) });
  }
}