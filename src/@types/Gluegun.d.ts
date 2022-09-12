import { ApiResponse } from "gluegun";

declare module "gluegun" {
  interface GluegunPrint {
    printApiRes<T = any>(apiRes: ApiResponse<T>, spin?: any): number
    spinApiRes<T = any>(apiRes: ApiResponse<T>, spin: any): number
  }
}