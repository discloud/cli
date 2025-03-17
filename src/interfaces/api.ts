import { type RequestData, type RouteLike } from "../services/discloud/types";

export interface IApi {
  get isLimited(): boolean
  get hasToken(): boolean
  get resetDateString(): string | void

  validateToken(token: string): Promise<boolean>

  delete<T>(fullRoute: RouteLike, options?: RequestData): Promise<T>
  get<T>(fullRoute: RouteLike, options?: RequestData): Promise<T>
  post<T>(fullRoute: RouteLike, options?: RequestData): Promise<T>
  put<T>(fullRoute: RouteLike, options?: RequestData): Promise<T>
}
