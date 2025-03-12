import { type ApiAppLog, type RESTGetApiAppAllLogResult, type RESTGetApiAppLogResult, Routes } from "@discloudapp/api-types/v2";
import { existsSync } from "fs";
import { appendFile, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { type CommandInterface } from "../../interfaces/command";
import { LOGS_PATH } from "../../utils/constants";

interface CommandArgs {
  app: string
  overwrite: boolean
  path: string
}

export default <CommandInterface<CommandArgs>>{
  name: "logs [app] [path]",
  description: "View the logs from application in Discloud",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
      default: "all",
    },
    overwrite: {
      type: "boolean",
      description: "Ovewrite log files",
      alias: "o",
    },
    path: {
      type: "string",
      description: "Relative path to backup your app",
      default: LOGS_PATH,
    },
  },

  async run(core, args) {
    const apinner = core.print.spin(`Fetching ${args.app} logs...`);

    const response = await core.api.get<
      | RESTGetApiAppLogResult
      | RESTGetApiAppAllLogResult
    >(Routes.appLogs(args.app));

    if (!response.apps) return core.print.apiResponse(response);

    const table = [];

    if (Array.isArray(response.apps)) {
      apinner.text = `Saving ${response.apps.length} logs...`;

      for (let i = 0; i < response.apps.length; i++) {
        const line = await saveLog(response.apps[i], args.path, args.overwrite);
        table.push(line);
      }
    } else {
      apinner.text = "Saving logs...";

      const line = await saveLog(response.apps, args.path, args.overwrite);
      table.push(line);
    }

    core.print.table(table);
  },
};

async function saveLog(log: ApiAppLog, path: string, overwrite?: boolean) {
  const uri = join(path, `${log.id}.log`);

  try {
    if (!existsSync(path)) await mkdir(path, { recursive: true });

    const logParams = [
      "", "-".repeat(60),
      new Date().toString(),
      "",
      log.terminal.big,
    ];

    if (overwrite) {
      await writeFile(uri, logParams.join("\n"), "utf8");
    } else {
      await appendFile(uri, logParams.join("\n"), "utf8");
    }

    return {
      id: log.id,
      log: uri,
    };
  } catch (error: any) {
    return {
      id: log.id,
      log: `[error] ${error.message}`,
    };
  }
}
