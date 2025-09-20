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

    switch (typeof body) {
      case "string":
        message = body.match(/<title>(.*)<\/title>/)?.[1] ?? body;
        break;
      case "object":
        if (body !== null) {
          message = "message" in body ? body.message as string : "Unknown error";
          break;
        }
      // eslint-disable-next-line no-fallthrough
      default:
        message = "Unknown error";
        break;
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
