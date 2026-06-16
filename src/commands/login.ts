import {
  type RESTGetApiUserResult,
  RouteBases,
  Routes,
} from "@discloudapp/api-types/v2";
import { styleText } from "util";
import { type ICommand } from "../interfaces/command";
import { promptApiToken } from "../prompts/discloud/api";

interface CommandArgs {}

function formatLocale(locale: string) {
  try {
    return (
      new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale
    );
  } catch {
    return locale;
  }
}

export default <ICommand<CommandArgs>>{
  name: "login",
  description: "Login on Discloud API",

  async run(core, _args) {
    const token = await promptApiToken();

    const spinner = core.print.spin("Validating token...");

    let userData: RESTGetApiUserResult["user"] | undefined;
    let isValid = false;

    try {
      const url = new URL(RouteBases.api + Routes.user());
      const response = (await (core.api as any).request(url, {
        headers: {
          "api-token": token,
          ...((core.api as any).options?.userAgent
            ? { "User-Agent": (core.api as any).options.userAgent.toString() }
            : {}),
        },
      })) as RESTGetApiUserResult;
      if (response.status === "ok" && response.user) {
        isValid = true;
        userData = response.user;
      }
    } catch {}

    if (!isValid) {
      return spinner.fail("Invalid token");
    }

    core.config.set("token", token);
    spinner.succeed("Logged in successfully");

    if (userData) {
      const u = userData;
      process.stdout.write("\n");
      process.stdout.write(`  ${styleText("dim", "ID")}      ${u.userID}\n`);
      process.stdout.write(
        `  ${styleText("dim", "Plan")}    ${styleText("magenta", u.plan)}\n`,
      );
      process.stdout.write(
        `  ${styleText("dim", "Locale")}  ${u.locale} (${formatLocale(u.locale)})\n`,
      );
      process.stdout.write(
        `  ${styleText("dim", "RAM")}     ${u.ramUsedMb} / ${u.totalRamMb} MB\n`,
      );
      process.stdout.write(
        `  ${styleText("dim", "Apps")}    ${u.apps?.length ?? 0}\n`,
      );
      process.stdout.write("\n");
    }
  },
};
