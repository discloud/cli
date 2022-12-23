import { ApiApp, ApiTeamApps } from "@discloudapp/api-types/v2";
import { ApiResponse } from "gluegun";
import { AskForAppsOptions } from ".";

declare module "gluegun" {
  interface GluegunPrint {
    printApiRes<T = any>(apiRes: ApiResponse<T>, spin?: any): number
    spinApiRes<T = any>(apiRes: ApiResponse<T>, spin: any): number
  }

  interface GluegunPrompt {
    askForApps<A extends (ApiApp | ApiTeamApps)[], T = GluegunAskResponse>(
      apps: A,
      options?: AskForAppsOptions
    ): Promise<T>
  }
}