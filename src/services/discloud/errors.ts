export class DiscloudAPIError<T = any> extends Error {
  readonly name = "DiscloudAPI";

  constructor(
    body: T,
    readonly code: number,
    readonly method: string,
    readonly path: string,
    readonly requestBody?: any,
  ) {
    let message: string;

    if (typeof body === "string") {
      message = body.match(/<title>(.*)<\/title>/)?.[1] ?? body;
    } else if (typeof body === "object" && body !== null) {
      message = "message" in body ? body.message as string : "Unknown error";
    } else {
      message = "Unknown error";
    }

    super(message);
  }

  /**
   * @returns `["[Discloud API: %o] %s", this.code, this.message]`
   */
  toArray(): [string, number, string] {
    return ["[Discloud API: %o] %s", this.code, this.message];
  }

  toString() {
    return `[Discloud API: ${this.code}] ${this.message}`;
  }
}

export class MissingDiscloudTokenError extends Error {
  readonly name = "MissingDiscloudToken";

  constructor() {
    super();
  }
}

export class RateLimitError extends Error {
  readonly name = "RateLimit";

  constructor() {
    super();
  }
}
