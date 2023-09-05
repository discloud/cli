import { config } from ".";

export class RateLimit {
  constructor(headers?: Record<string, string>) {
    RateLimit.limit(headers);
  }

  static get limited() {
    return Intl.DateTimeFormat([], { dateStyle: "short", timeStyle: "medium" })
      .format(new Date(config.data.limited!));
  }

  static get isLimited() {
    return new Date() < new Date(config.data.limited!);
  }

  static limit(headers?: Record<string, string>) {
    if (!headers) return;

    const remaining = Number(headers["ratelimit-remaining"]);
    if (isNaN(remaining) || remaining > 0) return;

    config.update({ limited: Date.now() + (Number(headers["ratelimit-reset"]) * 1000) });
  }
}