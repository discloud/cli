import { type RESTGetApiUserResult, RouteBases, Routes } from "@discloudapp/api-types/v2";
import type Core from "../../core";
import { type ApiInterface } from "../../interfaces/api";
import { RequestMethod } from "./enum";
import { DiscloudAPIError } from "./errors";
import RateLimit from "./RateLimit";
import { type InternalRequestData, type RequestData, type RequestOptions, type RESTOptions, type RouteLike } from "./types";
import { tokenIsDiscloudJwt } from "./utils";

export default class REST implements ApiInterface {
  readonly options: Partial<RESTOptions>;
  readonly rateLimiter: RateLimit;

  get baseURL() {
    return RouteBases.api;
  }

  get token() {
    return this.core.config.get("token", true);
  }

  constructor(readonly core: Core, options?: Partial<RESTOptions>) {
    this.options = options ?? {};
    this.rateLimiter = new RateLimit(core);
  }

  get isLimited() {
    const token = this.core.config.get("token");
    if (token) try { this.rateLimiter.verify(token); } catch { return true; }
    return false;
  }

  get hasToken() {
    return Boolean(this.core.config.get("token"));
  }

  get resetDateString() {
    const token = this.core.config.get("token");
    return token && this.rateLimiter.getResetDateString(token);
  }

  async validateToken(token: string): Promise<boolean> {
    if (!tokenIsDiscloudJwt(token)) return false;

    try {
      const url = new URL(RouteBases.api + Routes.user());

      const response = await this.request<RESTGetApiUserResult>(url, {
        headers: {
          "api-token": token,
          ...this.options.userAgent ? { "User-Agent": this.options.userAgent.toString() } : {},
        },
      });

      return response.status === "ok";
    } catch { }

    return false;
  }

  delete<T>(fullRoute: RouteLike, options: RequestData = {}): Promise<T> {
    return this.#raw(Object.assign({}, options, { fullRoute, method: RequestMethod.Delete }));
  }

  get<T>(fullRoute: RouteLike, options: RequestData = {}): Promise<T> {
    return this.#raw(Object.assign({}, options, { fullRoute, method: RequestMethod.Get }));
  }

  post<T>(fullRoute: RouteLike, options: RequestData = {}): Promise<T> {
    return this.#raw(Object.assign({}, options, { fullRoute, method: RequestMethod.Post }));
  }

  put<T>(fullRoute: RouteLike, options: RequestData = {}): Promise<T> {
    return this.#raw(Object.assign({}, options, { fullRoute, method: RequestMethod.Put }));
  }

  request<T>(url: URL, config?: RequestOptions | null): Promise<T>
  async request(url: URL, config: RequestOptions = {}) {
    const pathname = url.pathname;

    const requestToken = this.#getHeaderValue(config.headers, "api-token") as string;

    if (requestToken) this.rateLimiter.verify(requestToken);

    const response = await fetch(url, config);

    if (requestToken) this.#handleResponseHeaders(response.headers, requestToken);

    const responseBody = await this.#resolveResponseBody(response);

    if (!response.ok)
      throw new DiscloudAPIError(
        responseBody,
        response.status,
        config.method ?? "GET",
        pathname,
        config.body,
      );

    return responseBody;
  }

  #getHeaderValue(headers: RequestOptions["headers"], headerKey: any) {
    if (!headers) return;

    if (headers instanceof Headers)
      return headers.get(headerKey);

    if (Array.isArray(headers)) {
      let value;

      for (let i = 0; i < headers.length; i++) {
        if (headers[i][0] === headerKey) {
          value = headers[i][1];
          break;
        }
      }

      return value;
    }

    if (headerKey in headers)
      return headers[headerKey as keyof typeof headers];
  }

  #raw<T>(options: InternalRequestData) {
    const request = this.#resolveRequest(options);

    return this.request<T>(request.url, request.options);
  }

  #resolveRequest(request: InternalRequestData) {
    const options: RequestOptions = { method: request.method };

    if (!request.fullRoute.startsWith("/")) request.fullRoute = `/${request.fullRoute}`;

    const url = new URL(this.baseURL + request.fullRoute);
    const formData = new FormData();

    const headers = new Headers(Object.assign({}, {
      "api-token": this.token,
      ...this.options.userAgent ? { "User-Agent": this.options.userAgent.toString() } : {},
    }, request.headers));

    if (request.query) url.search = new URLSearchParams(request.query).toString();

    const hasFiles = Boolean(request.files?.length);

    if (hasFiles) {
      for (let i = 0; i < request.files!.length; i++) {
        const file = request.files![i];
        formData.append(file.name, file);
      }
    }

    if (request.body) {
      if (hasFiles) {
        if (typeof request.body === "string")
          try { request.body = JSON.parse(request.body); } catch { }

        if (request.body !== null)
          for (const key in request.body)
            formData.append(key, request.body[key as keyof InternalRequestData["body"]]);
      } else {
        headers.set("Content-Type", "application/json");

        if (typeof request.body === "string") {
          options.body = request.body;
        } else {
          options.body = JSON.stringify(request.body);
        }
      }
    }

    if (hasFiles) options.body = formData;

    options.headers = Object.fromEntries(headers.entries());

    return { url, options };
  }

  #resolveResponseBody<T>(response: Response): Promise<T>
  #resolveResponseBody(response: Response) {
    const contentType = response.headers.get("content-type");

    if (typeof contentType === "string") {
      if (contentType.includes("application/json"))
        return response.json();

      if (contentType.includes("text/"))
        return response.text();
    }

    return response.arrayBuffer();
  }

  #handleResponseHeaders(headers: Headers, context: string) {
    this.rateLimiter.limit(headers, context);
  }
}
