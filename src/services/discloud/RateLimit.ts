import type Core from "../../core";

export default class RateLimit {
  constructor(
    readonly core: Core,
  ) { }

  get limited() {
    return Intl.DateTimeFormat([this.core.locale], { dateStyle: "short", timeStyle: "medium" })
      .format(new Date(this.core.config.get("limited", true)));
  }

  get isLimited() {
    return Date.now() < (this.core.config.get("limited") ?? 0);
  }

  limit(headers: Headers) {
    let remaining: string | number | null = headers.get("ratelimit-remaining");
    let reset: string | number | null = headers.get("ratelimit-reset");

    if (!remaining || !reset) return;

    remaining = Number(remaining);
    reset = Number(reset);

    if (isNaN(remaining) || remaining > 0 || isNaN(reset) || reset < 0) return;

    const date = new Date();
    date.setSeconds(date.getSeconds() + 1, 0);

    const resetTimestamp = reset * 1000 + date.getTime();

    this.core.config.set("limited", resetTimestamp);
  }
}