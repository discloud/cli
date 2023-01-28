import { ApiApp, ApiTeamApps } from "@discloudapp/api-types/v2";
import { ApiResponse } from "@discloudapp/gluegun";
import { Ora } from "ora";
import { ApiResPrinterOptions, AskForAppsOptions, FetchAndAskForAppsOptions } from ".";

declare module "@discloudapp/gluegun" {
  interface GluegunPrint {
    debug: Console["debug"]
    printApiRes<T>(apiRes: ApiResponse<T>, options?: ApiResPrinterOptions, spin?: Ora): number
    spinApiRes<T>(apiRes: ApiResponse<T>, spin: Ora, ApiResPrinterOptions?: ApiResPrinterOptions): number
  }

  interface GluegunPrompt {
    askForApps<A extends (ApiApp | ApiTeamApps)[], T = GluegunAskResponse>(
      apps: A,
      options?: AskForAppsOptions
    ): Promise<T>
    fetchAndAskForApps(options?: FetchAndAskForAppsOptions): Promise<{ appId?: string }>
  }
}
