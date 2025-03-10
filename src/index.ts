import ora from "ora";
import { dirname } from "path";
import Core from "./core";

export default async function (argv: string[]) {
  const spinner = ora().start();

  const core = new Core(argv);

  await core.load();

  spinner.stop();

  await core.run();
}

export const BUILD_ROOT_PATH = __dirname;
export const ROOT_PATH = dirname(BUILD_ROOT_PATH);
