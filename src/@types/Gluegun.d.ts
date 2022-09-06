import "gluegun";

declare module "gluegun" {
  interface GluegunPrint {
    printApiRes(apiRes: any): number
    spinApiRes(apiRes: any, spin: any): number
  }
}